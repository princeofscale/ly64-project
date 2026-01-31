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

export interface SavedTestSession {
  sessionData: string;
  examId: string;
  examType: string;
  subject: string;
  grade: number;
  level?: string;
  savedAt: number;
  route: string;
}

export class TestSessionStorage {
  private storage: StorageService;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private readonly AUTO_SAVE_INTERVAL = 5000; // 5 секунд

  constructor() {
    this.storage = StorageService.getInstance();
  }

  /**
   * Сохранить полную сессию теста
   */
  public saveSession(sessionData: string, metadata?: Partial<SavedTestSession>): void {
    const savedSession: SavedTestSession = {
      sessionData,
      examId: metadata?.examId || '',
      examType: metadata?.examType || '',
      subject: metadata?.subject || '',
      grade: metadata?.grade || 0,
      level: metadata?.level,
      savedAt: Date.now(),
      route: metadata?.route || window.location.pathname,
    };
    this.storage.save(STORAGE_KEYS.TEST_SESSION, savedSession);
    console.log('[TestSessionStorage] Сессия сохранена', new Date().toLocaleTimeString());
  }

  /**
   * Загрузить сохранённую сессию
   */
  public loadSession(): SavedTestSession | null {
    const data = this.storage.load<SavedTestSession>(STORAGE_KEYS.TEST_SESSION);
    if (!data) return null;

    // Проверяем что сессия не старше 24 часов
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - data.savedAt > maxAge) {
      console.log('[TestSessionStorage] Сессия устарела, удаляем');
      this.clearSession();
      return null;
    }

    return data;
  }

  /**
   * Загрузить только данные сериализованной сессии
   */
  public loadSessionData(): string | null {
    const session = this.loadSession();
    return session?.sessionData || null;
  }

  public clearSession(): void {
    this.storage.remove(STORAGE_KEYS.TEST_SESSION);
    this.storage.remove(STORAGE_KEYS.ANSWERS_BACKUP);
    this.stopAutoSave();
    console.log('[TestSessionStorage] Сессия очищена');
  }

  public hasSession(): boolean {
    return this.loadSession() !== null;
  }

  /**
   * Бэкап ответов (дополнительная защита)
   */
  public backupAnswers(answers: Map<number, unknown>): void {
    this.storage.save(STORAGE_KEYS.ANSWERS_BACKUP, {
      answers: Array.from(answers.entries()),
      savedAt: Date.now(),
    });
  }

  /**
   * Восстановить ответы из бэкапа
   */
  public restoreAnswers(): Map<number, unknown> | null {
    const data = this.storage.load<{ answers: [number, unknown][]; savedAt: number }>(STORAGE_KEYS.ANSWERS_BACKUP);
    if (!data) return null;
    return new Map(data.answers);
  }

  /**
   * Запустить автосохранение
   */
  public startAutoSave(saveCallback: () => void): void {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => {
      saveCallback();
    }, this.AUTO_SAVE_INTERVAL);
    console.log('[TestSessionStorage] Автосохранение запущено');
  }

  /**
   * Остановить автосохранение
   */
  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('[TestSessionStorage] Автосохранение остановлено');
    }
  }

  /**
   * Получить информацию о сохранённой сессии
   */
  public getSessionInfo(): { exists: boolean; savedAt?: Date; route?: string } {
    const session = this.loadSession();
    if (!session) {
      return { exists: false };
    }
    return {
      exists: true,
      savedAt: new Date(session.savedAt),
      route: session.route,
    };
  }
}

export const getStorageService = (): StorageService => {
  return StorageService.getInstance();
};
