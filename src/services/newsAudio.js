/**
 * newsAudio.js — Breaking News Sound Sting
 * Plays a short urgent news-intro tone using Web Audio API.
 * No external files needed — generates the sound programmatically.
 */
import { audio } from '../services/audio.js';

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Play a short "breaking news" sting: two ascending tones + a subtle hum.
 * Total duration: ~1.2 seconds. Respects the global SFX mute toggle.
 */
export function playNewsSting() {
  if (audio.sfxMuted) return; // Respect mute toggle
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.15, now);
    master.connect(ctx.destination);

    // Tone 1: Low urgent beep (E4 = 329.63 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(329.63, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(1, now + 0.02);
    gain1.gain.setValueAtTime(1, now + 0.15);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(master);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: Higher urgent beep (A4 = 440 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, now + 0.25);
    gain2.gain.setValueAtTime(0, now + 0.25);
    gain2.gain.linearRampToValueAtTime(1, now + 0.27);
    gain2.gain.setValueAtTime(1, now + 0.45);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.7);

    // Tone 3: Resolution tone (E5 = 659.26 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(659.26, now + 0.55);
    gain3.gain.setValueAtTime(0, now + 0.55);
    gain3.gain.linearRampToValueAtTime(0.8, now + 0.57);
    gain3.gain.setValueAtTime(0.8, now + 0.75);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc3.connect(gain3);
    gain3.connect(master);
    osc3.start(now + 0.55);
    osc3.stop(now + 1.3);

    // Subtle low hum underneath (C3 = 130.81 Hz)
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.type = 'triangle';
    hum.frequency.setValueAtTime(130.81, now);
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    humGain.gain.setValueAtTime(0.3, now + 0.8);
    humGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    hum.connect(humGain);
    humGain.connect(master);
    hum.start(now);
    hum.stop(now + 1.3);

  } catch (e) {
    // Graceful degradation — no crash if audio blocked
    console.warn('[NewsAudio] Could not play sting:', e.message);
  }
}
