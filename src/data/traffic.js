/**
 * traffic.js — OSM road network particle system with sequential loading
 * Only activates when camera is zoomed into a city (below 500km altitude)
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

let roadPrimitives = [];
let particlePrimitives = [];
let particles = [];
let animFrame = null;
let loaded = false;
let isVisible = false;

// Road hierarchy for sequential loading
const ROAD_HIERARCHY = [
  { type: 'motorway', color: '#ff6d00', width: 3, speed: 2.5, density: 0.015 },
  { type: 'trunk', color: '#ffab00', width: 2.5, speed: 2.0, density: 0.012 },
  { type: 'primary', color: '#00e5ff', width: 2, speed: 1.5, density: 0.01 },
  { type: 'secondary', color: '#00b0ff', width: 1.5, speed: 1.2, density: 0.007 },
];

/**
 * Fetch roads for a viewport area from Overpass
 */
async function fetchRoads(bounds, roadType) {
  const query = `
    [out:json][timeout:15];
    way["highway"="${roadType}"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
    out geom;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data = await res.json();
    return data.elements || [];
  } catch (e) {
    console.warn(`[TRAFFIC] Failed fetching ${roadType}:`, e.message);
    return [];
  }
}

/**
 * Get camera viewport bounds — returns null if too high
 */
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

    // Only load traffic when zoomed into city level (< 500km)
    if (height > 500000) {
      console.log(`[TRAFFIC] Camera at ${Math.round(height/1000)}km — zoom below 500km to see traffic`);
      return null;
    }

    // Scale viewport span based on altitude
    const spanDeg = Math.min(height / 111000 * 0.8, 2);

    return {
      south: centerLat - spanDeg,
      north: centerLat + spanDeg,
      west: centerLon - spanDeg,
      east: centerLon + spanDeg
    };
  } catch (e) {
    return null;
  }
}

/**
 * Create particle objects along road segments
 */
function createParticlesForRoad(road, config) {
  const geom = road.geometry;
  if (!geom || geom.length < 2) return [];

  const roadParticles = [];
  const totalNodes = geom.length;
  const numParticles = Math.max(1, Math.floor(totalNodes * config.density));

  for (let i = 0; i < numParticles; i++) {
    const startIdx = Math.floor(Math.random() * (totalNodes - 1));
    roadParticles.push({
      roadGeom: geom,
      currentIdx: startIdx,
      progress: Math.random(),
      speed: config.speed * (0.7 + Math.random() * 0.6),
      color: config.color,
    });
  }

  return roadParticles;
}

/**
 * Load roads sequentially from the current viewport
 */
async function loadRoadsSequentially() {
  const bounds = getViewportBounds();
  if (!bounds) {
    console.log('[TRAFFIC] Zoom into a city to enable traffic particles');
    // Still mark as initialized — will load when user zooms in
    return;
  }

  const viewer = getViewer();
  if (!viewer) return;

  // Cleanup any previous data
  cleanup();
  particles = [];

  console.log('[TRAFFIC] Loading roads for current viewport...');

  for (const config of ROAD_HIERARCHY) {
    const roads = await fetchRoads(bounds, config.type);

    roads.forEach(road => {
      const roadParticles = createParticlesForRoad(road, config);
      particles.push(...roadParticles);

      // Draw road line
      if (road.geometry && road.geometry.length >= 2) {
        const positions = [];
        road.geometry.forEach(node => {
          positions.push(node.lon, node.lat, 5);
        });

        if (positions.length >= 6) {
          try {
            viewer.entities.add({
              id: `road-${road.id}`,
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
                width: config.width,
                material: Cesium.Color.fromCssColorString(config.color).withAlpha(0.2),
                clampToGround: true,
              }
            });
            roadPrimitives.push(`road-${road.id}`);
          } catch (e) { /* duplicate ID — skip */ }
        }
      }
    });

    console.log(`[TRAFFIC] Loaded ${roads.length} ${config.type} roads, ${particles.length} particles`);
  }

  loaded = true;

  if (particles.length > 0) {
    startAnimation();
  } else {
    console.log('[TRAFFIC] No roads found in viewport — try zooming into a city');
  }
}

/**
 * Animate particles along roads
 */
function startAnimation() {
  const viewer = getViewer();
  if (!viewer || particles.length === 0) return;

  // Kill any existing animation
  if (animFrame) cancelAnimationFrame(animFrame);

  const pointCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());

  particles.forEach(p => {
    const geom = p.roadGeom;
    const idx = Math.min(p.currentIdx, geom.length - 2);
    const node = geom[idx];

    p.point = pointCollection.add({
      position: Cesium.Cartesian3.fromDegrees(node.lon, node.lat, 8),
      pixelSize: 3,
      color: Cesium.Color.fromCssColorString(p.color).withAlpha(0.85),
      scaleByDistance: new Cesium.NearFarScalar(1e3, 1.5, 1e5, 0.3),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  });

  particlePrimitives.push(pointCollection);

  function animate() {
    if (!isVisible) {
      animFrame = null;
      return;
    }

    particles.forEach(p => {
      const geom = p.roadGeom;
      p.progress += p.speed * 0.005;

      if (p.progress >= 1) {
        p.progress = 0;
        p.currentIdx++;
        if (p.currentIdx >= geom.length - 1) {
          p.currentIdx = 0;
        }
      }

      const idx = Math.min(p.currentIdx, geom.length - 2);
      const nextIdx = idx + 1;
      const lon = geom[idx].lon + (geom[nextIdx].lon - geom[idx].lon) * p.progress;
      const lat = geom[idx].lat + (geom[nextIdx].lat - geom[idx].lat) * p.progress;

      if (p.point) {
        p.point.position = Cesium.Cartesian3.fromDegrees(lon, lat, 8);
      }
    });

    // Tell Cesium to re-render (requestRenderMode)
    const v = getViewer();
    if (v?.scene) v.scene.requestRender();

    animFrame = requestAnimationFrame(animate);
  }

  animate();
}

function cleanup() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  const viewer = getViewer();
  if (!viewer) return;

  roadPrimitives.forEach(id => {
    try { viewer.entities.removeById(id); } catch (e) {}
  });
  particlePrimitives.forEach(pc => {
    try { viewer.scene.primitives.remove(pc); } catch(e) {}
  });

  roadPrimitives = [];
  particlePrimitives = [];
  particles = [];
  loaded = false;
}

export function registerTrafficLayer() {
  registerLayer('traffic', {
    name: 'Traffic Particles',
    init: loadRoadsSequentially,
    show: () => {
      isVisible = true;
      particlePrimitives.forEach(pc => { pc.show = true; });
      roadPrimitives.forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = true;
      });
      // Restart animation if it was stopped
      if (loaded && particles.length > 0 && !animFrame) {
        startAnimation();
      }
    },
    hide: () => {
      isVisible = false;
      particlePrimitives.forEach(pc => { pc.show = false; });
      roadPrimitives.forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    destroy: cleanup,
    update: () => {}
  });
}
