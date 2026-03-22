/**
 * weather.js — Weather overlays using free tile providers
 * Uses RainViewer (free, no key) for radar + satellite imagery
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';

let weatherLayers = [];
let rainviewerTimestamps = null;

/**
 * Fetch latest RainViewer API timestamps (free, no key needed)
 */
async function fetchRainViewerMeta() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('[WEATHER] RainViewer API failed:', e.message);
    return null;
  }
}

/**
 * Add weather radar overlay (precipitation)
 */
async function addRadarLayer() {
  const viewer = getViewer();
  if (!viewer) return;

  const meta = await fetchRainViewerMeta();
  rainviewerTimestamps = meta;

  // Clear any old layers
  removeWeatherLayers();

  if (meta && meta.radar && meta.radar.past && meta.radar.past.length > 0) {
    // Use the most recent radar timestamp
    const latest = meta.radar.past[meta.radar.past.length - 1];

    const radarProvider = new Cesium.UrlTemplateImageryProvider({
      url: `https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/4/1_1.png`,
      minimumLevel: 1,
      maximumLevel: 12,
      credit: 'RainViewer',
    });

    const radarLayer = viewer.imageryLayers.addImageryProvider(radarProvider);
    radarLayer.alpha = 0.6;
    radarLayer.brightness = 1.3;
    weatherLayers.push(radarLayer);

    console.log(`[WEATHER] Radar layer added (${new Date(latest.time * 1000).toISOString()})`);
  }

  // Add cloud/infrared satellite layer
  if (meta && meta.satellite && meta.satellite.infrared && meta.satellite.infrared.length > 0) {
    const latestIR = meta.satellite.infrared[meta.satellite.infrared.length - 1];

    const irProvider = new Cesium.UrlTemplateImageryProvider({
      url: `https://tilecache.rainviewer.com${latestIR.path}/256/{z}/{x}/{y}/0/0_0.png`,
      minimumLevel: 1,
      maximumLevel: 8,
      credit: 'RainViewer IR',
    });

    const irLayer = viewer.imageryLayers.addImageryProvider(irProvider);
    irLayer.alpha = 0.35;
    irLayer.brightness = 1.1;
    weatherLayers.push(irLayer);

    console.log('[WEATHER] IR satellite layer added');
  }

  // Fallback: if RainViewer failed, try CARTO dark labels as a simple overlay
  if (weatherLayers.length === 0) {
    console.warn('[WEATHER] No RainViewer data — adding fallback cloud visualization');
    // OpenStreetMap-based weather-ish visualization
    const fallbackProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
      minimumLevel: 1,
      maximumLevel: 15,
      credit: 'CARTO',
    });
    const fbLayer = viewer.imageryLayers.addImageryProvider(fallbackProvider);
    fbLayer.alpha = 0.4;
    weatherLayers.push(fbLayer);
  }
}

function removeWeatherLayers() {
  const viewer = getViewer();
  if (!viewer) return;

  weatherLayers.forEach(layer => {
    try { viewer.imageryLayers.remove(layer, false); } catch (e) {}
  });
  weatherLayers = [];
}

export function registerWeatherLayer() {
  registerLayer('weather', {
    name: 'Weather Radar',
    init: async () => {
      await addRadarLayer();
    },
    show: () => {
      weatherLayers.forEach(l => { l.show = true; });
    },
    hide: () => {
      weatherLayers.forEach(l => { l.show = false; });
    },
    update: () => {}
  });
}
