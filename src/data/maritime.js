/**
 * maritime.js — AIS vessel tracking with procedurally generated global fleet
 * ~2000 ships distributed along real-world shipping lanes
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer, isLayerVisible } from '../core/layers.js';
import { createShipIcon } from './icons.js';

let vesselEntities = [];
let pollTimer = null;
let generatedFleet = [];

const VESSEL_COLORS = {
  cargo: '#00e5ff',
  tanker: '#ffab00',
  passenger: '#00e676',
  military: '#ff1744',
  fishing: '#7c4dff',
  other: '#9aa0a6'
};

// ── REAL SHIPPING LANE WAYPOINTS ──────────────────────────────────
// Each lane is an array of [lat, lon] waypoints that ships travel along
const SHIPPING_LANES = [
  // Trans-Atlantic: Europe ↔ US East Coast
  { name: 'North Atlantic', density: 120, types: ['cargo','tanker','passenger'],
    waypoints: [[40.7,-74],[41,-60],[48,-30],[50,-10],[51,1],[53.5,8]] },
  { name: 'South Atlantic', density: 50, types: ['cargo','tanker'],
    waypoints: [[-23,-43],[-20,-30],[-10,-10],[5,-5],[10,-15],[30,-15],[36,-6]] },

  // English Channel / North Sea
  { name: 'English Channel', density: 100, types: ['cargo','tanker','passenger','fishing'],
    waypoints: [[48.5,-5.5],[49.5,-2],[50.5,0],[51,1.5],[51.5,2.5],[52,4],[53.5,5.5],[54,8]] },
  { name: 'Baltic Sea', density: 60, types: ['cargo','tanker'],
    waypoints: [[54.5,10],[55,13],[56,16],[57.5,18],[58.5,20],[59.3,18],[59.5,24]] },
  { name: 'North Sea Oil', density: 40, types: ['tanker','cargo'],
    waypoints: [[51,2],[53,3],[56,3],[58,1],[60,2],[61,4]] },

  // Mediterranean
  { name: 'Western Med', density: 80, types: ['cargo','tanker','passenger'],
    waypoints: [[36,-5.5],[36.5,-2],[37.5,0],[38.5,2],[40,4],[41,6],[41.5,9],[40,14]] },
  { name: 'Eastern Med', density: 70, types: ['cargo','tanker','military'],
    waypoints: [[35,14],[34,18],[35,24],[34,28],[33,32],[31.5,32.3]] },
  { name: 'Adriatic', density: 30, types: ['cargo','passenger','fishing'],
    waypoints: [[40,18],[41.5,17],[42.5,16],[43.5,15.5],[44.5,13.5],[45.4,12.3]] },

  // Suez Canal → Red Sea → Indian Ocean
  { name: 'Suez–Red Sea', density: 90, types: ['cargo','tanker'],
    waypoints: [[31.2,32.3],[29.9,32.5],[27,34],[24,37],[20,39],[15,42],[12.5,43.5]] },
  { name: 'Indian Ocean East', density: 70, types: ['cargo','tanker'],
    waypoints: [[12,45],[10,55],[8,65],[6,73],[5,80],[3,90],[2,100],[1.3,103.8]] },
  { name: 'Indian Ocean West', density: 40, types: ['cargo','tanker'],
    waypoints: [[12,45],[5,50],[-5,45],[-15,42],[-25,35],[-34,26]] },

  // Persian Gulf
  { name: 'Persian Gulf', density: 80, types: ['tanker','cargo','military'],
    waypoints: [[26,56.3],[26.5,54],[27,52],[28,50],[29.5,49],[30,48]] },
  { name: 'Gulf of Oman', density: 40, types: ['tanker','military'],
    waypoints: [[25,57],[24,59],[23,62],[22,64],[20,65]] },

  // Strait of Malacca → South China Sea
  { name: 'Malacca Strait', density: 110, types: ['cargo','tanker'],
    waypoints: [[6,95],[4,99],[2.5,101],[1.5,103],[1.3,103.8]] },
   { name: 'South China Sea', density: 100, types: ['cargo','tanker','military','fishing'],
    waypoints: [[1.3,104],[5,108],[10,112],[15,114],[18,115],[21,114.5]] },
  { name: 'SCS to Japan', density: 80, types: ['cargo','tanker'],
    waypoints: [[21,114.5],[22,117],[23.5,118],[25,119],[26.5,122.5],[28,124],[30,126],[33,130],[35,137],[35,140]] },
  { name: 'Taiwan Strait', density: 60, types: ['cargo','military'],
    waypoints: [[22.5,117],[23,117.5],[23.5,118],[24,118.5],[24.8,119],[25.5,119.5]] },

  // East China Sea / Korea / Japan
  { name: 'East China Sea', density: 70, types: ['cargo','tanker','fishing'],
    waypoints: [[26.5,122.5],[28,124],[30,125],[32,126],[34,128],[35.5,129.5]] },
  { name: 'Sea of Japan', density: 40, types: ['cargo','fishing'],
    waypoints: [[35,130],[37,132],[39,134],[41,136],[43,140]] },
  { name: 'Tokyo Bay approach', density: 50, types: ['cargo','tanker','passenger'],
    waypoints: [[34,139],[34.5,139.5],[35,139.7],[35.5,139.8]] },

  // Trans-Pacific
  { name: 'North Pacific', density: 70, types: ['cargo','tanker'],
    waypoints: [[35,140],[36,155],[37,170],[38,-175],[37,-160],[36,-145],[35,-130],[34,-120]] },
  { name: 'Pacific Central', density: 40, types: ['cargo'],
    waypoints: [[22,114],[20,130],[18,150],[16,170],[15,-170],[17,-155],[20,-157]] },

  // US West Coast
  { name: 'US West Coast', density: 60, types: ['cargo','tanker','military','passenger'],
    waypoints: [[48,-125],[46,-124],[44,-124.5],[42,-125],[38,-123],[37,-122.5],[34,-118.5],[33,-117.5]] },
  // US East Coast
  { name: 'US East Coast', density: 80, types: ['cargo','tanker','military','passenger'],
    waypoints: [[25.8,-80],[28,-80],[30,-81],[32,-80.5],[35,-75.5],[37,-76],[39,-74],[40.5,-74],[42,-70]] },
  // US Gulf
  { name: 'Gulf of Mexico', density: 60, types: ['tanker','cargo'],
    waypoints: [[18,-87],[21,-90],[25,-90],[27,-90],[28,-89],[29.5,-90],[30,-89.5]] },

  // Caribbean
  { name: 'Caribbean', density: 50, types: ['cargo','passenger','tanker'],
    waypoints: [[10,-62],[12,-68],[14,-72],[17,-75],[18,-78],[20,-80],[22,-82],[25,-80]] },
  { name: 'Panama Canal approach', density: 40, types: ['cargo','tanker'],
    waypoints: [[8,-79],[8.5,-79.5],[9,-79.5],[9.5,-80],[10,-80]] },

  // West Africa
  { name: 'West Africa', density: 50, types: ['cargo','tanker','fishing'],
    waypoints: [[36,-6],[30,-10],[20,-17],[15,-17.5],[10,-14],[6,1],[5,3],[4,7]] },
  { name: 'Gulf of Guinea', density: 40, types: ['tanker','cargo'],
    waypoints: [[4,3],[4,5],[5,7],[6,3.4],[4,9],[-6,12]] },

  // East Africa / Mozambique Channel
  { name: 'East Africa', density: 30, types: ['cargo','tanker'],
    waypoints: [[-34,26],[-30,32],[-25,35],[-20,38],[-15,42],[-10,45],[-5,45],[0,45]] },
  { name: 'Mozambique Channel', density: 25, types: ['cargo','tanker'],
    waypoints: [[-27,33],[-24,36],[-20,38],[-16,42],[-12,45]] },

  // Australia / Oceania
  { name: 'Australia East', density: 40, types: ['cargo','tanker','passenger'],
    waypoints: [[-38,145],[-36,150],[-34,151],[-30,153],[-25,153],[-20,149]] },
  { name: 'Australia West', density: 30, types: ['cargo','tanker'],
    waypoints: [[-32,115],[-28,114],[-22,114],[-18,118],[-14,121],[-12,130]] },
  { name: 'Australia–Asia', density: 35, types: ['cargo'],
    waypoints: [[-12,130],[-10,125],[-8,118],[-6,112],[-3,108],[1,104]] },

  // South America
  { name: 'South America East', density: 40, types: ['cargo','tanker'],
    waypoints: [[-34,-58],[-33,-51],[-28,-48],[-23,-43],[-13,-38],[-5,-35],[0,-30],[5,-30]] },
  { name: 'South America West', density: 25, types: ['cargo','fishing'],
    waypoints: [[-33,-72],[-30,-71],[-23,-70],[-18,-71],[-12,-77],[-5,-81],[0,-80]] },
  { name: 'Patagonia', density: 15, types: ['fishing','cargo'],
    waypoints: [[-55,-68],[-52,-65],[-48,-63],[-45,-60],[-42,-58],[-38,-57]] },

  // Arctic / Northern routes
  { name: 'Norwegian Sea', density: 30, types: ['fishing','tanker','cargo'],
    waypoints: [[58,5],[60,3],[63,5],[66,10],[68,14],[70,18]] },
  { name: 'Barents Sea', density: 15, types: ['military','fishing'],
    waypoints: [[70,20],[71,25],[70,30],[69,33],[70,40]] },
];

// Named notable vessels for key positions
const NAMED_VESSELS = [
  { name: 'USS GERALD FORD (CVN-78)', mmsi: 'USN-78', type: 'military', lat: 36.5, lon: 14.2, heading: 90, speed: 22, flag: 'US' },
  { name: 'USS EISENHOWER (CVN-69)', mmsi: 'USN-69', type: 'military', lat: 22.5, lon: 60, heading: 120, speed: 20, flag: 'US' },
  { name: 'USS REAGAN (CVN-76)', mmsi: 'USN-76', type: 'military', lat: 35.3, lon: 139.6, heading: 180, speed: 18, flag: 'US' },
  { name: 'HMS QUEEN ELIZABETH', mmsi: 'RN-R08', type: 'military', lat: 50.8, lon: -1.1, heading: 180, speed: 15, flag: 'GB' },
  { name: 'LIAONING (CV-16)', mmsi: 'PLAN-16', type: 'military', lat: 18.2, lon: 112, heading: 135, speed: 18, flag: 'CN' },
  { name: 'SHANDONG (CV-17)', mmsi: 'PLAN-17', type: 'military', lat: 38.9, lon: 121.6, heading: 120, speed: 20, flag: 'CN' },
  { name: 'ADMIRAL KUZNETSOV', mmsi: 'RFN-01', type: 'military', lat: 69.1, lon: 33.4, heading: 0, speed: 8, flag: 'RU' },
  { name: 'CHARLES DE GAULLE', mmsi: 'MN-R91', type: 'military', lat: 43.1, lon: 5.9, heading: 180, speed: 20, flag: 'FR' },
  { name: 'INS VIKRANT', mmsi: 'IN-R11', type: 'military', lat: 15.4, lon: 73.8, heading: 270, speed: 18, flag: 'IN' },
  { name: 'IZUMO (DDH-183)', mmsi: 'JMSDF-183', type: 'military', lat: 33.3, lon: 132.5, heading: 240, speed: 20, flag: 'JP' },
  { name: 'EVER GIVEN', mmsi: 'EG-001', type: 'cargo', lat: 30.01, lon: 32.58, heading: 340, speed: 12, flag: 'PA' },
  { name: 'OASIS OF THE SEAS', mmsi: 'RCCL-01', type: 'passenger', lat: 25.78, lon: -80.18, heading: 170, speed: 20, flag: 'BS' },
  { name: 'QUEEN MARY 2', mmsi: 'QM2-01', type: 'passenger', lat: 40.67, lon: -74.04, heading: 90, speed: 24, flag: 'BM' },
];

// Ship name generators by type
const CARGO_NAMES = ['MAERSK','MSC','CMA CGM','EVERGREEN','COSCO','HAPAG','ONE','ZIM','YANG MING','PIL','WAN HAI','HYUNDAI','NYK','MOL','OOCL','HAMBURG SUD','SAFMARINE','GRIMALDI','K LINE','PACIFIC INT'];
const CARGO_SUFFIXES = ['SPIRIT','GLORY','PRIDE','HORIZON','UNITY','FORTUNE','PROGRESS','PIONEER','VENTURE','LIBERTY','EXPLORER','DISCOVERY','CHAMPION','GUARDIAN','TITAN','GENESIS','ATLAS','PHOENIX','SUMMIT','VALOR'];
const TANKER_NAMES = ['FRONT','NORDIC','EAGLE','SUEZMAX','AFRAMAX','VLCC','NS','STENA','EURONAV','TORM','HAFNIA','BW','SCORPIO','TEEKAY','DHT','AET','NAVION','MINERVA','GENER8','CRUDE'];
const TANKER_SUFFIXES = ['ALTA','SUPREME','STAR','PIONEER','GLORY','COURAGE','FREEDOM','SPIRIT','GRACE','PRIDE','VENTURE','GUARDIAN','TITAN','SOVEREIGN','VANGUARD'];
const FISHING_NAMES = ['ATLANTIC','PACIFIC','NORDIC','CAPE','OCEAN','DEEP SEA','BLUE','SILVER','GOLDEN','NORTH','SOUTHERN','EASTERN','POLAR','CORAL','REEF'];
const FISHING_SUFFIXES = ['FISHER','TRAWLER','HUNTER','MAIDEN','HARVESTER','ROVER','SEARCHER','EXPLORER','RANGER','DRIFTER'];
const PASSENGER_NAMES = ['WONDER','HARMONY','SYMPHONY','ANTHEM','OVATION','QUANTUM','SPECTRUM','ODYSSEY','ENCHANTED','MAJESTIC','SPLENDOR','CELEBRITY','AZURE','SAPPHIRE','EMERALD'];
const PASSENGER_SUFFIXES = ['OF THE SEAS','PRINCESS','STAR','DREAM','SPIRIT','VOYAGER','EXPLORER','CRUISE'];

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateShipName(type, index) {
  switch (type) {
    case 'cargo': return `${randomPick(CARGO_NAMES)} ${randomPick(CARGO_SUFFIXES)}`;
    case 'tanker': return `${randomPick(TANKER_NAMES)} ${randomPick(TANKER_SUFFIXES)}`;
    case 'fishing': return `${randomPick(FISHING_NAMES)} ${randomPick(FISHING_SUFFIXES)}`;
    case 'passenger': return `${randomPick(PASSENGER_NAMES)} ${randomPick(PASSENGER_SUFFIXES)}`;
    case 'military': return `WARSHIP-${index}`;
    default: return `VESSEL-${index}`;
  }
}

const FLAGS = ['PA','LR','MH','HK','SG','BS','BM','MT','CY','GR','NO','DK','JP','KR','CN','GB','US','DE','IT','FR','NL','ES','PT','TR','IN','ID','PH','TH','BR','RU'];

/**
 * Quick check if a point is likely on land (simplified bounding boxes for major landmasses)
 * Returns true if point is probably on land
 */
function isLikelyOnLand(lat, lon) {
  // Major landmass bounding boxes [latMin, latMax, lonMin, lonMax]
  const LAND_BOXES = [
    // North America mainland
    [25, 72, -130, -60],
    // Central America
    [7, 25, -120, -80],
    // South America
    [-56, 12, -82, -34],
    // Europe
    [36, 71, -10, 40],
    // Africa
    [-35, 37, -18, 52],
    // Middle East
    [12, 42, 25, 60],
    // India subcontinent
    [8, 35, 68, 90],
    // Southeast Asia mainland
    [0, 28, 92, 110],
    // China / East Asia inland
    [22, 54, 100, 135],
    // Korea
    [34, 43, 125, 130],
    // Japan main islands (rough, narrow)
    [31, 41, 130, 141],
    // Australia
    [-39, -11, 113, 154],
    // Indonesia main islands
    [-8, 2, 95, 120],
    // Philippines
    [5, 19, 117, 127],
    // UK
    [50, 59, -6, 2],
    // Scandinavia
    [55, 71, 5, 30],
    // Russia Siberia
    [50, 75, 40, 180],
    // Greenland
    [60, 84, -73, -12],
    // Madagascar
    [-26, -12, 43, 50],
    // New Zealand
    [-47, -34, 166, 179],
    // Taiwan
    [22, 25.5, 120, 122],
  ];

  // Water exclusion zones (seas/gulfs/straits inside landmass boxes)
  const WATER_BOXES = [
    // Mediterranean Sea
    [30, 46, -6, 36],
    // Black Sea
    [40.5, 47, 27, 42],
    // Caspian Sea
    [36, 47, 47, 55],
    // Red Sea
    [12, 30, 32, 44],
    // Persian Gulf
    [23, 31, 47, 57],
    // Gulf of Mexico
    [18, 31, -98, -80],
    // Caribbean
    [9, 23, -88, -60],
    // Hudson Bay
    [51, 64, -96, -77],
    // Baltic Sea
    [53, 66, 10, 30],
    // Sea of Japan
    [33, 52, 127, 142],
    // South China Sea (deep)
    [3, 22, 106, 120],
    // Taiwan Strait
    [22, 26, 116, 120],
    // East China Sea
    [24, 34, 119, 132],
    // Yellow Sea
    [32, 41, 117, 127],
    // Bay of Bengal
    [5, 22, 78, 95],
    // Arabian Sea
    [5, 25, 50, 78],
    // Gulf of Thailand
    [5, 14, 99, 106],
    // Strait of Malacca / Java Sea
    [-8, 6, 95, 117],
    // English Channel / North Sea inner
    [49, 56, -5, 9],
    // Gulf of Guinea
    [-5, 7, -5, 12],
    // Mozambique Channel
    [-28, -10, 34, 46],
    // Coral Sea / Tasman Sea
    [-35, -10, 145, 170],
  ];

  // First check if in a known water exclusion (override → it's water)
  for (const [latMin, latMax, lonMin, lonMax] of WATER_BOXES) {
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) {
      return false; // known water
    }
  }

  // Then check if in any land box
  for (const [latMin, latMax, lonMin, lonMax] of LAND_BOXES) {
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) {
      return true; // likely on land
    }
  }

  return false; // open ocean
}

/**
 * Generate fleet along shipping lanes
 */
function generateFleet() {
  const fleet = [];
  let id = 0;

  // Generate ships along each lane
  SHIPPING_LANES.forEach(lane => {
    const { waypoints, density, types } = lane;

    for (let i = 0; i < density; i++) {
      // Pick a random position along the lane
      const segIdx = Math.floor(seededRandom(id * 31 + i * 7) * (waypoints.length - 1));
      const t = seededRandom(id * 17 + i * 13);
      const wp1 = waypoints[segIdx];
      const wp2 = waypoints[Math.min(segIdx + 1, waypoints.length - 1)];

      // Interpolate between waypoints with TIGHT lateral offset (±0.5°, ~55km)
      const lat = wp1[0] + (wp2[0] - wp1[0]) * t + (seededRandom(id * 41 + i) - 0.5) * 0.5;
      const lon = wp1[1] + (wp2[1] - wp1[1]) * t + (seededRandom(id * 53 + i) - 0.5) * 0.5;

      // Skip vessels that would end up on land
      if (isLikelyOnLand(lat, lon)) {
        id++;
        continue;
      }

      // Heading roughly follows lane direction
      const baseBearing = Math.atan2(wp2[1] - wp1[1], wp2[0] - wp1[0]) * 180 / Math.PI;
      const heading = ((90 - baseBearing) + (seededRandom(id * 67) - 0.5) * 30 + 360) % 360;

      const type = types[Math.floor(seededRandom(id * 71 + i * 3) * types.length)];
      const speed = type === 'military' ? 15 + seededRandom(id) * 15
        : type === 'passenger' ? 14 + seededRandom(id) * 10
        : type === 'tanker' ? 8 + seededRandom(id) * 8
        : type === 'fishing' ? 2 + seededRandom(id) * 8
        : 10 + seededRandom(id) * 12;

      fleet.push({
        name: generateShipName(type, id),
        mmsi: `GEN-${id}`,
        type,
        lat,
        lon,
        heading: Math.round(heading),
        speed: Math.round(speed * 10) / 10,
        flag: FLAGS[Math.floor(seededRandom(id * 97) * FLAGS.length)],
        dest: lane.name.toUpperCase(),
      });
      id++;
    }
  });

  // Insert named notable vessels
  NAMED_VESSELS.forEach(nv => {
    fleet.push({ ...nv, speed: nv.speed, dest: 'CLASSIFIED' });
  });

  return fleet;
}

// Map of mmsi → { entity, lastRenderedHeading }
const vesselEntityMap = new Map();

function renderVessels(vessels) {
  const viewer = getViewer();
  if (!viewer) return;

  // Remove old entities not in the new set
  vesselEntities.forEach(id => {
    try { viewer.entities.removeById(id); } catch (e) {}
  });
  vesselEntities = [];
  vesselEntityMap.clear();

  vessels.forEach((v, i) => {
    const colorStr = VESSEL_COLORS[v.type] || VESSEL_COLORS.other;
    const heading = v.heading || 0;
    const entityId = `vessel-${v.mmsi || i}`;
    const iconSize = v.type === 'military' ? 34 : v.type === 'passenger' ? 30 : 24;

    const iconCanvas = createShipIcon(colorStr, heading, iconSize, v.type);

    const entity = viewer.entities.add({
      id: entityId,
      name: v.name,
      position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 0),
      billboard: {
        image: iconCanvas,
        width: iconSize,
        height: iconSize,
        scaleByDistance: new Cesium.NearFarScalar(1e4, 2.0, 8e6, 0.15),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3e6),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: v.name,
        font: '10px JetBrains Mono',
        fillColor: Cesium.Color.fromCssColorString(colorStr),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(iconSize / 2 + 8, -4),
        scaleByDistance: new Cesium.NearFarScalar(1e4, 0.8, 1e6, 0),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8e5),
      },
      properties: {
        type: 'vessel',
        vesselType: v.type,
        mmsi: v.mmsi,
        speed: v.speed,
        heading: heading,
        flag: v.flag,
        destination: v.dest
      }
    });
    vesselEntities.push(entityId);
    vesselEntityMap.set(entityId, { entity, lastHeading: heading, type: v.type, color: colorStr });
  });

  console.log(`[MARITIME] Rendered ${vesselEntities.length} vessels worldwide`);
}

/**
 * Simulate ship movement — update positions IN-PLACE (no re-render)
 */
function advanceFleet() {
  const viewer = getViewer();
  if (!viewer) return;

  generatedFleet.forEach((v, i) => {
    const headingRad = (v.heading || 0) * Math.PI / 180;
    const knotsToMs = 0.514444;
    const speedMs = v.speed * knotsToMs;
    const dt = 60; // 60 seconds between updates

    const distM = speedMs * dt;
    const dLat = (distM * Math.cos(headingRad)) / 111320;
    const dLon = (distM * Math.sin(headingRad)) / (111320 * Math.cos(v.lat * Math.PI / 180 + 0.001));

    v.lat += dLat;
    v.lon += dLon;

    // Slight random heading drift
    v.heading = (v.heading + (Math.random() - 0.5) * 2 + 360) % 360;

    // Update entity in-place if layer is visible
    if (isLayerVisible('maritime')) {
      const entityId = `vessel-${v.mmsi || i}`;
      const ref = vesselEntityMap.get(entityId);
      if (ref && ref.entity) {
        ref.entity.position = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 0);

        // Only regenerate icon if heading changed >5°
        const headingDelta = Math.abs(v.heading - ref.lastHeading);
        if (headingDelta > 5) {
          const iconSize = v.type === 'military' ? 34 : v.type === 'passenger' ? 30 : 24;
          ref.entity.billboard.image = createShipIcon(ref.color, v.heading, iconSize, ref.type);
          ref.lastHeading = v.heading;
        }
      }
    }
  });

  // Tell Cesium to re-render (requestRenderMode)
  if (viewer.scene) viewer.scene.requestRender();
}

export function registerMaritimeLayer() {
  registerLayer('maritime', {
    name: 'Maritime Vessels',
    init: async () => {
      console.log('[MARITIME] Generating global fleet...');
      generatedFleet = generateFleet();
      renderVessels(generatedFleet);

      // Move ships every 60 seconds
      pollTimer = setInterval(advanceFleet, 60000);
    },
    show: () => {
      const v = getViewer();
      vesselEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = true;
      });
    },
    hide: () => {
      const v = getViewer();
      vesselEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    update: () => {}
  });
}
