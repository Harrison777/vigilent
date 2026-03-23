/**
 * newsfeed.js — Collapsible world news feed panel on the right side
 * Generates procedural breaking news headlines that rotate periodically
 */

let feedPanel = null;
let updateInterval = null;
let isCollapsed = false;

// ── News headline templates — realistic geopolitical/finance headlines ──
export const HEADLINE_TEMPLATES = [
  // Iran / Middle East
  { cat: 'BREAKING', text: 'IRGC confirms damage to Isfahan military complex, vows retaliation', region: 'Iran', icon: '🔴', priority: 'urgent', lat: 32.654, lon: 51.668,
    image: 'https://images.unsplash.com/photo-1580894908361-967195033215?w=400&h=200&fit=crop' },
  { cat: 'CONFLICT', text: 'Israeli jets intercept Iranian UAV swarm over Golan Heights', region: 'Middle East', icon: '⚔️', priority: 'high', lat: 33.00, lon: 35.80,
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&h=200&fit=crop' },
  { cat: 'BREAKING', text: 'Tehran announces closure of Strait of Hormuz to "hostile vessels"', region: 'Iran', icon: '🔴', priority: 'urgent', lat: 26.56, lon: 56.25,
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=400&h=200&fit=crop' },
  { cat: 'DEFENSE', text: 'Pentagon deploys additional carrier group to Persian Gulf', region: 'USA', icon: '🚢', priority: 'high', lat: 26.00, lon: 52.00,
    image: 'https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=400&h=200&fit=crop' },
  { cat: 'DIPLOMATIC', text: 'China and Russia block UNSC resolution on Iran sanctions', region: 'UN', icon: '🏛️', priority: 'medium', lat: 40.749, lon: -73.968,
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=200&fit=crop' },
  { cat: 'MARKETS', text: 'Brent crude surges past $85 on Strait of Hormuz closure threat', region: 'Global', icon: '📈', priority: 'high', lat: 51.507, lon: -0.128,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop' },
  { cat: 'INTEL', text: 'Satellite imagery reveals new IRGC missile deployments near Bushehr', region: 'Iran', icon: '🛰️', priority: 'high', lat: 28.922, lon: 50.836,
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=200&fit=crop' },
  { cat: 'CONFLICT', text: 'Hezbollah launches largest-ever rocket barrage into northern Israel', region: 'Lebanon', icon: '⚔️', priority: 'urgent', lat: 33.27, lon: 35.20,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=200&fit=crop' },

  // Ukraine-Russia
  { cat: 'CONFLICT', text: 'Russia launches 50+ Shahed drones at Ukrainian energy infrastructure', region: 'Ukraine', icon: '⚔️', priority: 'high', lat: 50.45, lon: 30.52,
    image: 'https://images.unsplash.com/photo-1646975033569-1a1fd0a6e2b6?w=400&h=200&fit=crop' },
  { cat: 'DEFENSE', text: 'Germany approves €3.2B Leopard 2 tank package for Ukraine', region: 'Europe', icon: '🪖', priority: 'medium', lat: 52.52, lon: 13.405,
    image: 'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=400&h=200&fit=crop' },
  { cat: 'BREAKING', text: 'Ukrainian forces advance 8km in Zaporizhzhia counter-offensive', region: 'Ukraine', icon: '🔴', priority: 'high', lat: 47.839, lon: 35.14,
    image: 'https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=400&h=200&fit=crop' },

  // Asia-Pacific
  { cat: 'ALERT', text: 'PLA conducts live-fire exercises 12nm from Taiwan coast', region: 'Taiwan Strait', icon: '⚠️', priority: 'high', lat: 24.50, lon: 119.50,
    image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&h=200&fit=crop' },
  { cat: 'DIPLOMATIC', text: 'Japan, Philippines, USA announce trilateral security framework', region: 'Asia-Pacific', icon: '🏛️', priority: 'medium', lat: 35.68, lon: 139.69,
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&h=200&fit=crop' },
  { cat: 'DEFENSE', text: 'North Korea tests new solid-fuel ICBM, splashes into Sea of Japan', region: 'Korean Peninsula', icon: '🚀', priority: 'urgent', lat: 39.02, lon: 125.75,
    image: 'https://images.unsplash.com/photo-1457364887197-9f4dacfa57b3?w=400&h=200&fit=crop' },

  // Markets & Economy
  { cat: 'MARKETS', text: 'Gold hits all-time high at $3,100/oz amid global uncertainty', region: 'Global', icon: '📈', priority: 'medium', lat: 51.507, lon: -0.128,
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=200&fit=crop' },
  { cat: 'MARKETS', text: 'NASDAQ drops 2.3% on escalation fears, defense stocks surge', region: 'USA', icon: '📉', priority: 'medium', lat: 40.706, lon: -74.009,
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop' },
  { cat: 'ECONOMY', text: 'EU approves emergency energy security measures as oil prices spike', region: 'Europe', icon: '⚡', priority: 'medium', lat: 50.851, lon: 4.367,
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop' },
  { cat: 'MARKETS', text: 'USD/JPY breaks 150 barrier as safe-haven flows accelerate', region: 'Global', icon: '💱', priority: 'medium', lat: 35.68, lon: 139.69,
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=200&fit=crop' },

  // Other
  { cat: 'CYBER', text: 'Major DDoS attacks hit NATO member banking systems', region: 'Europe', icon: '💻', priority: 'high', lat: 50.85, lon: 4.35,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop' },
  { cat: 'HUMANITARIAN', text: 'UNHCR warns of 2M displaced in latest Iran-region escalation', region: 'Middle East', icon: '🆘', priority: 'medium', lat: 46.236, lon: 6.14,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=200&fit=crop' },
  { cat: 'ALERT', text: 'NORAD detects unusual Russian bomber activity near Alaska ADIZ', region: 'Arctic', icon: '⚠️', priority: 'high', lat: 61.22, lon: -149.90,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop' },
  { cat: 'SEISMIC', text: 'M6.2 earthquake strikes central Turkey, reports of structural damage', region: 'Turkey', icon: '🌍', priority: 'high', lat: 39.93, lon: 32.86,
    image: 'https://images.unsplash.com/photo-1545873209-348b4a826588?w=400&h=200&fit=crop' },
  { cat: 'DIPLOMATIC', text: 'India offers to mediate Iran-Israel ceasefire, hosts emergency talks', region: 'India', icon: '🏛️', priority: 'medium', lat: 28.614, lon: 77.209,
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop' },
  { cat: 'INTEL', text: 'OSINT analysts identify new Russian S-400 deployments in Syria', region: 'Syria', icon: '🛰️', priority: 'medium', lat: 35.00, lon: 38.00,
    image: 'https://images.unsplash.com/photo-1517976547714-720226b864c1?w=400&h=200&fit=crop' },
];

/**
 * Generate a pool of news items with realistic timestamps
 */
function generateNewsPool() {
  // Shuffle and pick 12 headlines to show
  const shuffled = [...HEADLINE_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 12);
  
  return selected.map((item, i) => {
    const minutesAgo = Math.floor(Math.random() * 180) + i * 15; // stagger by ~15 min per item
    return {
      ...item,
      time: formatTimeAgo(minutesAgo),
      minutesAgo
    };
  }).sort((a, b) => a.minutesAgo - b.minutesAgo); // most recent first
}

function formatTimeAgo(minutes) {
  if (minutes < 1) return 'JUST NOW';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Create the news feed DOM
 */
function createNewsFeed() {
  feedPanel = document.createElement('div');
  feedPanel.id = 'newsFeedPanel';
  feedPanel.className = 'news-feed-panel';
  feedPanel.innerHTML = `
    <div class="news-feed-header">
      <div class="news-feed-title">
        <span class="material-symbols-outlined">breaking_news</span>
        LIVE FEED
        <span class="news-feed-pulse"></span>
      </div>
      <button id="newsFeedToggle" class="icon-btn news-toggle-btn" title="Toggle News Feed">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
    <div class="news-feed-body" id="newsFeedBody"></div>
  `;

  document.body.appendChild(feedPanel);

  // Toggle collapse
  const toggleBtn = feedPanel.querySelector('#newsFeedToggle');
  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    feedPanel.classList.toggle('collapsed', isCollapsed);
    toggleBtn.querySelector('.material-symbols-outlined').textContent = isCollapsed ? 'chevron_left' : 'chevron_right';
  });
}

/**
 * Render news headlines into the feed
 */
function renderNews() {
  const body = document.getElementById('newsFeedBody');
  if (!body) return;

  const news = generateNewsPool();

  body.innerHTML = news.map(item => {
    const priorityClass = item.priority === 'urgent' ? 'news-urgent' : item.priority === 'high' ? 'news-high' : 'news-normal';
    const imageHTML = item.image
      ? `<div class="news-item-image"><img src="${item.image}" alt="" loading="lazy" /></div>`
      : '';
    return `
      <div class="news-item ${priorityClass}">
        ${imageHTML}
        <div class="news-item-header">
          <span class="news-cat">${item.cat}</span>
          <span class="news-time">${item.time}</span>
        </div>
        <div class="news-item-text">${item.icon} ${item.text}</div>
        <div class="news-item-region">${item.region}</div>
      </div>
    `;
  }).join('');
}

/**
 * Initialize the news feed
 */
export function initNewsFeed() {
  createNewsFeed();
  renderNews();
  // Refresh headlines every 2 minutes
  updateInterval = setInterval(renderNews, 120000);
}

/**
 * Historical era images — Wikimedia Commons public domain paintings & photos
 */
const ERA_IMAGES = {
  'Ancient Egypt':       'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&h=200&fit=crop',
  'Ancient Greece':      'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=200&fit=crop',
  'Roman Empire':        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=200&fit=crop',
  'Viking Age':          'https://images.unsplash.com/photo-1534237886190-eed66cefbb2e?w=400&h=200&fit=crop',
  'Crusades':            'https://images.unsplash.com/photo-1562979314-bee7453e911c?w=400&h=200&fit=crop',
  'Mongol Empire':       'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=400&h=200&fit=crop',
  'Ottoman Empire':      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=200&fit=crop',
  'Napoleonic Wars':     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=200&fit=crop',
  'American Revolution': 'https://images.unsplash.com/photo-1569407228235-9a744831a780?w=400&h=200&fit=crop',
  'American Civil War':  'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=200&fit=crop',
  'World War I':         'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400&h=200&fit=crop',
  'World War II':        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
  'Cold War':            'https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=400&h=200&fit=crop',
  'Gulf Wars':           'https://images.unsplash.com/photo-1580894908361-967195033215?w=400&h=200&fit=crop',
  'War on Terror':       'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop',
  'Alexander the Great': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=200&fit=crop',
};

/**
 * Switch the feed panel to historical timeline mode
 * Called by agent.js when a historical query is active
 */
export function showHistoricalTimeline(historicalEvents) {
  if (!feedPanel) return;
  
  // Pause normal news updates
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  // Update header to timeline mode
  const header = feedPanel.querySelector('.news-feed-title');
  if (header) {
    header.innerHTML = `
      <span class="material-symbols-outlined" style="color:#ffab00">history_edu</span>
      HISTORICAL TIMELINE
      <span class="news-feed-pulse" style="background:#ffab00"></span>
    `;
  }
  feedPanel.classList.add('timeline-mode');

  // Sort events chronologically (parse year for sorting)
  const sorted = [...historicalEvents].sort((a, b) => {
    const parseYear = (y) => {
      const str = String(y).replace(/[–—].*/,'').trim();
      if (str.includes('BC')) return -parseInt(str);
      if (str.includes('AD')) return parseInt(str);
      return parseInt(str) || 0;
    };
    return parseYear(a.year) - parseYear(b.year);
  });

  // Group by era for section headers
  const body = document.getElementById('newsFeedBody');
  if (!body) return;

  let currentEra = null;
  body.innerHTML = sorted.map(event => {
    let eraHeader = '';
    let eraImage = null;
    if (event.era !== currentEra) {
      currentEra = event.era;
      eraHeader = `<div class="timeline-era-header">${event.era}</div>`;
      eraImage = ERA_IMAGES[event.era] || null;
    }

    return `
      ${eraHeader}
      <div class="timeline-event" data-lat="${event.lat}" data-lon="${event.lon}">
        <div class="timeline-connector">
          <div class="timeline-dot"></div>
          <div class="timeline-line"></div>
        </div>
        <div class="timeline-content">
          ${eraImage ? `<div class="timeline-image"><img src="${eraImage}" alt="" loading="lazy" /></div>` : ''}
          <div class="timeline-year-badge">${event.year}</div>
          <div class="timeline-title">${event.title}</div>
          <div class="timeline-desc">${event.description}</div>
          <div class="timeline-meta">${event.region}${event.parties ? ' · ' + event.parties.join(' vs ') : ''}</div>
        </div>
      </div>
    `;
  }).join('');

  // Wire up click-to-fly on timeline events
  body.querySelectorAll('.timeline-event').forEach(el => {
    el.addEventListener('click', () => {
      const lat = parseFloat(el.dataset.lat);
      const lon = parseFloat(el.dataset.lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        // Dispatch custom event for fly-to
        window.dispatchEvent(new CustomEvent('timeline-fly', { detail: { lat, lon } }));
      }
    });
  });

  // Make sure panel is expanded and visible
  feedPanel.classList.remove('collapsed');
  const toggleBtn = feedPanel.querySelector('#newsFeedToggle');
  if (toggleBtn) {
    toggleBtn.querySelector('.material-symbols-outlined').textContent = 'chevron_right';
  }
}

/**
 * Restore the feed panel to normal LIVE FEED mode
 */
export function restoreNewsFeed() {
  if (!feedPanel) return;
  
  feedPanel.classList.remove('timeline-mode');
  
  // Restore header
  const header = feedPanel.querySelector('.news-feed-title');
  if (header) {
    header.innerHTML = `
      <span class="material-symbols-outlined">breaking_news</span>
      LIVE FEED
      <span class="news-feed-pulse"></span>
    `;
  }

  // Re-render news and restart interval
  renderNews();
  if (!updateInterval) {
    updateInterval = setInterval(renderNews, 120000);
  }
}
