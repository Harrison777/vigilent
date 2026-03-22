/**
 * aviation.js — Live flight tracking via OpenSky Network
 * Renders aircraft as airplane silhouettes with smooth position interpolation
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';
import { createAirplaneIcon } from './icons.js';

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

let flightEntities = [];
let commercialPollTimer = null;
let militaryPollTimer = null;
let interpolationTimer = null;
let lastStates = [];
let lastFetchTime = 0;
let fetchCooldown = 15000;

// Store flight state for interpolation (position + velocity + heading)
const flightStateMap = new Map();

const MILITARY_PREFIXES = [
  'DUKE', 'FORGE', 'REACH', 'EVAC', 'CASA', 'TOPCAT', 'VIPER', 'COBRA',
  'KNIFE', 'STEEL', 'HAWK', 'EAGLE', 'REAPER', 'RCH', 'JAKE', 'HOMER',
  'VALOR', 'CHAOS', 'FURY', 'BOLT', 'DOOM', 'IRON', 'TITAN', 'GHOST',
  'NCHO', 'ROCKY', 'POLO', 'KING', 'NOBLE', 'RAGE', 'DARK', 'TEAL',
  'FORTE', 'MAGMA', 'HYDRA', 'DEMON',
];

async function fetchOpenSkyData() {
  const now = Date.now();
  if (now - lastFetchTime < fetchCooldown && lastStates.length > 0) {
    return lastStates;
  }

  try {
    const bounds = getViewportBounds();
    let url = OPENSKY_URL;
    if (bounds) {
      url += `?lamin=${bounds.south.toFixed(2)}&lomin=${bounds.west.toFixed(2)}&lamax=${bounds.north.toFixed(2)}&lomax=${bounds.east.toFixed(2)}`;
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (res.status === 429) {
      fetchCooldown = Math.min(fetchCooldown * 2, 120000);
      console.warn(`[AVIATION] Rate limited. Cooldown → ${fetchCooldown / 1000}s.`);
      if (lastStates.length === 0) {
        console.log('[AVIATION] No cached data — generating fallback flights');
        lastStates = generateFallbackFlights();
        lastFetchTime = Date.now();
      }
      return lastStates;
    }

    if (!res.ok) throw new Error(`OpenSky ${res.status}`);

    const data = await res.json();
    lastStates = data.states || [];
    lastFetchTime = Date.now();
    fetchCooldown = 15000;
    return lastStates;

  } catch (e) {
    console.warn('[AVIATION] Fetch failed:', e.message);
    if (lastStates.length === 0) {
      console.log('[AVIATION] Generating fallback flights');
      lastStates = generateFallbackFlights();
      lastFetchTime = Date.now();
    }
    return lastStates;
  }
}

// ── Fallback Procedural Flights ──────────────────────────────────
// Major air corridors with realistic flight distributions
const AIR_CORRIDORS = [
  // Transatlantic
  { name: 'North Atlantic Tracks', count: 80, waypoints: [[40.6,-73.8],[42,-60],[48,-30],[50,-10],[51.5,0]], altRange: [10000,12000], airlines: ['AAL','DAL','UAL','BAW','DLH','AFR','KLM'] },
  { name: 'South Atlantic', count: 30, waypoints: [[-23,-43],[-10,-15],[5,-5],[15,0],[35,-5],[40,-4]], altRange: [10000,12000], airlines: ['TAM','TAP','IBE','RAM'] },

  // Europe internal
  { name: 'Europe N-S', count: 65, waypoints: [[59.6,10.7],[55.6,12.6],[52.3,13.4],[48.8,2.3],[41.3,2.1],[37,-3.7]], altRange: [8000,11000], airlines: ['RYR','EZY','SAS','DLH','VLG','AEA'] },
  { name: 'Europe E-W', count: 55, waypoints: [[55.9,37.4],[52.2,21],[50,14.3],[48.1,16.5],[48.8,2.3],[51.5,-0.1]], altRange: [9000,11000], airlines: ['AFL','LOT','CSA','AUA','BAW','EZY'] },
  { name: 'Mediterranean', count: 40, waypoints: [[41.8,12.2],[37.9,23.7],[36.8,30.7],[33.8,35.5],[30,31.2]], altRange: [8000,10000], airlines: ['AZA','OAL','THY','ELY','MSR'] },

  // Middle East hub
  { name: 'Dubai Hub', count: 50, waypoints: [[25.2,55.3],[28,56],[33,44],[37,35],[41,29],[48,11]], altRange: [10000,13000], airlines: ['UAE','ETD','QTR','SAA','GFA'] },
  { name: 'ME to Asia', count: 45, waypoints: [[25.2,55.3],[22,65],[18,73],[13,80],[7,80],[1.3,103.9]], altRange: [10000,12000], airlines: ['UAE','QTR','SIA','CPA','MAS'] },

  // Asia
  { name: 'China trunk', count: 60, waypoints: [[39.9,116.4],[31.1,121.8],[23.4,113.3],[22.3,114],[25,121]], altRange: [9000,11000], airlines: ['CCA','CES','CSN','HXA','CPA'] },
  { name: 'Japan-Korea', count: 35, waypoints: [[35.5,139.7],[37.5,126.9],[33.6,130.4],[34.4,135.2]], altRange: [9000,11000], airlines: ['ANA','JAL','KAL','AAR','APJ'] },
  { name: 'SE Asia', count: 45, waypoints: [[1.3,103.9],[3.1,101.7],[7,100.5],[13.7,100.5],[21,105.8]], altRange: [9000,11000], airlines: ['SIA','MAS','THA','VJC','AIQ'] },

  // Transpacific
  { name: 'North Pacific', count: 40, waypoints: [[35.5,139.7],[40,170],[42,-175],[45,-150],[38,-122]], altRange: [10000,12500], airlines: ['ANA','JAL','UAL','AAL','DAL'] },

  // US domestic
  { name: 'US East-West', count: 70, waypoints: [[40.6,-73.8],[39,-84],[38,-90],[37,-97],[35,-106],[34,-118]], altRange: [9000,11000], airlines: ['AAL','DAL','UAL','SWA','JBU','FFT'] },
  { name: 'US East Coast', count: 50, waypoints: [[42.4,-71],[40.6,-73.8],[38.9,-77],[33.6,-84.4],[25.8,-80.3]], altRange: [7000,10000], airlines: ['AAL','DAL','JBU','SWA','NKS'] },

  // Africa
  { name: 'Africa trunk', count: 25, waypoints: [[30,31.2],[9,38.7],[1.3,36.8],[-1.3,36.8],[-6.8,39.2],[-26.1,28]], altRange: [9000,11000], airlines: ['MSR','ETH','KQA','SAA'] },

  // South America
  { name: 'South America', count: 30, waypoints: [[-23,-46.6],[-22.9,-43.2],[-12.9,-38.3],[-4.9,-37.1],[4.7,-74],[10.6,-66.9]], altRange: [9000,11000], airlines: ['TAM','GLO','AVA','CMP','ARG'] },

  // India
  { name: 'India trunk', count: 40, waypoints: [[28.6,77.1],[19,72.9],[17.2,78.4],[13,80.2],[12.9,77.6]], altRange: [8000,10000], airlines: ['AIC','IGO','UAE','QTR','SEJ'] },

  // Australia
  { name: 'Australia', count: 25, waypoints: [[-33.9,151.2],[-37.7,144.8],[-31.9,115.9],[-27.4,153.1],[-16.9,145.8]], altRange: [9000,11000], airlines: ['QFA','JST','VOZ','TGW'] },
];

const seededRand = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };

function generateFallbackFlights() {
  const states = [];
  let seed = 42;

  AIR_CORRIDORS.forEach(corridor => {
    const { waypoints, count, altRange, airlines } = corridor;

    for (let i = 0; i < count; i++) {
      seed++;
      const segIdx = Math.floor(seededRand(seed * 31) * (waypoints.length - 1));
      const t = seededRand(seed * 17);
      const wp1 = waypoints[segIdx];
      const wp2 = waypoints[Math.min(segIdx + 1, waypoints.length - 1)];

      const lat = wp1[0] + (wp2[0] - wp1[0]) * t + (seededRand(seed * 41) - 0.5) * 2;
      const lon = wp1[1] + (wp2[1] - wp1[1]) * t + (seededRand(seed * 53) - 0.5) * 2;
      const alt = altRange[0] + seededRand(seed * 67) * (altRange[1] - altRange[0]);
      const heading = Math.atan2(wp2[1] - wp1[1], wp2[0] - wp1[0]) * 180 / Math.PI;
      const trueTrack = ((90 - heading) + (seededRand(seed * 73) - 0.5) * 15 + 360) % 360;
      const velocity = 180 + seededRand(seed * 83) * 80; // 180-260 m/s
      const airline = airlines[Math.floor(seededRand(seed * 97) * airlines.length)];
      const flightNum = Math.floor(seededRand(seed * 101) * 9000) + 100;
      const callsign = `${airline}${flightNum}`;
      const icao24 = `gen${seed.toString(16).padStart(6, '0')}`;

      // OpenSky state vector format: [icao24, callsign, originCountry, timePosition, lastContact,
      //   longitude, latitude, baroAlt, onGround, velocity, trueTrack, verticalRate, sensors, geoAlt, squawk]
      states.push([
        icao24, callsign, '', Date.now() / 1000, Date.now() / 1000,
        lon, lat, alt, false, velocity,
        trueTrack, (seededRand(seed * 109) - 0.5) * 2, null, alt, null
      ]);
    }
  });

  console.log(`[AVIATION] Generated ${states.length} fallback flights along ${AIR_CORRIDORS.length} corridors`);
  return states;
}

function getViewportBounds() {
  const viewer = getViewer();
  if (!viewer) return null;

  try {
    const camera = viewer.camera;
    const canvas = viewer.canvas;
    const ellipsoid = viewer.scene.globe.ellipsoid;

    const center = camera.pickEllipsoid(
      new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
      ellipsoid
    );
    if (!center) return null;

    const carto = Cesium.Cartographic.fromCartesian(center);
    const centerLat = Cesium.Math.toDegrees(carto.latitude);
    const centerLon = Cesium.Math.toDegrees(carto.longitude);
    const height = viewer.camera.positionCartographic.height;
    const spanDeg = Math.min(height / 80000, 40);

    return {
      south: Math.max(centerLat - spanDeg, -90),
      north: Math.min(centerLat + spanDeg, 90),
      west: Math.max(centerLon - spanDeg, -180),
      east: Math.min(centerLon + spanDeg, 180),
    };
  } catch (e) {
    return null;
  }
}

function isMilitaryFlight(callsign) {
  if (!callsign) return false;
  const cs = callsign.trim().toUpperCase();
  return MILITARY_PREFIXES.some(p => cs.startsWith(p));
}

/**
 * Interpolate all flight positions based on velocity + heading
 * Called every 2 seconds between API polls
 */
function interpolatePositions() {
  const viewer = getViewer();
  if (!viewer) return;

  const now = Date.now();

  flightStateMap.forEach((state, entityId) => {
    const entity = viewer.entities.getById(entityId);
    if (!entity || !entity.show) return;

    const elapsed = (now - state.lastUpdate) / 1000; // seconds since last update
    if (elapsed <= 0 || !state.velocity || state.velocity < 1) return;

    // Convert velocity (m/s) and heading (degrees) to lat/lon displacement
    const headingRad = (state.heading || 0) * Math.PI / 180;
    const distanceM = state.velocity * elapsed;

    // Earth radius ~6371km — convert distance to degrees
    const dLat = (distanceM * Math.cos(headingRad)) / 111320;
    const dLon = (distanceM * Math.sin(headingRad)) / (111320 * Math.cos(state.lat * Math.PI / 180));

    const newLat = state.lat + dLat;
    const newLon = state.lon + dLon;
    const newAlt = state.alt + (state.verticalRate || 0) * elapsed;

    entity.position = Cesium.Cartesian3.fromDegrees(newLon, newLat, Math.max(newAlt, 100));
  });
}

function renderFlights(states, category) {
  const viewer = getViewer();
  if (!viewer) return;

  const colorStr = category === 'military' ? '#ff1744' : '#00e5ff';
  const iconSize = category === 'military' ? 36 : 28;

  const activeIds = new Set();
  const now = Date.now();

  states.forEach(state => {
    const [
      icao24, callsign, originCountry, timePosition, lastContact,
      longitude, latitude, baroAlt, onGround, velocity,
      trueTrack, verticalRate, sensors, geoAlt, squawk,
    ] = state;

    if (!longitude || !latitude || onGround) return;

    const alt = geoAlt || baroAlt || 10000;
    const heading = trueTrack || 0;
    const entityId = `flight-${category}-${icao24}`;
    const cs = (callsign || '').trim() || icao24;
    activeIds.add(entityId);

    // Store state for interpolation
    flightStateMap.set(entityId, {
      lat: latitude,
      lon: longitude,
      alt: alt,
      velocity: velocity || 0,
      heading: heading,
      verticalRate: verticalRate || 0,
      lastUpdate: now,
    });

    const iconCanvas = createAirplaneIcon(colorStr, heading, iconSize);

    let entity = viewer.entities.getById(entityId);

    if (!entity) {
      entity = viewer.entities.add({
        id: entityId,
        name: cs,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, alt),
        billboard: {
          image: iconCanvas,
          width: iconSize,
          height: iconSize,
          scaleByDistance: new Cesium.NearFarScalar(5e4, 1.8, 8e6, 0.3),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e6),
          heightReference: Cesium.HeightReference.NONE,
        },
        label: {
          text: cs,
          font: '10px JetBrains Mono',
          fillColor: Cesium.Color.fromCssColorString(colorStr),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(iconSize / 2 + 6, -4),
          scaleByDistance: new Cesium.NearFarScalar(1e5, 0.8, 3e6, 0),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2e6),
        },
        properties: {
          type: 'aircraft',
          category: category,
          icao24: icao24,
          callsign: cs,
          origin: originCountry,
          altitude: alt,
          velocity: velocity,
          heading: heading,
          verticalRate: verticalRate,
          squawk: squawk
        }
      });
      flightEntities.push(entityId);
    } else {
      entity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, alt);
      entity.billboard.image = iconCanvas;
    }
  });

  // Clean stale
  flightEntities = flightEntities.filter(id => {
    if (id.startsWith(`flight-${category}-`) && !activeIds.has(id)) {
      viewer.entities.removeById(id);
      flightStateMap.delete(id);
      return false;
    }
    return true;
  });
}

async function pollCommercial() {
  const states = await fetchOpenSkyData();
  const commercial = states
    .filter(s => !isMilitaryFlight(s[1]))
    .slice(0, 1500);
  renderFlights(commercial, 'commercial');
  console.log(`[AVIATION] ${commercial.length} commercial flights`);
}

async function pollMilitary() {
  const states = await fetchOpenSkyData();
  const military = states.filter(s => isMilitaryFlight(s[1]));
  renderFlights(military, 'military');
  console.log(`[AVIATION] ${military.length} military flights`);
}

/**
 * Start the position interpolation loop (smooth movement between API polls)
 */
function startInterpolation() {
  if (interpolationTimer) return;
  interpolationTimer = setInterval(interpolatePositions, 2000);
}

function stopInterpolation() {
  if (interpolationTimer) {
    clearInterval(interpolationTimer);
    interpolationTimer = null;
  }
}

export function registerAviationLayers() {
  registerLayer('aviation-commercial', {
    name: 'Commercial Aviation',
    init: async () => {
      // FAST BOOT: render fallback flights instantly, try API in background
      lastStates = generateFallbackFlights();
      lastFetchTime = Date.now();
      const commercial = lastStates.filter(s => !isMilitaryFlight(s[1])).slice(0, 1500);
      renderFlights(commercial, 'commercial');
      startInterpolation();
      console.log(`[AVIATION] ${commercial.length} fallback commercial flights rendered instantly`);
      // Background: try real API after a short delay
      setTimeout(() => {
        fetchCooldown = 0; // Reset so the poll can try the API
        pollCommercial();
        commercialPollTimer = setInterval(pollCommercial, 30000);
      }, 3000);
    },
    show: () => {
      flightEntities.filter(id => id.includes('-commercial-')).forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = true;
      });
      startInterpolation();
    },
    hide: () => {
      flightEntities.filter(id => id.includes('-commercial-')).forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    update: () => {}
  });

  registerLayer('aviation-military', {
    name: 'Military / ADS-B',
    init: async () => {
      // Use already-loaded states (shared with commercial)
      if (lastStates.length === 0) {
        lastStates = generateFallbackFlights();
        lastFetchTime = Date.now();
      }
      const military = lastStates.filter(s => isMilitaryFlight(s[1]));
      renderFlights(military, 'military');
      startInterpolation();
      console.log(`[AVIATION] ${military.length} fallback military flights rendered instantly`);
      setTimeout(() => {
        pollMilitary();
        militaryPollTimer = setInterval(pollMilitary, 30000);
      }, 5000);
    },
    show: () => {
      flightEntities.filter(id => id.includes('-military-')).forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = true;
      });
      startInterpolation();
    },
    hide: () => {
      flightEntities.filter(id => id.includes('-military-')).forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    update: () => {}
  });
}
