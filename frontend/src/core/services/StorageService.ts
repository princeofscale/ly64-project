import { IStorageService } from '../interfaces';
import { STORAGE_KEYS } from '../constants';

export class StorageService implements IStorageService {
  private static instance: StorageService;
  private prefix: string = 'lyceum64_';
  private isAvailable: boolean;

  private constructor() {
    this.isAvailable = this.checkAvailability();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage недоступен:', e);
      return false;
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  public save<T>(key: string, value: T): void {
    if (!this.isAvailable) {
      console.warn('Storage недоступен');
      return;
    }

    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: '1.0',
      });
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldData();
        this.save(key, value);
      }
    }
  }

  public load<T>(key: string): T | null {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      return parsed.data as T;
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      return null;
    }
  }

  public loadWithMeta<T>(key: string): { data: T; timestamp: number } | null {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      return {
        data: parsed.data as T,
        timestamp: parsed.timestamp,
      };
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      return null;
    }
  }

  public remove(key: string): void {
    if (!this.isAvailable) return;
    localStorage.removeItem(this.getKey(key));
  }

  public clear(): void {
    if (!this.isAvailable) return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  public exists(key: string): boolean {
    if (!this.isAvailable) return false;
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  private clearOldData(): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (now - parsed.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  }

  public getUsedSpace(): number {
    let total = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    }

    return total * 2;
  }

  public getKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }

    return keys;
  }
}

export class TestSessionStorage {
  private storage: StorageService;

  constructor() {
    this.storage = StorageService.getInstance();
  }

  public saveSession(sessionData: string): void {
    this.storage.save(STORAGE_KEYS.TEST_SESSION, sessionData);
  }

  public loadSession(): string | null {
    return this.storage.load<string>(STORAGE_KEYS.TEST_SESSION);
  }

  public clearSession(): void {
    this.storage.remove(STORAGE_KEYS.TEST_SESSION);
  }

  public hasSession(): boolean {
    return this.storage.exists(STORAGE_KEYS.TEST_SESSION);
  }

  public backupAnswers(answers: Map<number, unknown>): void {
    this.storage.save(STORAGE_KEYS.ANSWERS_BACKUP, Array.from(answers.entries()));
  }

  public restoreAnswers(): Map<number, unknown> | null {
    const data = this.storage.load<[number, unknown][]>(STORAGE_KEYS.ANSWERS_BACKUP);
    if (!data) return null;
    return new Map(data);
  }
}

export const getStorageService = (): StorageService => {
  return StorageService.getInstance();
};
