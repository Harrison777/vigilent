/**
 * conflicts.js — GPS jamming, internet blackouts, airspace closure data layers
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';

let conflictEntities = { gps: [], internet: [], airspace: [] };

// === GPS JAMMING HOTSPOTS ===
// Derived from known areas of GNSS interference (ADS-B anomalies)
const GPS_JAMMING_ZONES = [
  { name: 'Eastern Mediterranean', lat: 34.5, lon: 33.5, radius: 300000, intensity: 0.8, source: 'ADS-B NIC degradation' },
  { name: 'Baltic Sea / Kaliningrad', lat: 54.7, lon: 20.5, radius: 250000, intensity: 0.9, source: 'GNSS interference' },
  { name: 'Black Sea / Crimea', lat: 44.5, lon: 33.5, radius: 350000, intensity: 0.85, source: 'ADS-B position anomalies' },
  { name: 'Northern Syria', lat: 36.2, lon: 37.2, radius: 200000, intensity: 0.7, source: 'Military GNSS denial' },
  { name: 'Finnish Border', lat: 62.0, lon: 29.0, radius: 150000, intensity: 0.6, source: 'Intermittent jamming' },
  { name: 'Persian Gulf', lat: 26.5, lon: 52.0, radius: 280000, intensity: 0.65, source: 'GPS spoofing incidents' },
  { name: 'South China Sea', lat: 16.0, lon: 112.0, radius: 400000, intensity: 0.5, source: 'AIS/GPS anomalies' },
  { name: 'Norwegian Arctic', lat: 70.0, lon: 25.0, radius: 200000, intensity: 0.55, source: 'Intermittent GNSS denial' },
];

// === INTERNET BLACKOUT / RESTRICTION ZONES ===
const INTERNET_BLACKOUT_ZONES = [
  { name: 'Donetsk / Luhansk', lat: 48.0, lon: 38.5, radius: 200000, severity: 'partial', since: '2022-02' },
  { name: 'Myanmar (Rakhine)', lat: 20.5, lon: 92.8, radius: 150000, severity: 'full', since: '2023-06' },
  { name: 'Tigray Region', lat: 13.5, lon: 39.5, radius: 250000, severity: 'partial', since: '2023-01' },
  { name: 'Gaza Strip', lat: 31.4, lon: 34.4, radius: 30000, severity: 'severe', since: '2023-10' },
  { name: 'Xinjiang', lat: 41.0, lon: 80.0, radius: 600000, severity: 'restricted', since: '2017-01' },
  { name: 'Kashmir', lat: 34.1, lon: 74.9, radius: 100000, severity: 'intermittent', since: '2019-08' },
  { name: 'Iran (periodic)', lat: 32.4, lon: 53.7, radius: 700000, severity: 'throttled', since: '2022-09' },
];

// === AIRSPACE CLOSURES ===
const AIRSPACE_CLOSURES = [
  { name: 'Ukraine Airspace', polygon: [[44.3,22.1],[52.3,22.1],[52.3,40.2],[44.3,40.2]], status: 'CLOSED', notam: 'NOTAM A0001/24' },
  { name: 'Eastern Libya', polygon: [[30,18],[33,18],[33,25],[30,25]], status: 'RESTRICTED', notam: 'NOTAM L0132/24' },
  { name: 'Northern Syria / Iraq', polygon: [[34,36],[37.5,36],[37.5,44],[34,44]], status: 'RESTRICTED', notam: 'NOTAM IRQ/24' },
  { name: 'Yemen Airspace', polygon: [[12,42],[19,42],[19,54],[12,54]], status: 'CLOSED', notam: 'NOTAM Y0055/24' },
  { name: 'Somalia Airspace', polygon: [[0,41],[12,41],[12,51],[0,51]], status: 'RESTRICTED', notam: 'NOTAM SOM/24' },
];

function renderGPSJamming() {
  const viewer = getViewer();
  if (!viewer) return;

  GPS_JAMMING_ZONES.forEach((zone, i) => {
    const entityId = `gps-jam-${i}`;
    viewer.entities.add({
      id: entityId,
      name: `GPS Jamming: ${zone.name}`,
      position: Cesium.Cartesian3.fromDegrees(zone.lon, zone.lat, 0),
      ellipse: {
        semiMinorAxis: zone.radius,
        semiMajorAxis: zone.radius,
        height: 0,
        material: Cesium.Color.fromCssColorString('#ff6d00').withAlpha(zone.intensity * 0.15),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#ff6d00').withAlpha(zone.intensity * 0.5),
        outlineWidth: 2,
      },
      label: {
        text: `⚡ ${zone.name}`,
        font: '10px JetBrains Mono',
        fillColor: Cesium.Color.fromCssColorString('#ff6d00'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0e17').withAlpha(0.8),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1, 1e7, 0.3),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1e7),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: { type: 'gps_jamming', intensity: zone.intensity, source: zone.source }
    });
    conflictEntities.gps.push(entityId);
  });
}

function renderInternetBlackouts() {
  const viewer = getViewer();
  if (!viewer) return;

  INTERNET_BLACKOUT_ZONES.forEach((zone, i) => {
    const entityId = `net-out-${i}`;
    const severityAlpha = { full: 0.25, severe: 0.2, partial: 0.12, restricted: 0.08, throttled: 0.06, intermittent: 0.06 };
    const alpha = severityAlpha[zone.severity] || 0.1;

    viewer.entities.add({
      id: entityId,
      name: `Internet Blackout: ${zone.name}`,
      position: Cesium.Cartesian3.fromDegrees(zone.lon, zone.lat, 0),
      ellipse: {
        semiMinorAxis: zone.radius,
        semiMajorAxis: zone.radius,
        height: 0,
        material: Cesium.Color.fromCssColorString('#d500f9').withAlpha(alpha),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#d500f9').withAlpha(alpha * 3),
        outlineWidth: 2,
      },
      label: {
        text: `📡✗ ${zone.name}`,
        font: '10px JetBrains Mono',
        fillColor: Cesium.Color.fromCssColorString('#d500f9'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0e17').withAlpha(0.8),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1, 1e7, 0.3),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1e7),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: { type: 'internet_blackout', severity: zone.severity, since: zone.since }
    });
    conflictEntities.internet.push(entityId);
  });
}

function renderAirspaceClosures() {
  const viewer = getViewer();
  if (!viewer) return;

  AIRSPACE_CLOSURES.forEach((zone, i) => {
    const entityId = `airspace-${i}`;
    const positions = zone.polygon.map(([lat, lon]) => Cesium.Cartographic.fromDegrees(lon, lat));
    const cartesians = zone.polygon.map(([lat, lon]) => Cesium.Cartesian3.fromDegrees(lon, lat, 15000));

    const isClosed = zone.status === 'CLOSED';
    const color = isClosed ? '#ff1744' : '#ffab00';

    viewer.entities.add({
      id: entityId,
      name: `Airspace ${zone.status}: ${zone.name}`,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(cartesians),
        height: 0,
        extrudedHeight: isClosed ? 20000 : 15000,
        material: Cesium.Color.fromCssColorString(color).withAlpha(isClosed ? 0.08 : 0.05),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(0.4),
        outlineWidth: 2,
      },
      properties: { type: 'airspace_closure', status: zone.status, notam: zone.notam }
    });
    conflictEntities.airspace.push(entityId);
  });
}

export function registerConflictLayers() {
  registerLayer('gps-jamming', {
    name: 'GPS Jamming',
    init: async () => { renderGPSJamming(); },
    show: () => { conflictEntities.gps.forEach(id => { const e = getViewer()?.entities.getById(id); if (e) e.show = true; }); },
    hide: () => { conflictEntities.gps.forEach(id => { const e = getViewer()?.entities.getById(id); if (e) e.show = false; }); },
    update: () => {}
  });

  registerLayer('internet-blackouts', {
    name: 'Internet Blackouts',
    init: async () => { renderInternetBlackouts(); },
    show: () => { conflictEntities.internet.forEach(id => { const e = getViewer()?.entities.getById(id); if (e) e.show = true; }); },
    hide: () => { conflictEntities.internet.forEach(id => { const e = getViewer()?.entities.getById(id); if (e) e.show = false; }); },
    update: () => {}
  });

  registerLayer('airspace-closures', {
    name: 'Airspace Closures',
    init: async () => { renderAirspaceClosures(); },
    show: () => { conflictEntities.airspace.forEach(id => { const e = getViewer()?.entities.getById(id); if (e) e.show = true; }); },
    hide: () => { conflictEntities.airspace.forEach(id => { const e = getViewer()?.entities.getById(id); if (e) e.show = false; }); },
    update: () => {}
  });
}
