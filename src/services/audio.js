// src/services/audio.js

class AudioSystem {
  constructor() {
    this.sfxMuted = true; // Starts out muted per user request
    this.ctx = null;
    this.masterGain = null;
  }

  /** Lazy-create AudioContext on first actual use (avoids Chrome autoplay warnings) */
  _ensureCtx() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute() {
    this.sfxMuted = !this.sfxMuted;
    if (!this.sfxMuted) this._ensureCtx();
    return this.sfxMuted;
  }

  playTick(pitch = 1500) {
    if (this.sfxMuted) return;
    this._ensureCtx();
    if (this.ctx.state === 'suspended') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playClick() {
    if (this.sfxMuted) return;
    this._ensureCtx();
    if (this.ctx.state === 'suspended') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playTypingBurst() {
    if (this.sfxMuted) return;
    this._ensureCtx();
    if (this.ctx.state === 'suspended') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2000 + Math.random() * 1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.03);
    
    // Very quiet typing sound
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }
}

export const audio = new AudioSystem();

