/**
 * main.js — World Tracker 4D Intelligence Dashboard
 * Application bootstrap: initializes Cesium, registers all layers, wires up UI
 */
import './styles/index.css';
import './styles/panels.css';
import './styles/timeline.css';
import './styles/agent.css';
import './styles/navigator.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';

import { initGlobe, getViewer } from './core/globe.js';
import { toggleLayer } from './core/layers.js';
import { initPostProcessing } from './shaders/post-processing.js';
import { initSidebar } from './ui/sidebar.js';
import { initSearch } from './ui/search.js';
import { initInfoPanel } from './ui/info-panel.js';
import { initControls } from './ui/controls.js';
import { initAgent } from './ui/agent.js';
import { registerSatelliteLayers } from './data/satellites.js';
import { registerAviationLayers } from './data/aviation.js';
import { registerSeismicLayer } from './data/seismic.js';
import { registerMaritimeLayer } from './data/maritime.js';
import { registerTrafficLayer } from './data/traffic.js';
import { registerCCTVLayer } from './data/cctv.js';
import { registerWeatherLayer } from './data/weather.js';
import { registerMarketsLayer } from './data/markets.js';
import { registerEventsLayer } from './geo/events.js';
import { registerConflictLayers } from './geo/conflicts.js';
import { registerTickerLayer } from './data/ticker.js';
import { initNewsFeed } from './ui/newsfeed.js';

// ============================================================
// BOOT SEQUENCE
// ============================================================
async function boot() {
  const t0 = performance.now();
  console.log('%c[VIGILENT] Initializing...', 'color: #4A90D9; font-weight: bold; font-size: 14px');

  try {
    // 1. Initialize Cesium Globe — this must complete first
    await initGlobe();
    const globeTime = Math.round(performance.now() - t0);
    console.log(`[BOOT] Globe ready in ${globeTime}ms`);

    // 2. IMMEDIATELY dismiss loading overlay — user sees the globe!
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 600);
    }

    // 3. Register all data layers (instant — just adds to registry, no I/O)
    registerSatelliteLayers();
    registerAviationLayers();
    registerSeismicLayer();
    registerMaritimeLayer();
    registerTrafficLayer();
    registerCCTVLayer();
    registerWeatherLayer();
    registerMarketsLayer();
    registerEventsLayer();
    registerConflictLayers();
    registerTickerLayer();

    // 4. Init UI simultaneously (all synchronous)
    initPostProcessing();
    initSidebar();
    initSearch();
    initInfoPanel();
    initControls();
    initNewsFeed();
    initAgent();

    // 5. Start HUD immediately
    startHUDUpdates();

    const uiTime = Math.round(performance.now() - t0);
    console.log(`[BOOT] UI ready in ${uiTime}ms`);

    // 6. Enable default layers — stagger to avoid frame drops
    const defaultLayers = [
      'events',       // instant, local data
      'ticker',       // instant, local data
      'seismic',      // fast API (5s timeout)
      'satellites-commercial',  // instant fallback
      'satellites-military',    // instant fallback  
      'aviation-commercial',    // instant fallback
      'maritime',               // procedural gen
    ];

    // Fire lightweight layers first, give heavier ones a stagger
    const layerPromises = defaultLayers.map((layerId, idx) => {
      const checkbox = document.querySelector(`[data-layer="${layerId}"]`);
      if (checkbox && checkbox.checked) {
        // Stagger heavy layers by 50ms each to avoid frame stalls
        return new Promise(resolve => {
          setTimeout(() => {
            toggleLayer(layerId, true)
              .then(resolve)
              .catch(err => {
                console.warn(`[BOOT] Layer ${layerId} init failed:`, err.message);
                resolve();
              });
          }, idx * 50);
        });
      }
      return Promise.resolve();
    });

    Promise.all(layerPromises).then(() => {
      const dt = Math.round(performance.now() - t0);
      console.log(`%c[VIGILENT] ✓ All layers online (${dt}ms)`, 'color: #00e676; font-weight: bold');
    });

    const bootTime = Math.round(performance.now() - t0);
    console.log(`%c[VIGILENT] ✓ System online in ${bootTime}ms`, 'color: #00e676; font-weight: bold; font-size: 14px');

  } catch (e) {
    console.error('[BOOT] Initialization failed:', e);
  }
}

// ============================================================
// HUD UPDATES (UTC clock, FPS counter, layer count, coordinates, stats)
// ============================================================
function startHUDUpdates() {
  const utcClock = document.getElementById('utcClock');
  const fpsCounter = document.getElementById('fpsCounter');
  const hudLat = document.getElementById('hudLat');
  const hudLon = document.getElementById('hudLon');
  const hudAlt = document.getElementById('hudAlt');
  let frameCount = 0;
  let lastFPSTime = performance.now();

  // UTC Clock — update every second
  if (utcClock) {
    utcClock.textContent = new Date().toISOString().slice(11, 19);
    setInterval(() => {
      utcClock.textContent = new Date().toISOString().slice(11, 19);
    }, 1000);
  }

  // FPS Counter — measure actual render performance
  const viewer = getViewer();
  if (viewer && fpsCounter) {
    viewer.scene.postRender.addEventListener(() => {
      frameCount++;
      const now = performance.now();
      if (now - lastFPSTime >= 1000) {
        fpsCounter.textContent = frameCount;
        fpsCounter.style.color = frameCount >= 50 ? '#00e676' : frameCount >= 25 ? '#ffab00' : '#ff1744';
        frameCount = 0;
        lastFPSTime = now;
      }
    });
  }

  // Layer count — already handled by updateCounter() in layers.js
  // Just update on checkbox change events by toggling via sidebar.js
  // The registry-based counter in layers.js is authoritative

  // Coordinate HUD — track mouse position on globe + camera altitude
  if (viewer && hudLat && hudLon && hudAlt) {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement) => {
      const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        hudLat.textContent = Cesium.Math.toDegrees(carto.latitude).toFixed(3) + '°';
        hudLon.textContent = Cesium.Math.toDegrees(carto.longitude).toFixed(3) + '°';
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Camera altitude — update when camera moves
    const updateAlt = () => {
      const camCarto = viewer.camera.positionCartographic;
      const altKm = camCarto.height / 1000;
      if (altKm > 1000) {
        hudAlt.textContent = (altKm / 1000).toFixed(1) + ' Mm';
      } else {
        hudAlt.textContent = altKm.toFixed(0) + ' km';
      }
    };
    viewer.scene.postRender.addEventListener(updateAlt);
    updateAlt();
  }

  // Live stats bar — count entities by type every 3 seconds
  if (viewer) {
    const statEls = {
      satellites:  document.querySelector('#statSatellites .stat-count'),
      flights:     document.querySelector('#statFlights .stat-count'),
      vessels:     document.querySelector('#statVessels .stat-count'),
      quakes:      document.querySelector('#statQuakes .stat-count'),
      events:      document.querySelector('#statEvents .stat-count'),
    };

    const updateStats = () => {
      let sats = 0, flights = 0, vessels = 0, quakes = 0, events = 0;
      const entities = viewer.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i];
        if (!e.show) continue;
        const id = e.id || '';
        if (id.startsWith('sat-')) sats++;
        else if (id.startsWith('flight-')) flights++;
        else if (id.startsWith('vessel-')) vessels++;
        else if (id.startsWith('quake-')) quakes++;
        else if (id.startsWith('event-')) events++;
      }
      if (statEls.satellites)  statEls.satellites.textContent = sats;
      if (statEls.flights)     statEls.flights.textContent = flights;
      if (statEls.vessels)     statEls.vessels.textContent = vessels;
      if (statEls.quakes)      statEls.quakes.textContent = quakes;
      if (statEls.events)      statEls.events.textContent = events;
    };

    setInterval(updateStats, 5000);
    setTimeout(updateStats, 2000); // Initial update after layers load
  }
}

// ============================================================
// LAUNCH
// ============================================================
document.addEventListener('DOMContentLoaded', boot);
