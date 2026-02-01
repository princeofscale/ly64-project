import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface CacheEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
  readonly createdAt: number;
}

interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly size: number;
  readonly keys: ReadonlyArray<string>;
}

interface InternalCacheStats {
  hits: number;
  misses: number;
}

interface CacheConfiguration {
  readonly defaultTtl: number;
  readonly maxCacheSize: number;
  readonly cleanupIntervalMs: number;
  readonly evictionPercentage: number;
  readonly ttlConfig: Readonly<Record<string, number>>;
}

interface CacheMiddlewareOptions {
  readonly prefix: string;
  readonly ttlMs?: number;
  readonly keyGenerator?: (req: Request) => string;
}

type CacheKeyDelimiter = ':';
type CacheKeyParameterDelimiter = '&';

class CacheService {
  private static instance: CacheService | null = null;
  private readonly cache: Map<string, CacheEntry<unknown>>;
  private readonly stats: InternalCacheStats;
  private readonly config: CacheConfiguration;
  private cleanupIntervalId: NodeJS.Timeout | null = null;

  private readonly keyDelimiter: CacheKeyDelimiter = ':';
  private readonly parameterDelimiter: CacheKeyParameterDelimiter = '&';
  private readonly percentageMultiplier: number = 100;
  private readonly millisecondsInSecond: number = 1000;
  private readonly secondsInMinute: number = 60;

  private constructor() {
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };
    this.config = this.initializeConfiguration();
    this.startCleanupInterval();
  }

  private initializeConfiguration(): CacheConfiguration {
    return {
      defaultTtl: 5 * this.secondsInMinute * this.millisecondsInSecond,
      maxCacheSize: 1000,
      cleanupIntervalMs: this.secondsInMinute * this.millisecondsInSecond,
      evictionPercentage: 0.1,
      ttlConfig: {
        tests: 10 * this.secondsInMinute * this.millisecondsInSecond,
        test_detail: 30 * this.secondsInMinute * this.millisecondsInSecond,
        questions: 60 * this.secondsInMinute * this.millisecondsInSecond,
        user: 2 * this.secondsInMinute * this.millisecondsInSecond,
        leaderboard: 1 * this.secondsInMinute * this.millisecondsInSecond,
        achievements: 5 * this.secondsInMinute * this.millisecondsInSecond,
        stats: 30 * this.millisecondsInSecond,
      },
    };
  }

  private startCleanupInterval(): void {
    this.cleanupIntervalId = setInterval(
      () => this.cleanup(),
      this.config.cleanupIntervalMs
    );
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public generateKey(prefix: string, params?: Record<string, unknown>): string {
    this.validatePrefix(prefix);

    if (!params || this.isEmptyObject(params)) {
      return prefix;
    }

    const sortedParams = this.buildSortedParametersString(params);
    return `${prefix}${this.keyDelimiter}${sortedParams}`;
  }

  private validatePrefix(prefix: string): void {
    if (!prefix || typeof prefix !== 'string') {
      throw new Error('Cache key prefix must be a non-empty string');
    }
  }

  private isEmptyObject(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0;
  }

  private buildSortedParametersString(params: Record<string, unknown>): string {
    return Object.keys(params)
      .sort()
      .map((key) => this.formatParameter(key, params[key]))
      .join(this.parameterDelimiter);
  }

  private formatParameter(key: string, value: unknown): string {
    return `${key}=${JSON.stringify(value)}`;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.incrementMisses();
      return null;
    }

    if (this.isExpired(entry)) {
      this.removeEntry(key);
      this.incrementMisses();
      return null;
    }

    this.incrementHits();
    return entry.data as T;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private removeEntry(key: string): void {
    this.cache.delete(key);
  }

  private incrementHits(): void {
    this.stats.hits++;
  }

  private incrementMisses(): void {
    this.stats.misses++;
  }

  public set<T>(key: string, data: T, ttlMs?: number): void {
    this.validateCacheData(data);

    if (this.isCacheFull()) {
      this.evictOldest();
    }

    const entry = this.createCacheEntry(data, ttlMs ?? this.getTTLForKey(key));
    this.cache.set(key, entry);
  }

  private validateCacheData<T>(data: T): void {
    if (data === undefined) {
      throw new Error('Cannot cache undefined value');
    }
  }

  private isCacheFull(): boolean {
    return this.cache.size >= this.config.maxCacheSize;
  }

  private createCacheEntry<T>(data: T, ttl: number): CacheEntry<T> {
    const now = Date.now();
    return {
      data,
      expiresAt: now + ttl,
      createdAt: now,
    };
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public deleteByPrefix(prefix: string): number {
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  public clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  private resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.removeEntry(key);
      return false;
    }

    return true;
  }

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

  public getStats(): CacheStats {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  public getHitRate(): number {
    const totalRequests = this.getTotalRequests();

    if (totalRequests === 0) {
      return 0;
    }

    return this.calculateHitRatePercentage(this.stats.hits, totalRequests);
  }

  private getTotalRequests(): number {
    return this.stats.hits + this.stats.misses;
  }

  private calculateHitRatePercentage(hits: number, total: number): number {
    return Math.round((hits / total) * this.percentageMultiplier);
  }

  private getTTLForKey(key: string): number {
    for (const [prefix, ttl] of Object.entries(this.config.ttlConfig)) {
      if (key.startsWith(prefix)) {
        return ttl;
      }
    }
    return this.config.defaultTtl;
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys = this.findExpiredKeys(now);

    this.removeExpiredKeys(expiredKeys);
    this.logCleanupResult(expiredKeys.length);
  }

  private findExpiredKeys(currentTime: number): string[] {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (currentTime > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    return expiredKeys;
  }

  private removeExpiredKeys(keys: string[]): void {
    for (const key of keys) {
      this.cache.delete(key);
    }
  }

  private logCleanupResult(cleanedCount: number): void {
    if (cleanedCount > 0) {
      logger.info(`Cache cleanup completed: removed ${cleanedCount} expired entries`);
    }
  }

  private evictOldest(): void {
    const sortedEntries = this.getSortedEntriesByAge();
    const evictionCount = this.calculateEvictionCount(sortedEntries.length);

    this.removeOldestEntries(sortedEntries, evictionCount);
    this.logEvictionResult(evictionCount);
  }

  private getSortedEntriesByAge(): Array<[string, CacheEntry<unknown>]> {
    return Array.from(this.cache.entries()).sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );
  }

  private calculateEvictionCount(totalEntries: number): number {
    return Math.ceil(totalEntries * this.config.evictionPercentage);
  }

  private removeOldestEntries(
    entries: Array<[string, CacheEntry<unknown>]>,
    count: number
  ): void {
    for (let i = 0; i < count; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private logEvictionResult(evictedCount: number): void {
    logger.warn(`Cache overflow: evicted ${evictedCount} oldest entries`);
  }

  public shutdown(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    this.clear();
    logger.info('Cache service shutdown completed');
  }
}

class CacheMiddleware {
  private readonly service: CacheService;

  constructor(service: CacheService) {
    this.service = service;
  }

  public create(options: CacheMiddlewareOptions) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!this.shouldCache(req)) {
        next();
        return;
      }

      const key = this.generateCacheKey(req, options);
      const cached = this.service.get(key);

      if (cached !== null) {
        this.respondWithCache(res, cached);
        return;
      }

      this.interceptResponse(res, key, options.ttlMs);
      next();
    };
  }

  private shouldCache(req: Request): boolean {
    return req.method === 'GET';
  }

  private generateCacheKey(req: Request, options: CacheMiddlewareOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(req);
    }

    return this.service.generateKey(options.prefix, {
      path: req.path,
      query: req.query,
    });
  }

  private respondWithCache(res: Response, data: unknown): void {
    res.setHeader('X-Cache', 'HIT');
    res.json(data);
  }

  private interceptResponse(res: Response, key: string, ttlMs?: number): void {
    const originalJson = res.json.bind(res);

    res.json = (data: unknown): Response => {
      if (res.statusCode === 200) {
        this.service.set(key, data, ttlMs);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };
  }
}

export const cacheService = CacheService.getInstance();

const middleware = new CacheMiddleware(cacheService);

export const cacheMiddleware = (options: CacheMiddlewareOptions) => {
  return middleware.create(options);
};

export const invalidateCache = (prefix: string): number => {
  return cacheService.deleteByPrefix(prefix);
};

export default cacheService;
