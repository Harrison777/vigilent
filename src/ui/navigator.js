/**
 * navigator.js — VIGILENT Historical Navigator v2
 * Cinematic guided tours with documentarian narration,
 * unified bottom player, great-arc trails, and pulsing markers.
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';
import { ttsService } from '../services/tts.js';
import { audio } from '../services/audio.js';

// ════════════════════════════════════════════════════════════════
// NARRATIVE VOICE — transforms raw data into storytelling text
// ════════════════════════════════════════════════════════════════

/** Event-type icons for map markers and stop list */
const EVENT_ICONS = {
  battle:    '⚔️',
  siege:     '🏰',
  conquest:  '🚩',
  political: '👑',
  campaign:  '🗺️',
  death:     '💀',
  founding:  '🏛️',
  treaty:    '🤝',
  revolt:    '🔥',
  default:   '📍',
};

/**
 * Create a canvas marker icon for the map — large, clear, and colorful.
 * @param {string} icon - emoji icon to render
 * @param {string} bgColor - CSS color for the circle background
 * @param {number} size - canvas size in pixels
 * @returns {HTMLCanvasElement}
 */
function createMarkerCanvas(icon, bgColor, size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2, r = size / 2 - 3;

  // Outer glow
  ctx.shadowColor = bgColor;
  ctx.shadowBlur = 8;

  // Dark circle background
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0e17';
  ctx.fill();

  // Colored ring
  ctx.lineWidth = 3;
  ctx.strokeStyle = bgColor;
  ctx.stroke();

  // Reset shadow for text
  ctx.shadowBlur = 0;

  // Icon emoji
  ctx.font = `${Math.round(size * 0.45)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, cx, cy + 1);

  return canvas;
}

// ── Direction & Geography helpers ──

function getCompassDir(fromCoords, toCoords) {
  const dLat = toCoords.lat - fromCoords.lat;
  const dLng = toCoords.lng - fromCoords.lng;
  const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
  if (angle > -22.5 && angle <= 22.5) return 'north';
  if (angle > 22.5 && angle <= 67.5) return 'northeast';
  if (angle > 67.5 && angle <= 112.5) return 'east';
  if (angle > 112.5 && angle <= 157.5) return 'southeast';
  if (angle > 157.5 || angle <= -157.5) return 'south';
  if (angle > -157.5 && angle <= -112.5) return 'southwest';
  if (angle > -112.5 && angle <= -67.5) return 'west';
  return 'northwest';
}

function getDistanceDeg(a, b) {
  const dLat = Math.abs(b.lat - a.lat);
  const dLon = Math.abs(b.lng - a.lng);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/** Identify the climax stop (most dramatic battle) in a sequence */
function findClimaxIndex(events) {
  const battleTypes = new Set(['battle', 'siege', 'conquest']);
  let best = -1, bestScore = 0;
  events.forEach((ev, i) => {
    if (i === 0 || i === events.length - 1) return; // skip first/last
    let score = battleTypes.has(ev.type) ? 3 : 0;
    score += (ev.parties?.length || 0);
    if (ev.description?.length > 60) score += 1;
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return best;
}

/** Pick a random element from an array */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── ERA-SPECIFIC VOCABULARY ──────────────────────────────────
const ERA_VOCAB = {
  'Ancient Egypt':       { warriors: 'warriors', forces: 'armies of the pharaoh', weapon: 'bronze', land: 'the land of the Nile', verb: 'marched', clash: 'clashed' },
  'Ancient Greece':      { warriors: 'hoplites', forces: 'phalanxes', weapon: 'iron-tipped spears', land: 'Hellas', verb: 'advanced', clash: 'collided' },
  'Alexander the Great': { warriors: 'Companion cavalry', forces: 'the Macedonian war machine', weapon: 'the sarissa', land: 'the known world', verb: 'pressed onward', clash: 'smashed into' },
  'Roman Empire':        { warriors: 'legionaries', forces: 'the legions of Rome', weapon: 'the gladius', land: 'the Roman world', verb: 'marched', clash: 'clashed' },
  'Viking Age':          { warriors: 'Norse raiders', forces: 'the longship fleet', weapon: 'axes and shields', land: 'the northern seas', verb: 'sailed', clash: 'fell upon' },
  'Crusades':            { warriors: 'crusaders', forces: 'the armies of Christendom', weapon: 'the longsword', land: 'the Holy Land', verb: 'rode', clash: 'threw themselves against' },
  'Mongol Empire':       { warriors: 'Mongol horsemen', forces: 'the horde', weapon: 'the composite bow', land: 'the steppe', verb: 'thundered', clash: 'swept through' },
  'Ottoman Empire':      { warriors: 'janissaries', forces: 'the Ottoman host', weapon: 'cannon and musket', land: 'the crescent empire', verb: 'advanced', clash: 'besieged' },
  'Napoleonic Wars':     { warriors: 'regiments', forces: 'the Grande Armée', weapon: 'artillery', land: 'the continent', verb: 'marched', clash: 'engaged' },
  'American Revolution': { warriors: 'minutemen', forces: 'the Continental Army', weapon: 'muskets', land: 'the colonies', verb: 'rallied', clash: 'stood against' },
  'American Civil War':  { warriors: 'battalions', forces: 'Union and Confederate forces', weapon: 'rifle and cannon', land: 'a nation divided', verb: 'advanced', clash: 'met in a fury' },
  'World War I':         { warriors: 'divisions', forces: 'the allied powers', weapon: 'machine guns and gas', land: 'the Western Front', verb: 'pushed through', clash: 'ground against' },
  'World War II':        { warriors: 'armored divisions', forces: 'Allied and Axis forces', weapon: 'tanks and airpower', land: 'the theatre of war', verb: 'surged forward', clash: 'collided' },
  'Cold War':            { warriors: 'special forces', forces: 'superpower proxies', weapon: 'jets and missiles', land: 'the Iron Curtain', verb: 'deployed', clash: 'confronted' },
};
const DEFAULT_VOCAB = { warriors: 'soldiers', forces: 'the assembled armies', weapon: 'weapons of war', land: 'the region', verb: 'advanced', clash: 'clashed' };

function getVocab(era) { return ERA_VOCAB[era] || DEFAULT_VOCAB; }

// ── DIRECTIONAL MOVEMENT ─────────────────────────────────────
const DIR_PHRASES = {
  north:     ['northward through the mountain passes', 'toward the frozen north', 'up through the heartland'],
  northeast: ['northeast across the frontier', 'toward the northeast horizon', 'cutting northeast through the wilderness'],
  east:      ['east toward the rising sun', 'eastward into uncharted territory', 'toward the dawn'],
  southeast: ['southeast through the lowlands', 'down toward the southeast coast', 'into the southeast corridor'],
  south:     ['southward across the plains', 'sweeping south', 'pushing toward the southern reaches'],
  southwest: ['southwest through the hills', 'angling southwest', 'toward the southwest frontier'],
  west:      ['westward under darkening skies', 'toward the setting sun', 'pressing west'],
  northwest: ['northwest through the forests', 'toward the northwest passage', 'cutting northwest'],
};

function getDirPhrase(dir) { return pick(DIR_PHRASES[dir] || [`toward ${dir}`]); }

// ── TRANSITIONS (5+ per time-gap category) ──────────────────

function getTransition(prevStop, curStop, index, isClimax) {
  if (index === 0) return '';

  const prevYear = parseYearNum(prevStop.year);
  const curYear  = parseYearNum(curStop.year);
  const gap = Math.abs(curYear - prevYear);
  const dir = getCompassDir(prevStop.coordinates, curStop.coordinates);
  const dist = getDistanceDeg(prevStop.coordinates, curStop.coordinates);
  const farAway = dist > 8;
  const dirPhrase = getDirPhrase(dir);

  // Climax — maximum drama
  if (isClimax) {
    return pick([
      `Then came the moment everything hinged upon. `,
      `What followed would become the turning point — the hinge of fate. `,
      `And then — the decisive hour arrived. `,
      `History was about to pivot on a single day. `,
      `The stage was set for the battle that would decide everything. `,
    ]);
  }

  // Same year
  if (gap === 0) {
    return farAway ? pick([
      `That same year, ${dirPhrase}, `,
      `Before the year was out, forces moved ${dirPhrase}, where `,
      `Still in that fateful year — now ${dirPhrase} — `,
      `The ink had barely dried when, ${dirPhrase}, `,
    ]) : pick([
      'That same year, not far from the last, ',
      'Before the dust had settled, ',
      'Almost simultaneously, ',
      'In that very same year, ',
      'Events moved quickly — ',
    ]);
  }

  // 1 year
  if (gap === 1) {
    return farAway ? pick([
      `The following year, ${dirPhrase}, `,
      `One year later, having pressed ${dirPhrase}, `,
      `When the next spring came, ${dirPhrase}, `,
      `A year would pass. Then, ${dirPhrase}, `,
    ]) : pick([
      'One year later, ',
      'The following spring, ',
      'When the next year dawned, ',
      'Twelve months later, ',
    ]);
  }

  // 2-5 years
  if (gap <= 5) {
    return farAway ? pick([
      `${gap} years later, having campaigned ${dirPhrase}, `,
      `After ${gap} years of consolidation, the march continued ${dirPhrase}, where `,
      `${gap} years of preparation culminated ${dirPhrase}, when `,
      `The next ${gap} years reshaped the map. ${dirPhrase.charAt(0).toUpperCase() + dirPhrase.slice(1)}, `,
    ]) : pick([
      `${gap} years later, `,
      `In the ${gap} years that followed, `,
      `After ${gap} years of uneasy peace, `,
      `${gap} years would pass before `,
    ]);
  }

  // 6-20 years
  if (gap <= 20) {
    return pick([
      `After ${gap} long years, `,
      `Nearly ${gap === 10 ? 'a decade' : gap + ' years'} of consolidation ended when `,
      `${gap} years of preparation would lead to `,
      `A generation shaped by those ${gap} years would witness `,
      `The world had changed in those ${gap} years. Now, `,
    ]);
  }

  // 20+ years
  return pick([
    `Decades would pass — ${gap} years, to be precise — before `,
    `${gap} years. A lifetime. And then, `,
    `More than ${Math.floor(gap / 10)} decades of silence broken when `,
    `History waited ${gap} years for its next chapter. `,
    `The world turned for ${gap} years. Then, `,
  ]);
}

// ── OPENINGS ─────────────────────────────────────────────────

const OPENERS_SHORT = [
  (ev) => `${ev.year}. ${ev.region || 'The stage is set'}. ${ev.description}.`,
  (ev) => `${ev.year} — ${ev.description}.`,
  (ev) => `It begins: ${ev.year}. ${ev.description}.`,
];

const OPENERS_MEDIUM = [
  (ev, v, region) => `The year is ${ev.year}. In ${region}, ${ev.description}. ${v.forces} stand ready — and the world is about to change.`,
  (ev, v, region) => `Our story opens in ${ev.year}, in ${region}. ${ev.description}. What follows will reshape the map of the known world.`,
  (ev, v, region) => `Picture this — ${region}, ${ev.year}. ${ev.description}. A chain of events is about to unfold that history will never forget.`,
  (ev, v, region) => `We begin in the year ${ev.year}. ${ev.description}. Across ${region}, ${v.warriors} prepare for what lies ahead.`,
  (ev, v, region) => `${ev.year}. ${region}. ${ev.description}. From this moment, there is no turning back.`,
];

const OPENERS_LONG = [
  (ev, v, region, parties) => `Close your eyes and imagine ${region}, the year ${ev.year}. The air is thick with tension. ${ev.description}. ${parties ? `${parties} face each other across a landscape that will soon be forever changed.` : `${v.forces} have assembled, and what comes next will echo through the centuries.`} The stakes could not be higher.`,
  (ev, v, region, parties) => `The year is ${ev.year}. In ${region}, a powder keg is about to ignite. ${ev.description}. ${parties ? `The fate of ${parties} — and perhaps of ${v.land} itself — hangs in the balance.` : `${v.forces} stand at a crossroads that will define an age.`} No one alive that day could have predicted what was to come.`,
  (ev, v, region, parties) => `${ev.year}. To understand what happens next, you must first understand ${region} — a land shaped by generations of conflict and ambition. ${ev.description}. ${parties ? `Here, ${parties} will write a chapter in blood and iron.` : `Here, ${v.warriors} will be tested as never before.`} This is where it all begins.`,
];

// ── CLOSINGS ─────────────────────────────────────────────────

const CLOSERS_SHORT = [
  (ev) => `${ev.year} — ${ev.description}. The chapter closes.`,
  (ev) => `And finally: ${ev.year}. ${ev.description}. End of an era.`,
];

const CLOSERS_MEDIUM = [
  (ev, v) => `And so we arrive at ${ev.year}. ${ev.description}. The dust settles, the maps are redrawn, and ${v.land} will never look the same.`,
  (ev, v) => `Our journey ends in ${ev.year}. ${ev.description}. What began with such promise now passes into legend — but the echoes will be heard for generations.`,
  (ev, v) => `${ev.year}. ${ev.description}. And with that final act, this chapter of history draws to a close. The world that emerges is fundamentally different from the one that began this story.`,
  (ev) => `We end where all great stories must — at the moment of reckoning. ${ev.year}: ${ev.description}. History moves on, but it never forgets.`,
];

const CLOSERS_LONG = [
  (ev, v, parties) => `And now we reach the final stop. ${ev.year}. ${ev.description}. ${parties ? `For ${parties}, this marks the end of an extraordinary chapter.` : `For ${v.warriors} and those who followed them, this was the last act.`} Empires rise. Empires fall. But the human ambition that drove these events — that endures. The maps will be redrawn again. They always are.`,
  (ev, v, parties) => `${ev.year}. ${ev.description}. ${parties ? `The story of ${parties} reaches its conclusion here` : `The final chapter is written here`} — not with a whisper, but with a moment that would resonate through the ages. Stand at this spot today, and you can almost hear the echoes. History is not just what happened. It is what we choose to remember.`,
];

// ── NEWS OPENINGS & CLOSINGS ─────────────────────────────────

const NEWS_OPENERS = [
  (desc, region) => `Breaking news from ${region}. ${desc}`,
  (desc, region) => `Turning our attention to ${region}. ${desc}`,
  (desc, region) => `Developing story out of ${region}: ${desc}`,
];

const NEWS_CLOSERS = [
  (desc) => `${desc} We will continue monitoring the situation.`,
  (desc) => `${desc} This remains a developing story.`,
  (desc) => `The implications of this are still unfolding. ${desc}`,
];

function buildNewsNarrative(event, prevStop, index, totalStops) {
  const region = event.region || 'the region';
  // Attempt to strip obvious non-latin blocks (like full Arabic sentences) if they clutter the English TTS
  let desc = (event.description || event.title || 'Events are unfolding.').replace(/[^\x00-\x7F]/g, '').trim().replace(/\s+/g, ' ');
  if (!desc.endsWith('.')) desc += '.';

  if (index === 0) return pick(NEWS_OPENERS)(desc, region).replace('..', '.');
  if (index === totalStops - 1) return pick(NEWS_CLOSERS)(desc).replace('..', '.');
  
  // Middle stops
  const transitions = [
    `Meanwhile, in ${region}, `,
    `Moving to ${region}, `,
    `Elsewhere in ${region}, `,
    `Also developing today: `,
  ];
  return `${pick(transitions)}${desc}`.replace('..', '.');
}

// ── EVENT-TYPE DRAMATIC BEATS ────────────────────────────────

function eventBeat(ev, vocab, parties, narrationLength) {
  const short = narrationLength === 'short';
  const t = ev.type;

  if (t === 'battle' || t === 'war') {
    return short ? '' : pick([
      parties ? ` ${parties} ${vocab.clash} in a test of will and ${vocab.weapon}.` : ` ${vocab.warriors} met their match that day.`,
      parties ? ` The forces of ${parties} collided — and the cost was measured in blood.` : ` The clash of ${vocab.weapon} rang across ${ev.region || vocab.land}.`,
      ` It was brutal, decisive, and it changed the calculus of power in ${ev.region || vocab.land}.`,
    ]);
  }
  if (t === 'siege') {
    return short ? '' : pick([
      ` The walls held — until they didn't.`,
      ` Day after day the defenders fought. But time favors the attacker.`,
      parties ? ` ${parties} stared each other down across fortified walls. Only one would walk away.` : ` Behind those walls, an era was about to end.`,
    ]);
  }
  if (t === 'conquest' || t === 'invasion') {
    return short ? '' : pick([
      ` New banners rose over ${ev.region || 'the conquered lands'}. The old order crumbled.`,
      ` The conqueror's boot pressed down. A new chapter began — written by the victors.`,
      parties ? ` ${parties} — and the world shifted on its axis.` : ` The map was redrawn overnight.`,
    ]);
  }
  if (t === 'political' || t === 'treaty') {
    return short ? '' : pick([
      ` The pen proved mightier than the sword — at least for now.`,
      ` A signature. A handshake. And the fate of nations was sealed.`,
      ` This was not won on the battlefield — but its consequences were no less seismic.`,
    ]);
  }
  if (t === 'death' || t === 'fall') {
    return short ? '' : pick([
      ` And just like that — it was over. An era extinguished.`,
      ` The world mourned. Or celebrated. History rarely offers a clean verdict.`,
      ` What fell that day was not merely a person, but an idea — an entire way of being.`,
    ]);
  }
  if (t === 'achievement' || t === 'founding') {
    return short ? '' : pick([
      ` Something extraordinary was born that day — and it would outlast its creators.`,
      ` In that moment of creation, the impossible became permanent.`,
      ` The world got bigger. Horizons expanded. Nothing would ever be ordinary again.`,
    ]);
  }
  // Default
  return short ? '' : pick([
    ` The significance of this moment would only become clear in the years that followed.`,
    ` History rarely announces its pivots. This was one of them.`,
    ` A quiet turning point — invisible to those living through it, unmistakable in hindsight.`,
  ]);
}

// ── MAIN NARRATIVE BUILDER ───────────────────────────────────

function buildNarrative(event, prevStop, index, totalStops, isClimax, narrationLength = 'medium') {
  const isNews = String(event.year) === 'Modern' || String(event.year).startsWith('202') || event.news_tag;
  if (isNews) {
    return buildNewsNarrative(event, prevStop, index, totalStops);
  }

  const vocab = getVocab(event.era);
  const parties = event.parties?.join(' and ') || '';
  const region = event.region || vocab.land;
  const transition = getTransition(prevStop, event, index, isClimax);

  // ── OPENING (first stop) ──
  if (index === 0) {
    const pool = narrationLength === 'short' ? OPENERS_SHORT
      : narrationLength === 'long' ? OPENERS_LONG : OPENERS_MEDIUM;
    return pick(pool)(event, vocab, region, parties);
  }

  // ── CLOSING (last stop) ──
  if (index === totalStops - 1) {
    const pool = narrationLength === 'short' ? CLOSERS_SHORT
      : narrationLength === 'long' ? CLOSERS_LONG : CLOSERS_MEDIUM;
    return pick(pool)(event, vocab, parties);
  }

  // ── SHORT: punchy one-liners ──
  if (narrationLength === 'short') {
    return `${transition}${event.description}.`;
  }

  // ── MEDIUM / LONG: transition + description + event beat ──
  const beat = eventBeat(event, vocab, parties, narrationLength);
  const base = `${transition}${event.description}.${beat}`;

  // LONG gets extra atmospheric detail
  if (narrationLength === 'long') {
    const atmo = pick([
      ` The landscape itself seemed to hold its breath.`,
      ` Across ${region}, the reverberations were felt immediately.`,
      ` Those who witnessed it would carry the memory to their graves.`,
      ` The weight of this moment pressed down on everyone present.`,
      ` Nothing in ${region} would ever look the same again.`,
      '',  // sometimes just skip for variety
      '',
    ]);
    return base + atmo;
  }

  return base;
}

function parseYearNum(y) {
  const s = String(y).trim();
  if (s.includes('BC')) return -parseInt(s);
  return parseInt(s.replace(/\s*AD\s*/i, ''));
}

// ════════════════════════════════════════════════════════════════
// CAMPAIGN BUILDER
// ════════════════════════════════════════════════════════════════

/**
 * Map zoom level to altitude — PULLED BACK for geographic context.
 * User feedback: "don't make the flyover so close you can't tell where you are"
 */
function zoomToAltitude(zoom) {
  const map = {
    5: 6000000, 6: 3500000, 7: 2000000, 8: 1200000,
    9: 700000, 10: 400000, 11: 250000, 12: 150000,
  };
  return map[Math.round(zoom)] || 1200000;
}

/** Calculate flight duration from distance between stops */
function calcFlightDuration(fromCoords, toCoords) {
  if (!fromCoords) return 3;
  const dLat = Math.abs(toCoords.lat - fromCoords.lat);
  const dLon = Math.abs(toCoords.lng - fromCoords.lng);
  const dist = Math.sqrt(dLat * dLat + dLon * dLon);
  if (dist < 2) return 2;
  if (dist < 5) return 3;
  if (dist < 15) return 4;
  return 5;
}

/** Generate intermediate points along a great-arc for smooth curved trails */
function greatArcPoints(from, to, numPoints = 20) {
  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;
  const lat1 = toRad(from.lat), lon1 = toRad(from.lng);
  const lat2 = toRad(to.lat), lon2 = toRad(to.lng);

  const d = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
  ));

  if (d < 0.001) return [from.lng, from.lat, to.lng, to.lat]; // Too close, straight line

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDeg(Math.atan2(y, x));
    points.push(lon, lat);
  }
  return points;
}

// ── Camera Emotion Presets ──
// Each style defines: altitude multiplier, pitch, duration multiplier
const CAMERA_STYLES = {
  wide_establishing: { altMult: 1.6, pitch: 20, durMult: 1.3, label: 'Establishing' },
  cinematic_pan:     { altMult: 1.2, pitch: 30, durMult: 1.1, label: 'Cinematic' },
  rapid_zoom:        { altMult: 0.85, pitch: 40, durMult: 0.8, label: 'Rapid Zoom' },
  terrain_tilt:      { altMult: 0.9, pitch: 50, durMult: 1.0, label: 'Terrain Tilt' },
};

/** Assign camera style based on event type and position */
function assignCameraStyle(evType, index, total) {
  if (index === 0) return 'wide_establishing';
  if (index === total - 1) return 'cinematic_pan';
  if (evType === 'battle' || evType === 'siege') return 'rapid_zoom';
  if (evType === 'campaign' || evType === 'conquest') return 'terrain_tilt';
  return 'cinematic_pan'; // political, death, founding, etc.
}

/** Compute heading in degrees based on march direction */
function calcHeading(fromCoords, toCoords) {
  if (!fromCoords) return 0; // Default north for first stop
  const dLng = toCoords.lng - fromCoords.lng;
  const dLat = toCoords.lat - fromCoords.lat;
  // atan2 gives radians from north, clockwise
  const heading = Math.atan2(dLng, dLat) * (180 / Math.PI);
  // Normalize to 0-360
  return ((heading % 360) + 360) % 360;
}

/** Generate a Wikipedia source URL from event title */
function generateSourceUrl(title) {
  const slug = title.replace(/['']/g, "'").replace(/ /g, '_');
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
}

/** Build a campaign from historical events with camera emotion & narration depth */
export function buildCampaign(events, eraTitle, tourLength = 'medium') {
  const sorted = [...events].sort((a, b) => parseYearNum(a.year) - parseYearNum(b.year));
  const climaxIdx = findClimaxIndex(sorted);

  const path = [];
  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    const prevCoords = i > 0 ? { lat: sorted[i - 1].lat, lng: sorted[i - 1].lon } : null;
    const coords = { lat: ev.lat, lng: ev.lon };
    const baseDuration = calcFlightDuration(prevCoords, coords);

    // Camera emotion
    const cameraStyle = assignCameraStyle(ev.type, i, sorted.length);
    const style = CAMERA_STYLES[cameraStyle];
    const baseZoom = (ev.type === 'campaign') ? 7 : 8;
    const altitude = zoomToAltitude(baseZoom) * style.altMult;
    const duration = Math.max(2, baseDuration * style.durMult);

    // Heading follows march direction
    const heading = calcHeading(prevCoords, coords);

    // Is this the climax?
    const isClimax = i === climaxIdx;

    const prevStop = i > 0 ? path[i - 1] : null;
    const lecture = buildNarrative(
      { ...ev, coordinates: coords },
      prevStop ? { ...sorted[i - 1], coordinates: prevStop.coordinates } : null,
      i, sorted.length, isClimax, tourLength
    );

    path.push({
      stop_number: i + 1,
      location_name: ev.title,
      coordinates: coords,
      year: ev.year,
      era: ev.era,
      region: ev.region,
      type: ev.type,
      parties: ev.parties,
      lecture_segment: lecture,
      source_url: generateSourceUrl(ev.title),
      camera_style: cameraStyle,
      map_action: {
        altitude,
        heading,
        pitch: style.pitch,
        duration,
        dwell: Math.max(2.5, lecture.length / 14),
      },
    });
  }

  return {
    metadata: {
      event_title: eraTitle || sorted[0]?.era || 'Historical Campaign',
      total_stops: path.length,
      tour_length: tourLength,
      total_estimated_duration_seconds: path.reduce(
        (sum, s) => sum + s.map_action.duration + s.map_action.dwell, 0
      ),
    },
    campaign_path: path,
  };
}

// ════════════════════════════════════════════════════════════════
// CAMPAIGN PLAYER — state machine
// ════════════════════════════════════════════════════════════════

let activePlayer = null;

export class CampaignPlayer {
  constructor(campaign) {
    this.campaign = campaign;
    this.state = 'idle';         // idle | flying | narrating | paused | complete
    this.currentStop = -1;
    this.muted = false;
    this.trailEntities = [];
    this.markerEntities = [];
    this.previewMarkers = [];
    this.fogEntities = [];       // Fog of war overlay entities
    this._dwellTimer = null;
    this._listeners = {};

    // Wire TTS word-level highlighting
    ttsService.onWord((wordIdx, word) => {
      this._emit('word-highlight', { wordIdx, word });
    });
  }

  on(event, fn) { this._listeners[event] = fn; }
  _emit(event, data) { if (this._listeners[event]) this._listeners[event](data); }
  _setState(s) { this.state = s; this._emit('state-change', s); }

  async play() {
    if (activePlayer && activePlayer !== this) activePlayer.stop();
    activePlayer = this;
    if (this.state === 'paused') {
      // Browser voice can resume; AI voice restarts on next advance
      if (ttsService.getMode() === 'browser' && window.speechSynthesis?.paused) {
        window.speechSynthesis.resume();
      }
      this._setState('narrating');
      return;
    }
    this._setState('flying');
    this.currentStop = -1;
    this._placeAllPreviewMarkers();
    this._addFogOfWar();   // Dark overlay on tour start
    await this._advance();
  }

  pause() {
    if (this.state === 'narrating' || this.state === 'flying') {
      ttsService.stop();
      clearTimeout(this._dwellTimer);
      this._setState('paused');
    }
  }

  stop() {
    this._setState('idle');
    this.currentStop = -1;
    clearTimeout(this._dwellTimer);
    ttsService.stop();
    this._clearAll();
    this._removeFogOfWar();
    if (activePlayer === this) activePlayer = null;
  }

  async next() {
    if (this.state === 'complete') return;
    clearTimeout(this._dwellTimer);
    ttsService.stop();
    await this._advance();
  }

  async prev() {
    if (this.currentStop <= 0) return;
    clearTimeout(this._dwellTimer);
    ttsService.stop();
    this.currentStop -= 2;
    const viewer = getViewer();
    if (viewer && this.trailEntities.length > 0) {
      viewer.entities.remove(this.trailEntities.pop());
    }
    await this._advance();
  }

  /** Cycle voice mode: ai → browser → muted → ai */
  cycleVoiceMode() {
    const modes = ['ai', 'browser', 'muted'];
    const current = ttsService.getMode();
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    ttsService.setMode(next);
    this.muted = (next === 'muted');
    return next;
  }

  async jumpTo(index) {
    clearTimeout(this._dwellTimer);
    ttsService.stop();
    this.currentStop = index - 1;
    await this._advance();
  }

  // ── Core Loop ──

  async _advance() {
    this.currentStop++;
    const path = this.campaign.campaign_path;

    if (this.currentStop >= path.length) {
      this._setState('complete');
      this._emit('complete', this.campaign.metadata);
      return;
    }

    const stop = path[this.currentStop];
    this._emit('stop-change', { stop, index: this.currentStop, total: path.length });

    // Reveal fog of war at this stop
    this._revealFogAt(stop.coordinates);

    // Animated trail from previous stop (starts growing during flight)
    if (this.currentStop > 0) {
      const prev = path[this.currentStop - 1];
      this._animateTrail(prev.coordinates, stop.coordinates, this.currentStop, stop.map_action.duration);
      this._fadeOldTrails();
    }

    // Marker
    this._updateMarkers(stop, this.currentStop);

    // Fly
    this._setState('flying');
    await this._flyTo(stop);

    // Narrate (via TTS service: AI voice → browser fallback → silent)
    this._setState('narrating');
    await ttsService.speak(stop.lecture_segment);

    // Dwell
    await this._dwell(stop.map_action.dwell * 1000);

    // Auto-advance
    if (this.state !== 'paused' && this.state !== 'idle') {
      await this._advance();
    }
  }

  _flyTo(stop) {
    return new Promise(resolve => {
      const viewer = getViewer();
      if (!viewer) { resolve(); return; }

      const pitchDeg = stop.map_action.pitch;
      const headingDeg = stop.map_action.heading || 0;

      // Use flyToBoundingSphere — Cesium positions the camera so the target
      // is at the visual center of the viewport regardless of pitch angle.
      const target = Cesium.Cartesian3.fromDegrees(
        stop.coordinates.lng, stop.coordinates.lat, 0
      );
      const bsphere = new Cesium.BoundingSphere(target, 0);

      viewer.camera.flyToBoundingSphere(bsphere, {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(headingDeg),      // heading: follows march direction
          Cesium.Math.toRadians(-pitchDeg),        // pitch below horizontal
          stop.map_action.altitude                  // range from camera emotion
        ),
        duration: stop.map_action.duration,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => resolve(),
        cancel: () => resolve(),
      });
    });
  }

  _dwell(ms) {
    return new Promise(resolve => {
      if (this.state === 'paused' || this.state === 'idle') { resolve(); return; }
      this._dwellTimer = setTimeout(resolve, ms);
    });
  }

  // ── Fog of War ──

  /** Add a dark fog overlay covering the globe */
  _addFogOfWar() {
    const viewer = getViewer();
    if (!viewer) return;

    // Semi-transparent dark rectangle covering the world
    const fog = viewer.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
        material: Cesium.Color.BLACK.withAlpha(0.55),
        height: 0,
        classificationType: Cesium.ClassificationType.BOTH,
      },
    });
    this.fogEntities.push(fog);
  }

  /** Reveal a circle at the given coordinates */
  _revealFogAt(coords) {
    const viewer = getViewer();
    if (!viewer) return;

    // Bright "revealed" ellipse that punches through the fog
    const reveal = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(coords.lng, coords.lat),
      ellipse: {
        semiMinorAxis: 120000,   // ~120km radius reveal
        semiMajorAxis: 120000,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString('#0a1628').withAlpha(0.0)
        ),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#f0b429').withAlpha(0.35),
        outlineWidth: 2,
        height: 0,
        classificationType: Cesium.ClassificationType.BOTH,
      },
    });
    this.fogEntities.push(reveal);
  }

  /** Clean up all fog entities */
  _removeFogOfWar() {
    const viewer = getViewer();
    if (!viewer) return;
    this.fogEntities.forEach(e => viewer.entities.remove(e));
    this.fogEntities = [];
  }

  // ── Trail & Markers ──

  /**
   * Animated "marching line" — trail grows from origin to destination
   * over the flight duration, synced with the camera movement.
   */
  _animateTrail(from, to, segIdx, flightDuration) {
    const viewer = getViewer();
    if (!viewer) return;

    const allArcCoords = greatArcPoints(from, to, 40); // lon,lat pairs
    const totalPairs = allArcCoords.length / 2;
    const startTime = Date.now();
    const durationMs = (flightDuration || 3) * 1000;
    let currentCount = 1; // Start with 1 point visible

    // CallbackProperty dynamically returns the subset of positions
    const positionsCallback = new Cesium.CallbackProperty(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease-in-out to match camera easing
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const targetCount = Math.max(1, Math.floor(eased * totalPairs));
      currentCount = Math.max(currentCount, targetCount); // Never shrink

      const slice = allArcCoords.slice(0, currentCount * 2);
      return Cesium.Cartesian3.fromDegreesArray(slice);
    }, false);

    const entity = viewer.entities.add({
      id: `nav-trail-${segIdx}-${Date.now()}`,
      polyline: {
        positions: positionsCallback,
        width: 3.5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.4,
          color: Cesium.Color.fromCssColorString('#ffd54f'),
        }),
        clampToGround: true,
      },
    });
    this.trailEntities.push(entity);

    // After animation completes, convert to static positions for performance
    setTimeout(() => {
      if (entity.polyline) {
        try {
          entity.polyline.positions = Cesium.Cartesian3.fromDegreesArray(allArcCoords);
        } catch(_) { /* entity may have been removed */ }
      }
    }, durationMs + 200);
  }

  _fadeOldTrails() {
    this.trailEntities.forEach((entity, i) => {
      if (i < this.trailEntities.length - 1 && entity.polyline) {
        entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.08,
          color: Cesium.Color.fromCssColorString('#ffd54f').withAlpha(0.35),
        });
        entity.polyline.width = 2;
      }
    });
  }

  _updateMarkers(currentStop, currentIndex) {
    const viewer = getViewer();
    if (!viewer) return;

    // Remove preview marker for this stop (it gets replaced by active marker)
    if (this._previewEntities && this._previewEntities[currentIndex]) {
      try { viewer.entities.remove(this._previewEntities[currentIndex]); } catch (_) {}
      this._previewEntities[currentIndex] = null;
    }

    // Re-style previous marker to "completed" (smaller gold billboard)
    if (currentIndex > 0 && this.markerEntities.length > 0) {
      const prev = this.markerEntities[this.markerEntities.length - 1];
      if (prev.billboard) {
        const prevIcon = EVENT_ICONS[prev._stopType] || EVENT_ICONS.default;
        prev.billboard.image = createMarkerCanvas(prevIcon, '#ffd54f', 36);
      }
      if (prev.label) {
        prev.label.fillColor = Cesium.Color.fromCssColorString('#ffd54f').withAlpha(0.7);
        prev.label.scale = 0.85;
      }
    }

    // Place current marker — large cyan billboard with label
    const icon = EVENT_ICONS[currentStop.type] || EVENT_ICONS.default;
    const canvas = createMarkerCanvas(icon, '#00e5ff', 56);
    
    const entity = viewer.entities.add({
      id: `nav-marker-${currentIndex}-${Date.now()}`,
      position: Cesium.Cartesian3.fromDegrees(
        currentStop.coordinates.lng, currentStop.coordinates.lat, 500
      ),
      billboard: {
        image: canvas,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: currentStop.location_name,
        font: 'bold 15px Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -60),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a0e17').withAlpha(0.9),
        backgroundPadding: new Cesium.Cartesian2(10, 5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    entity._stopType = currentStop.type;
    this.markerEntities.push(entity);

    // Ensure Cesium renders the new marker (requestRenderMode)
    if (viewer.scene) viewer.scene.requestRender();
  }

  /** Place small preview markers for ALL stops at tour start */
  _placeAllPreviewMarkers() {
    const viewer = getViewer();
    if (!viewer) return;
    this._previewEntities = this._previewEntities || [];

    this.campaign.campaign_path.forEach((stop, i) => {
      const icon = EVENT_ICONS[stop.type] || EVENT_ICONS.default;
      const canvas = createMarkerCanvas(icon, '#607d8b', 28);
      
      const entity = viewer.entities.add({
        id: `nav-preview-${i}-${Date.now()}`,
        position: Cesium.Cartesian3.fromDegrees(
          stop.coordinates.lng, stop.coordinates.lat, 500
        ),
        billboard: {
          image: canvas,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          color: Cesium.Color.WHITE.withAlpha(0.6),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: `${i + 1}`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#90a4ae'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -32),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3e6),
        },
      });
      this._previewEntities.push(entity);
    });

    if (viewer.scene) viewer.scene.requestRender();
  }

  _clearAll() {
    const viewer = getViewer();
    if (!viewer) return;
    [...this.trailEntities, ...this.markerEntities, ...(this._previewEntities || [])].forEach(e => {
      try { viewer.entities.remove(e); } catch (_) {}
    });
    this.trailEntities = [];
    this.markerEntities = [];
    this._previewEntities = [];
  }
}

// ════════════════════════════════════════════════════════════════
// NAVIGATOR UI — unified bottom player + stop list
// ════════════════════════════════════════════════════════════════

let hudEl = null;
let stopListEl = null;
let currentPlayer = null;

/** Ensure the navigator DOM elements exist — creates them if missing */
function ensureDOMElements() {
  // Stop list
  if (!document.getElementById('navigatorStopList')) {
    const sl = document.createElement('div');
    sl.id = 'navigatorStopList';
    document.body.appendChild(sl);
  }
  // HUD bar
  if (!document.getElementById('navigatorHUD')) {
    const hud = document.createElement('div');
    hud.id = 'navigatorHUD';
    hud.innerHTML = `
      <div class="nav-progress"><div class="nav-progress-fill"></div></div>
      <div class="nav-header">
        <span class="nav-title">Navigator</span>
        <span class="nav-camera-style"></span>
        <span class="nav-state"></span>
      </div>
      <div class="nav-controls">
        <button class="nav-btn nav-btn-prev" title="Previous stop">
          <span class="material-symbols-outlined">skip_previous</span>
        </button>
        <button class="nav-btn nav-btn-play" title="Play">
          <span class="material-symbols-outlined">play_arrow</span>
        </button>
        <button class="nav-btn nav-btn-pause" title="Pause" style="display:none">
          <span class="material-symbols-outlined">pause</span>
        </button>
        <button class="nav-btn nav-btn-next" title="Next stop">
          <span class="material-symbols-outlined">skip_next</span>
        </button>
      </div>
      <span class="nav-stop-info">1 / 1</span>
      <div class="nav-lecture"></div>
      <div class="nav-bottom-row">
        <a class="nav-source-link" href="#" target="_blank" rel="noopener" title="View source">
          <span class="material-symbols-outlined">menu_book</span>
          Source
        </a>
        <span class="nav-voice-badge">AI VOICE</span>
        <span class="nav-duration"></span>
      </div>
      <div class="nav-end-controls">
        <button class="nav-btn nav-btn-voice" title="Cycle voice mode: AI → Browser → Muted">
          <span class="material-symbols-outlined">graphic_eq</span>
        </button>
        <button class="nav-btn nav-btn-close" title="End tour">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    `;
    document.body.appendChild(hud);
  }
}

/** Start a guided tour */
export function startNavigator(events, eraTitle, tourLength = 'medium', llmCampaign = null) {
  ensureDOMElements();

  let campaign;
  if (llmCampaign && llmCampaign.campaign_path && llmCampaign.campaign_path.length >= 2) {
    // LLM-generated campaign — normalize the stop format
    campaign = {
      metadata: {
        event_title: llmCampaign.metadata?.title || eraTitle || 'Campaign',
        total_stops: llmCampaign.campaign_path.length,
        tour_length: tourLength,
        total_estimated_duration_seconds: llmCampaign.campaign_path.reduce(
          (sum, s) => sum + (s.map_action?.duration || 5) + (s.map_action?.dwell || 5), 0
        ),
      },
      campaign_path: llmCampaign.campaign_path.map((stop, i) => ({
        stop_number: i + 1,
        location_name: stop.title || stop.location_name || `Stop ${i + 1}`,
        title: stop.title || stop.location_name || `Stop ${i + 1}`,
        coordinates: {
          lat: stop.coordinates?.lat || 0,
          lng: stop.coordinates?.lng || stop.coordinates?.lon || 0,
        },
        year: stop.year || '',
        era: stop.era || llmCampaign.metadata?.era || '',
        region: stop.region || '',
        type: stop.type || 'campaign',
        parties: stop.parties || [],
        lecture_segment: stop.lecture_segment || stop.description || '',
        source_url: stop.source_url || '',
        camera_style: stop.camera_style || stop.camera_emotion || assignCameraStyle(stop.type || 'campaign', i, llmCampaign.campaign_path.length),
        map_action: {
          altitude: stop.map_action?.altitude || 1200000,
          heading: stop.map_action?.heading || 0,
          pitch: stop.map_action?.pitch || 30,
          duration: stop.map_action?.duration || 5,
          dwell: stop.map_action?.dwell || Math.max(3, (stop.lecture_segment || '').length / 14),
        },
      })),
    };
  } else {
    // Legacy: build campaign from local historical events
    campaign = buildCampaign(events, eraTitle, tourLength);
  }

  if (campaign.campaign_path.length < 2) return;

  currentPlayer = new CampaignPlayer(campaign);
  showNavigatorUI(campaign, currentPlayer);

  currentPlayer.on('stop-change', (data) => {
    updateHUDStop(data.stop, data.index, data.total);
    updateStopList(data.index);
  });
  currentPlayer.on('state-change', updateHUDState);
  currentPlayer.on('complete', () => updateHUDState('complete'));

  // Hide timeline, show navigator
  const timeline = document.getElementById('timelineContainer');
  if (timeline) timeline.style.display = 'none';

  currentPlayer.play();
}

/** Stop and dismiss */
export function stopNavigator() {
  if (currentPlayer) {
    currentPlayer.stop();
    currentPlayer = null;
  }
  hideNavigatorUI();

  // Restore timeline
  const timeline = document.getElementById('timelineContainer');
  if (timeline) timeline.style.display = '';
}

export function isNavigatorActive() {
  return !!currentPlayer && currentPlayer.state !== 'idle';
}

// ── UI rendering ──

function showNavigatorUI(campaign, player) {
  hudEl = document.getElementById('navigatorHUD');
  stopListEl = document.getElementById('navigatorStopList');
  if (!hudEl || !stopListEl) return;

  const path = campaign.campaign_path;
  const meta = campaign.metadata;
  const mins = Math.floor(meta.total_estimated_duration_seconds / 60);
  const secs = Math.round(meta.total_estimated_duration_seconds % 60);

  // HUD content
  hudEl.querySelector('.nav-title').textContent = meta.event_title;
  hudEl.querySelector('.nav-duration').textContent = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  hudEl.querySelector('.nav-stop-info').textContent = `1 / ${path.length}`;
  hudEl.querySelector('.nav-lecture').textContent = '';

  // Stop list
  stopListEl.innerHTML = `
    <div class="nav-list-header">
      <span class="material-symbols-outlined">route</span>
      CAMPAIGN STOPS
    </div>
  ` + path.map((stop, i) => {
    const icon = EVENT_ICONS[stop.type] || EVENT_ICONS.default;
    return `
      <div class="nav-stop-item" data-index="${i}">
        <div class="nav-stop-num">${i + 1}</div>
        <div class="nav-stop-icon">${icon}</div>
        <div class="nav-stop-detail">
          <span class="nav-stop-name">${stop.location_name}</span>
          <span class="nav-stop-year">${stop.year} · ${stop.region}</span>
        </div>
      </div>
    `;
  }).join('');

  // Wire stop clicks
  stopListEl.querySelectorAll('.nav-stop-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index);
      if (!isNaN(idx) && currentPlayer) currentPlayer.jumpTo(idx);
    });
  });

  // Wire controls
  hudEl.querySelector('.nav-btn-play').onclick = () => player.play();
  hudEl.querySelector('.nav-btn-pause').onclick = () => player.pause();
  hudEl.querySelector('.nav-btn-prev').onclick = () => player.prev();
  hudEl.querySelector('.nav-btn-next').onclick = () => player.next();
  hudEl.querySelector('.nav-btn-close').onclick = () => stopNavigator();

  // Voice mode cycle: AI → Browser → Muted
  const voiceBtn = hudEl.querySelector('.nav-btn-voice');
  const voiceBadge = hudEl.querySelector('.nav-voice-badge');
  const VOICE_ICONS = { ai: 'graphic_eq', browser: 'record_voice_over', muted: 'volume_off' };
  const VOICE_LABELS = { ai: 'AI VOICE', browser: 'BROWSER', muted: 'MUTED' };

  if (voiceBtn) {
    voiceBtn.onclick = () => {
      const newMode = player.cycleVoiceMode();
      voiceBtn.querySelector('.material-symbols-outlined').textContent = VOICE_ICONS[newMode] || 'graphic_eq';
      if (voiceBadge) {
        voiceBadge.textContent = VOICE_LABELS[newMode] || '';
        voiceBadge.className = `nav-voice-badge nav-voice-${newMode}`;
      }
    };
  }

  // Word highlighting callback
  player.on('word-highlight', ({ wordIdx }) => {
    const lectureEl = hudEl.querySelector('.nav-lecture');
    if (!lectureEl || !lectureEl.children.length) return;
    // Remove previous highlight
    lectureEl.querySelectorAll('.nav-word-active').forEach(el => el.classList.remove('nav-word-active'));
    // Highlight current word
    const wordSpan = lectureEl.children[wordIdx];
    if (wordSpan) wordSpan.classList.add('nav-word-active');
  });

  hudEl.classList.add('visible');
  stopListEl.classList.add('visible');
}

function hideNavigatorUI() {
  if (hudEl) hudEl.classList.remove('visible');
  if (stopListEl) stopListEl.classList.remove('visible');
}

function updateHUDStop(stop, index, total) {
  if (!hudEl) return;
  hudEl.querySelector('.nav-stop-info').textContent = `${index + 1} / ${total}`;
  // Render lecture text with a cinematic typewriter effect timed to the flight duration
  const lectureEl = hudEl.querySelector('.nav-lecture');
  if (lectureEl) {
    if (lectureEl._typeInterval) clearInterval(lectureEl._typeInterval);
    
    const text = stop.lecture_segment;
    let charIdx = 0;
    
    // Calculate typing speed to finish just before the flight completes (or max 20ms per char)
    const flightMs = (stop.map_action?.duration || 3) * 1000;
    const typeSpeed = Math.min(25, Math.max(5, (flightMs - 500) / text.length));

    lectureEl._typeInterval = setInterval(() => {
      if (charIdx < text.length) {
        lectureEl.innerHTML = text.substring(0, charIdx + 1) + '<span class="type-cursor">█</span>';
        if (charIdx % 3 === 0) audio.playTypingBurst(); // Throttle audio slightly
        charIdx++;
      } else {
        clearInterval(lectureEl._typeInterval);
        // Swap to span-wrapped words for TTS highlighting once typing is complete
        const words = text.split(/\s+/);
        lectureEl.innerHTML = words.map(w => `<span class="nav-word">${w}</span>`).join(' ');
      }
    }, typeSpeed);
  }

  // Source link
  const srcLink = hudEl.querySelector('.nav-source-link');
  if (srcLink && stop.source_url) {
    srcLink.href = stop.source_url;
    srcLink.style.display = '';
  } else if (srcLink) {
    srcLink.style.display = 'none';
  }

  // Camera style badge
  const styleBadge = hudEl.querySelector('.nav-camera-style');
  if (styleBadge && stop.camera_style) {
    const styleLabel = CAMERA_STYLES[stop.camera_style]?.label || '';
    styleBadge.textContent = styleLabel;
    styleBadge.className = `nav-camera-style nav-camera-${stop.camera_style}`;
  }

  const pct = ((index + 1) / total) * 100;
  const bar = hudEl.querySelector('.nav-progress-fill');
  if (bar) bar.style.width = `${pct}%`;
}

function updateHUDState(state) {
  if (!hudEl) return;
  const playBtn = hudEl.querySelector('.nav-btn-play');
  const pauseBtn = hudEl.querySelector('.nav-btn-pause');

  if (state === 'flying' || state === 'narrating') {
    playBtn.style.display = 'none';
    pauseBtn.style.display = '';
  } else {
    playBtn.style.display = '';
    pauseBtn.style.display = 'none';
  }

  if (state === 'complete') {
    hudEl.querySelector('.nav-lecture').textContent =
      'Tour complete — click any stop to revisit, or close to return.';
  }

  // State badge
  const stateEl = hudEl.querySelector('.nav-state');
  if (stateEl) {
    const labels = { idle: '', flying: '● FLYING', narrating: '● NARRATING', paused: '● PAUSED', complete: '✓ COMPLETE' };
    stateEl.textContent = labels[state] || '';
    stateEl.className = `nav-state nav-state-${state}`;
  }
}

function updateStopList(activeIndex) {
  if (!stopListEl) return;
  stopListEl.querySelectorAll('.nav-stop-item').forEach((item, i) => {
    item.classList.remove('completed', 'active', 'upcoming');
    if (i < activeIndex) item.classList.add('completed');
    else if (i === activeIndex) item.classList.add('active');
    else item.classList.add('upcoming');
  });
  const active = stopListEl.querySelector('.nav-stop-item.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Pre-load browser voices (fallback)
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// Auto-detect AI voice availability
ttsService.checkAvailability().then(available => {
  if (!available) {
    console.info('[VIGILENT] AI voice not available, using browser SpeechSynthesis.');
    ttsService.setMode('browser');
  } else {
    console.info('[VIGILENT] AI voice available via ElevenLabs.');
  }
});
