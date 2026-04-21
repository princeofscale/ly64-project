/** Звуковые эффекты игры Ракетка (Web Audio API, без ассетов) */

type SoundName = 'launch' | 'tick' | 'cashout' | 'crash' | 'lose';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private listeners = new Set<() => void>();

  constructor() {
    const savedEnabled = localStorage.getItem('rocket_sounds_enabled');
    const savedVolume = localStorage.getItem('rocket_sounds_volume');
    if (savedEnabled !== null) this.enabled = savedEnabled === 'true';
    if (savedVolume !== null) {
      const v = parseFloat(savedVolume);
      if (Number.isFinite(v)) this.volume = Math.max(0, Math.min(1, v));
    }
  }

  private ctx(): AudioContext {
    if (!this.audioContext) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AC();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') void this.audioContext.resume();
    return this.audioContext;
  }

  private dest(): AudioNode {
    this.ctx();
    return this.masterGain!;
  }

  private getNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx();
    if (!this.noiseBuffer) {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    return this.noiseBuffer;
  }

  /** Запустить whoosh-взлёт: шум с bandpass-свипом + низкий саб */
  private playLaunch(): void {
    const ctx = this.ctx();
    const now = ctx.currentTime;
    const dur = 0.85;

    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer();
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.8;
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.55, now + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.dest());
    src.start(now);
    src.stop(now + dur);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.55);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.18, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(og);
    og.connect(this.dest());
    osc.start(now);
    osc.stop(now + 0.7);
  }

  /** Короткий тик для milestone-мультипликаторов */
  private playTick(): void {
    const ctx = this.ctx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(g);
    g.connect(this.dest());
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /** Мажорный арпеджио при успешном выводе */
  private playCashout(): void {
    const ctx = this.ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      const t = now + i * 0.07;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.32, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(g);
      g.connect(this.dest());
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  /** Взрыв: noise burst + низкий бум */
  private playCrash(): void {
    const ctx = this.ctx();
    const now = ctx.currentTime;
    const dur = 0.7;

    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(1200, now);
    f.frequency.exponentialRampToValueAtTime(120, now + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.dest());
    src.start(now);
    src.stop(now + dur);

    const boom = ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(140, now);
    boom.frequency.exponentialRampToValueAtTime(38, now + 0.45);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.55, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    boom.connect(bg);
    bg.connect(this.dest());
    boom.start(now);
    boom.stop(now + 0.6);
  }

  /** Грустный нисходящий триллинг (sad trombone-lite) */
  private playLose(): void {
    const ctx = this.ctx();
    const now = ctx.currentTime;
    const notes = [392, 349.23, 293.66]; // G4 F4 D4
    notes.forEach((freq, i) => {
      const t = now + i * 0.14;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 1200;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 0.92, t + 0.25);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(lpf);
      lpf.connect(g);
      g.connect(this.dest());
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  play(sound: SoundName): void {
    if (!this.enabled) return;
    try {
      switch (sound) {
        case 'launch': this.playLaunch(); break;
        case 'tick': this.playTick(); break;
        case 'cashout': this.playCashout(); break;
        case 'crash': this.playCrash(); break;
        case 'lose': this.playLose(); break;
      }
    } catch {
      // audio can fail pre-interaction — ignore
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('rocket_sounds_enabled', String(enabled));
    this.notify();
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('rocket_sounds_volume', String(this.volume));
    if (this.masterGain) this.masterGain.gain.value = this.volume;
    this.notify();
  }

  isEnabled(): boolean { return this.enabled; }
  getVolume(): number { return this.volume; }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private notify(): void {
    this.listeners.forEach(fn => fn());
  }
}

export const soundManager = new SoundManager();
