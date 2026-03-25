/**
 * info-panel.js — Entity detail popup on click
 * Now with event-news correlation for geopolitical events
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { HEADLINE_TEMPLATES } from './newsfeed.js';

/**
 * Find news headlines that correlate with a geopolitical event
 * Matches by region overlap, party names in headline text, and keyword similarity
 */
function findRelatedNews(eventProps) {
  const region = (eventProps.region || '').toLowerCase();
  const parties = (eventProps.parties || []).map(p => p.toLowerCase());
  const description = (eventProps.description || '').toLowerCase();
  const evType = (eventProps.eventType || '').toLowerCase();

  // Extract keywords from description (words > 3 chars)
  const descWords = description.split(/\s+/).filter(w => w.length > 3);

  return HEADLINE_TEMPLATES
    .map(headline => {
      let score = 0;
      const hText = headline.text.toLowerCase();
      const hRegion = headline.region.toLowerCase();

      // Region match (strong signal)
      if (region && hRegion) {
        if (hRegion.includes(region) || region.includes(hRegion)) score += 3;
        // Broader region matching (e.g., "Middle East" covers "Iran")
        const regionMap = {
          'middle east': ['iran', 'iraq', 'israel', 'lebanon', 'syria', 'yemen', 'gulf'],
          'eastern europe': ['ukraine', 'russia'],
          'asia-pacific': ['china', 'taiwan', 'japan', 'korea'],
          'international': ['un', 'global', 'g7'],
        };
        for (const [broad, specifics] of Object.entries(regionMap)) {
          if ((region.includes(broad) || hRegion.includes(broad)) &&
              specifics.some(s => region.includes(s) || hRegion.includes(s))) {
            score += 2;
          }
        }
      }

      // Party name appears in headline
      parties.forEach(party => {
        if (hText.includes(party)) score += 3;
      });

      // Keyword overlap from description
      descWords.forEach(word => {
        if (hText.includes(word)) score += 1;
      });

      // Event type alignment
      if (evType === 'strike' && (headline.cat === 'BREAKING' || headline.cat === 'CONFLICT')) score += 1;
      if (evType === 'diplomatic' && headline.cat === 'DIPLOMATIC') score += 2;
      if (evType === 'sanction' && (headline.cat === 'MARKETS' || headline.cat === 'ECONOMY')) score += 1;

      return { ...headline, score };
    })
    .filter(h => h.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4); // Top 4 related stories
}

const TYPE_FORMATTERS = {
  satellite: (props) => `
    <div class="info-row"><span class="info-label">NORAD ID</span><span class="info-value">${props.noradId}</span></div>
    <div class="info-row"><span class="info-label">OPERATOR</span><span class="info-value">${props.operator}</span></div>
    <div class="info-row"><span class="info-label">NATION</span><span class="info-value">${props.nation}</span></div>
    <div class="info-row"><span class="info-label">SENSOR</span><span class="info-value">${props.sensorType}</span></div>
    <div class="info-row"><span class="info-label">RESOLUTION</span><span class="info-value">${props.resolution}</span></div>
    <div class="info-row"><span class="info-label">ORBIT</span><span class="info-value">${props.orbitType}</span></div>
    <div class="info-row"><span class="info-label">CATEGORY</span><span class="info-value">${props.category}</span></div>
  `,
  aircraft: (props) => `
    <div class="info-row"><span class="info-label">CALLSIGN</span><span class="info-value">${props.callsign}</span></div>
    <div class="info-row"><span class="info-label">ICAO24</span><span class="info-value">${props.icao24}</span></div>
    <div class="info-row"><span class="info-label">ORIGIN</span><span class="info-value">${props.origin}</span></div>
    <div class="info-row"><span class="info-label">ALTITUDE</span><span class="info-value">${Math.round(props.altitude)}m</span></div>
    <div class="info-row"><span class="info-label">SPEED</span><span class="info-value">${props.velocity ? Math.round(props.velocity) + ' m/s' : 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">HEADING</span><span class="info-value">${props.heading ? Math.round(props.heading) + '°' : 'N/A'}</span></div>
    <div class="info-row"><span class="info-label">SQUAWK</span><span class="info-value">${props.squawk || 'N/A'}</span></div>
  `,
  vessel: (props) => `
    <div class="info-row"><span class="info-label">TYPE</span><span class="info-value">${props.vesselType}</span></div>
    <div class="info-row"><span class="info-label">MMSI</span><span class="info-value">${props.mmsi}</span></div>
    <div class="info-row"><span class="info-label">FLAG</span><span class="info-value">${props.flag}</span></div>
    <div class="info-row"><span class="info-label">SPEED</span><span class="info-value">${props.speed} kts</span></div>
    <div class="info-row"><span class="info-label">HEADING</span><span class="info-value">${props.heading}°</span></div>
    <div class="info-row"><span class="info-label">DESTINATION</span><span class="info-value">${props.destination}</span></div>
  `,
  earthquake: (props) => `
    <div class="info-row"><span class="info-label">MAGNITUDE</span><span class="info-value" style="color:#ff6d00">M${props.magnitude?.toFixed(1)}</span></div>
    <div class="info-row"><span class="info-label">DEPTH</span><span class="info-value">${props.depth?.toFixed(1)} km</span></div>
    <div class="info-row"><span class="info-label">LOCATION</span><span class="info-value">${props.place}</span></div>
    <div class="info-row"><span class="info-label">TIME</span><span class="info-value">${props.time}</span></div>
  `,
  geopolitical_event: (props) => {
    const related = findRelatedNews(props);
    const relatedHTML = related.length > 0 ? `
      <div class="info-related-section">
        <div class="info-related-header">
          <span class="material-symbols-outlined" style="font-size:14px">newspaper</span>
          RELATED INTEL
        </div>
        ${related.map(n => `
          <div class="info-related-item">
            <span class="info-related-cat" style="color:${
              n.priority === 'urgent' ? '#ff1744' : n.priority === 'high' ? '#ffab00' : '#4A90D9'
            }">${n.cat}</span>
            <span class="info-related-text">${n.icon} ${n.text}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="info-row"><span class="info-label">TYPE</span><span class="info-value">${props.eventType}</span></div>
      <div class="info-row"><span class="info-label">PARTIES</span><span class="info-value">${props.parties?.join(', ')}</span></div>
      <div class="info-row"><span class="info-label">TIME</span><span class="info-value">${props.timestamp}</span></div>
      <div class="info-row"><span class="info-label">REGION</span><span class="info-value">${props.region}</span></div>
      <div style="padding-top:8px;color:#9aa0a6;font-size:11px">${props.description}</div>
      ${relatedHTML}
    `;
  },
  cctv: (props) => `
    <div class="info-row"><span class="info-label">CITY</span><span class="info-value">${props.city}</span></div>
    <div class="info-row"><span class="info-label">LAST UPDATE</span><span class="info-value">${props.lastUpdate}</span></div>
    <div class="info-row"><span class="info-label">FEED</span><span class="info-value">${props.feedUrl ? 'Available' : 'Marker Only'}</span></div>
  `,
  market: (props) => `
    <div class="info-row"><span class="info-label">EXCHANGE</span><span class="info-value">${props.exchange}</span></div>
    <div class="info-row"><span class="info-label">CITY</span><span class="info-value">${props.city}</span></div>
    <div class="info-row"><span class="info-label">INDICES</span><span class="info-value">${props.indices?.join(', ')}</span></div>
    <div class="info-row"><span class="info-label">CHANGE</span><span class="info-value" style="color:${props.change >= 0 ? '#00e676' : '#ff1744'}">${props.change >= 0 ? '▲' : '▼'} ${Math.abs(props.change).toFixed(2)}%</span></div>
    <div class="info-row"><span class="info-label">STATUS</span><span class="info-value">${props.status}</span></div>
  `,
};

let clickHandler = null;

export function initInfoPanel() {
  const viewer = getViewer();
  if (!viewer) return;

  const panel = document.getElementById('infoPanel');
  const title = document.getElementById('infoPanelTitle');
  const body = document.getElementById('infoPanelBody');
  const closeBtn = document.getElementById('infoPanelClose');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.add('hidden');
    });
  }

  // Handle entity clicks — store handler for cleanup
  clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  clickHandler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (!picked || !picked.id) {
      panel.classList.add('hidden');
      return;
    }

    const entity = picked.id;
    const props = {};

    // Extract properties from entity
    if (entity.properties) {
      const propNames = entity.properties.propertyNames;
      propNames.forEach(name => {
        const val = entity.properties[name]?.getValue?.() ?? entity.properties[name];
        props[name] = val;
      });
    }

    const type = props.type;
    const formatter = TYPE_FORMATTERS[type];

    if (formatter) {
      title.textContent = entity.name || type.toUpperCase();
      body.innerHTML = formatter(props);

      // Add TRACK button for entities with positions
      const trackBtn = document.createElement('button');
      trackBtn.className = 'info-track-btn';
      trackBtn.innerHTML = '<span class="material-symbols-outlined">gps_fixed</span> TRACK ENTITY';
      trackBtn.addEventListener('click', () => {
        if (viewer.trackedEntity === entity) {
          viewer.trackedEntity = undefined;
          trackBtn.innerHTML = '<span class="material-symbols-outlined">gps_fixed</span> TRACK ENTITY';
        } else {
          viewer.trackedEntity = entity;
          trackBtn.innerHTML = '<span class="material-symbols-outlined">gps_off</span> STOP TRACKING';
        }
      });
      body.appendChild(trackBtn);

      panel.classList.remove('hidden');
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // ESC to stop tracking and close panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      viewer.trackedEntity = undefined;
      panel.classList.add('hidden');
    }
  });
}

/**
 * Destroy the info panel click handler — frees the ScreenSpaceEventHandler
 */
export function destroyInfoPanel() {
  if (clickHandler) {
    clickHandler.destroy();
    clickHandler = null;
  }
}
