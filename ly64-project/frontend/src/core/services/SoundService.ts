/**
 * Sound Service
 * Управление звуковыми эффектами в приложении
 */

type SoundType =
  | 'click'
  | 'success'
  | 'error'
  | 'warning'
  | 'complete'
  | 'achievement'
  | 'navigation'
  | 'timer'
  | 'levelUp';

interface SoundConfig {
  volume: number;
  enabled: boolean;
}

const STORAGE_KEY = 'sound-settings';

/**
 * Web Audio API based sound generator
 */
class SoundService {
  private static instance: SoundService;
  private audioContext: AudioContext | null = null;
  private config: SoundConfig = {
    volume: 0.3,
    enabled: true,
  };

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('[SoundService] Failed to load settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('[SoundService] Failed to save settings:', error);
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('[SoundService] AudioContext not supported');
        return null;
      }
    }

    // Resume suspended context (happens after user interaction requirement)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  /**
   * Play a synthesized sound
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    attack = 0.01,
    decay = 0.1
  ): void {
    if (!this.config.enabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.config.volume, ctx.currentTime + attack);
    gainNode.gain.linearRampToValueAtTime(
      this.config.volume * 0.7,
      ctx.currentTime + attack + decay
    );
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Play multiple tones in sequence (melody)
   */
  private playMelody(
    notes: { freq: number; duration: number; delay: number }[],
    type: OscillatorType = 'sine'
  ): void {
    if (!this.config.enabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    notes.forEach(({ freq, duration, delay }) => {
      setTimeout(() => {
        this.playTone(freq, duration, type);
      }, delay * 1000);
    });
  }

  /**
   * Play sound by type
   */
  public play(sound: SoundType): void {
    if (!this.config.enabled) return;

    switch (sound) {
      case 'click':
        // Short click sound
        this.playTone(800, 0.05, 'square', 0.001, 0.01);
        break;

      case 'success':
        // Pleasant success ding
        this.playMelody([
          { freq: 523.25, duration: 0.15, delay: 0 }, // C5
          { freq: 659.25, duration: 0.15, delay: 0.1 }, // E5
          { freq: 783.99, duration: 0.2, delay: 0.2 }, // G5
        ]);
        break;

      case 'error':
        // Error buzz
        this.playTone(200, 0.3, 'sawtooth', 0.01, 0.05);
        break;

      case 'warning':
        // Warning beep
        this.playMelody([
          { freq: 440, duration: 0.1, delay: 0 },
          { freq: 440, duration: 0.1, delay: 0.15 },
        ]);
        break;

      case 'complete':
        // Test completion fanfare
        this.playMelody([
          { freq: 523.25, duration: 0.1, delay: 0 }, // C5
          { freq: 587.33, duration: 0.1, delay: 0.1 }, // D5
          { freq: 659.25, duration: 0.1, delay: 0.2 }, // E5
          { freq: 783.99, duration: 0.1, delay: 0.3 }, // G5
          { freq: 1046.5, duration: 0.3, delay: 0.4 }, // C6
        ]);
        break;

      case 'achievement':
        // Achievement unlock sound
        this.playMelody(
          [
            { freq: 392, duration: 0.1, delay: 0 }, // G4
            { freq: 523.25, duration: 0.1, delay: 0.1 }, // C5
            { freq: 659.25, duration: 0.1, delay: 0.2 }, // E5
            { freq: 783.99, duration: 0.15, delay: 0.3 }, // G5
            { freq: 1046.5, duration: 0.3, delay: 0.45 }, // C6
          ],
          'triangle'
        );
        break;

      case 'navigation':
        // Subtle navigation tick
        this.playTone(600, 0.03, 'sine', 0.001, 0.01);
        break;

      case 'timer':
        // Timer tick (warning when time is low)
        this.playTone(440, 0.05, 'square', 0.001, 0.02);
        break;

      case 'levelUp':
        // Level up / rank increase
        this.playMelody(
          [
            { freq: 261.63, duration: 0.1, delay: 0 }, // C4
            { freq: 329.63, duration: 0.1, delay: 0.08 }, // E4
            { freq: 392, duration: 0.1, delay: 0.16 }, // G4
            { freq: 523.25, duration: 0.1, delay: 0.24 }, // C5
            { freq: 659.25, duration: 0.1, delay: 0.32 }, // E5
            { freq: 783.99, duration: 0.2, delay: 0.4 }, // G5
            { freq: 1046.5, duration: 0.4, delay: 0.55 }, // C6
          ],
          'triangle'
        );
        break;
    }
  }

  // Configuration methods
  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public getVolume(): number {
    return this.config.volume;
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveSettings();
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public toggleEnabled(): boolean {
    this.config.enabled = !this.config.enabled;
    this.saveSettings();
    return this.config.enabled;
  }
}

export const soundService = SoundService.getInstance();
export default soundService;
