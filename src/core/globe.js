/**
 * globe.js — Cesium Viewer + Google Photorealistic 3D Tiles
 */
import * as Cesium from 'cesium';

let viewer = null;

/**
 * Initialize the Cesium viewer with Google 3D Tiles
 */
export async function initGlobe() {
  // --- SET YOUR API KEYS HERE ---
  // Get a free Cesium Ion token at https://ion.cesium.com/tokens
  // Get a Google Maps API key at https://console.cloud.google.com/google/maps-apis
  const CESIUM_ION_TOKEN = 'YOUR_CESIUM_ION_TOKEN';
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

  // Only set the Ion token if it's a real token (not a placeholder)
  if (CESIUM_ION_TOKEN !== 'YOUR_CESIUM_ION_TOKEN') {
    Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;
  }

  viewer = new Cesium.Viewer('cesiumContainer', {
    // Disable default UI — we have our own
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    selectionIndicator: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    // Performance — only re-render when scene changes (huge FPS win)
    requestRenderMode: true,
    maximumRenderTimeChange: 0.0,   // still re-render on clock ticks
    // Credits
    creditContainer: document.createElement('div'),
    // Terrain
    terrain: undefined,
    // GPU performance
    msaaSamples: 1,
  });

  // ── CAMERA CONTROLLER TUNING ──────────────────────────────
  const controller = viewer.scene.screenSpaceCameraController;

  // Zoom: faster scroll zoom, tighter min distance
  controller.minimumZoomDistance = 50;           // allow close zoom
  controller.maximumZoomDistance = 40000000;     // max out at orbit
  controller.zoomEventTypes = [
    Cesium.CameraEventType.WHEEL,
    Cesium.CameraEventType.PINCH,
  ];

  // Inertia: snappy controls — reduce the floaty spin/glide
  controller.inertiaSpin = 0.6;          // default 0.9 — reduce drag coast
  controller.inertiaTranslate = 0.6;    // default 0.9
  controller.inertiaZoom = 0.7;          // default 0.8

  // Tilt: right-click to tilt (industry standard), single-finger on mobile
  controller.tiltEventTypes = [
    Cesium.CameraEventType.RIGHT_DRAG,
    Cesium.CameraEventType.PINCH,
    {
      eventType: Cesium.CameraEventType.LEFT_DRAG,
      modifier: Cesium.KeyboardEventModifier.CTRL,
    },
  ];

  // Rotate: left-click drag (industry standard)
  controller.rotateEventTypes = [
    Cesium.CameraEventType.LEFT_DRAG,
  ];

  // Look (FPV): middle-click drag
  controller.lookEventTypes = [
    Cesium.CameraEventType.MIDDLE_DRAG,
  ];

  // Disable bouncing at min/max distance
  controller.enableCollisionDetection = true;

  // ── SCENE PERFORMANCE ─────────────────────────────────────
  const scene = viewer.scene;

  // Tile budget — balance quality vs speed
  scene.globe.tileCacheSize = 100;                  // lower memory footprint
  scene.globe.maximumScreenSpaceError = 4;          // fewer tiles at distance (barely visible)
  scene.globe.preloadAncestors = true;
  scene.globe.preloadSiblings = false;              // don't fetch 8 neighbors per tile

  // Use GPU picking for faster click detection
  scene.pickTranslucentDepth = false;

  // Reduce shadow/reflection overhead
  scene.shadowMap && (scene.shadowMap.enabled = false);

  // Atmosphere & visual settings
  scene.globe.enableLighting = true;
  scene.globe.atmosphereLightIntensity = 10.0;
  scene.highDynamicRange = true;
  scene.skyAtmosphere.show = true;
  scene.fog.enabled = true;
  scene.fog.density = 0.0002;
  scene.sun.show = true;
  scene.moon.show = true;
  scene.skyBox.show = true;

  // Anti-aliasing
  scene.postProcessStages.fxaa.enabled = true;

  // ── GOOGLE 3D TILES ────────────────────────────────────────
  if (GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    try {
      const tileset = await Cesium.createGooglePhotorealistic3DTileset({
        key: GOOGLE_MAPS_API_KEY
      });
      scene.primitives.add(tileset);
      scene.globe.show = false;
      console.log('[GLOBE] Google 3D Tiles loaded');
    } catch (e) {
      console.warn('[GLOBE] Google 3D Tiles failed, using default globe:', e.message);
      scene.globe.show = true;
    }
  } else {
    console.warn('[GLOBE] No Google Maps API key set — using default imagery. Set your key in src/core/globe.js');
  }

  // Default camera: overview of Earth
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(20, 25, 20000000),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-90),
      roll: 0
    }
  });

  return viewer;
}

export function getViewer() {
  return viewer;
}
