/**
 * cctv.js — Public CCTV feed projection onto street geometry
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';

let cctvEntities = [];
let refreshTimer = null;

// Curated list of public DOT/traffic cameras with known positions
const PUBLIC_CAMERAS = [
  // New York City DOT
  { id: 'nyc-ts1', name: 'Times Square', lat: 40.758, lon: -73.9855, url: 'https://webcams.nyctmc.org/api/cameras/74c7db66-f6dd-4a1d-ab11-f8fd1c8e0d62/image', city: 'New York' },
  { id: 'nyc-bk1', name: 'Brooklyn Bridge', lat: 40.7061, lon: -73.9969, url: 'https://webcams.nyctmc.org/api/cameras/e62e5931-8546-42cd-a0b6-336e6e87e3b0/image', city: 'New York' },
  // London
  { id: 'lon-bb1', name: 'Big Ben / Westminster', lat: 51.5007, lon: -0.1246, city: 'London' },
  { id: 'lon-tb1', name: 'Tower Bridge', lat: 51.5055, lon: -0.0754, city: 'London' },
  // Tokyo
  { id: 'tok-sb1', name: 'Shibuya Crossing', lat: 35.6590, lon: 139.7005, city: 'Tokyo' },
  // Paris
  { id: 'par-ef1', name: 'Eiffel Tower Area', lat: 48.8584, lon: 2.2945, city: 'Paris' },
  // Moscow
  { id: 'mos-rq1', name: 'Red Square', lat: 55.7539, lon: 37.6208, city: 'Moscow' },
  // Dubai
  { id: 'dub-bk1', name: 'Burj Khalifa', lat: 25.1972, lon: 55.2744, city: 'Dubai' },
  // Washington DC
  { id: 'dc-wh1', name: 'White House Area', lat: 38.8977, lon: -77.0365, city: 'Washington DC' },
  { id: 'dc-cap', name: 'US Capitol', lat: 38.8899, lon: -77.0091, city: 'Washington DC' },
  // Beijing
  { id: 'bei-ts1', name: 'Tiananmen Square', lat: 39.9054, lon: 116.3976, city: 'Beijing' },
  // Sydney
  { id: 'syd-oh1', name: 'Sydney Opera House', lat: -33.8568, lon: 151.2153, city: 'Sydney' },
];

function renderCCTVMarkers() {
  const viewer = getViewer();
  if (!viewer) return;

  PUBLIC_CAMERAS.forEach(cam => {
    const entityId = `cctv-${cam.id}`;

    viewer.entities.add({
      id: entityId,
      name: `📹 ${cam.name}`,
      position: Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, 20),
      billboard: {
        image: createCCTVIcon(),
        width: 24,
        height: 24,
        scaleByDistance: new Cesium.NearFarScalar(1e3, 1.5, 1e6, 0.3),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      label: {
        text: cam.name,
        font: '10px JetBrains Mono',
        fillColor: Cesium.Color.fromCssColorString('#7c4dff'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(16, -8),
        scaleByDistance: new Cesium.NearFarScalar(1e3, 0.8, 5e5, 0),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      // Field of view cone
      ellipse: {
        semiMinorAxis: 50,
        semiMajorAxis: 100,
        height: 5,
        material: Cesium.Color.fromCssColorString('#7c4dff').withAlpha(0.12),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#7c4dff').withAlpha(0.3),
      },
      properties: {
        type: 'cctv',
        city: cam.city,
        feedUrl: cam.url || null,
        lastUpdate: new Date().toISOString()
      }
    });

    cctvEntities.push(entityId);
  });
}

/**
 * Create a simple CCTV icon as a data URI
 */
function createCCTVIcon() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Camera body
  ctx.fillStyle = '#7c4dff';
  ctx.strokeStyle = '#b388ff';
  ctx.lineWidth = 1.5;

  // Circle background
  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fill();

  // Camera icon
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 12, 10, 8);
  ctx.beginPath();
  ctx.moveTo(20, 13);
  ctx.lineTo(24, 11);
  ctx.lineTo(24, 21);
  ctx.lineTo(20, 19);
  ctx.fill();

  // Red recording dot
  ctx.fillStyle = '#ff1744';
  ctx.beginPath();
  ctx.arc(12, 14, 2, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}

export function registerCCTVLayer() {
  registerLayer('cctv', {
    name: 'CCTV Feeds',
    init: async () => {
      renderCCTVMarkers();
    },
    show: () => {
      const v = getViewer();
      cctvEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = true;
      });
    },
    hide: () => {
      const v = getViewer();
      cctvEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    update: () => {}
  });
}
