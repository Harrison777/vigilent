/**
 * navigator.js — VIGILENT Historical Navigator v2
 * Cinematic guided tours with documentarian narration,
 * unified bottom player, great-arc trails, and pulsing markers.
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';

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

/** Time-based transition phrases linking two stops */
function getTransition(prevStop, curStop, index) {
  if (index === 0) return '';

  const prevYear = parseYearNum(prevStop.year);
  const curYear = parseYearNum(curStop.year);
  const gap = Math.abs(curYear - prevYear);

  // Distance-based context
  const dLat = Math.abs(curStop.coordinates.lat - prevStop.coordinates.lat);
  const dLon = Math.abs(curStop.coordinates.lng - prevStop.coordinates.lng);
  const dist = Math.sqrt(dLat * dLat + dLon * dLon);
  const farAway = dist > 8;

  // Build transition
  if (gap === 0) {
    if (farAway) return `That same year, far to the ${curStop.coordinates.lng > prevStop.coordinates.lng ? 'east' : 'west'}, `;
    return 'In the same year, ';
  }
  if (gap === 1) return farAway ? 'The following year, having marched onward, ' : 'One year later, ';
  if (gap <= 3) return `${gap} years later, `;
  if (gap <= 10) return `After ${gap} years, `;
  return `${gap} years would pass before `;
}

/** Build a narrative lecture from an event, with storytelling transitions */
function buildNarrative(event, prevStop, index, totalStops) {
  const transition = getTransition(prevStop, event, index);

  // Opening narration for the first stop
  if (index === 0) {
    return `Our journey begins in ${event.year}. ${event.description}.`;
  }

  // Closing narration for the last stop
  if (index === totalStops - 1) {
    return `${transition}${event.description}. And so, our journey comes to an end.`;
  }

  // Middle stops — weave the description naturally
  return `${transition}${event.description}.`;
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

/** Build a campaign from historical events */
export function buildCampaign(events, eraTitle) {
  const sorted = [...events].sort((a, b) => parseYearNum(a.year) - parseYearNum(b.year));

  const path = [];
  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    const prevCoords = i > 0 ? { lat: sorted[i - 1].lat, lng: sorted[i - 1].lon } : null;
    const coords = { lat: ev.lat, lng: ev.lon };
    const duration = calcFlightDuration(prevCoords, coords);

    // Zoom levels — WIDE to see geographic context
    let zoom = 7;  // Default: continent-scale (~2000km)
    if (ev.type === 'battle' || ev.type === 'siege') zoom = 8;
    if (ev.type === 'political' || ev.type === 'death') zoom = 8;
    if (ev.type === 'campaign') zoom = 7;
    if (ev.type === 'conquest') zoom = 8;

    const prevStop = i > 0 ? path[i - 1] : null;
    const lecture = buildNarrative(
      { ...ev, coordinates: coords },
      prevStop ? { ...sorted[i - 1], coordinates: prevStop.coordinates } : null,
      i, sorted.length
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
      map_action: {
        zoom,
        pitch: 35,
        duration,
        dwell: Math.max(2, lecture.length / 16),
      },
    });
  }

  return {
    metadata: {
      event_title: eraTitle || sorted[0]?.era || 'Historical Campaign',
      total_stops: path.length,
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
    this.currentStop = -1;
    this.state = 'idle';
    this.muted = false;
    this.trailEntities = [];
    this.markerEntities = [];
    this.utterance = null;
    this._dwellTimer = null;
    this._listeners = {};
  }

  on(event, fn) { this._listeners[event] = fn; }
  _emit(event, data) { if (this._listeners[event]) this._listeners[event](data); }
  _setState(s) { this.state = s; this._emit('state-change', s); }

  async play() {
    if (activePlayer && activePlayer !== this) activePlayer.stop();
    activePlayer = this;
    if (this.state === 'paused') {
      if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
      this._setState('narrating');
      return;
    }
    this._setState('flying');
    this.currentStop = -1;
    this._placeAllPreviewMarkers();
    await this._advance();
  }

  pause() {
    if (this.state === 'narrating' || this.state === 'flying') {
      if (window.speechSynthesis?.speaking) window.speechSynthesis.pause();
      clearTimeout(this._dwellTimer);
      this._setState('paused');
    }
  }

  stop() {
    this._setState('idle');
    this.currentStop = -1;
    clearTimeout(this._dwellTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this._clearAll();
    if (activePlayer === this) activePlayer = null;
  }

  async next() {
    if (this.state === 'complete') return;
    clearTimeout(this._dwellTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    await this._advance();
  }

  async prev() {
    if (this.currentStop <= 0) return;
    clearTimeout(this._dwellTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this.currentStop -= 2;
    const viewer = getViewer();
    if (viewer && this.trailEntities.length > 0) {
      viewer.entities.remove(this.trailEntities.pop());
    }
    await this._advance();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && window.speechSynthesis?.speaking) window.speechSynthesis.cancel();
    return this.muted;
  }

  async jumpTo(index) {
    clearTimeout(this._dwellTimer);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
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

    // Trail from previous stop
    if (this.currentStop > 0) {
      const prev = path[this.currentStop - 1];
      this._drawTrail(prev.coordinates, stop.coordinates, this.currentStop);
      this._fadeOldTrails();
    }

    // Marker
    this._updateMarkers(stop, this.currentStop);

    // Fly
    this._setState('flying');
    await this._flyTo(stop);

    // Narrate
    this._setState('narrating');
    await this._narrate(stop.lecture_segment);

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

      const alt = zoomToAltitude(stop.map_action.zoom);
      const pitchDeg = stop.map_action.pitch; // degrees below horizontal (e.g. 35)

      // Use flyToBoundingSphere — Cesium positions the camera so the target
      // is at the visual center of the viewport regardless of pitch angle.
      const target = Cesium.Cartesian3.fromDegrees(
        stop.coordinates.lng, stop.coordinates.lat, 0
      );
      const bsphere = new Cesium.BoundingSphere(target, 0);

      viewer.camera.flyToBoundingSphere(bsphere, {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(0),              // heading: north
          Cesium.Math.toRadians(-pitchDeg),       // pitch below horizontal
          alt                                      // range (distance from target)
        ),
        duration: stop.map_action.duration,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => resolve(),
        cancel: () => resolve(),
      });
    });
  }

  _narrate(text) {
    return new Promise(resolve => {
      if (this.muted || !window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 0.9;
      u.volume = 0.85;

      // Prefer a deep, authoritative voice
      const voices = window.speechSynthesis.getVoices();
      const pref = voices.find(v =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Daniel') ||
        v.name.includes('Microsoft David') ||
        v.name.includes('Google US English')
      ) || voices.find(v => v.lang.startsWith('en'));
      if (pref) u.voice = pref;

      u.onend = () => resolve();
      u.onerror = () => resolve();
      this.utterance = u;
      window.speechSynthesis.speak(u);
    });
  }

  _dwell(ms) {
    return new Promise(resolve => {
      if (this.state === 'paused' || this.state === 'idle') { resolve(); return; }
      this._dwellTimer = setTimeout(resolve, ms);
    });
  }

  // ── Trail & Markers ──

  _drawTrail(from, to, segIdx) {
    const viewer = getViewer();
    if (!viewer) return;

    const arcPoints = greatArcPoints(from, to, 30);
    const entity = viewer.entities.add({
      id: `nav-trail-${segIdx}-${Date.now()}`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(arcPoints),
        width: 3,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: Cesium.Color.fromCssColorString('#ffd54f'),
        }),
        clampToGround: true,
      },
    });
    this.trailEntities.push(entity);
    if (viewer.scene) viewer.scene.requestRender();
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

    // Re-style previous marker to "completed" (smaller gold dot)
    if (currentIndex > 0 && this.markerEntities.length > 0) {
      const prev = this.markerEntities[this.markerEntities.length - 1];
      if (prev.point) {
        prev.point.pixelSize = 10;
        prev.point.color = Cesium.Color.fromCssColorString('#ffd54f');
        prev.point.outlineColor = Cesium.Color.fromCssColorString('#0a0e17');
        prev.point.outlineWidth = 2;
      }
      if (prev.label) {
        prev.label.fillColor = Cesium.Color.fromCssColorString('#ffd54f').withAlpha(0.7);
        prev.label.scale = 0.85;
      }
    }

    // Place current marker — large cyan point with label
    const icon = EVENT_ICONS[currentStop.type] || EVENT_ICONS.default;
    const entity = viewer.entities.add({
      id: `nav-marker-${currentIndex}-${Date.now()}`,
      position: Cesium.Cartesian3.fromDegrees(
        currentStop.coordinates.lng, currentStop.coordinates.lat, 500
      ),
      point: {
        pixelSize: 22,
        color: Cesium.Color.fromCssColorString('#00e5ff'),
        outlineColor: Cesium.Color.fromCssColorString('#0a0e17'),
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: `${icon}  ${currentStop.location_name}`,
        font: 'bold 14px Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -22),
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
      const entity = viewer.entities.add({
        id: `nav-preview-${i}-${Date.now()}`,
        position: Cesium.Cartesian3.fromDegrees(
          stop.coordinates.lng, stop.coordinates.lat, 500
        ),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#607d8b').withAlpha(0.8),
          outlineColor: Cesium.Color.fromCssColorString('#0a0e17'),
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: `${i + 1}`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#90a4ae'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -16),
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
      <span class="nav-duration"></span>
      <div class="nav-end-controls">
        <button class="nav-btn nav-btn-mute" title="Toggle narration">
          <span class="material-symbols-outlined">volume_up</span>
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
export function startNavigator(events, eraTitle) {
  ensureDOMElements();
  const campaign = buildCampaign(events, eraTitle);
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
  hudEl.querySelector('.nav-btn-mute').onclick = () => {
    const m = player.toggleMute();
    hudEl.querySelector('.nav-btn-mute .material-symbols-outlined').textContent =
      m ? 'volume_off' : 'volume_up';
  };

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
  hudEl.querySelector('.nav-lecture').textContent = stop.lecture_segment;

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

// Pre-load voices
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
