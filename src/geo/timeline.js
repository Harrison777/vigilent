/**
 * timeline.js — 4D Timeline controller with event playback
 */
import { getViewer } from '../core/globe.js';

let events = [];
let playing = false;
let playSpeed = 1;
let currentTime = 0; // 0-1 normalized position
let timeRange = { start: null, end: null };
let animFrame = null;
let onTimeChange = null;
let activeFilter = 'all';

const SPEED_OPTIONS = [1, 2, 5, 10, 50];
let speedIdx = 0;

/**
 * Initialize the timeline with event data
 */
export function initTimeline(eventData, onChange) {
  events = eventData;
  onTimeChange = onChange;

  if (events.length === 0) return;

  // Calculate time range
  const timestamps = events.map(e => new Date(e.timestamp).getTime()).sort((a, b) => a - b);
  timeRange.start = timestamps[0] - 86400000; // 1 day before first event
  timeRange.end = timestamps[timestamps.length - 1] + 86400000;

  // Render event markers on timeline track
  renderEventMarkers();

  // Wire up controls
  setupControls();

  // Set initial position
  setTimePosition(0);
}

/**
 * Render event markers on the timeline track
 */
function renderEventMarkers() {
  const track = document.getElementById('timelineTrack');
  if (!track) return;

  // Clear existing markers
  track.querySelectorAll('.timeline-event-marker').forEach(el => el.remove());

  const filtered = activeFilter === 'all'
    ? events
    : events.filter(e => e.type === activeFilter);

  const range = timeRange.end - timeRange.start;

  filtered.forEach(event => {
    const ts = new Date(event.timestamp).getTime();
    const pos = ((ts - timeRange.start) / range) * 100;

    const marker = document.createElement('div');
    marker.className = 'timeline-event-marker';
    marker.dataset.type = event.type;
    marker.style.left = `${pos}%`;
    marker.title = `${event.title} (${new Date(event.timestamp).toLocaleDateString()})`;
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      setTimePosition(pos / 100);
    });
    track.appendChild(marker);
  });
}

/**
 * Set timeline position (0-1)
 */
function setTimePosition(pos) {
  currentTime = Math.max(0, Math.min(1, pos));

  // Update UI
  const progress = document.getElementById('timelineProgress');
  const scrubber = document.getElementById('timelineScrubber');
  const dateLabel = document.getElementById('timelineDate');

  if (progress) progress.style.width = `${currentTime * 100}%`;
  if (scrubber) scrubber.style.left = `${currentTime * 100}%`;

  // Calculate actual date
  const ts = timeRange.start + (timeRange.end - timeRange.start) * currentTime;
  const date = new Date(ts);
  if (dateLabel) {
    dateLabel.textContent = date.toISOString().slice(0, 16).replace('T', ' ');
  }

  // Fire callback with current date and visible events
  if (onTimeChange) {
    const visibleEvents = events.filter(e => {
      const eventTs = new Date(e.timestamp).getTime();
      return eventTs <= ts;
    });
    onTimeChange(date, visibleEvents);
  }
}

/**
 * Setup timeline controls
 */
function setupControls() {
  // Play/Pause
  const playBtn = document.getElementById('timelinePlayBtn');
  if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
  }

  // Speed
  const speedBtn = document.getElementById('timelineSpeedBtn');
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % SPEED_OPTIONS.length;
      playSpeed = SPEED_OPTIONS[speedIdx];
      document.getElementById('speedLabel').textContent = `${playSpeed}×`;
    });
  }

  // Scrub on track click
  const track = document.getElementById('timelineTrack');
  if (track) {
    track.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setTimePosition(pos);
    });

    // Drag scrubber
    let dragging = false;
    const scrubber = document.getElementById('timelineScrubber');
    if (scrubber) {
      scrubber.addEventListener('mousedown', () => { dragging = true; });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const rect = track.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        setTimePosition(pos);
      });
      window.addEventListener('mouseup', () => { dragging = false; });
    }
  }

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderEventMarkers();
    });
  });
}

/**
 * Toggle playback
 */
function togglePlay() {
  playing = !playing;

  const icon = document.querySelector('#timelinePlayBtn .material-symbols-outlined');
  if (icon) {
    icon.textContent = playing ? 'pause' : 'play_arrow';
  }

  if (playing) {
    startPlayback();
  } else {
    if (animFrame) cancelAnimationFrame(animFrame);
  }
}

function startPlayback() {
  let lastTime = performance.now();

  function tick(now) {
    if (!playing) return;

    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // Advance position — full timeline is ~60 seconds at 1× speed
    const advance = (dt / 60) * playSpeed;
    setTimePosition(currentTime + advance);

    if (currentTime >= 1) {
      playing = false;
      const icon = document.querySelector('#timelinePlayBtn .material-symbols-outlined');
      if (icon) icon.textContent = 'play_arrow';
      return;
    }

    animFrame = requestAnimationFrame(tick);
  }

  animFrame = requestAnimationFrame(tick);
}

/**
 * Get current timeline date
 */
export function getCurrentDate() {
  const ts = timeRange.start + (timeRange.end - timeRange.start) * currentTime;
  return new Date(ts);
}
