/**
 * agent.js — VIGILENT Research Agent
 * Dual-mode search: location search ↔ AI research agent
 * Matches user prompts against current events, news, AND historical data
 * Places temporary markers on the map for all discovered items
 */
import * as Cesium from 'cesium';
import { GEOPOLITICAL_EVENTS } from '../geo/events.js';
import { HEADLINE_TEMPLATES } from './newsfeed.js';
import { HISTORICAL_EVENTS, HISTORICAL_STYLES, getHistoricalIcon } from '../data/historical.js';
import { showHistoricalTimeline, restoreNewsFeed } from './newsfeed.js';
import { flyToLocation } from '../core/camera.js';
import { getViewer } from '../core/globe.js';
import { toggleLayer, getVisibleLayerIds } from '../core/layers.js';

let agentMode = false;
let agentPanel = null;
let agentMarkerIds = [];
let savedLayerState = null;  // layers active before historical mode
let inHistoricalDisplay = false;

// All layer IDs that should be hidden during historical view
const MODERN_LAYER_IDS = [
  'satellites-commercial', 'satellites-military',
  'aviation-commercial', 'aviation-military',
  'traffic', 'cctv', 'seismic',
  'maritime', 'events',
  'gps-jamming', 'internet-blackouts', 'airspace-closures',
  'ticker', 'markets', 'weather',
];

// ── Event type visual config ──
const EVENT_ICONS = {
  strike: '💥', response: '🎯', diplomatic: '🤝',
  sanction: '⚖️', military_movement: '🪖', natural_disaster: '🌊',
};

const PRIORITY_COLORS = {
  urgent: '#ff1744', high: '#ffab00', medium: '#4A90D9',
};

/**
 * Extract meaningful keywords from a user prompt
 */
function extractKeywords(prompt) {
  const stopWords = new Set([
    'what', 'is', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'a', 'an',
    'and', 'or', 'but', 'with', 'about', 'are', 'was', 'were', 'has', 'have',
    'been', 'being', 'there', 'their', 'they', 'this', 'that', 'those', 'these',
    'from', 'how', 'why', 'when', 'where', 'who', 'which', 'will', 'do', 'does',
    'happening', 'going', 'tell', 'me', 'give', 'show', 'find', 'search',
    'latest', 'recent', 'current', 'update', 'any', 'all', 'can', 'could',
    'past', 'history', 'historical',
  ]);
  return prompt
    .toLowerCase()
    .replace(/[?!.,;:'"]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

/**
 * Score any data item (event, news, or historical) against keywords
 */
function scoreItem(item, keywords) {
  let score = 0;
  const fields = [
    item.title, item.description, item.region, item.text,
    item.era, item.year, item.cat, item.type,
    ...(item.parties || []),
  ].filter(Boolean);
  const searchable = fields.join(' ').toLowerCase();

  keywords.forEach(kw => {
    if (searchable.includes(kw)) score += 2;
    // Partial match bonus
    searchable.split(/\s+/).forEach(w => {
      if (w.length > 3 && (w.startsWith(kw) || kw.startsWith(w))) score += 1;
    });
  });
  return score;
}

/**
 * Generate a situation summary based on matched data
 */
function generateSummary(keywords, events, news, historical) {
  const total = events.length + news.length + historical.length;

  if (total === 0) {
    return `No intelligence matching "<strong>${keywords.join(' ')}</strong>" in current or historical databases. Try broadening your search terms.`;
  }

  // Check if this is primarily historical
  const isHistorical = historical.length > 0 && events.length === 0;

  if (isHistorical) {
    const eras = [...new Set(historical.map(h => h.era))];
    const regions = [...new Set(historical.map(h => h.region))];
    const parties = [...new Set(historical.flatMap(h => h.parties || []))].slice(0, 6);
    const yearRange = historical.map(h => h.year).join(', ');

    let summary = `VIGILENT historical analysis identified <strong>${historical.length} event${historical.length > 1 ? 's' : ''}</strong>`;
    if (eras.length > 0) summary += ` from the <strong>${eras.join(', ')}</strong> era`;
    summary += '.';
    if (regions.length > 0) summary += ` Spanning <strong>${regions.join(', ')}</strong>.`;
    if (parties.length > 0) summary += ` Key actors: <strong>${parties.join(', ')}</strong>.`;
    return summary;
  }

  // Mixed or current-only results
  const regions = [...new Set([
    ...events.map(e => e.region),
    ...news.map(n => n.region),
    ...historical.map(h => h.region),
  ])];
  const parties = [...new Set([
    ...events.flatMap(e => e.parties || []),
    ...historical.flatMap(h => h.parties || []),
  ])].slice(0, 6);

  let summary = `VIGILENT has identified <strong>${total} intelligence item${total > 1 ? 's' : ''}</strong>`;
  if (regions.length > 0) summary += ` across <strong>${regions.slice(0, 5).join(', ')}</strong>`;
  summary += '.';
  if (events.length > 0) summary += ` ${events.length} active event${events.length > 1 ? 's' : ''}.`;
  if (news.length > 0) summary += ` ${news.length} corroborating news report${news.length > 1 ? 's' : ''}.`;
  if (historical.length > 0) summary += ` ${historical.length} historical precedent${historical.length > 1 ? 's' : ''} mapped.`;
  if (parties.length > 0) summary += ` Key actors: <strong>${parties.join(', ')}</strong>.`;

  return summary;
}

// ════════════════════════════════════════════════════════════════════
// MAP MARKER INTEGRATION
// ════════════════════════════════════════════════════════════════════

function clearAgentMarkers() {
  const viewer = getViewer();
  if (!viewer) return;
  agentMarkerIds.forEach(id => {
    const entity = viewer.entities.getById(id);
    if (entity) viewer.entities.remove(entity);
  });
  agentMarkerIds = [];
}

/**
 * Place markers on the globe for all discovered items
 */
function placeAgentMarkers(events, news, historical) {
  const viewer = getViewer();
  if (!viewer) return;
  clearAgentMarkers();

  const cyanColor = Cesium.Color.fromCssColorString('#00e5ff');

  // Current events — cyan rings
  events.forEach((ev, i) => {
    const id = `agent-event-${i}`;
    viewer.entities.add({
      id,
      position: Cesium.Cartesian3.fromDegrees(ev.lon, ev.lat, 0),
      ellipse: {
        semiMinorAxis: 80000, semiMajorAxis: 80000, height: 0,
        material: cyanColor.withAlpha(0.08),
        outline: true, outlineColor: cyanColor.withAlpha(0.5),
      },
      label: {
        text: `⟐ ${ev.title}`,
        font: '10px JetBrains Mono', fillColor: cyanColor,
        outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -30),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0e17').withAlpha(0.9),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1, 8e6, 0.35),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1.2e7),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      properties: { type: 'agent_marker', source: 'event' },
    });
    agentMarkerIds.push(id);
  });

  // News — priority-colored dots
  news.forEach((n, i) => {
    if (!n.lat || !n.lon) return;
    const id = `agent-news-${i}`;
    const color = Cesium.Color.fromCssColorString(PRIORITY_COLORS[n.priority] || '#4A90D9');
    viewer.entities.add({
      id,
      position: Cesium.Cartesian3.fromDegrees(n.lon, n.lat, 0),
      point: {
        pixelSize: 10, color: color.withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE.withAlpha(0.6), outlineWidth: 2,
        scaleByDistance: new Cesium.NearFarScalar(1e5, 2, 1e7, 0.5),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: `${n.icon} ${n.text.substring(0, 50)}…`,
        font: '9px JetBrains Mono',
        fillColor: Cesium.Color.WHITE.withAlpha(0.9),
        outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(14, 0),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0e17').withAlpha(0.85),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 0.9, 5e6, 0),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e6),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      properties: { type: 'agent_marker', source: 'news' },
    });
    agentMarkerIds.push(id);
  });

  // Historical events — era-appropriate icons with prominent markers
  historical.forEach((h, i) => {
    const id = `agent-hist-${i}`;
    const idLabel = `agent-hist-label-${i}`;
    const style = getHistoricalIcon(h);
    const markerColor = Cesium.Color.fromCssColorString(style.color);

    // Prominent icon point
    viewer.entities.add({
      id,
      position: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, 0),
      ellipse: {
        semiMinorAxis: 60000, semiMajorAxis: 60000, height: 0,
        material: markerColor.withAlpha(0.12),
        outline: true, outlineColor: markerColor.withAlpha(0.6),
      },
      // Large icon billboard via label
      label: {
        text: style.icon,
        font: '28px sans-serif',
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL,
        pixelOffset: new Cesium.Cartesian2(0, -4),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1.2, 8e6, 0.4),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1.5e7),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      properties: { type: 'agent_marker', source: 'historical' },
    });
    agentMarkerIds.push(id);

    // Title label below the icon
    viewer.entities.add({
      id: idLabel,
      position: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, 0),
      label: {
        text: `${h.title} (${h.year})`,
        font: '11px JetBrains Mono',
        fillColor: markerColor,
        outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, 22),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#1a150a').withAlpha(0.9),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1, 8e6, 0.3),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8e6),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      properties: { type: 'agent_marker', source: 'historical' },
    });
    agentMarkerIds.push(idLabel);
  });
}

/**
 * Zoom camera to fit all markers
 */
function zoomToAgentMarkers(events, news, historical) {
  const viewer = getViewer();
  if (!viewer) return;

  const allCoords = [
    ...events.map(e => ({ lat: e.lat, lon: e.lon })),
    ...news.filter(n => n.lat && n.lon).map(n => ({ lat: n.lat, lon: n.lon })),
    ...historical.map(h => ({ lat: h.lat, lon: h.lon })),
  ];

  if (allCoords.length === 0) return;

  if (allCoords.length === 1) {
    flyToLocation({ lat: allCoords[0].lat, lon: allCoords[0].lon, displayName: 'Agent Result' });
    return;
  }

  const lats = allCoords.map(c => c.lat);
  const lons = allCoords.map(c => c.lon);
  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(
      Math.min(...lons) - 2, Math.min(...lats) - 2,
      Math.max(...lons) + 2, Math.max(...lats) + 2
    ),
    duration: 2.0,
  });
}

// ════════════════════════════════════════════════════════════════════
// RESEARCH + BRIEFING
// ════════════════════════════════════════════════════════════════════

function runResearch(prompt) {
  const keywords = extractKeywords(prompt);
  if (keywords.length === 0) {
    return { events: [], news: [], historical: [], regions: [], summary: 'Please provide a more specific query.' };
  }

  // Score current events
  const scoredEvents = GEOPOLITICAL_EVENTS
    .map(ev => ({ ...ev, score: scoreItem(ev, keywords) }))
    .filter(ev => ev.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Score news
  const scoredNews = HEADLINE_TEMPLATES
    .map(h => ({ ...h, score: scoreItem(h, keywords) }))
    .filter(h => h.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Score historical events
  const scoredHistorical = HISTORICAL_EVENTS
    .map(h => ({ ...h, score: scoreItem(h, keywords) }))
    .filter(h => h.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  const regions = [...new Set([
    ...scoredEvents.map(e => e.region),
    ...scoredNews.map(n => n.region),
    ...scoredHistorical.map(h => h.region),
  ])].filter(Boolean);

  const summary = generateSummary(keywords, scoredEvents, scoredNews, scoredHistorical);
  return { events: scoredEvents, news: scoredNews, historical: scoredHistorical, regions, summary };
}

function renderThinking(panel) {
  panel.innerHTML = `
    <div class="agent-thinking">
      <div class="agent-thinking-dots">
        <span></span><span></span><span></span>
      </div>
      <span class="agent-thinking-text">SCANNING ALL INTELLIGENCE SOURCES...</span>
    </div>
  `;
  panel.classList.remove('hidden');
}

function renderBriefing(panel, results) {
  const { events, news, historical, regions, summary } = results;
  const totalMarkers = events.length + news.filter(n => n.lat && n.lon).length + historical.length;
  const isHistorical = historical.length > 0;

  // Current events section
  const eventsHTML = events.length > 0 ? `
    <div class="agent-section-title">
      <span class="material-symbols-outlined">location_on</span>
      ACTIVE EVENTS (${events.length})
    </div>
    ${events.map(ev => `
      <div class="agent-event-card" data-lat="${ev.lat}" data-lon="${ev.lon}">
        <span class="agent-event-icon">${EVENT_ICONS[ev.type] || '📍'}</span>
        <div class="agent-event-info">
          <div class="agent-event-title">${ev.title}</div>
          <div class="agent-event-meta">${ev.type.toUpperCase()} · ${ev.region} · ${ev.parties?.join(' vs ')}</div>
        </div>
        <span class="material-symbols-outlined agent-event-fly">flight_takeoff</span>
      </div>
    `).join('')}
  ` : '';

  // Historical events section
  const historicalHTML = historical.length > 0 ? `
    <div class="agent-section-title agent-section-historical">
      <span class="material-symbols-outlined">history_edu</span>
      HISTORICAL RECORD (${historical.length})
    </div>
    ${historical.map(h => {
      const style = getHistoricalIcon(h);
      return `
        <div class="agent-event-card agent-hist-card" data-lat="${h.lat}" data-lon="${h.lon}">
          <span class="agent-event-icon">${style.icon}</span>
          <div class="agent-event-info">
            <div class="agent-event-title">${h.title}</div>
            <div class="agent-event-meta">
              <span class="agent-hist-year">${h.year}</span> · ${h.era} · ${h.region}
              ${h.parties ? ` · ${h.parties.join(' vs ')}` : ''}
            </div>
            <div class="agent-event-desc">${h.description}</div>
          </div>
          <span class="material-symbols-outlined agent-event-fly">flight_takeoff</span>
        </div>
      `;
    }).join('')}
  ` : '';

  // News section
  const newsHTML = news.length > 0 ? `
    <div class="agent-section-title">
      <span class="material-symbols-outlined">newspaper</span>
      RELATED INTEL (${news.length})
    </div>
    ${news.map(n => `
      <div class="agent-event-card" data-lat="${n.lat || ''}" data-lon="${n.lon || ''}">
        <span class="agent-event-icon">${n.icon}</span>
        <div class="agent-event-info">
          <div class="agent-event-title">${n.text}</div>
          <div class="agent-event-meta">${n.cat} · ${n.region}</div>
        </div>
        ${n.lat ? '<span class="material-symbols-outlined agent-event-fly">flight_takeoff</span>' : ''}
      </div>
    `).join('')}
  ` : '';

  const regionsHTML = regions.length > 0 ? `
    <div class="agent-section-title">
      <span class="material-symbols-outlined">public</span>
      AFFECTED REGIONS
    </div>
    <div class="agent-regions">
      ${regions.map(r => `<span class="agent-region-tag">${r}</span>`).join('')}
    </div>
  ` : '';

  const headerLabel = isHistorical && events.length === 0
    ? 'VIGILENT HISTORICAL ANALYSIS'
    : 'VIGILENT AGENT BRIEFING';

  panel.innerHTML = `
    <div class="agent-briefing ${isHistorical ? 'agent-briefing-historical' : ''}">
      <div class="agent-briefing-header ${isHistorical ? 'agent-header-historical' : ''}">
        <span class="material-symbols-outlined">${isHistorical && events.length === 0 ? 'history_edu' : 'smart_toy'}</span>
        ${headerLabel}
        <span class="agent-marker-badge">${totalMarkers} MAPPED</span>
      </div>
      <div class="agent-summary">${summary}</div>
      ${eventsHTML}
      ${historicalHTML}
      ${newsHTML}
      ${regionsHTML}
    </div>
  `;

  // Wire up fly-to clicks
  panel.querySelectorAll('.agent-event-card').forEach(card => {
    const lat = parseFloat(card.dataset.lat);
    const lon = parseFloat(card.dataset.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      card.addEventListener('click', () => {
        flyToLocation({ lat, lon, displayName: card.querySelector('.agent-event-title')?.textContent });
      });
    }
  });
}

// ════════════════════════════════════════════════════════════════════
// MODE TOGGLE + INIT
// ════════════════════════════════════════════════════════════════════

function setMode(isAgent) {
  agentMode = isAgent;
  const container = document.getElementById('searchContainer');
  const input = document.getElementById('searchInput');
  const toggleBtn = document.getElementById('searchModeToggle');
  const searchResults = document.getElementById('searchResults');

  if (isAgent) {
    container.classList.add('agent-mode');
    toggleBtn.classList.add('agent-active');
    toggleBtn.querySelector('.material-symbols-outlined').textContent = 'smart_toy';
    toggleBtn.title = 'Switch to Location Search';
    input.placeholder = 'Ask VIGILENT... (e.g., "Alexander the Great", "Iran conflict")';
    input.value = '';
    searchResults.classList.remove('visible');
    agentPanel.classList.add('hidden');
  } else {
    container.classList.remove('agent-mode');
    toggleBtn.classList.remove('agent-active');
    toggleBtn.querySelector('.material-symbols-outlined').textContent = 'search';
    toggleBtn.title = 'Switch to Agent Mode';
    input.placeholder = 'Search location... (e.g., Pentagon, Kremlin, Beijing)';
    input.value = '';
    agentPanel.classList.add('hidden');
    clearAgentMarkers();
    restoreModernLayers();
    restoreNewsFeed();
  }
}

/**
 * Disable all modern layers for clean historical map view
 */
function hideModernLayers() {
  savedLayerState = getVisibleLayerIds();
  MODERN_LAYER_IDS.forEach(id => toggleLayer(id, false));
  // Also uncheck the sidebar toggles
  MODERN_LAYER_IDS.forEach(id => {
    const checkbox = document.querySelector(`[data-layer="${id}"]`);
    if (checkbox) checkbox.checked = false;
  });
  inHistoricalDisplay = true;
}

/**
 * Restore layers to their state before historical mode
 */
function restoreModernLayers() {
  if (!inHistoricalDisplay || !savedLayerState) return;
  savedLayerState.forEach(id => {
    toggleLayer(id, true);
    const checkbox = document.querySelector(`[data-layer="${id}"]`);
    if (checkbox) checkbox.checked = true;
  });
  savedLayerState = null;
  inHistoricalDisplay = false;
}

function handleAgentQuery(prompt) {
  if (!prompt.trim()) return;
  renderThinking(agentPanel);

  setTimeout(() => {
    const results = runResearch(prompt);
    const isHistorical = results.historical.length > 0 && results.events.length === 0;

    // If purely historical results, disable all modern layers for a clean view
    if (isHistorical) {
      hideModernLayers();
      showHistoricalTimeline(results.historical);
    } else {
      restoreModernLayers();
      restoreNewsFeed();
    }

    placeAgentMarkers(results.events, results.news, results.historical);
    renderBriefing(agentPanel, results);
    setTimeout(() => {
      zoomToAgentMarkers(results.events, results.news, results.historical);
    }, 300);
  }, 1200 + Math.random() * 800);
}

export function initAgent() {
  agentPanel = document.getElementById('agentPanel');
  const toggleBtn = document.getElementById('searchModeToggle');
  const input = document.getElementById('searchInput');

  if (!agentPanel || !toggleBtn || !input) return;

  // Listen for timeline fly-to events
  window.addEventListener('timeline-fly', (e) => {
    const { lat, lon } = e.detail;
    flyToLocation({ lat, lon, displayName: 'Historical Event' });
  });

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setMode(!agentMode);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && agentMode) {
      e.preventDefault();
      e.stopPropagation();
      handleAgentQuery(input.value);
    }
  });

  document.addEventListener('click', (e) => {
    if (agentPanel && !e.target.closest('#searchContainer')) {
      agentPanel.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && agentMode) {
      agentPanel.classList.add('hidden');
    }
  });
}

export function isAgentMode() {
  return agentMode;
}
