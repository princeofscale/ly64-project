import { TIMER_CONFIG } from '../constants';

import type { ITimerService, IObservable, IObserver } from '../interfaces';
import type { TimerState } from '../types';

type TimerCallback = (state: TimerState) => void;
type CompleteCallback = () => void;

export class TimerService implements ITimerService, IObservable<TimerState> {
  private static instance: TimerService | null = null;

  private duration: number = 0;
  private timeLeft: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  private tickObservers: Set<TimerCallback> = new Set();
  private completeObservers: Set<CompleteCallback> = new Set();

  private constructor() {}

  public static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  public static resetInstance(): void {
    if (TimerService.instance) {
      TimerService.instance.stop();
      TimerService.instance = null;
    }
  }

  public start(durationSeconds: number): void {
    this.stop();
    this.duration = durationSeconds;
    this.timeLeft = durationSeconds;
    this.isRunning = true;
    this.isPaused = false;

    this.intervalId = setInterval(() => {
      this.tick();
    }, TIMER_CONFIG.tickInterval);

    this.notifyTick();
  }

  public pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.isRunning = false;

      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.notifyTick();
    }
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.isRunning = true;

      this.intervalId = setInterval(() => {
        this.tick();
      }, TIMER_CONFIG.tickInterval);

      this.notifyTick();
    }
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    this.isPaused = false;
    this.timeLeft = 0;

    this.notifyTick();
  }

  public reset(durationSeconds: number): void {
    this.stop();
    this.duration = durationSeconds;
    this.timeLeft = durationSeconds;
    this.notifyTick();
  }

  public getState(): TimerState {
    return {
      timeLeft: this.timeLeft,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      status: this.calculateStatus(),
    };
  }

  public onTick(callback: TimerCallback): () => void {
    this.tickObservers.add(callback);
    callback(this.getState());
    return () => this.tickObservers.delete(callback);
  }

  public onComplete(callback: CompleteCallback): () => void {
    this.completeObservers.add(callback);
    return () => this.completeObservers.delete(callback);
  }

  public subscribe(observer: IObserver<TimerState>): () => void {
    const callback = (state: TimerState) => observer.update(state);
    this.tickObservers.add(callback);
    return () => this.tickObservers.delete(callback);
  }

  public notify(data: TimerState): void {
    this.tickObservers.forEach(callback => callback(data));
  }

  private tick(): void {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.notifyTick();

      if (this.timeLeft === 0) {
        this.handleComplete();
      }
    }
  }

  private notifyTick(): void {
    const state = this.getState();
    this.tickObservers.forEach(callback => callback(state));
  }

  private handleComplete(): void {
    this.stop();
    this.completeObservers.forEach(callback => callback());
  }

  private calculateStatus(): 'normal' | 'warning' | 'critical' {
    if (this.duration === 0) return 'normal';

    const remainingPercent = this.timeLeft / this.duration;

    if (remainingPercent <= TIMER_CONFIG.criticalThreshold) {
      return 'critical';
    }
    if (remainingPercent <= TIMER_CONFIG.warningThreshold) {
      return 'warning';
    }
    return 'normal';
  }

  public static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  public getPercentRemaining(): number {
    if (this.duration === 0) return 100;
    return Math.round((this.timeLeft / this.duration) * 100);
  }

  public isExpired(): boolean {
    return this.timeLeft === 0 && this.duration > 0;
  }

  public addTime(seconds: number): void {
    this.timeLeft += seconds;
    this.duration += seconds;
    this.notifyTick();
  }
}

export const getTimerService = (): TimerService => {
  return TimerService.getInstance();
};
