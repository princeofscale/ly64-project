/** Простой менеджер звуковых эффектов для игры */
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Загружаем настройки из localStorage
    const savedEnabled = localStorage.getItem('rocket_sounds_enabled');
    const savedVolume = localStorage.getItem('rocket_sounds_volume');

    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume suspended context (browsers suspend AudioContext until a user gesture)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  /** Call once on any user interaction to unlock audio */
  unlock(): void {
    this.getAudioContext();
  }

  private playTone(frequencies: number[], duration: number) {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = 'sine';

        // Envelope
        gain.gain.setValueAtTime(this.volume / frequencies.length, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now + idx * 0.05);
        osc.stop(now + duration);
      });
    } catch (e) {
      // Игнорируем ошибки
    }
  }

  play(soundName: string) {
    if (!this.enabled) return;

    switch (soundName) {
      case 'launch':
        this.playTone([200, 400, 600], 0.3);
        break;
      case 'tick':
        this.playTone([800], 0.05);
        break;
      case 'crash':
        this.playTone([300, 200, 100, 80], 0.6);
        break;
      case 'cashout':
        this.playTone([400, 500, 600, 700], 0.4);
        break;
      case 'lose':
        this.playTone([300, 200, 100], 0.5);
        break;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('rocket_sounds_enabled', String(enabled));
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('rocket_sounds_volume', String(this.volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

export const soundManager = new SoundManager();
