/**
 * agent.js — VIGILENT Research Agent
 * Dual-mode search: location search ↔ AI research agent
 * Matches user prompts against current events, news, AND historical data
 * Places temporary markers on the map for all discovered items
 * Integrates Historical Navigator for guided tour playback
 */
import * as Cesium from 'cesium';
import { researcher } from '../services/researcher.js';
import { narrator } from '../services/narrator.js';
import { campaignCache } from '../services/campaignCache.js';
import { playNewsSting } from '../services/newsAudio.js';
import { GEOPOLITICAL_EVENTS } from '../geo/events.js';
import { HEADLINE_TEMPLATES } from './newsfeed.js';
import { HISTORICAL_EVENTS, HISTORICAL_STYLES, getHistoricalIcon } from '../data/historical.js';
import { showHistoricalTimeline, restoreNewsFeed } from './newsfeed.js';
import { flyToLocation } from '../core/camera.js';
import { getViewer } from '../core/globe.js';
import { toggleLayer, getVisibleLayerIds } from '../core/layers.js';
import { startNavigator, stopNavigator, isNavigatorActive } from './navigator.js';

let agentMode = false;
let agentPanel = null;
let agentMarkerIds = [];
let savedLayerState = null;
let inHistoricalDisplay = false;
let activeTickerEl = null;  // live news ticker element

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
    // Ordinals & generic numbers — match too broadly
    'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    // Generic action words
    'great', 'big', 'new', 'old', 'last', 'next', 'many', 'much', 'most',
    'start', 'end', 'began', 'begin', 'major', 'main', 'important',
    'please', 'would', 'like', 'want', 'need', 'know', 'look', 'think',
    'mission', 'story', 'journey', 'event', 'events', 'thing', 'things',
  ]);
  return prompt
    .toLowerCase()
    .replace(/[?!.,;:'"]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

/**
 * Score any data item (event, news, or historical) against keywords.
 * Requires at least 40% of keywords to match to prevent garbage results
 * from single-word coincidences (e.g., "third" matching "Third Crusade").
 */
function scoreItem(item, keywords) {
  if (keywords.length === 0) return 0;

  let score = 0;
  let matchedKeywords = 0;
  const fields = [
    item.title, item.description, item.region, item.text,
    item.era, item.year, item.cat, item.type,
    ...(item.parties || []),
  ].filter(Boolean);
  const searchable = fields.join(' ').toLowerCase();

  keywords.forEach(kw => {
    let kwMatched = false;
    if (searchable.includes(kw)) {
      score += 2;
      kwMatched = true;
    }
    // Partial match bonus (only for substantive words)
    if (kw.length > 3) {
      searchable.split(/\s+/).forEach(w => {
        if (w.length > 3 && (w.startsWith(kw) || kw.startsWith(w))) {
          score += 1;
          kwMatched = true;
        }
      });
    }
    if (kwMatched) matchedKeywords++;
  });

  // Require at least 40% of keywords to match (min 1)
  const minMatches = Math.max(1, Math.ceil(keywords.length * 0.4));
  if (matchedKeywords < minMatches) return 0;

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
function placeAgentMarkers(events, news, historical, isNewsMode = false) {
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
    // For news mode: use pulsing red instead of era-specific colors
    const markerColor = isNewsMode
      ? Cesium.Color.fromCssColorString('#ff1744')
      : Cesium.Color.fromCssColorString(style.color);
    const markerAlpha = isNewsMode ? 0.2 : 0.12;
    const outlineAlpha = isNewsMode ? 0.8 : 0.6;
    const markerIcon = isNewsMode ? '🔴' : style.icon;

    // Prominent icon point (pulsing via CSS for news mode)
    viewer.entities.add({
      id,
      position: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, 0),
      ellipse: {
        semiMinorAxis: isNewsMode ? 80000 : 60000,
        semiMajorAxis: isNewsMode ? 80000 : 60000,
        height: 0,
        material: markerColor.withAlpha(markerAlpha),
        outline: true, outlineColor: markerColor.withAlpha(outlineAlpha),
      },
      // Large icon billboard via label
      label: {
        text: markerIcon,
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

  // Dynamic threshold: require meaningful match quality
  // For 1 keyword: score >= 2 (exact match required)
  // For 2 keywords: score >= 4 (both must match)
  // For 3+ keywords: score >= keywords * 1.5 (most must match)
  const minScore = keywords.length <= 1 ? 2
    : keywords.length === 2 ? 4
    : Math.ceil(keywords.length * 1.5);

  // Score current events
  const scoredEvents = GEOPOLITICAL_EVENTS
    .map(ev => ({ ...ev, score: scoreItem(ev, keywords) }))
    .filter(ev => ev.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Score news
  const scoredNews = HEADLINE_TEMPLATES
    .map(h => ({ ...h, score: scoreItem(h, keywords) }))
    .filter(h => h.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Score historical events (stricter — these need strong matches)
  const histMinScore = Math.max(minScore, 4); // floor of 4 for historical
  const scoredHistorical = HISTORICAL_EVENTS
    .map(h => ({ ...h, score: scoreItem(h, keywords) }))
    .filter(h => h.score >= histMinScore)
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

function renderThinking(panel, phase = 'research') {
  const phases = {
    research: { icon: 'travel_explore', text: 'PHASE 1 — RESEARCHING SOURCES...', color: '#00e5ff' },
    news:     { icon: 'breaking_news', text: 'PHASE 1 — SCANNING LIVE NEWS FEEDS...', color: '#ff1744' },
    script:   { icon: 'auto_awesome', text: 'PHASE 2 — SCRIPTING NARRATION...', color: '#ffab00' },
    map:      { icon: 'map', text: 'PHASE 3 — MAPPING CAMPAIGN...', color: '#00e676' },
    fallback: { icon: 'database', text: 'SCANNING LOCAL DATABASES...', color: '#4A90D9' },
  };
  const p = phases[phase] || phases.research;
  panel.innerHTML = `
    <div class="agent-thinking">
      <div class="agent-thinking-dots">
        <span></span><span></span><span></span>
      </div>
      <span class="material-symbols-outlined" style="color:${p.color};font-size:18px;margin-right:6px">${p.icon}</span>
      <span class="agent-thinking-text" style="color:${p.color}">${p.text}</span>
    </div>
  `;
  panel.classList.remove('hidden');
}

function renderBriefing(panel, results) {
  const { events, news, regions, summary } = results;
  // Sort historical events chronologically (BC dates first)
  const historical = [...(results.historical || [])].sort((a, b) => {
    const parseY = (y) => {
      const s = String(y || '').trim().replace(/^~/, '');
      const m = s.match(/(\d+)/);
      if (!m) return 0;
      const n = parseInt(m[1], 10);
      return s.toUpperCase().includes('BC') ? -n : n;
    };
    return parseY(a.year) - parseY(b.year);
  });
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

  const isNews = !!results._isNews;
  const headerLabel = isNews
    ? '🔴 LIVE SITUATION REPORT'
    : isHistorical && events.length === 0
      ? 'VIGILENT HISTORICAL ANALYSIS'
      : 'VIGILENT AGENT BRIEFING';
  const headerIcon = isNews ? 'breaking_news' : (isHistorical && events.length === 0 ? 'history_edu' : 'smart_toy');
  const briefingClass = isNews ? 'agent-briefing-news' : (isHistorical ? 'agent-briefing-historical' : '');
  const headerClass = isNews ? 'agent-header-news' : (isHistorical ? 'agent-header-historical' : '');

  // Build news tag badges for news mode historical items
  const newsHistoricalHTML = isNews && historical.length > 0 ? `
    <div class="agent-section-title agent-section-news">
      <span class="material-symbols-outlined">crisis_alert</span>
      SITUATION REPORT (${historical.length} LOCATIONS)
    </div>
    ${historical.map(h => {
      const newsTag = h.news_tag || h.type?.toUpperCase() || 'BREAKING';
      const tagClass = newsTag.toLowerCase().replace(/\s+/g, '-');
      return `
        <div class="agent-event-card agent-news-card" data-lat="${h.lat}" data-lon="${h.lon}">
          <span class="agent-event-icon">🔴</span>
          <div class="agent-event-info">
            <div class="agent-event-title">
              <span class="news-tag-badge news-tag-${tagClass}">${newsTag}</span>
              ${h.title}
            </div>
            <div class="agent-event-meta">${h.year || 'Now'} · ${h.region}</div>
            <div class="agent-event-desc">${h.description}</div>
            ${h.source_url ? `<a class="agent-source-link" href="${h.source_url}" target="_blank" rel="noopener">📎 Source</a>` : ''}
          </div>
          <span class="material-symbols-outlined agent-event-fly">flight_takeoff</span>
        </div>
      `;
    }).join('')}
  ` : '';

  // Check if this qualifies for a guided tour
  // Mode A: LLM-generated campaign (already has campaign_path)
  // Mode B: Local data with dominant era (legacy)
  const hasLLMCampaign = !!results._llmCampaign;
  let canTour, tourEvents, dominantEra;

  if (hasLLMCampaign) {
    canTour = true;
    tourEvents = historical; // placeholder — navigator uses _llmCampaign directly
    dominantEra = [results._llmCampaign.metadata?.era || 'Campaign', 0];
  } else {
    const eraCounts = {};
    historical.forEach(h => { eraCounts[h.era] = (eraCounts[h.era] || 0) + 1; });
    dominantEra = Object.entries(eraCounts).sort((a, b) => b[1] - a[1])[0];
    canTour = isHistorical && dominantEra && dominantEra[1] >= 3;
    tourEvents = canTour ? historical.filter(h => h.era === dominantEra[0]) : [];
  }

  const tourHTML = canTour ? `
    <div class="agent-tour-controls">
      <div class="agent-tour-length">
        <button class="tour-len-btn" data-length="short" title="Brief narration — just the facts">SHORT</button>
        <button class="tour-len-btn active" data-length="medium" title="Standard documentary narration">MEDIUM</button>
        <button class="tour-len-btn" data-length="long" title="Full dramatic storytelling">LONG</button>
      </div>
      <button class="agent-tour-btn" id="startTourBtn">
        <span class="material-symbols-outlined">explore</span>
        START GUIDED TOUR
      </button>
    </div>
  ` : '';

  panel.innerHTML = `
    <div class="agent-briefing ${briefingClass}">
      <div class="agent-briefing-header ${headerClass}">
        <span class="material-symbols-outlined">${headerIcon}</span>
        ${headerLabel}
        <span class="agent-marker-badge">${totalMarkers} MAPPED</span>
        ${results._cacheSource ? `<span class="agent-cache-badge agent-cache-${results._cacheSource}">${results._cacheSource === 'hit' ? '⚡ CACHED' : '● LIVE'}</span>` : ''}
      </div>
      <div class="agent-summary">${summary}</div>
      ${tourHTML}
      ${isNews ? newsHistoricalHTML : ''}
      ${eventsHTML}
      ${isNews ? '' : historicalHTML}
      ${newsHTML}
      ${regionsHTML}
    </div>
  `;

  // Wire up tour length toggle + guided tour button
  if (canTour) {
    let selectedLength = 'medium';

    // Tour length buttons
    panel.querySelectorAll('.tour-len-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.querySelectorAll('.tour-len-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLength = btn.dataset.length;
      });
    });

    const tourBtn = panel.querySelector('#startTourBtn');
    if (tourBtn) {
      tourBtn.addEventListener('click', () => {
        try {
          panel.classList.add('hidden');
          clearAgentMarkers(); // Hide static markers before tour begins
          if (hasLLMCampaign) {
            // Pass the LLM-generated campaign directly to navigator
            startNavigator(results._llmCampaign.campaign_path, results._llmCampaign.metadata?.title || 'Campaign', selectedLength, results._llmCampaign);
          } else {
            startNavigator(tourEvents, dominantEra[0], selectedLength);
          }
        } catch (err) {
          console.error('[AGENT] Tour launch failed:', err);
          panel.classList.remove('hidden');
        }
      });
    }
  }

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
    hideLiveTicker();
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

// ── Time-window detection ──────────────────────────────────────

function detectTimeframe(prompt) {
  const p = prompt.toLowerCase();
  if (/today|tonight|this morning|breaking|right now|just now|last hour/.test(p)) return 'LAST_24H';
  if (/this week|past week|weekly|last 7 days|past few days/.test(p)) return 'PAST_WEEK';
  return 'FULL_OVERVIEW';
}

// ── Live Ticker ────────────────────────────────────────────────

function showLiveTicker(campaign) {
  hideLiveTicker();
  const stops = campaign.campaign_path || [];
  if (stops.length === 0) return;

  const headlines = stops.map(s => {
    const tag = s.news_tag || 'BREAKING';
    const title = s.title || s.location_name || '';
    const snippet = (s.lecture_segment || '').split('.')[0];
    return `<span class="ticker-tag ticker-tag-${tag.toLowerCase().replace(/\s+/g, '-')}">${tag}</span> <strong>${title}</strong>: ${snippet}`;
  }).join(' &nbsp;·&nbsp; ');

  const el = document.createElement('div');
  el.id = 'liveTicker';
  el.className = 'live-ticker';
  el.innerHTML = `
    <div class="ticker-label">🔴 LIVE</div>
    <div class="ticker-track">
      <div class="ticker-content">${headlines} &nbsp;·&nbsp; ${headlines}</div>
    </div>
  `;
  document.body.appendChild(el);
  activeTickerEl = el;
}

function hideLiveTicker() {
  if (activeTickerEl) {
    activeTickerEl.remove();
    activeTickerEl = null;
  }
  const existing = document.getElementById('liveTicker');
  if (existing) existing.remove();
}

async function handleAgentQuery(prompt) {
  if (!prompt.trim()) return;

  // Detect mode: news vs historical
  const pLow = prompt.toLowerCase();
  
  // Explicit historical keywords prevent the query from being forced into "LIVE NEWS"
  // just because it contains words like "war" (e.g. "World War II")
  const historicalKeywords = [
    'history', 'historical', 'world war', 'ww1', 'ww2', 'wwi', 'wwii',
    'ancient', 'empire', 'dynasty', 'century', 'b.c.', 'a.d.', 'bc', 'ad',
    'cold war', 'korean war', 'vietnam war', 'civil war', 'revolutionary war',
    'napoleonic', 'crusade', 'crusades', 'medieval', 'renaissance', 'bronze age',
    'iron age', 'stone age', 'ottoman', 'roman', 'greek', 'persian', 'mongol',
    'byzantine', 'aztec', 'maya', 'inca', 'pharaoh', 'mesopotamia', 'viking',
    'colonial', 'industrial revolution', 'silk road', 'alexander the great',
    'genghis khan', 'julius caesar', 'cleopatra', 'napoleon', 'charlemagne',
  ];
  const isHistoricalExplicit = historicalKeywords.some(kw => pLow.includes(kw));
  
  const newsKeywords = ['news', 'today', 'current', 'recent', 'breaking', 'latest', '2024', '2025', '2026',
    'crisis', 'market', 'stocks', 'conflict', 'war', 'strike', 'tonight', 'this week'];
  const isNewsQuery = !isHistoricalExplicit && newsKeywords.some(kw => pLow.includes(kw));
  const searchMode = isNewsQuery ? 'news' : 'historical';
  const timeframe = isNewsQuery ? detectTimeframe(prompt) : null;

  // Clean up previous news ticker if switching modes
  if (!isNewsQuery) hideLiveTicker();

  // ── Check campaign cache first ──
  const cachedCampaign = campaignCache.get(prompt);
  if (cachedCampaign) {
    renderThinking(agentPanel, 'map');
    await new Promise(r => setTimeout(r, 300));

    const isNewsCampaign = cachedCampaign.metadata?.type === 'LIVE_NEWS';
    const historical = _campaignToHistorical(cachedCampaign);
    const hasLLM = cachedCampaign.campaign_path?.[0]?.lecture_segment?.length > 20;

    const results = {
      events: [],
      news: [],
      historical,
      regions: [...new Set(historical.map(h => h.region).filter(Boolean))],
      summary: _buildSummary(cachedCampaign, historical, prompt),
      _llmCampaign: hasLLM ? cachedCampaign : null,
      _cacheSource: 'hit',
      _isNews: isNewsCampaign,
    };

    if (isNewsCampaign) {
      restoreModernLayers();
      showLiveTicker(cachedCampaign);
    } else {
      hideModernLayers();
      showHistoricalTimeline(historical);
    }
    placeAgentMarkers(results.events, results.news, results.historical, isNewsCampaign);
    renderBriefing(agentPanel, results);
    setTimeout(() => zoomToAgentMarkers(results.events, results.news, results.historical), 300);
    return;
  }

  // ── Try the Delta pipeline (Researcher → Narrator → Pilot) ──
  try {
    // Phase 1: Research
    renderThinking(agentPanel, isNewsQuery ? 'news' : 'research');
    const [searchAvail, narratorAvail, kgAvail] = await Promise.all([
      researcher.checkAvailability(),
      narrator.checkAvailability(),
      researcher.checkKGAvailability(),
    ]);

    // Need at least the narrator + at least one data source (Serper OR KG)
    if (!narratorAvail || (!searchAvail && !kgAvail)) {
      throw new Error('APIs not configured');
    }

    const searchData = await researcher.search(prompt, searchMode);
    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('No search results');
    }

    // Phase 2: Narrate (route to appropriate narrator)
    renderThinking(agentPanel, 'script');
    let campaign;
    if (isNewsQuery) {
      campaign = await narrator.generateNewsReport(searchData, prompt, timeframe, 'medium');
    } else {
      campaign = await narrator.generateCampaign(searchData, prompt, 'medium');
    }

    // Phase 3: Map
    renderThinking(agentPanel, 'map');
    await new Promise(r => setTimeout(r, 400));

    // Play news sting for live reports
    if (isNewsQuery) {
      playNewsSting();
    }

    // Cache the successful campaign
    campaignCache.put(prompt, campaign, 'llm');

    const historical = _campaignToHistorical(campaign);

    const results = {
      events: [],
      news: [],
      historical,
      regions: [...new Set(historical.map(h => h.region).filter(Boolean))],
      summary: isNewsQuery
        ? `VIGILENT Live Anchor analyzed <strong>${searchData.results.length}</strong> sources. Urgency: <strong>${campaign.metadata?.urgency || 'High'}</strong>. <strong>${campaign.campaign_path.length} locations</strong> in this situation report.`
        : `VIGILENT Delta researched <strong>${searchData.results.length}</strong> sources and generated a <strong>${campaign.campaign_path.length}-stop</strong> guided campaign: <strong>${campaign.metadata?.title || prompt}</strong>.`,
      _llmCampaign: campaign,
      _cacheSource: 'live',
      _isNews: isNewsQuery,
    };

    if (isNewsQuery) {
      restoreModernLayers();
      showLiveTicker(campaign);
    } else {
      hideModernLayers();
      showHistoricalTimeline(historical);
    }
    placeAgentMarkers(results.events, results.news, results.historical, isNewsQuery);
    renderBriefing(agentPanel, results);
    setTimeout(() => zoomToAgentMarkers(results.events, results.news, results.historical), 300);
    return;

  } catch (err) {
    console.warn('[Agent] Delta pipeline failed, falling back to local:', err.message);
    window._lastAgentApiError = err.message.includes('APIs not configured') || err.message.includes('key');
  }

  // ── Fallback: local keyword search + KG enrichment ──
  renderThinking(agentPanel, window._lastAgentApiError ? 'fallback' : (isNewsQuery ? 'news' : 'fallback'));

  // Run local keyword search first
  const results = runResearch(prompt);

  // Also try to get KG results to supplement local data
  try {
    const kgData = await researcher.searchKG(prompt, 10);
    if (kgData.results && kgData.results.length > 0) {
      // Convert KG results to historical format for display
      const kgHistorical = kgData.results.map((r, i) => ({
        id: `kg-${i}`,
        title: r.title,
        year: r.era || '',
        type: 'historical',
        lat: r.lat || 0,
        lon: r.lng || 0,
        description: r.snippet || '',
        parties: [],
        region: '',
        era: r.era || 'Historical',
        source_url: r.source_url || '',
      })).filter(h => h.lat !== 0 && h.lon !== 0);

      // Merge KG results (avoid duplicates by title)
      const existingTitles = new Set(results.historical.map(h => h.title.toLowerCase()));
      kgHistorical.forEach(h => {
        if (!existingTitles.has(h.title.toLowerCase())) {
          results.historical.push(h);
          existingTitles.add(h.title.toLowerCase());
        }
      });

      // Update summary with KG data
      if (results.historical.length > 0) {
        if (window._lastAgentApiError) {
             results.summary = `<span style="color: #ff5252;">⚠️ Documentary Pipeline Offline.</span> LLM or Search APIs are not configured in the Admin panel. Serving raw intelligence for <strong>${results.historical.length}</strong> matching locations.`;
        } else {
             results.summary = generateSummary(extractKeywords(prompt), results.events, results.news, results.historical);
        }
      }
    }
  } catch (err) {
    console.warn('[Agent] KG search in fallback failed (non-fatal):', err.message);
  }

  const isHistorical = results.historical.length > 0 && results.events.length === 0;
  const hasAnyResults = results.events.length > 0 || results.news.length > 0 || results.historical.length > 0;

  // Pass news mode flag through to briefing renderer
  results._isNews = isNewsQuery;

  // Cache the local fallback result as a campaign
  if (isHistorical && results.historical.length >= 3) {
    const localCampaign = _historicalToCampaign(results.historical, prompt);
    campaignCache.put(prompt, localCampaign, 'local');
  }

  if (isNewsQuery && hasAnyResults) {
    // News fallback: keep modern layers, play sting
    restoreModernLayers();
    playNewsSting();
  } else if (isHistorical) {
    hideModernLayers();
    showHistoricalTimeline(results.historical);
  } else {
    restoreModernLayers();
    restoreNewsFeed();
  }

  placeAgentMarkers(results.events, results.news, results.historical, isNewsQuery);
  renderBriefing(agentPanel, results);
  setTimeout(() => zoomToAgentMarkers(results.events, results.news, results.historical), 300);
}

// ── Cache helpers ──────────────────────────────────────────────

function _campaignToHistorical(campaign) {
  return (campaign.campaign_path || []).map((stop, i) => ({
    id: `cached-${i}`,
    title: stop.title || stop.location_name || `Stop ${i + 1}`,
    year: stop.year || '',
    type: stop.type || 'campaign',
    lat: stop.coordinates?.lat || 0,
    lon: stop.coordinates?.lng || stop.coordinates?.lon || 0,
    description: stop.lecture_segment || stop.description || '',
    parties: stop.parties || [],
    region: stop.region || '',
    era: campaign.metadata?.era || 'Campaign',
    source_url: stop.source_url || '',
  }));
}

function _historicalToCampaign(historicalEvents, query) {
  return {
    metadata: {
      title: query,
      era: historicalEvents[0]?.era || 'History',
      total_stops: historicalEvents.length,
    },
    campaign_path: historicalEvents.map(ev => ({
      title: ev.title,
      year: ev.year,
      type: ev.type,
      coordinates: { lat: ev.lat, lng: ev.lon },
      lecture_segment: ev.description,
      source_url: ev.source_url || '',
      parties: ev.parties || [],
      region: ev.region || '',
      camera_emotion: 'cinematic_pan',
    })),
  };
}

function _buildSummary(campaign, historical, prompt) {
  const stops = campaign.campaign_path?.length || historical.length;
  const regions = [...new Set(historical.map(h => h.region).filter(Boolean))];
  const eras = [...new Set(historical.map(h => h.era).filter(Boolean))];
  return `VIGILENT historical analysis identified <strong>${stops} events</strong> from the ${eras.join(', ')} era. Spanning <strong>${regions.join(', ')}</strong>.`;
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
