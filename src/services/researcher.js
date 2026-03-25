/**
 * researcher.js — VIGILENT Research Service
 * Queries the local Knowledge Graph (PHNK-G) first for instant results,
 * then supplements with Serper Google Search API if needed.
 *
 * Usage:
 *   import { researcher } from '../services/researcher.js';
 *   const results = await researcher.search('Alexander the Great timeline', 'historical');
 */

// ── Public API ─────────────────────────────────────────────────

export const researcher = {
  /**
   * Search for topic data — KG first, then Serper.
   * @param {string} query — User's raw search query
   * @param {string} mode — 'historical' | 'news'
   * @returns {Promise<{ results: Array, source: string }>}
   */
  async search(query, mode = 'historical') {
    try {
      if (mode === 'news') {
        return await searchNews(query);
      }
      return await searchHistorical(query);
    } catch (err) {
      console.warn('[Researcher] Search failed, returning empty:', err.message);
      return { results: [], source: 'none' };
    }
  },

  /**
   * Search the Knowledge Graph only.
   * @param {string} query — Search query
   * @param {number} limit — Max results
   * @returns {Promise<{ results: Array, source: string }>}
   */
  async searchKG(query, limit = 10) {
    return await searchKnowledgeGraph(query, limit);
  },

  /**
   * Find KG nodes near a coordinate.
   * @param {number} lat
   * @param {number} lng
   * @param {number} radius — km
   * @returns {Promise<{ results: Array, source: string }>}
   */
  async searchNearby(lat, lng, radius = 50) {
    try {
      const res = await fetch(`/api/kg/nearby?lat=${lat}&lng=${lng}&r=${radius}&limit=20`);
      if (!res.ok) return { results: [], source: 'none' };
      const data = await res.json();
      return {
        results: (data.results || []).map(formatKGNode),
        source: 'knowledge-graph',
      };
    } catch {
      return { results: [], source: 'none' };
    }
  },

  /** Check if the search API is configured */
  async checkAvailability() {
    try {
      const res = await fetch('/api/search/health');
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Check if the Knowledge Graph is available */
  async checkKGAvailability() {
    try {
      const res = await fetch('/api/kg/health');
      if (!res.ok) return false;
      const data = await res.json();
      return data.available === true;
    } catch {
      return false;
    }
  },
};

// ── Knowledge Graph Search ─────────────────────────────────────

async function searchKnowledgeGraph(query, limit = 10) {
  try {
    const res = await fetch(`/api/kg/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) return { results: [], source: 'none' };
    const data = await res.json();
    
    // Fetch edges for each node to enrich the narrative
    const enrichedResults = await Promise.all((data.results || []).map(async (node) => {
      try {
        const edgeRes = await fetch(`/api/kg/node/${node.v_delta_id}/edges`);
        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          node.edges = edgeData.edges || { incoming: [], outgoing: [] };
        }
      } catch (e) {
        console.warn('Failed to fetch edges for node', node.v_delta_id);
      }
      return formatKGNode(node);
    }));

    return {
      results: enrichedResults,
      source: 'knowledge-graph',
      total: data.total || 0,
    };
  } catch {
    return { results: [], source: 'none' };
  }
}

/**
 * Format a KG node into a research result compatible with the narrator.
 */
function formatKGNode(node) {
  let edgeText = '';
  if (node.edges) {
    const outEdges = node.edges.outgoing.slice(0, 3).map(e => `Causes ${e.target_title}: ${e.description}`);
    const inEdges = node.edges.incoming.slice(0, 3).map(e => `Caused by ${e.source_title}: ${e.description}`);
    edgeText = [...outEdges, ...inEdges].join('. ');
  }
  
  return {
    type: 'kg_node',
    title: node.canonical_name || '',
    snippet: (node.high_level_summary || '') + (edgeText ? `\nRelated: ${edgeText}` : ''),
    source_url: node.source_link || '',
    lat: node.lat,
    lng: node.lng,
    era: node.era_tag || 'Unknown',
    source_type: node.source_type || 'unknown',
    relevance: node.relevance_score || 0,
  };
}

// ── Historical Search (KG + Serper hybrid) ─────────────────────

async function searchHistorical(query) {
  // Step 1: Query the Knowledge Graph first (instant, free)
  const kgResults = await searchKnowledgeGraph(query, 8);

  // Step 2: Query Serper for supplemental web results
  let serperResults = [];
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: `${query} timeline major events locations dates`,
        type: 'search',
        num: 15,
      }),
    });

    if (res.ok) {
      const data = await res.json();

      // Knowledge graph (if available)
      if (data.knowledgeGraph) {
        serperResults.push({
          type: 'knowledge',
          title: data.knowledgeGraph.title || query,
          description: data.knowledgeGraph.description || '',
          source_url: data.knowledgeGraph.descriptionLink || '',
          attributes: data.knowledgeGraph.attributes || {},
        });
      }

      // Organic search results
      if (data.organic) {
        data.organic.forEach(item => {
          serperResults.push({
            type: 'organic',
            title: item.title || '',
            snippet: item.snippet || '',
            source_url: item.link || '',
            date: item.date || '',
            position: item.position || 0,
          });
        });
      }

      // Related searches (for context)
      if (data.relatedSearches) {
        serperResults.push({
          type: 'related',
          queries: data.relatedSearches.map(r => r.query),
        });
      }
    }
  } catch (err) {
    console.warn('[Researcher] Serper search failed (KG results still available):', err.message);
  }

  // Step 3: Merge — KG results first (higher quality), then Serper
  const combined = [...kgResults.results, ...serperResults];
  const source = kgResults.results.length > 0
    ? (serperResults.length > 0 ? 'kg+serper' : 'knowledge-graph')
    : 'serper';

  if (kgResults.results.length > 0) {
    console.log(`[Researcher] 📚 KG provided ${kgResults.results.length} nodes, Serper provided ${serperResults.length} results`);
  }

  return { results: combined, source };
}

// ── News Search ────────────────────────────────────────────────

async function searchNews(query) {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: query,
      type: 'news',
      num: 12,
    }),
  });

  if (!res.ok) return { results: [], source: 'none' };
  const data = await res.json();

  const results = [];
  if (data.news) {
    data.news.forEach(item => {
      results.push({
        type: 'news',
        title: item.title || '',
        snippet: item.snippet || '',
        source_url: item.link || '',
        source_name: item.source || '',
        date: item.date || '',
        imageUrl: item.imageUrl || '',
      });
    });
  }

  return { results, source: 'serper-news' };
}
