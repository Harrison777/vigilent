/**
 * satellites.js — Live satellite tracking via CelesTrak TLE + SGP4 propagation
 * FAST BOOT: Uses fallback positions immediately, fetches TLEs in background
 */
import * as Cesium from 'cesium';
import * as satellite from 'satellite.js';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';
import { SATELLITE_CATEGORIES } from './satellite-db.js';

// Single fast proxy (2s timeout)
const PROXY_URL = url => `https://corsproxy.io/?${encodeURIComponent(url)}`;

let satEntities = [];
let tleCache = new Map();
let updateInterval = null;
let initialized = false;

/**
 * Try to fetch TLE data (background, non-blocking)
 */
async function fetchTLEsBackground() {
  const groups = ['stations', 'active', 'gnss', 'weather', 'geo', 'resource'];

  for (const group of groups) {
    try {
      const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;
      // Very short timeout — if CelesTrak is slow, skip entirely
      const res = await fetch(PROXY_URL(url), { signal: AbortSignal.timeout(4000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach(entry => {
          if (entry.TLE_LINE1 && entry.TLE_LINE2) {
            tleCache.set(entry.NORAD_CAT_ID, {
              name: entry.OBJECT_NAME,
              line1: entry.TLE_LINE1,
              line2: entry.TLE_LINE2,
            });
          }
        });
      }
    } catch (e) {
      // Expected failure — already using fallback
    }
  }

  if (tleCache.size > 0) {
    console.log(`[SAT] Background TLE fetch: ${tleCache.size} records — upgrading to SGP4 positions`);
    updateSatellites(); // Re-render with real orbit data
  }
}

// ── Fallback Satellite Positions ──────────────────────────────────
const ORBIT_PARAMS = {
  LEO:        { alt: 400000, period: 92, inclination: 51.6 },
  SSO:        { alt: 700000, period: 99, inclination: 97.8 },
  MEO:        { alt: 20200000, period: 717, inclination: 55.0 },
  GEO:        { alt: 35786000, period: 1436, inclination: 0.05 },
  HEO:        { alt: 35786000, period: 1436, inclination: 63.4 },
  L1:         { alt: 1500000000, period: 525960, inclination: 0.0 },
  L2:         { alt: 1500000000, period: 525960, inclination: 0.0 },
  'Retro-SSO':{ alt: 600000, period: 96, inclination: 142 },
};

let fallbackPositions = new Map();

function generateFallbackPositions() {
  const now = Date.now();
  const allSats = [];
  Object.entries(SATELLITE_CATEGORIES).forEach(([catKey, cat]) => {
    cat.satellites.forEach(s => allSats.push({ ...s, catKey }));
  });

  allSats.forEach((sat, idx) => {
    const params = ORBIT_PARAMS[sat.orbit] || ORBIT_PARAMS.LEO;
    const periodMs = params.period * 60 * 1000;
    const planeOffset = (idx * 137.508) % 360;
    const phase = ((now % periodMs) / periodMs) * 360 + planeOffset;
    const phaseRad = phase * Math.PI / 180;

    let lat, lon, alt;
    if (sat.orbit === 'GEO') {
      lat = 0 + (Math.sin(idx * 2.3) * 0.5);
      lon = -180 + (idx * 47.3) % 360;
      alt = params.alt;
    } else {
      const incRad = params.inclination * Math.PI / 180;
      lat = Math.asin(Math.sin(incRad) * Math.sin(phaseRad)) * 180 / Math.PI;
      lon = ((phase * 0.9 + planeOffset - (now / 240000) * 360 / params.period) % 360 + 540) % 360 - 180;
      alt = params.alt + Math.sin(phaseRad * 2) * 20000;
    }

    fallbackPositions.set(sat.noradId, { latitude: lat, longitude: lon, altitude: alt });
  });
}

/**
 * Propagate satellite position using SGP4
 */
function propagatePosition(tle, time) {
  try {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const posVel = satellite.propagate(satrec, time);
    const posEci = posVel.position;
    if (!posEci || typeof posEci.x !== 'number') return null;

    const gmst = satellite.gstime(time);
    const posGd = satellite.eciToGeodetic(posEci, gmst);

    return {
      longitude: satellite.degreesLong(posGd.longitude),
      latitude: satellite.degreesLat(posGd.latitude),
      altitude: posGd.height * 1000
    };
  } catch (e) {
    return null;
  }
}

/**
 * Calculate one full orbit path
 */
function calculateOrbitPath(tle, periodMinutes = 95) {
  const positions = [];
  const now = new Date();
  const steps = 120;
  const stepMs = (periodMinutes * 60 * 1000) / steps;

  for (let i = 0; i <= steps; i++) {
    const t = new Date(now.getTime() + i * stepMs);
    const pos = propagatePosition(tle, t);
    if (pos) {
      positions.push(pos.longitude, pos.latitude, pos.altitude);
    }
  }
  return positions;
}

/**
 * Render / update all satellite entities
 */
function updateSatellites() {
  const viewer = getViewer();
  if (!viewer) return;

  const useFallback = tleCache.size === 0;
  if (useFallback && fallbackPositions.size === 0) {
    generateFallbackPositions();
  }

  const now = new Date();

  // Build visibility map from sidebar checkboxes for all categories
  const categoryVisibility = {};
  Object.keys(SATELLITE_CATEGORIES).forEach(catKey => {
    const checkbox = document.querySelector(`[data-layer="satellites-${catKey}"]`);
    categoryVisibility[catKey] = checkbox?.checked ?? false;
  });

  Object.entries(SATELLITE_CATEGORIES).forEach(([catKey, cat]) => {
    const isVisible = categoryVisibility[catKey] ?? false;

    cat.satellites.forEach(satInfo => {
      let pos;
      const tle = tleCache.get(satInfo.noradId);

      if (tle) {
        pos = propagatePosition(tle, now);
      } else {
        pos = fallbackPositions.get(satInfo.noradId);
      }
      if (!pos) return;

      const entityId = `sat-${satInfo.noradId}`;
      let entity = viewer.entities.getById(entityId);

      if (!entity) {
        entity = viewer.entities.add({
          id: entityId,
          name: satInfo.name,
          position: Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.altitude),
          point: {
            pixelSize: catKey === 'military' ? 6 : 5,
            color: Cesium.Color.fromCssColorString(cat.color),
            outlineColor: Cesium.Color.fromCssColorString(cat.color).withAlpha(0.4),
            outlineWidth: 3,
            scaleByDistance: new Cesium.NearFarScalar(1e6, 1.5, 1e8, 0.5),
          },
          label: {
            text: satInfo.name,
            font: '11px JetBrains Mono',
            fillColor: Cesium.Color.fromCssColorString(cat.color),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(12, -4),
            scaleByDistance: new Cesium.NearFarScalar(1e6, 1, 5e7, 0.3),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3e7),
          },
          show: isVisible,
          properties: {
            type: 'satellite',
            category: catKey,
            noradId: satInfo.noradId,
            operator: satInfo.operator,
            nation: satInfo.nation,
            sensorType: satInfo.type,
            resolution: satInfo.resolution,
            orbitType: satInfo.orbit
          }
        });

        // Add orbit path (only with real TLE data)
        if (tle) {
          const orbitPositions = calculateOrbitPath(tle);
          if (orbitPositions.length > 6) {
            viewer.entities.add({
              id: `orbit-${satInfo.noradId}`,
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(orbitPositions),
                width: 1,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.2,
                  color: Cesium.Color.fromCssColorString(cat.color).withAlpha(0.35)
                }),
                show: isVisible,
              }
            });
          }
        }

        satEntities.push(entityId);
      } else {
        entity.position = Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.altitude);
        entity.show = isVisible;

        const orbitEntity = viewer.entities.getById(`orbit-${satInfo.noradId}`);
        if (orbitEntity) orbitEntity.show = isVisible;
      }
    });
  });
}

/**
 * Initialize satellite layer — FAST: fallback positions first, API in background
 */
async function initSatellites() {
  if (initialized) return;
  const t0 = performance.now();

  // INSTANT: generate fallback positions (pure math, <5ms)
  generateFallbackPositions();
  console.log(`[SAT] Fallback positions ready in ${Math.round(performance.now() - t0)}ms`);

  // Render immediately with fallback data
  updateSatellites();
  updateInterval = setInterval(updateSatellites, 10000);
  initialized = true;

  // BACKGROUND: try to fetch real TLE data (non-blocking)
  fetchTLEsBackground().catch(() => {});
}

function showSatellites() {
  updateSatellites();
  // Restart position updates when layer is visible again
  if (!updateInterval) {
    updateInterval = setInterval(updateSatellites, 10000);
  }
}

function hideSatellites() {
  // Stop the update timer — no point recalculating orbits for hidden entities
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  const viewer = getViewer();
  if (!viewer) return;
  satEntities.forEach(id => {
    const e = viewer.entities.getById(id);
    if (e) e.show = false;
    const o = viewer.entities.getById(id.replace('sat-', 'orbit-'));
    if (o) o.show = false;
  });
}

export function registerSatelliteLayers() {
  registerLayer('satellites-commercial', {
    name: 'Commercial Satellites',
    init: initSatellites,
    show: showSatellites,
    hide: hideSatellites,
    update: () => {}
  });

  registerLayer('satellites-military', {
    name: 'Military / ISR Satellites',
    init: async () => { if (!initialized) await initSatellites(); },
    show: showSatellites,
    hide: hideSatellites,
    update: () => {}
  });

  registerLayer('satellites-navigation', {
    name: 'Navigation / GNSS',
    init: async () => { if (!initialized) await initSatellites(); },
    show: showSatellites,
    hide: hideSatellites,
    update: () => {}
  });

  registerLayer('satellites-weather', {
    name: 'Weather / Climate',
    init: async () => { if (!initialized) await initSatellites(); },
    show: showSatellites,
    hide: hideSatellites,
    update: () => {}
  });

  registerLayer('satellites-comms', {
    name: 'Communications',
    init: async () => { if (!initialized) await initSatellites(); },
    show: showSatellites,
    hide: hideSatellites,
    update: () => {}
  });

  registerLayer('satellites-science', {
    name: 'Science / Research',
    init: async () => { if (!initialized) await initSatellites(); },
    show: showSatellites,
    hide: hideSatellites,
    update: () => {}
  });
}
