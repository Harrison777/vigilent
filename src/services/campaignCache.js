/**
 * campaignCache.js — VIGILENT Campaign Cache
 * LocalStorage-backed LRU cache for campaign data.
 * Avoids re-hitting Serper + Gemini APIs for repeated queries.
 *
 * Usage:
 *   import { campaignCache } from '../services/campaignCache.js';
 *   const cached = campaignCache.get('roman empire');
 *   if (!cached) { ... fetch from API ... campaignCache.put('roman empire', campaign, 'llm'); }
 */

const STORAGE_KEY = 'vigilent_campaign_cache';
const MAX_ENTRIES = 50;
const TTL_LLM   = 24 * 60 * 60 * 1000;  // 24 hours
const TTL_LOCAL  = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Helpers ────────────────────────────────────────────────────

function normalizeKey(query) {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Storage full — evict oldest entries and retry
    console.warn('[Cache] Storage full, evicting old entries');
    evictOldest(cache, 10);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch { /* give up */ }
  }
}

function evictOldest(cache, count) {
  const entries = Object.entries(cache)
    .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
  for (let i = 0; i < Math.min(count, entries.length); i++) {
    delete cache[entries[i][0]];
  }
}

function isExpired(entry) {
  const ttl = entry.source === 'llm' ? TTL_LLM : TTL_LOCAL;
  return Date.now() - entry.timestamp > ttl;
}

// ── Public API ─────────────────────────────────────────────────

export const campaignCache = {
  /**
   * Get a cached campaign for a query.
   * Returns null if not found or expired.
   */
  get(query) {
    const key = normalizeKey(query);
    const cache = loadCache();
    const entry = cache[key];

    if (!entry) return null;
    if (isExpired(entry)) {
      delete cache[key];
      saveCache(cache);
      return null;
    }

    // Update last-accessed for LRU
    entry.lastAccessed = Date.now();
    saveCache(cache);

    console.info(`[Cache] HIT for "${key}" (${entry.source}, ${entry.campaign.campaign_path?.length || 0} stops)`);
    return entry.campaign;
  },

  /**
   * Store a campaign in the cache.
   * @param {string} query — Original search query
   * @param {object} campaign — Full campaign JSON (with campaign_path)
   * @param {'llm'|'local'} source — Where the data came from
   */
  put(query, campaign, source = 'local') {
    const key = normalizeKey(query);
    const cache = loadCache();

    // LRU eviction if at max capacity
    const keys = Object.keys(cache);
    if (keys.length >= MAX_ENTRIES && !cache[key]) {
      evictOldest(cache, keys.length - MAX_ENTRIES + 1);
    }

    cache[key] = {
      campaign,
      source,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
    };

    saveCache(cache);
    console.info(`[Cache] STORED "${key}" (${source}, ${campaign.campaign_path?.length || 0} stops)`);
  },

  /**
   * Check if a query has a valid (non-expired) cache entry.
   */
  has(query) {
    const key = normalizeKey(query);
    const cache = loadCache();
    const entry = cache[key];
    if (!entry) return false;
    if (isExpired(entry)) {
      delete cache[key];
      saveCache(cache);
      return false;
    }
    return true;
  },

  /**
   * Get the source type of a cached entry ('llm' | 'local' | null)
   */
  getSource(query) {
    const key = normalizeKey(query);
    const cache = loadCache();
    return cache[key]?.source || null;
  },

  /**
   * Clear the entire cache.
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    console.info('[Cache] Cleared all entries');
  },

  /**
   * Get cache stats for debugging.
   */
  stats() {
    const cache = loadCache();
    const entries = Object.entries(cache);
    const llm = entries.filter(([, v]) => v.source === 'llm').length;
    const local = entries.filter(([, v]) => v.source === 'local').length;
    const expired = entries.filter(([, v]) => isExpired(v)).length;
    return { total: entries.length, llm, local, expired, maxEntries: MAX_ENTRIES };
  },
};
