/**
 * Sound manager for Plane Game — all sounds synthesized with Web Audio API (no external files).
 */

const STORAGE_MUTE = 'plane-sound-muted';
const STORAGE_VOLUME = 'plane-sound-volume';

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterVolume = 0.5;
  private muted = false;
  private musicGain: GainNode | null = null;
  private musicOsc: OscillatorNode | null = null;
  private musicTimeout: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem(STORAGE_MUTE) === '1';
      const v = localStorage.getItem(STORAGE_VOLUME);
      if (v != null) {
        const n = parseFloat(v);
        if (!Number.isNaN(n)) this.masterVolume = Math.max(0, Math.min(1, n));
      }
    }
  }

  init(): void {
    if (typeof window === 'undefined' || this.audioContext) return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new Ctx();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.masterVolume;
    this.masterGain.connect(this.audioContext.destination);
    this.audioContext.resume?.();
  }

  private ctx(): AudioContext | null {
    return this.audioContext;
  }

  private getGain(vol: number): GainNode | null {
    const ctx = this.ctx();
    if (!ctx || !this.masterGain || this.muted) return null;
    const g = ctx.createGain();
    g.gain.value = vol * this.masterVolume;
    g.connect(this.masterGain);
    return g;
  }

  private tone(type: OscillatorType, freq: number, startTime: number, duration: number, gainVal: number, sweepEnd?: number, attack = 0.008): void {
    const ctx = this.ctx();
    const g = this.getGain(gainVal);
    if (!ctx || !g) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (sweepEnd != null) osc.frequency.linearRampToValueAtTime(sweepEnd, startTime + duration);
    osc.connect(g);
    const vol = gainVal * this.masterVolume;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + attack);
    g.gain.linearRampToValueAtTime(vol, startTime + duration - 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private noise(startTime: number, duration: number, gainVal: number, filterFreqStart?: number, filterFreqEnd?: number): void {
    const ctx = this.ctx();
    const g = this.getGain(gainVal);
    if (!ctx || !g) return;
    const rate = ctx.sampleRate;
    const len = rate * duration;
    const buf = ctx.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    if (filterFreqStart != null) filter.frequency.setValueAtTime(filterFreqStart, startTime);
    if (filterFreqEnd != null) filter.frequency.linearRampToValueAtTime(filterFreqEnd, startTime + duration);
    else if (filterFreqStart != null) filter.frequency.setValueAtTime(filterFreqStart, startTime);
    src.connect(filter);
    filter.connect(g);
    g.gain.setValueAtTime(gainVal * this.masterVolume, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    src.start(startTime);
    src.stop(startTime + duration);
  }

  private bandNoise(startTime: number, duration: number, gainVal: number, centerFreq: number): void {
    const ctx = this.ctx();
    const g = this.getGain(gainVal);
    if (!ctx || !g) return;
    const rate = ctx.sampleRate;
    const len = Math.ceil(rate * duration);
    const buf = ctx.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = centerFreq;
    filter.Q.value = 2;
    src.connect(filter);
    filter.connect(g);
    g.gain.setValueAtTime(gainVal * this.masterVolume, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    src.start(startTime);
    src.stop(startTime + duration);
  }

  playShoot(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('sine', 900, t, 0.08, 0.45, 180, 0.003);
  }

  playBombExplode(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.noise(t, 0.6, 0.9, 600, 40);
    this.tone('sine', 80, t + 0.05, 0.4, 0.35, 30, 0.02);
  }

  playPlayerHit(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const g = this.getGain(0.5);
    if (!g) return;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5 * this.masterVolume, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.18);
    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playPlayerDeath(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.noise(t, 0.6, 0.6, 250, 35);
    this.tone('sine', 180, t + 0.08, 0.8, 0.45, 35, 0.03);
  }

  playEnemyHit(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('triangle', 500, t, 0.07, 0.5, 120, 0.002);
  }

  playEnemyDestroy(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.bandNoise(t, 0.25, 0.65, 350);
    this.tone('sine', 200, t + 0.02, 0.2, 0.35, 80, 0.005);
  }

  playEnemyShoot(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('sawtooth', 350, t, 0.06, 0.4, 450, 0.002);
  }

  /** Softer shot for boss only – low sine, no harsh overtones. */
  playBossShoot(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('sine', 120, t, 0.1, 0.22, 90, 0.02);
  }

  playBossIntro(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const g = this.getGain(0.28);
    if (!g) return;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.28 * this.masterVolume, t + 0.15);
    g.gain.linearRampToValueAtTime(0.28 * this.masterVolume, t + 0.85);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    const tremolo = ctx.createGain();
    osc.connect(tremolo);
    tremolo.connect(g);
    for (let i = 0; i < 4; i++) {
      const phase = t + i * 0.25;
      tremolo.gain.setValueAtTime(0.5, phase);
      tremolo.gain.linearRampToValueAtTime(1, phase + 0.12);
      tremolo.gain.linearRampToValueAtTime(0.5, phase + 0.25);
    }
    osc.start(t);
    osc.stop(t + 1);
  }

  playBossHit(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('triangle', 85, t, 0.12, 0.32, 65, 0.01);
  }

  playBossDestroy(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.noise(t, 0.5, 0.35, 180, 40);
    this.tone('sine', 75, t, 0.9, 0.32, 35, 0.03);
    this.tone('triangle', 200, t + 0.1, 0.5, 0.2, 80, 0.02);
  }

  playCoinCollect(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const v = 40 * (Math.random() * 2 - 1);
    this.tone('sine', 988 + v, t, 0.06, 0.4, undefined, 0.003);
    this.tone('sine', 1319 + v, t + 0.04, 0.1, 0.38, undefined, 0.003);
  }

  playPowerupCollect(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => this.tone('sine', f, t + i * 0.05, 0.08, 0.45, undefined, 0.004));
  }

  playHeartCollect(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('sine', 523, t, 0.12, 0.4, undefined, 0.01);
    this.tone('sine', 659, t + 0.08, 0.12, 0.38, undefined, 0.01);
  }

  playBombPickup(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('sine', 100, t, 0.18, 0.5, 60, 0.02);
    this.noise(t, 0.025, 0.35);
  }

  playShieldActivate(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const g = this.getGain(0.45);
    if (!g) return;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.45 * this.masterVolume, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.linearRampToValueAtTime(1400, t + 0.35);
    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playButtonClick(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    this.tone('sine', 660, t, 0.04, 0.35, undefined, 0.002);
  }

  playLevelStart(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    [523, 659, 784].forEach((f, i) => this.tone('sine', f, t + i * 0.12, 0.14, 0.5, undefined, 0.01));
    this.tone('sine', 1047, t + 0.36, 0.35, 0.5, undefined, 0.02);
  }

  playLevelComplete(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => this.tone('sine', f, t + i * 0.1, 0.14, 0.55, undefined, 0.008));
  }

  playGameOver(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    [349, 294, 262, 233].forEach((f, i) => this.tone('sine', f, t + i * 0.18, i < 3 ? 0.18 : 0.5, 0.5, undefined, 0.02));
  }

  private musicScheduledTimeouts: number[] = [];

  stopMusic(): void {
    this.musicScheduledTimeouts.forEach(id => clearTimeout(id));
    this.musicScheduledTimeouts = [];
    const ctx = this.ctx();
    if (!this.musicGain || !ctx) return;
    const t = ctx.currentTime;
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
    this.musicGain.gain.exponentialRampToValueAtTime(0.001, t + 1);
    if (this.musicOsc) {
      try { this.musicOsc.stop(t + 1.05); } catch (_) {}
      this.musicOsc = null;
    }
    this.musicGain = null;
    this.musicOsc = null;
  }

  /** Schedule a single note with smooth envelope (attack, sustain, release). No clicks. */
  private scheduleNote(
    ctx: AudioContext,
    dest: GainNode,
    freq: number,
    startTime: number,
    duration: number,
    vol: number,
    type: OscillatorType = 'sine',
    attack = 0.03,
    release = 0.1
  ): void {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + attack);
    g.gain.linearRampToValueAtTime(vol, startTime + duration - release);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    g.connect(dest);
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    osc.connect(g);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playBackgroundMusic(theme: 'menu' | 'gameplay' | 'boss'): void {
    this.stopMusic();
    const ctx = this.ctx();
    if (!ctx || !this.masterGain || this.muted) return;

    const musicMaster = ctx.createGain();
    musicMaster.gain.setValueAtTime(0, ctx.currentTime);
    musicMaster.connect(this.masterGain);
    this.musicGain = musicMaster;

    const MUSIC_VOL = 0.07;
    const fadeIn = 1;
    musicMaster.gain.linearRampToValueAtTime(MUSIC_VOL, ctx.currentTime + fadeIn);

    if (theme === 'menu') {
      const chords: number[][] = [
        [220, 262, 330],
        [174, 220, 262],
        [131, 165, 196],
        [196, 247, 294]
      ];
      const noteDur = 0.4;
      const chordDur = 1.2;
      const cycleDur = 4.8;
      let t = ctx.currentTime + fadeIn + 0.1;
      const scheduleMenu = () => {
        if (!ctx || this.muted) return;
        for (let c = 0; c < 4; c++) {
          for (let n = 0; n < 3; n++) {
            const st = t + c * chordDur + n * noteDur;
            this.scheduleNote(ctx, musicMaster, chords[c][n], st, noteDur, 0.06, 'sine', 0.05, 0.15);
            // Reverb: duplicate at 50% vol, 0.1s delay, faster decay
            const delayGain = ctx.createGain();
            delayGain.gain.setValueAtTime(0, st);
            delayGain.gain.linearRampToValueAtTime(0.03, st + 0.1);
            delayGain.gain.exponentialRampToValueAtTime(0.001, st + 0.1 + 0.25);
            delayGain.connect(musicMaster);
            const delayed = ctx.createOscillator();
            delayed.type = 'sine';
            delayed.frequency.setValueAtTime(chords[c][n], st + 0.1);
            delayed.connect(delayGain);
            delayed.start(st + 0.1);
            delayed.stop(st + 0.5);
          }
        }
        t += cycleDur;
        this.musicScheduledTimeouts.push(window.setTimeout(() => scheduleMenu(), (cycleDur - 0.1) * 1000));
      };
      scheduleMenu();
      return;
    }

    if (theme === 'gameplay') {
      const bassNotes = [131, 131, 98, 98];
      const melodyNotes = [330, 392, 440, 392];
      const bassDur = 0.5;
      const melodyDur = 0.25;
      const barDur = 2;
      let t = ctx.currentTime + fadeIn + 0.1;
      const scheduleGameplay = () => {
        if (!ctx || this.muted) return;
        for (let i = 0; i < 4; i++) {
          this.scheduleNote(ctx, musicMaster, bassNotes[i], t + i * bassDur, bassDur, 0.05, 'triangle', 0.03, 0.1);
        }
        for (let i = 0; i < 4; i++) {
          this.scheduleNote(ctx, musicMaster, melodyNotes[i], t + i * melodyDur, melodyDur, 0.04, 'sine', 0.03, 0.1);
        }
        t += barDur;
        this.musicScheduledTimeouts.push(window.setTimeout(() => scheduleGameplay(), (barDur - 0.1) * 1000));
      };
      scheduleGameplay();
      return;
    }

    if (theme === 'boss') {
      const bassNotes = [98, 98, 73, 73];
      const melodyNotes = [196, 220, 208, 196];
      const bassDur = 0.4;
      const melodyDur = 0.2;
      const barDur = 1.6;
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.012, ctx.currentTime);
      padGain.connect(musicMaster);
      const padOsc = ctx.createOscillator();
      padOsc.type = 'sine';
      padOsc.frequency.setValueAtTime(98, ctx.currentTime);
      padOsc.connect(padGain);
      padOsc.start(ctx.currentTime);
      this.musicOsc = padOsc;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.5, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.006;
      lfo.connect(lfoGain);
      lfoGain.connect(padGain.gain);
      lfo.start(ctx.currentTime);
      let t = ctx.currentTime + fadeIn + 0.1;
      const scheduleBoss = () => {
        if (!ctx || this.muted) return;
        for (let i = 0; i < 4; i++) {
          this.scheduleNote(ctx, musicMaster, bassNotes[i], t + i * bassDur, bassDur, 0.04, 'triangle', 0.04, 0.12);
        }
        for (let i = 0; i < 4; i++) {
          this.scheduleNote(ctx, musicMaster, melodyNotes[i], t + i * melodyDur, melodyDur, 0.032, 'sine', 0.04, 0.12);
        }
        t += barDur;
        this.musicScheduledTimeouts.push(window.setTimeout(() => scheduleBoss(), (barDur - 0.1) * 1000));
      };
      scheduleBoss();
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) this.stopMusic();
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_MUTE, this.muted ? '1' : '0');
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) this.masterGain.gain.value = this.masterVolume;
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_VOLUME, String(this.masterVolume));
  }

  /** Call on first user interaction to unlock audio (required by browser autoplay policy). */
  resume(): void {
    if (this.audioContext) {
      this.audioContext.resume?.();
      return;
    }
    this.init();
  }
}

let defaultManager: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!defaultManager) defaultManager = new SoundManager();
  return defaultManager;
}
