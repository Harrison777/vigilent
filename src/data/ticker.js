/**
 * ticker.js — Scrolling financial market ticker strip
 * Shows Gold, Oil, NASDAQ, S&P 500, major currencies (EUR/USD, GBP/USD, USD/JPY, BTC)
 * Toggleable via the "Financial Markets" layer
 */
import { registerLayer } from '../core/layers.js';

let tickerEl = null;
let updateInterval = null;
let initialized = false;

// ── Ticker instruments with simulated base prices ──
const INSTRUMENTS = [
  { symbol: 'XAU/USD', name: 'Gold', base: 3045.20, icon: '🥇', type: 'commodity' },
  { symbol: 'WTI', name: 'Crude Oil', base: 68.42, icon: '🛢️', type: 'commodity' },
  { symbol: 'BRENT', name: 'Brent Oil', base: 72.15, icon: '🛢️', type: 'commodity' },
  { symbol: 'NAS100', name: 'NASDAQ', base: 17845.60, icon: '📊', type: 'index' },
  { symbol: 'SPX', name: 'S&P 500', base: 5667.30, icon: '📈', type: 'index' },
  { symbol: 'DJI', name: 'Dow Jones', base: 41890.50, icon: '📈', type: 'index' },
  { symbol: 'EUR/USD', name: 'Euro', base: 1.0842, icon: '💶', type: 'forex' },
  { symbol: 'GBP/USD', name: 'Pound', base: 1.2915, icon: '💷', type: 'forex' },
  { symbol: 'USD/JPY', name: 'Yen', base: 149.35, icon: '💴', type: 'forex' },
  { symbol: 'USD/CNY', name: 'Yuan', base: 7.2340, icon: '🇨🇳', type: 'forex' },
  { symbol: 'BTC/USD', name: 'Bitcoin', base: 87250.00, icon: '₿', type: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', base: 3120.50, icon: 'Ξ', type: 'crypto' },
  { symbol: 'NGAS', name: 'Nat Gas', base: 4.23, icon: '🔥', type: 'commodity' },
  { symbol: 'SILVER', name: 'Silver', base: 33.80, icon: '🥈', type: 'commodity' },
];

// Persistent simulated prices so they drift realistically
let priceState = INSTRUMENTS.map(inst => ({
  ...inst,
  current: inst.base,
  prevClose: inst.base * (1 + (Math.random() - 0.5) * 0.01),
}));

/**
 * Update prices with small random walk
 */
function tickPrices() {
  priceState = priceState.map(p => {
    const volatility = p.type === 'crypto' ? 0.003 : p.type === 'commodity' ? 0.001 : p.type === 'forex' ? 0.0003 : 0.0008;
    const drift = (Math.random() - 0.48) * volatility; // slight upward bias
    const newPrice = p.current * (1 + drift);
    return { ...p, current: newPrice };
  });
}

/**
 * Format price based on instrument type
 */
function formatPrice(inst) {
  if (inst.type === 'forex') return inst.current.toFixed(4);
  if (inst.current >= 10000) return inst.current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (inst.current >= 100) return inst.current.toFixed(2);
  return inst.current.toFixed(2);
}

/**
 * Build ticker HTML
 */
function renderTicker() {
  if (!tickerEl) return;

  tickPrices();

  const items = priceState.map(p => {
    const change = ((p.current - p.prevClose) / p.prevClose) * 100;
    const isUp = change >= 0;
    const arrow = isUp ? '▲' : '▼';
    const colorClass = isUp ? 'ticker-up' : 'ticker-down';

    return `<span class="ticker-item ${colorClass}">
      <span class="ticker-icon">${p.icon}</span>
      <span class="ticker-symbol">${p.symbol}</span>
      <span class="ticker-price">${formatPrice(p)}</span>
      <span class="ticker-change">${arrow}${Math.abs(change).toFixed(2)}%</span>
    </span>`;
  }).join('<span class="ticker-sep">│</span>');

  // Duplicate for infinite scroll
  const inner = tickerEl.querySelector('.ticker-track');
  if (inner) {
    inner.innerHTML = items + '<span class="ticker-sep">│</span>' + items;
  }
}

/**
 * Create the ticker DOM element
 */
function createTickerElement() {
  tickerEl = document.createElement('div');
  tickerEl.id = 'financialTicker';
  tickerEl.className = 'financial-ticker';
  tickerEl.innerHTML = `<div class="ticker-track"></div>`;

  // Insert above the stats bar
  const statsBar = document.getElementById('statsBar');
  if (statsBar) {
    statsBar.parentNode.insertBefore(tickerEl, statsBar);
  } else {
    document.body.appendChild(tickerEl);
  }
}

function initTicker() {
  if (initialized) return;
  createTickerElement();
  renderTicker();
  updateInterval = setInterval(renderTicker, 3000); // Update every 3s
  initialized = true;
}

function showTicker() {
  if (tickerEl) tickerEl.classList.add('visible');
}

function hideTicker() {
  if (tickerEl) tickerEl.classList.remove('visible');
}

export function registerTickerLayer() {
  registerLayer('ticker', {
    name: 'Financial Ticker',
    init: async () => {
      initTicker();
      showTicker();
    },
    show: showTicker,
    hide: hideTicker,
    update: () => {}
  });
}
