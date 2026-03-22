/**
 * events.js — Geopolitical event data model with 7-day expiration
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';
import { initTimeline } from './timeline.js';
import { createEventIcon } from '../data/icons.js';

let eventEntities = [];

// 7-day expiration window (ms)
const EVENT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Event type → visual config
const EVENT_STYLES = {
  strike: { color: '#ff1744', icon: '💥', size: 44 },
  response: { color: '#ffab00', icon: '🎯', size: 40 },
  diplomatic: { color: '#00e676', icon: '🤝', size: 36 },
  sanction: { color: '#d500f9', icon: '⚖️', size: 36 },
  military_movement: { color: '#ff6d00', icon: '🪖', size: 38 },
  natural_disaster: { color: '#ff6d00', icon: '🌊', size: 42 },
};

// Helper: generate ISO timestamp relative to now
function daysAgo(d, h = 0) {
  const t = new Date(Date.now() - d * 86400000);
  t.setUTCHours(h, 0, 0, 0);
  return t.toISOString();
}

// ── Geopolitical event dataset — all timestamps within last 7 days ──
const GEOPOLITICAL_EVENTS = [
  // ── IRAN CONFLICT (recent escalation) ──
  { id: 'ir001', title: 'Airstrike on IRGC compound — Isfahan', timestamp: daysAgo(1, 3), type: 'strike', lat: 32.654, lon: 51.668, parties: ['IDF', 'IRGC'], description: 'Precision strikes on IRGC missile storage and command bunker near Isfahan', region: 'Middle East' },
  { id: 'ir002', title: 'Drone strike on Natanz enrichment facility', timestamp: daysAgo(1, 6), type: 'strike', lat: 33.721, lon: 51.727, parties: ['Unknown', 'Iran'], description: 'Multiple explosive UAVs targeted centrifuge halls at Natanz nuclear site', region: 'Middle East' },
  { id: 'ir003', title: 'Ballistic missile barrage — Bandar Abbas', timestamp: daysAgo(2, 2), type: 'strike', lat: 27.188, lon: 56.265, parties: ['Coalition', 'IRGC Navy'], description: 'Strikes on IRGC Navy fast-attack boat fleet at Bandar Abbas port', region: 'Middle East' },
  { id: 'ir004', title: 'Iran retaliatory rocket salvo — Erbil base', timestamp: daysAgo(1, 14), type: 'response', lat: 36.184, lon: 44.009, parties: ['IRGC', 'US Forces'], description: 'Ballistic missiles targeting US military base near Erbil, Iraq', region: 'Middle East' },
  { id: 'ir005', title: 'Airstrike on Tehran weapons depot', timestamp: daysAgo(0, 22), type: 'strike', lat: 35.694, lon: 51.423, parties: ['IDF', 'IRGC'], description: 'Targeted strike on underground missile depot in southeastern Tehran', region: 'Middle East' },
  { id: 'ir006', title: 'IRGC proxy attack — Golan Heights', timestamp: daysAgo(2, 18), type: 'response', lat: 33.000, lon: 35.800, parties: ['Hezbollah', 'IDF'], description: 'Coordinated drone and rocket attack on northern Israel military positions', region: 'Middle East' },
  { id: 'ir007', title: 'Strike on Kharg Island oil terminal', timestamp: daysAgo(3, 5), type: 'strike', lat: 29.233, lon: 50.317, parties: ['Coalition', 'Iran'], description: 'Precision strikes disabling export infrastructure at Kharg Island', region: 'Middle East' },
  { id: 'ir008', title: 'UNSC emergency session — Iran crisis', timestamp: daysAgo(1, 10), type: 'diplomatic', lat: 40.749, lon: -73.968, parties: ['UN', 'Multiple'], description: 'Emergency Security Council session addressing Iran-Israel escalation', region: 'International' },
  { id: 'ir009', title: 'EU emergency sanctions on Iran arms', timestamp: daysAgo(0, 8), type: 'sanction', lat: 50.851, lon: 4.367, parties: ['EU', 'Iran'], description: 'Emergency arms embargo and aerospace technology sanctions', region: 'Europe' },

  // ── UKRAINE-RUSSIA ──
  { id: 'ua001', title: 'Shahed drone wave — Kyiv energy grid', timestamp: daysAgo(2, 3), type: 'strike', lat: 50.450, lon: 30.524, parties: ['Russia', 'Ukraine'], description: 'Mass drone attack targeting Ukrainian power infrastructure', region: 'Eastern Europe' },
  { id: 'ua002', title: 'Ukrainian counter-offensive — Zaporizhzhia', timestamp: daysAgo(4, 6), type: 'response', lat: 47.839, lon: 35.140, parties: ['Ukraine', 'Russia'], description: 'Combined arms assault recapturing positions south of Zaporizhzhia', region: 'Eastern Europe' },
  { id: 'ua003', title: 'G7 condemns latest attacks', timestamp: daysAgo(3, 15), type: 'diplomatic', lat: 45.464, lon: 9.190, parties: ['G7', 'International'], description: 'Joint statement condemning drone attacks on civilian infrastructure', region: 'International' },

  // ── RED SEA / YEMEN ──
  { id: 'rs001', title: 'Houthi anti-ship missile — Bab el-Mandeb', timestamp: daysAgo(3, 20), type: 'strike', lat: 13.000, lon: 43.000, parties: ['Houthis', 'Shipping'], description: 'Anti-ship ballistic missile targeting commercial tanker', region: 'Middle East' },
  { id: 'rs002', title: 'USN retaliatory strikes — Yemen', timestamp: daysAgo(3, 8), type: 'response', lat: 12.800, lon: 43.150, parties: ['US Navy', 'Houthis'], description: 'Retaliatory airstrikes on Houthi radar and missile sites', region: 'Middle East' },

  // ── ASIA-PACIFIC ──
  { id: 'ap001', title: 'PLA exercises near Taiwan Strait', timestamp: daysAgo(5, 0), type: 'military_movement', lat: 24.500, lon: 119.500, parties: ['PLA Navy', 'ROCN'], description: 'Large-scale joint naval-air exercises near Taiwan', region: 'Asia-Pacific' },

  // ── SANCTIONS ──
  { id: 'sn001', title: 'US sanctions on Russian oligarchs', timestamp: daysAgo(4, 16), type: 'sanction', lat: 38.907, lon: -77.037, parties: ['USA', 'Russia'], description: 'New personal sanctions on defense-linked Russian oligarchs', region: 'International' },
];

/**
 * Filter events to only those within the 7-day expiration window
 */
function getActiveEvents(events) {
  const now = Date.now();
  return events.filter(ev => {
    const age = now - new Date(ev.timestamp).getTime();
    return age >= 0 && age <= EVENT_TTL_MS;
  });
}

/**
 * Render events on the globe
 */
function renderEvents(visibleEvents) {
  const viewer = getViewer();
  if (!viewer) return;

  // Apply expiration filter
  const activeEvents = getActiveEvents(visibleEvents);

  // Hide all first
  eventEntities.forEach(id => {
    const e = viewer.entities.getById(id);
    if (e) e.show = false;
  });

  // Show visible + non-expired ones
  activeEvents.forEach(event => {
    const entityId = `event-${event.id}`;
    let entity = viewer.entities.getById(entityId);
    const style = EVENT_STYLES[event.type] || EVENT_STYLES.strike;

    if (!entity) {
      const iconCanvas = createEventIcon(event.type, style.color, style.size);

      entity = viewer.entities.add({
        id: entityId,
        name: event.title,
        position: Cesium.Cartesian3.fromDegrees(event.lon, event.lat, 0),
        billboard: {
          image: iconCanvas,
          width: style.size,
          height: style.size,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          scaleByDistance: new Cesium.NearFarScalar(1e5, 1.8, 1e7, 0.5),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: event.title,
          font: '11px JetBrains Mono',
          fillColor: Cesium.Color.fromCssColorString(style.color),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(style.size / 2 + 8, 0),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#0a0e17').withAlpha(0.85),
          backgroundPadding: new Cesium.Cartesian2(6, 4),
          scaleByDistance: new Cesium.NearFarScalar(1e5, 1, 5e6, 0.3),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8e6),
        },
        ellipse: {
          semiMinorAxis: event.type === 'strike' ? 50000 : 30000,
          semiMajorAxis: event.type === 'strike' ? 50000 : 30000,
          height: 0,
          material: Cesium.Color.fromCssColorString(style.color).withAlpha(0.1),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(style.color).withAlpha(0.3),
        },
        properties: {
          type: 'geopolitical_event',
          eventType: event.type,
          parties: event.parties,
          description: event.description,
          timestamp: event.timestamp,
          region: event.region
        }
      });
      eventEntities.push(entityId);
    } else {
      entity.show = true;
    }
  });
}

export function registerEventsLayer() {
  registerLayer('events', {
    name: 'Geopolitical Events',
    init: async () => {
      initTimeline(GEOPOLITICAL_EVENTS, (date, visibleEvents) => {
        renderEvents(visibleEvents);
      });
      renderEvents(GEOPOLITICAL_EVENTS);
    },
    show: () => {
      eventEntities.forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = true;
      });
    },
    hide: () => {
      eventEntities.forEach(id => {
        const e = getViewer()?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    update: () => {}
  });
}

export { GEOPOLITICAL_EVENTS };
