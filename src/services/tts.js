/**
 * tts.js — VIGILENT Text-to-Speech Service
 * ElevenLabs AI voice with browser SpeechSynthesis fallback.
 *
 * Usage:
 *   import { ttsService } from '../services/tts.js';
 *   await ttsService.speak(text);           // plays & resolves when done
 *   ttsService.stop();                      // cancel current playback
 *   ttsService.setMode('ai' | 'browser' | 'muted');
 */

// ── State ──────────────────────────────────────────────────────

let mode = 'ai';           // 'ai' | 'browser' | 'muted'
let audioCtx = null;
let currentSource = null;  // AudioBufferSourceNode (AI voice)
let utterance = null;       // SpeechSynthesisUtterance (browser voice)
let _onWordCallback = null; // (wordIndex, word) => void

// ── Audio Context (lazy) ───────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ── TTS API ────────────────────────────────────────────────────

/**
 * Call the TTS proxy at /api/tts.
 * Supports VoiceBox (local) and ElevenLabs (cloud) — configured via admin panel.
 * Voice, model, and format are controlled server-side via the admin panel config.
 * Returns { audio_base64, alignment?, content_type?, provider }
 */
async function fetchTTSAudio(text) {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`TTS API error ${res.status}: ${errText}`);
  }

  return res.json(); // { audio_base64, alignment?, content_type?, provider }
}

/**
 * Play AI-generated audio and fire word callbacks synced to alignment.
 */
async function playAIVoice(text) {
  const data = await fetchTTSAudio(text);

  // Decode base64 audio → ArrayBuffer → AudioBuffer
  const binaryStr = atob(data.audio_base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const ctx = getAudioCtx();
  const audioBuffer = await ctx.decodeAudioData(bytes.buffer);

  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    currentSource = source;

    // Fire word-level highlights via alignment timestamps
    if (_onWordCallback && data.alignment) {
      scheduleWordHighlights(text, data.alignment);
    }

    source.onended = () => {
      currentSource = null;
      resolve();
    };
    source.start(0);
  });
}

/**
 * Parse alignment data to find word boundaries and schedule
 * highlight callbacks at the right times.
 */
function scheduleWordHighlights(text, alignment) {
  if (!alignment.chars || !alignment.charStartTimesMs) return;

  // Build words from character alignment
  const chars = alignment.chars;
  const starts = alignment.charStartTimesMs;

  let wordIndex = 0;
  let wordStart = 0;
  let inWord = false;

  for (let i = 0; i <= chars.length; i++) {
    const ch = i < chars.length ? chars[i] : ' ';
    const isSpace = ch === ' ' || ch === ',' || ch === '.' || ch === ';' || ch === ':';

    if (!isSpace && !inWord) {
      // Word started
      wordStart = i;
      inWord = true;
    } else if (isSpace && inWord) {
      // Word ended — schedule highlight
      const word = chars.slice(wordStart, i);
      const timeMs = starts[wordStart];
      const idx = wordIndex;

      setTimeout(() => {
        if (_onWordCallback) _onWordCallback(idx, word);
      }, timeMs);

      wordIndex++;
      inWord = false;
    }
  }
}

// ── Browser SpeechSynthesis Fallback ───────────────────────────

function playBrowserVoice(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 0.9;
    u.volume = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const pref = voices.find(v =>
      v.name.includes('Google UK English Male') ||
      v.name.includes('Daniel') ||
      v.name.includes('Microsoft David') ||
      v.name.includes('Google US English')
    ) || voices.find(v => v.lang.startsWith('en'));
    if (pref) u.voice = pref;

    // Word boundary events for highlighting
    let wordIdx = 0;
    u.onboundary = (e) => {
      if (e.name === 'word' && _onWordCallback) {
        const word = text.substring(e.charIndex, e.charIndex + e.charLength);
        _onWordCallback(wordIdx++, word);
      }
    };

    u.onend = () => { utterance = null; resolve(); };
    u.onerror = () => { utterance = null; resolve(); };
    utterance = u;
    window.speechSynthesis.speak(u);
  });
}

// ── Public API ─────────────────────────────────────────────────

export const ttsService = {
  /**
   * Speak text using the current mode.
   * Returns a Promise that resolves when speech finishes.
   */
  async speak(text) {
    this.stop(); // Cancel any current playback

    if (mode === 'muted') return;

    if (mode === 'ai') {
      try {
        await playAIVoice(text);
        return;
      } catch (err) {
        console.warn('[TTS] AI voice failed, falling back to browser:', err.message);
        // Fall through to browser voice
      }
    }

    // Browser voice (explicit mode or AI fallback)
    await playBrowserVoice(text);
  },

  /** Stop any current playback. */
  stop() {
    if (currentSource) {
      try { currentSource.stop(); } catch (_) { /* already stopped */ }
      currentSource = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    utterance = null;
  },

  /** Set voice mode: 'ai', 'browser', or 'muted'. */
  setMode(newMode) {
    mode = newMode;
    if (mode === 'muted') this.stop();
  },

  /** Get current mode. */
  getMode() { return mode; },

  /**
   * Register a callback for word-level highlighting.
   * Called as (wordIndex, wordText) during speech.
   */
  onWord(callback) {
    _onWordCallback = callback;
  },

  /** Check if AI voice is likely available (proxy responds). */
  async checkAvailability() {
    try {
      const res = await fetch('/api/tts/health', { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },
};
