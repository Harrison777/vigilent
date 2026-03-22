/**
 * seismic.js — USGS Earthquake data layer
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';
let quakeEntities = [];
let pollTimer = null;

// Magnitude → visual size mapping
function magToSize(mag) {
  if (mag < 2) return 6;
  if (mag < 4) return 10;
  if (mag < 5) return 16;
  if (mag < 6) return 24;
  if (mag < 7) return 34;
  return 48;
}

// Depth → color mapping (shallow=red, deep=blue)
function depthToColor(depth) {
  if (depth < 10) return '#ff1744';
  if (depth < 50) return '#ff6d00';
  if (depth < 100) return '#ffab00';
  if (depth < 300) return '#00e676';
  return '#00b0ff';
}

async function fetchEarthquakes() {
  try {
    const res = await fetch(`${USGS_URL}/all_day.geojson`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return data.features || [];
  } catch (e) {
    console.warn('[SEISMIC] USGS fetch failed:', e.message);
    return [];
  }
}

function renderQuakes(quakes) {
  const viewer = getViewer();
  if (!viewer) return;

  // Clear old
  quakeEntities.forEach(id => viewer.entities.removeById(id));
  quakeEntities = [];

  quakes.forEach((q, i) => {
    const { geometry, properties } = q;
    const [lon, lat, depth] = geometry.coordinates;
    const mag = properties.mag || 0;
    const place = properties.place || 'Unknown';
    const time = new Date(properties.time);
    const color = depthToColor(depth);
    const size = magToSize(mag);

    const entityId = `quake-${i}`;
    viewer.entities.add({
      id: entityId,
      name: `M${mag.toFixed(1)} — ${place}`,
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
      point: {
        pixelSize: size,
        color: Cesium.Color.fromCssColorString(color).withAlpha(0.7),
        outlineColor: Cesium.Color.fromCssColorString(color),
        outlineWidth: 2,
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1.5, 2e7, 0.4),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: `M${mag.toFixed(1)}`,
        font: '10px JetBrains Mono',
        fillColor: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(size / 2 + 8, 0),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1, 1e7, 0),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e6),
      },
      // Pulsing effect via ellipse
      ellipse: {
        semiMinorAxis: mag * 15000,
        semiMajorAxis: mag * 15000,
        height: 0,
        material: Cesium.Color.fromCssColorString(color).withAlpha(0.15),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(0.4),
        outlineWidth: 1,
      },
      properties: {
        type: 'earthquake',
        magnitude: mag,
        depth: depth,
        place: place,
        time: time.toISOString(),
        url: properties.url
      }
    });
    quakeEntities.push(entityId);
  });

  console.log(`[SEISMIC] Rendered ${quakeEntities.length} earthquakes`);
}

export function registerSeismicLayer() {
  registerLayer('seismic', {
    name: 'Seismic Activity',
    init: async () => {
      const quakes = await fetchEarthquakes();
      renderQuakes(quakes);
      pollTimer = setInterval(async () => {
        const q = await fetchEarthquakes();
        renderQuakes(q);
      }, 300000); // 5 min
    },
    show: () => {
      const v = getViewer();
      quakeEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = true;
      });
    },
    hide: () => {
      const v = getViewer();
      quakeEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    update: () => {}
  });
}
