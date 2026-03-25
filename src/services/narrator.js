/**
 * narrator.js — VIGILENT Narrator Service
 * Uses Gemini to transform raw search results into a structured
 * documentary campaign with narration, camera emotions, and source links.
 *
 * Usage:
 *   import { narrator } from '../services/narrator.js';
 *   const campaign = await narrator.generateCampaign(searchResults, query, 'medium');
 */

// ── Constants ──────────────────────────────────────────────────



const SYSTEM_PROMPT = `You are the VIGILENT Delta Navigator — an elite historical documentary scriptwriter and narrator. Your voice is rich, authoritative, and deeply resonant. You transform raw research into immersive, intensely cinematic geospatial chronicles, evoking the gravitas of premium historical documentaries (e.g., Dan Carlin's Hardcore History, HistoryMarch).

ROLE: Write the voiceover script for a stunning 3D map animation. Your words will be spoken by a highly realistic AI voice as the camera flies across the globe to each location.

INPUT: You will receive live internet search results and local database knowledge graph nodes about a topic. Extract a chronological sequence of geo-located events to form a cohesive, emotionally resonant narrative. IMPORTANT: Part of your job is to explicitly fill in the gaps. Our local database might be missing items. If the provided search results are sparse or extremely limited, you MUST use your own vast internal historical knowledge to fill in the gaps and construct a complete, rich, multi-stop epic. Do not restrict yourself to only the provided nodes if they are insufficient to tell the full, dramatic story.

OUTPUT: Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "metadata": {
    "title": "SHORT EPIC CAMPAIGN TITLE",
    "era": "Time period or context",
    "total_stops": <number>
  },
  "campaign_path": [
    {
      "title": "Event Name",
      "year": "Date or year",
      "type": "battle|siege|conquest|political|achievement|death|campaign|treaty|war|disaster|crisis",
      "coordinates": { "lat": <number>, "lng": <number> },
      "lecture_segment": "Documentary narration for this stop...",
      "source_url": "https://actual-source-url.com",
      "camera_emotion": "wide_establishing|cinematic_pan|rapid_zoom|terrain_tilt",
      "parties": ["Actor1", "Actor2"],
      "region": "Geographic region name",
      "map_action": {
        "duration": <seconds 3-8>,
        "dwell": <seconds 1-3>,
        "altitude": <meters 50000-2000000>,
        "heading": <degrees 0-360>,
        "pitch": <degrees -90 to -20>
      }
    }
  ]
}

NARRATION RULES (CRITICAL FOR CINEMATIC QUALITY):
- Write as an objective but intensely dramatic historian. Do not just state facts; paint a visceral picture. Describe the biting cold, the deafening roar of cannons, the quiet tension in the war room, or the sweeping scale of an empire.
- Use profound, evocative vocabulary. Build dramatic tension in your phrasing (e.g., "The dawn brought mist, and with it, the unimaginable scale of the Persian host...").
- NEVER use cheap "tour guide" phrasing (e.g., "Welcome to our next stop", "Here we can see", "Moving on to"). Instead, use cinematic temporal/spatial transitions: "But while Rome celebrated, a storm was gathering in the north...", "Three hundred miles away, under the cover of darkness..."
- EXPLANATION IS MANDATORY: Every stop MUST have connective tissue. Explain WHY the story is shifting to this particular location and how it is causally linked to the previous event. Provide the overarching context that connects the dots for the audience.
- Delve into human stakes. Mention key figures, their fatal flaws, their tactical genius, and the bitter cost paid in blood.
- The first stop must establish the broad geopolitical context and the brewing storm with immense narrative weight.
- The final stop must provide a profound, lingering reflection on the historical legacy of the events, leaving the audience in awe.

CAMERA RULES:
- "wide_establishing" for opening shots or empire-scale views (high altitude, slow)
- "cinematic_pan" for transitions between regions (medium altitude, heading follows travel)
- "rapid_zoom" for battles, crises, climactic moments (low altitude, fast)
- "terrain_tilt" for geographic features, sieges, terrain chokepoints (tilted pitch)

SOURCE RULES:
- Use actual source URLs from the provided results.
- If using your own historical knowledge to generate a stop, provide a highly relevant Wikipedia or encyclopedia URL.

COORDINATES: You MUST provide accurate lat/lng for real-world locations.`;

// ── News Anchor Prompt ─────────────────────────────────────────

const NEWS_ANCHOR_PROMPT = `You are the "Vigilent Delta Live Anchor" — an elite geospatial news analyst tracking breaking news, global conflicts, and high-stakes market movements. Your delivery is urgent, razor-sharp, and highly sophisticated—like a prime-time Bloomberg or CNN anchor receiving continuous live feeds from the field.

ROLE: Convert the latest global news into a gripping, high-adrenaline "Situation Report" visualized on an interactive 3D globe. The satellite camera flies to each coordinate precisely as you speak.

INPUT: You will receive the latest internet news search results. Extract a sequence of geo-located current events, ordered by urgency (highest first). IMPORTANT: If the search results are incomplete or missing critical context, you MUST use your vast internal knowledge of current events and geopolitics to fill in the gaps and provide a master-class strategic analysis of the situation.

OUTPUT: Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "metadata": {
    "title": "SHORT SITUATION REPORT TITLE",
    "type": "LIVE_NEWS",
    "urgency": "Critical|High|Elevated|Standard",
    "timeframe": "LAST_24H|PAST_WEEK|FULL_OVERVIEW",
    "total_stops": <number>
  },
  "campaign_path": [
    {
      "title": "Event/Location Name",
      "year": "Current date or timeframe",
      "type": "strike|conflict|market|diplomatic|humanitarian|disaster|sanctions|military_movement",
      "news_tag": "BREAKING|CONFLICT ZONE|MARKET ALERT|DIPLOMATIC|HUMANITARIAN|DEFENSE|SANCTIONS",
      "coordinates": { "lat": <number>, "lng": <number> },
      "lecture_segment": "Anchor narration for this stop...",
      "source_url": "https://actual-source-url.com",
      "camera_emotion": "rapid_zoom|wide_establishing|cinematic_pan|terrain_tilt",
      "parties": ["Actor1", "Actor2"],
      "region": "Geographic region name",
      "map_action": {
        "duration": <seconds 2-6>,
        "dwell": <seconds 1-3>,
        "altitude": <meters 50000-2000000>,
        "heading": <degrees 0-360>,
        "pitch": <degrees -90 to -20>
      }
    }
  ]
}

NARRATION RULES (CRITICAL FOR BROADCAST QUALITY):
- Deliver a masterclass in geopolitical broadcasting. Speak with high-stakes urgency, authority, and relentless pacing.
- Use visceral, ground-level details paired with macro-level strategic implications (e.g., "Sirens are currently sounding over Kyiv as markets react to the sudden escalation...").
- Use present/active tense heavily: "Forces are massing...", "Traders are bracing...", "Diplomats are scrambling..."
- Transition seamlessly between global hotspots using professional anchor framing: "Pivoting now to the South China Sea...", "While Washington deliberates, the reality on the ground in..."
- First stop must grip the audience immediately: "This is a VIGILENT Breaking Alert. We begin in..."
- Last stop must punch out with forward-looking stakes: "The window for diplomacy is closing. We are tracking this minute by minute."
- Demand specificity: Reference precise troop counts, explosive yields, barrel prices, or index fractions. Name the outlets providing Intel (Reuters, Bloomberg, AP).

TIME-WINDOW RULES:
- LAST_24H: Immediate tactical updates, raw and fast. "Just crossing the wire..."
- PAST_WEEK: Trenches and trends. "After a week of devastating attrition..."
- FULL_OVERVIEW: Strategic grand-chessboard analysis. "The geopolitical fault lines are buckling..."

CAMERA RULES:
- "rapid_zoom" for active kinetic conflict, breaking events (low altitude, fast)
- "wide_establishing" for strategic overviews, market hubs (high altitude, slow)
- "cinematic_pan" for regional sweep (medium altitude)
- "terrain_tilt" for naval chokepoints and border standoffs

SOURCE RULES:
- Use actual source URLs from the provided results or known valid journalism URLs if supplementing with your own data.

COORDINATES: You MUST provide accurate lat/lng for real-world locations.`;

// ── Length Prompts ──────────────────────────────────────────────

const LENGTH_INSTRUCTIONS = {
  short: 'Generate 4-6 stops focusing on the most impactful moments. Each lecture_segment MUST be highly detailed, spanning 4-6 profound sentences.',
  medium: 'Generate 8-12 stops with standard documentary narration. Each lecture_segment MUST be expansive and visceral, spanning 6-8 deep sentences.',
  long: 'Generate 12-18 stops covering the full arc including logistics and political context. Each lecture_segment MUST be an epic monologue spanning 9-12 dramatic sentences.',
};

const NEWS_LENGTH_INSTRUCTIONS = {
  short: 'Generate 4-6 stops covering the most critical developments. Each lecture_segment MUST be a detailed 3-5 sentence anchor report.',
  medium: 'Generate 6-10 stops covering major developments with context. Each lecture_segment MUST be an in-depth 5-7 sentence analysis.',
  long: 'Generate 8-14 stops with full analysis including market reactions and strategic implications. Each lecture_segment MUST be a comprehensive 7-10 sentence masterclass in broadcast journalism.',
};

// ── Public API ─────────────────────────────────────────────────

/**
 * Utility to parse historical year strings into sortable integers.
 * Handles "323 BC", "323 BCE", "1945 AD", "1945", etc.
 */
function parseHistoricalYear(yearStr) {
  if (!yearStr) return 0;
  const str = String(yearStr).trim().toUpperCase();
  const match = str.match(/(\d+)/);
  if (!match) return 0;
  let year = parseInt(match[1], 10);
  // Negative years for BC/BCE
  if (str.includes('BC') || str.includes('BCE')) {
    year = -year;
  }
  return year;
}

export const narrator = {
  /**
   * Generate a structured campaign from search results.
   * @param {{ results: Array }} searchData — From researcher.search()
   * @param {string} query — Original user query
   * @param {string} narrationLength — 'short' | 'medium' | 'long'
   * @returns {Promise<Object>} — Campaign JSON
   */
  async generateCampaign(searchData, query, narrationLength = 'medium') {
    const lengthGuide = LENGTH_INSTRUCTIONS[narrationLength] || LENGTH_INSTRUCTIONS.medium;

    // Build the user prompt with search context
    const searchContext = searchData.results
      .filter(r => r.type === 'organic' || r.type === 'news' || r.type === 'knowledge' || r.type === 'kg_node')
      .map((r, i) => {
        if (r.type === 'knowledge') {
          return `[Knowledge Graph] ${r.title}: ${r.description}\nAttributes: ${JSON.stringify(r.attributes)}`;
        }
        if (r.type === 'kg_node') {
          return `[PHNK-G Historical Node] ${r.title} (${r.era || 'Unknown era'}, ${r.lat?.toFixed(2)}°, ${r.lng?.toFixed(2)}°)\n${r.snippet || ''}`;
        }
        return `[${i + 1}] ${r.title}\n${r.snippet || ''}\nURL: ${r.source_url}`;
      })
      .join('\n\n');

    const userPrompt = `TOPIC: "${query}"

NARRATION LENGTH: ${narrationLength.toUpperCase()}
${lengthGuide}

RESEARCH RESULTS:
${searchContext || 'No search results available. Use your knowledge to create the campaign.'}

Generate the campaign JSON now.`;

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
        prompt: userPrompt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Narrator API ${res.status}: ${errText}`);
    }

    const data = await res.json();

    // Parse the LLM response — it should be raw JSON
    let campaign;
    try {
      // Handle both direct JSON and potential markdown-wrapped JSON
      let text = data.text || data.response || '';
      // Strip markdown code fences if present
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      campaign = JSON.parse(text);
    } catch (parseErr) {
      console.error('[Narrator] Failed to parse LLM response:', parseErr);
      throw new Error('Narrator response was not valid JSON');
    }

    // Validate structure
    if (!campaign.campaign_path || !Array.isArray(campaign.campaign_path)) {
      throw new Error('Narrator response missing campaign_path');
    }

    // Strictly enforce chronological sorting (only if years are parseable)
    const hasParseableYears = campaign.campaign_path.some(s => parseHistoricalYear(s.year) !== 0);
    if (hasParseableYears) {
      campaign.campaign_path.sort((a, b) => {
        return parseHistoricalYear(a.year) - parseHistoricalYear(b.year);
      });
    }

    // Normalize coordinates to match navigator expectations
    campaign.campaign_path = campaign.campaign_path.map(stop => ({
      ...stop,
      coordinates: {
        lat: stop.coordinates?.lat || 0,
        lng: stop.coordinates?.lng || stop.coordinates?.lon || 0,
      },
      map_action: {
        duration: stop.map_action?.duration || 5,
        dwell: stop.map_action?.dwell || 2,
        altitude: stop.map_action?.altitude || 500000,
        heading: stop.map_action?.heading || 0,
        pitch: stop.map_action?.pitch || -35,
      },
      camera_style: stop.camera_emotion || 'cinematic_pan',
      source_url: stop.source_url || '',
    }));

    return campaign;
  },

  /**
   * Generate a live news situation report from search results.
   * @param {{ results: Array }} searchData — From researcher.search() with mode='news'
   * @param {string} query — Original user query
   * @param {string} timeframe — 'LAST_24H' | 'PAST_WEEK' | 'FULL_OVERVIEW'
   * @param {string} narrationLength — 'short' | 'medium' | 'long'
   * @returns {Promise<Object>} — News campaign JSON
   */
  async generateNewsReport(searchData, query, timeframe = 'FULL_OVERVIEW', narrationLength = 'medium') {
    const lengthGuide = NEWS_LENGTH_INSTRUCTIONS[narrationLength] || NEWS_LENGTH_INSTRUCTIONS.medium;

    const searchContext = searchData.results
      .filter(r => r.type === 'news' || r.type === 'organic' || r.type === 'knowledge')
      .map((r, i) => {
        if (r.type === 'knowledge') {
          return `[Knowledge Graph] ${r.title}: ${r.description}\nAttributes: ${JSON.stringify(r.attributes)}`;
        }
        const source = r.source_name ? ` (${r.source_name})` : '';
        return `[${i + 1}] ${r.title}${source}\n${r.snippet || ''}\nURL: ${r.source_url}\nDate: ${r.date || 'Recent'}`;
      })
      .join('\n\n');

    const userPrompt = `LIVE NEWS TOPIC: "${query}"

TIMEFRAME: ${timeframe}
NARRATION LENGTH: ${narrationLength.toUpperCase()}
${lengthGuide}

CURRENT DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

NEWS RESULTS:
${searchContext || 'No news results available. Use your knowledge of current 2026 events.'}

Generate the situation report JSON now.`;

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        system: NEWS_ANCHOR_PROMPT,
        prompt: userPrompt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`News Anchor API ${res.status}: ${errText}`);
    }

    const data = await res.json();

    let campaign;
    try {
      let text = data.text || data.response || '';
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      campaign = JSON.parse(text);
    } catch (parseErr) {
      console.error('[NewsAnchor] Failed to parse LLM response:', parseErr);
      throw new Error('News Anchor response was not valid JSON');
    }

    if (!campaign.campaign_path || !Array.isArray(campaign.campaign_path)) {
      throw new Error('News Anchor response missing campaign_path');
    }

    // Ensure metadata has news type
    campaign.metadata = {
      ...campaign.metadata,
      type: 'LIVE_NEWS',
      timeframe,
    };

    // Normalize coordinates + preserve news_tag
    campaign.campaign_path = campaign.campaign_path.map(stop => ({
      ...stop,
      coordinates: {
        lat: stop.coordinates?.lat || 0,
        lng: stop.coordinates?.lng || stop.coordinates?.lon || 0,
      },
      map_action: {
        duration: stop.map_action?.duration || 4,
        dwell: stop.map_action?.dwell || 2,
        altitude: stop.map_action?.altitude || 400000,
        heading: stop.map_action?.heading || 0,
        pitch: stop.map_action?.pitch || -30,
      },
      camera_style: stop.camera_emotion || 'rapid_zoom',
      source_url: stop.source_url || '',
      news_tag: stop.news_tag || 'BREAKING',
    }));

    return campaign;
  },

  /** Check if the narrator API is configured */
  async checkAvailability() {
    try {
      const res = await fetch('/api/generate/health');
      return res.ok;
    } catch {
      return false;
    }
  },
};
