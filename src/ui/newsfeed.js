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

/** Strip HTML tags and decode entities to get plain text */
function stripHTML(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/** Check if text is primarily English/Latin script */
function isEnglish(text) {
  if (!text) return false;
  // Count Latin-script characters vs total
  const latin = text.replace(/[^a-zA-Z]/g, '').length;
  return latin / text.replace(/\s/g, '').length > 0.5;
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
  { query: 'military+conflict+war',           cat: 'CONFLICT',    icon: '⚔️', priority: 'high' },
  { query: 'defense+military+troops',         cat: 'DEFENSE',     icon: '🪖', priority: 'medium' },
  { query: 'geopolitics+sanctions+diplomacy', cat: 'DIPLOMATIC',  icon: '🏛️', priority: 'medium' },
  { query: 'stock+market+economy+oil+trade',  cat: 'MARKETS',     icon: '📈', priority: 'medium' },
  { query: 'cybersecurity+attack+hack+breach', cat: 'CYBER',      icon: '💻', priority: 'high' },
  { query: 'missile+nuclear+weapons+warhead', cat: 'ALERT',       icon: '⚠️', priority: 'urgent' },
  { query: 'NATO+Russia+China+Iran+Korea',    cat: 'BREAKING',    icon: '🔴', priority: 'urgent' },
  { query: 'terrorism+insurgency+attack',     cat: 'TERROR',      icon: '🚨', priority: 'urgent' },
  { query: 'earthquake+hurricane+tsunami+disaster', cat: 'DISASTER', icon: '🌊', priority: 'high' },
  { query: 'election+coup+protest+unrest',    cat: 'POLITICAL',   icon: '🗳️', priority: 'medium' },
  { query: 'energy+pipeline+gas+OPEC',        cat: 'ENERGY',      icon: '⛽', priority: 'medium' },
  { query: 'space+satellite+launch+NASA',     cat: 'SPACE',       icon: '🚀', priority: 'medium' },
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

      return data.items.slice(0, 8)
        .map(item => {
          // Extract source name from title (Google News format: "Headline - Source")
          const titleParts = item.title.split(' - ');
          const source = titleParts.length > 1 ? titleParts.pop().trim() : 'News';
          const headline = titleParts.join(' - ').trim();

          // Extract plain-text summary from RSS description
          let summary = stripHTML(item.description || '');
          // Remove the headline if it repeats at the start of the description
          if (summary.startsWith(headline)) summary = summary.slice(headline.length).trim();
          // Truncate to ~140 chars
          if (summary.length > 140) summary = summary.slice(0, 137) + '…';

          return {
            cat: topic.cat,
            icon: topic.icon,
            priority: topic.priority,
            text: headline,
            summary: summary || '',
            source: source,
            url: item.link || '#',
            pubDate: new Date(item.pubDate),
            region: source.toUpperCase(),
            image: item.thumbnail || item.enclosure?.link || null,
          };
        })
        .filter(item => isEnglish(item.text)); // drop non-English stories
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

  return unique.slice(0, 40); // top 40 stories
}

// ── Fallback simulated headlines (used when offline) ──
const FALLBACK_HEADLINES = [
  { cat: 'BREAKING', text: 'IRGC confirms damage to Isfahan military complex, vows retaliation', summary: 'Iranian military officials say the strike targeted a key nuclear facility. Supreme Leader vows proportional response.', region: 'IRAN', icon: '🔴', priority: 'urgent',
    url: 'https://news.google.com/search?q=IRGC+Isfahan+military' },
  { cat: 'CONFLICT', text: 'Israeli jets intercept Iranian UAV swarm over Golan Heights', summary: 'IDF says 15 drones neutralized before crossing border. No casualties reported. CENTCOM monitoring situation.', region: 'MIDDLE EAST', icon: '⚔️', priority: 'high',
    url: 'https://news.google.com/search?q=Israel+Iran+UAV+Golan+Heights' },
  { cat: 'DEFENSE', text: 'Pentagon deploys additional carrier group to Persian Gulf', summary: 'USS Gerald Ford strike group joins USS Eisenhower in the region. SecDef calls it a "precautionary measure."', region: 'USA', icon: '🚢', priority: 'high',
    url: 'https://news.google.com/search?q=Pentagon+carrier+group+Persian+Gulf' },
  { cat: 'MARKETS', text: 'Brent crude surges past $85 on Strait of Hormuz closure threat', summary: 'Energy markets spike as IRGC warns of naval blockade. Analysts predict $100/barrel if tensions escalate further.', region: 'GLOBAL', icon: '📈', priority: 'high',
    url: 'https://news.google.com/search?q=Brent+crude+oil+price' },
  { cat: 'CONFLICT', text: 'Russia launches 50+ Shahed drones at Ukrainian energy infrastructure', summary: 'Overnight barrage targets power stations in Kharkiv and Dnipro. Air defense intercepts 38 of 52 drones.', region: 'UKRAINE', icon: '⚔️', priority: 'high',
    url: 'https://news.google.com/search?q=Russia+Shahed+drones+Ukraine' },
  { cat: 'ALERT', text: 'PLA conducts live-fire exercises 12nm from Taiwan coast', summary: 'Chinese navy deploys two carrier groups for largest Taiwan Strait drill since 2022. Taiwan scrambles F-16Vs.', region: 'TAIWAN STRAIT', icon: '⚠️', priority: 'high',
    url: 'https://news.google.com/search?q=China+PLA+Taiwan+exercises' },
  { cat: 'CYBER', text: 'Major DDoS attacks hit NATO member banking systems', summary: 'Coordinated attacks traced to Fancy Bear APT group. Multiple European banks report service outages lasting 6+ hours.', region: 'EUROPE', icon: '💻', priority: 'high',
    url: 'https://news.google.com/search?q=DDoS+NATO+banking' },
  { cat: 'DIPLOMATIC', text: 'India offers to mediate Iran-Israel ceasefire, hosts emergency talks', summary: 'PM Modi invites both foreign ministers to New Delhi. UNSC calls emergency session to discuss de-escalation.', region: 'INDIA', icon: '🏛️', priority: 'medium',
    url: 'https://news.google.com/search?q=India+Iran+Israel+ceasefire' },
  { cat: 'TERROR', text: 'Interpol issues red notice after coordinated bomb threats across three capitals', summary: 'Paris, London, and Berlin evacuate transit hubs. No explosives found but security agencies remain on high alert.', region: 'GLOBAL', icon: '🚨', priority: 'urgent',
    url: 'https://news.google.com/search?q=Interpol+terror+threat' },
  { cat: 'DISASTER', text: '7.2 magnitude earthquake strikes off coast of Indonesia, tsunami warning issued', summary: 'Epicenter located 40km off Sulawesi at 10km depth. Coastal residents evacuated. USGS monitoring aftershocks.', region: 'ASIA-PACIFIC', icon: '🌊', priority: 'high',
    url: 'https://news.google.com/search?q=Indonesia+earthquake+tsunami' },
  { cat: 'POLITICAL', text: 'Mass protests erupt across South America over austerity measures', summary: 'Millions take to streets in Argentina and Colombia. Tear gas deployed as demonstrators block major highways.', region: 'S. AMERICA', icon: '🗳️', priority: 'medium',
    url: 'https://news.google.com/search?q=South+America+protests+austerity' },
  { cat: 'ENERGY', text: 'OPEC+ announces emergency production cut, oil futures spike 6%', summary: 'Saudi Arabia leads 1.5M barrel/day cut. White House calls move "counterproductive" amid inflation concerns.', region: 'GLOBAL', icon: '⛽', priority: 'high',
    url: 'https://news.google.com/search?q=OPEC+production+cut+oil' },
  { cat: 'SPACE', text: 'SpaceX launches classified NRO reconnaissance satellite from Vandenberg', summary: 'NROL-167 payload deployed to LEO. Mission details classified. Third NRO launch this quarter.', region: 'USA', icon: '🚀', priority: 'medium',
    url: 'https://news.google.com/search?q=SpaceX+NRO+satellite+launch' },
  { cat: 'DEFENSE', text: 'Japan scrambles F-35s after unidentified aircraft enter ADIZ', summary: 'JASDF identifies two Russian Tu-95 bombers near Hokkaido. Aircraft escorted out after 45-minute standoff.', region: 'JAPAN', icon: '🪖', priority: 'high',
    url: 'https://news.google.com/search?q=Japan+F-35+scramble+ADIZ' },
  { cat: 'MARKETS', text: 'Global semiconductor supply chain disrupted as Taiwan raises alert level', summary: 'TSMC shares drop 8% as military drills threaten shipping lanes. Apple and NVIDIA warn of potential delays.', region: 'ASIA', icon: '📈', priority: 'high',
    url: 'https://news.google.com/search?q=semiconductor+supply+chain+Taiwan' },
  { cat: 'BREAKING', text: 'North Korea test-fires ICBM into Sea of Japan, G7 convenes emergency session', summary: 'Hwasong-18 missile flew 1,000km before splashing down in Japan EEZ. Tokyo and Seoul raise defense readiness.', region: 'KOREA', icon: '🔴', priority: 'urgent',
    url: 'https://news.google.com/search?q=North+Korea+ICBM+test' },
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

  // Try fetching live news (rate-limit to every 90s)
  if (Date.now() - lastFetchTime > 90000 || liveNews.length === 0) {
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
  // Background: fetch live news after 2s, then refresh every 2 min
  setTimeout(async () => {
    await renderNews();
    updateInterval = setInterval(renderNews, 120000);
  }, 2000);
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
    const summaryHTML = item.summary ? `<div class="news-item-summary">${escapeHTML(item.summary)}</div>` : '';
    return `
      <a href="${escapeHTML(item.url || '#')}" target="_blank" rel="noopener noreferrer" class="news-item-link">
        <div class="news-item ${priorityClass}">
          <div class="news-item-header">
            <span class="news-cat">${escapeHTML(item.cat)}</span>
            <span class="news-time">${escapeHTML(item.time || '')}</span>
          </div>
          <div class="news-item-text">${item.icon} ${escapeHTML(item.text)}</div>
          ${summaryHTML}
          <div class="news-item-footer">
            <span class="news-item-region">${escapeHTML(item.region)}</span>
            ${sourceTag}
          </div>
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
