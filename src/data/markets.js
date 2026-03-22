/**
 * markets.js — Global financial market overlays
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { registerLayer } from '../core/layers.js';

let marketEntities = [];
let updateTimer = null;

// World financial centers with their indices
const FINANCIAL_CENTERS = [
  { name: 'NYSE / NASDAQ', city: 'New York', lat: 40.7069, lon: -74.0089, indices: ['DJI', 'IXIC', 'SPX'], timezone: 'EST' },
  { name: 'LSE', city: 'London', lat: 51.5144, lon: -0.0987, indices: ['FTSE'], timezone: 'GMT' },
  { name: 'TSE', city: 'Tokyo', lat: 35.6817, lon: 139.7671, indices: ['N225'], timezone: 'JST' },
  { name: 'SSE', city: 'Shanghai', lat: 31.2319, lon: 121.4691, indices: ['SSEC'], timezone: 'CST' },
  { name: 'HKEX', city: 'Hong Kong', lat: 22.2860, lon: 114.158, indices: ['HSI'], timezone: 'HKT' },
  { name: 'Euronext Paris', city: 'Paris', lat: 48.8691, lon: 2.3414, indices: ['CAC40'], timezone: 'CET' },
  { name: 'XETRA', city: 'Frankfurt', lat: 50.1109, lon: 8.6821, indices: ['DAX'], timezone: 'CET' },
  { name: 'BSE / NSE', city: 'Mumbai', lat: 18.9309, lon: 72.8327, indices: ['SENSEX', 'NIFTY'], timezone: 'IST' },
  { name: 'ASX', city: 'Sydney', lat: -33.8678, lon: 151.2087, indices: ['ASX200'], timezone: 'AEST' },
  { name: 'TSX', city: 'Toronto', lat: 43.6481, lon: -79.3820, indices: ['TSX'], timezone: 'EST' },
  { name: 'MOEX', city: 'Moscow', lat: 55.7554, lon: 37.6315, indices: ['MOEX'], timezone: 'MSK' },
  { name: 'B3', city: 'São Paulo', lat: -23.5558, lon: -46.6396, indices: ['IBOV'], timezone: 'BRT' },
  { name: 'SGX', city: 'Singapore', lat: 1.2826, lon: 103.8500, indices: ['STI'], timezone: 'SGT' },
  { name: 'KRX', city: 'Seoul', lat: 37.5219, lon: 126.9259, indices: ['KOSPI'], timezone: 'KST' },
  { name: 'Tadawul', city: 'Riyadh', lat: 24.6914, lon: 46.6853, indices: ['TASI'], timezone: 'AST' },
];

// Simulated market data (updates periodically with realistic values)
function generateMarketData() {
  return FINANCIAL_CENTERS.map(center => {
    const change = (Math.random() - 0.45) * 4; // Slight bull bias
    const value = 10000 + Math.random() * 30000;
    return {
      ...center,
      change: change,
      value: value,
      volume: Math.floor(Math.random() * 500000000),
      status: isMarketOpen(center.timezone) ? 'OPEN' : 'CLOSED'
    };
  });
}

function isMarketOpen(timezone) {
  // Simple check — most markets operate ~9am-4pm local
  const hour = new Date().getUTCHours();
  const offsets = { EST: -5, GMT: 0, JST: 9, CST: 8, HKT: 8, CET: 1, IST: 5.5, AEST: 11, MSK: 3, BRT: -3, SGT: 8, KST: 9, AST: 3 };
  const offset = offsets[timezone] || 0;
  const localHour = (hour + offset + 24) % 24;
  return localHour >= 9 && localHour < 16;
}

function renderMarkets() {
  const viewer = getViewer();
  if (!viewer) return;

  // Clear old
  marketEntities.forEach(id => viewer.entities.removeById(id));
  marketEntities = [];

  const data = generateMarketData();

  data.forEach((market, i) => {
    const isUp = market.change >= 0;
    const color = isUp ? '#00e676' : '#ff1744';
    const arrow = isUp ? '▲' : '▼';
    const entityId = `market-${i}`;

    viewer.entities.add({
      id: entityId,
      name: market.name,
      position: Cesium.Cartesian3.fromDegrees(market.lon, market.lat, 50000),
      label: {
        text: `${market.name}\n${arrow} ${Math.abs(market.change).toFixed(2)}%`,
        font: '12px JetBrains Mono',
        fillColor: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0e17').withAlpha(0.85),
        backgroundPadding: new Cesium.Cartesian2(8, 5),
        pixelOffset: new Cesium.Cartesian2(0, -20),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1, 2e7, 0.4),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3e7),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      // Glowing column from surface up
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          market.lon, market.lat, 0,
          market.lon, market.lat, 50000
        ]),
        width: 3,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: Cesium.Color.fromCssColorString(color).withAlpha(0.5)
        }),
      },
      properties: {
        type: 'market',
        exchange: market.name,
        city: market.city,
        indices: market.indices,
        change: market.change,
        value: market.value,
        status: market.status
      }
    });

    marketEntities.push(entityId);
  });
}

export function registerMarketsLayer() {
  registerLayer('markets', {
    name: 'Financial Markets',
    init: async () => {
      renderMarkets();
      updateTimer = setInterval(renderMarkets, 60000); // Update every minute
    },
    show: () => {
      const v = getViewer();
      marketEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = true;
      });
    },
    hide: () => {
      const v = getViewer();
      marketEntities.forEach(id => {
        const e = v?.entities.getById(id);
        if (e) e.show = false;
      });
    },
    update: () => {}
  });
}
