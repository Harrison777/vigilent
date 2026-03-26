/**
 * newsfeed.js — Live world news feed panel on the right side
 * Pulls real headlines from Google News RSS via RSS2JSON proxy
 * Falls back to simulated headlines if offline or rate-limited
 */

/** Escape HTML special chars to prevent XSS from RSS content */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let feedPanel = null;
let updateInterval = null;
let isCollapsed = false;
let liveNews = [];        // cached live stories
let lastFetchTime = 0;

// ── RSS2JSON proxy (free, CORS-safe, no key needed for basic use) ──
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// ── Google News RSS search topics — each returns ~10 stories ──
const NEWS_TOPICS = [
  { query: 'military+conflict+war',      cat: 'CONFLICT',   icon: '⚔️', priority: 'high' },
  { query: 'defense+military+troops',    cat: 'DEFENSE',    icon: '🪖', priority: 'medium' },
  { query: 'geopolitics+sanctions+diplomacy', cat: 'DIPLOMATIC', icon: '🏛️', priority: 'medium' },
  { query: 'stock+market+economy+oil',   cat: 'MARKETS',    icon: '📈', priority: 'medium' },
  { query: 'cybersecurity+attack+hack',  cat: 'CYBER',      icon: '💻', priority: 'high' },
  { query: 'missile+nuclear+weapons',    cat: 'ALERT',      icon: '⚠️', priority: 'urgent' },
  { query: 'NATO+Russia+China+Iran',     cat: 'BREAKING',   icon: '🔴', priority: 'urgent' },
];

/**
 * Fetch live news from Google News RSS
 */
async function fetchLiveNews() {
  const allStories = [];

  // Fetch all topics in parallel
  const fetches = NEWS_TOPICS.map(async (topic) => {
    const rssUrl = encodeURIComponent(
      `https://news.google.com/rss/search?q=${topic.query}&hl=en-US&gl=US&ceid=US:en`
    );
    try {
      const res = await fetch(`${RSS2JSON}${rssUrl}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return [];
      const data = await res.json();
      if (data.status !== 'ok' || !data.items) return [];

      return data.items.slice(0, 5).map(item => {
        // Extract source name from title (Google News format: "Headline - Source")
        const titleParts = item.title.split(' - ');
        const source = titleParts.length > 1 ? titleParts.pop().trim() : 'News';
        const headline = titleParts.join(' - ').trim();

        return {
          cat: topic.cat,
          icon: topic.icon,
          priority: topic.priority,
          text: headline,
          source: source,
          url: item.link || '#',
          pubDate: new Date(item.pubDate),
          region: source.toUpperCase(),
          image: item.thumbnail || item.enclosure?.link || null,
        };
      });
    } catch {
      return [];
    }
  });

  const results = await Promise.all(fetches);
  results.forEach(stories => allStories.push(...stories));

  // Sort by publication date (most recent first) and dedupe
  const seen = new Set();
  const unique = allStories
    .sort((a, b) => b.pubDate - a.pubDate)
    .filter(s => {
      const key = s.text.substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return unique.slice(0, 20); // top 20 stories
}

// ── Fallback simulated headlines (used when offline) ──
const FALLBACK_HEADLINES = [
  { cat: 'BREAKING', text: 'IRGC confirms damage to Isfahan military complex, vows retaliation', region: 'IRAN', icon: '🔴', priority: 'urgent',
    url: 'https://news.google.com/search?q=IRGC+Isfahan+military' },
  { cat: 'CONFLICT', text: 'Israeli jets intercept Iranian UAV swarm over Golan Heights', region: 'MIDDLE EAST', icon: '⚔️', priority: 'high',
    url: 'https://news.google.com/search?q=Israel+Iran+UAV+Golan+Heights' },
  { cat: 'DEFENSE', text: 'Pentagon deploys additional carrier group to Persian Gulf', region: 'USA', icon: '🚢', priority: 'high',
    url: 'https://news.google.com/search?q=Pentagon+carrier+group+Persian+Gulf' },
  { cat: 'MARKETS', text: 'Brent crude surges past $85 on Strait of Hormuz closure threat', region: 'GLOBAL', icon: '📈', priority: 'high',
    url: 'https://news.google.com/search?q=Brent+crude+oil+price' },
  { cat: 'CONFLICT', text: 'Russia launches 50+ Shahed drones at Ukrainian energy infrastructure', region: 'UKRAINE', icon: '⚔️', priority: 'high',
    url: 'https://news.google.com/search?q=Russia+Shahed+drones+Ukraine' },
  { cat: 'ALERT', text: 'PLA conducts live-fire exercises 12nm from Taiwan coast', region: 'TAIWAN STRAIT', icon: '⚠️', priority: 'high',
    url: 'https://news.google.com/search?q=China+PLA+Taiwan+exercises' },
  { cat: 'CYBER', text: 'Major DDoS attacks hit NATO member banking systems', region: 'EUROPE', icon: '💻', priority: 'high',
    url: 'https://news.google.com/search?q=DDoS+NATO+banking' },
  { cat: 'DIPLOMATIC', text: 'India offers to mediate Iran-Israel ceasefire, hosts emergency talks', region: 'INDIA', icon: '🏛️', priority: 'medium',
    url: 'https://news.google.com/search?q=India+Iran+Israel+ceasefire' },
];

// Keep HEADLINE_TEMPLATES export for backward compatibility
export const HEADLINE_TEMPLATES = FALLBACK_HEADLINES;

/**
 * Format time ago from a Date object
 */
function formatTimeAgo(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
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
    <div class="news-feed-body" id="newsFeedBody">
      <div class="news-loading">Fetching live stories…</div>
    </div>
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
 * Render news headlines into the feed (live or fallback)
 */
async function renderNews() {
  const body = document.getElementById('newsFeedBody');
  if (!body) return;

  let news = [];

  // Try fetching live news (rate-limit to every 3 min)
  if (Date.now() - lastFetchTime > 180000 || liveNews.length === 0) {
    try {
      body.innerHTML = '<div class="news-loading">Updating…</div>';
      const live = await fetchLiveNews();
      if (live.length > 0) {
        liveNews = live;
        lastFetchTime = Date.now();
        console.log(`[NEWS] ✓ ${live.length} live stories from Google News`);
      }
    } catch (e) {
      console.warn('[NEWS] Live fetch failed, using cache/fallback', e);
    }
  }

  // Use live or fallback
  if (liveNews.length > 0) {
    news = liveNews.map(item => ({
      ...item,
      time: formatTimeAgo(item.pubDate),
    }));
  } else {
    // Fallback: simulated headlines
    news = FALLBACK_HEADLINES.map((item, i) => ({
      ...item,
      time: `${Math.floor(Math.random() * 3) + 1}h ago`,
      source: 'VIGILENT Intel',
    }));
  }

  body.innerHTML = renderNewsItems(news);
}

/**
 * Initialize the news feed — instant fallback, deferred live fetch
 */
export function initNewsFeed() {
  createNewsFeed();
  // Show fallback headlines INSTANTLY (no network wait)
  renderFallbackNews();
  // Background: fetch live news after 3s, then refresh every 5 min
  setTimeout(async () => {
    await renderNews();
    updateInterval = setInterval(renderNews, 300000);
  }, 3000);
}

/**
 * Render fallback headlines immediately (no async, no network)
 */
function renderFallbackNews() {
  const body = document.getElementById('newsFeedBody');
  if (!body) return;
  const news = FALLBACK_HEADLINES.map(item => ({
    ...item,
    time: `${Math.floor(Math.random() * 3) + 1}h ago`,
    source: 'VIGILENT Intel',
  }));
  body.innerHTML = renderNewsItems(news);
}

/**
 * Shared news item renderer (used by both live and fallback paths).
 * HTML-escapes headline text to prevent XSS from untrusted RSS content.
 */
function renderNewsItems(news) {
  return news.map(item => {
    const priorityClass = item.priority === 'urgent' ? 'news-urgent' : item.priority === 'high' ? 'news-high' : 'news-normal';
    const sourceTag = item.source ? `<span class="news-source">${escapeHTML(item.source)}</span>` : '';
    return `
      <a href="${escapeHTML(item.url || '#')}" target="_blank" rel="noopener noreferrer" class="news-item-link">
        <div class="news-item ${priorityClass}">
          <div class="news-item-header">
            <span class="news-cat">${escapeHTML(item.cat)}</span>
            <span class="news-time">${escapeHTML(item.time)}</span>
          </div>
          <div class="news-item-text">${item.icon} ${escapeHTML(item.text)}</div>
          <div class="news-item-region">${escapeHTML(item.region)} ${sourceTag}</div>
        </div>
      </a>
    `;
  }).join('');
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
      const str = String(y || '').replace(/^~/, '').replace(/[–—].*/, '').trim();
      const m = str.match(/(\d+)/);
      if (!m) return 0;
      const n = parseInt(m[1], 10);
      return str.toUpperCase().includes('BC') ? -n : n;
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
    updateInterval = setInterval(renderNews, 300000);
  }
}
