/**
 * In-Memory Cache Service
 * Простой кэш для API с TTL (Time To Live)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  keys: string[];
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private stats = { hits: 0, misses: 0 };

  // Время жизни кэша по умолчанию (в миллисекундах)
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 минут
  private readonly MAX_CACHE_SIZE = 1000; // Максимум записей

  // TTL для разных типов данных
  private readonly TTL_CONFIG: Record<string, number> = {
    'tests': 10 * 60 * 1000,       // 10 минут - список тестов
    'test_detail': 30 * 60 * 1000, // 30 минут - детали теста
    'questions': 60 * 60 * 1000,   // 1 час - вопросы (редко меняются)
    'user': 2 * 60 * 1000,         // 2 минуты - данные пользователя
    'leaderboard': 1 * 60 * 1000,  // 1 минута - лидерборд
    'achievements': 5 * 60 * 1000, // 5 минут - достижения
    'stats': 30 * 1000,            // 30 секунд - статистика
  };

  private constructor() {
    // Очистка устаревших записей каждую минуту
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Генерация ключа кэша
   */
  public generateKey(prefix: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return prefix;
    }
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Получить данные из кэша
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Проверяем не истёк ли TTL
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Сохранить данные в кэш
   */
  public set<T>(key: string, data: T, ttlMs?: number): void {
    // Проверяем размер кэша
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const ttl = ttlMs || this.getTTLForKey(key);
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Удалить запись из кэша
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Удалить все записи по префиксу
   */
  public deleteByPrefix(prefix: string): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Очистить весь кэш
   */
  public clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Проверить наличие ключа
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Получить или установить значение (cache-aside pattern)
   */
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttlMs);
    return data;
  }

  /**
   * Получить статистику кэша
   */
  public getStats(): CacheStats {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Получить hit rate в процентах
   */
  public getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return Math.round((this.stats.hits / total) * 100);
  }

  /**
   * Определить TTL по ключу
   */
  private getTTLForKey(key: string): number {
    for (const [prefix, ttl] of Object.entries(this.TTL_CONFIG)) {
      if (key.startsWith(prefix)) {
        return ttl;
      }
    }
    return this.DEFAULT_TTL;
  }

  /**
   * Удалить устаревшие записи
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[CacheService] Очищено ${cleaned} устаревших записей`);
    }
  }

  /**
   * Удалить самые старые записи при переполнении
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    // Удаляем 10% самых старых записей
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    console.log(`[CacheService] Удалено ${toRemove} записей (переполнение)`);
  }
}

// Singleton instance
export const cacheService = CacheService.getInstance();

// Middleware для кэширования ответов API
import { Request, Response, NextFunction } from 'express';

interface CacheMiddlewareOptions {
  prefix: string;
  ttlMs?: number;
  keyGenerator?: (req: Request) => string;
}

export const cacheMiddleware = (options: CacheMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Только GET запросы кэшируются
    if (req.method !== 'GET') {
      return next();
    }

    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : cacheService.generateKey(options.prefix, {
          path: req.path,
          query: req.query,
        });

    const cached = cacheService.get(key);
    if (cached !== null) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Перехватываем res.json для кэширования ответа
    const originalJson = res.json.bind(res);
    res.json = (data: unknown) => {
      if (res.statusCode === 200) {
        cacheService.set(key, data, options.ttlMs);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Хелпер для инвалидации кэша
export const invalidateCache = (prefix: string): number => {
  return cacheService.deleteByPrefix(prefix);
};

export default cacheService;
