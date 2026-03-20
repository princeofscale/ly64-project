/**
 * CacheService Unit Tests
 *
 * Tests for the in-memory caching functionality including:
 * - Key generation
 * - Get/Set operations
 * - TTL and expiration
 * - Cache statistics
 */

// We need to mock the logger to avoid console output during tests
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import after mocking
import { cacheService, invalidateCache } from '../../src/services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheService.clear();
  });

  afterAll(() => {
    // Clean up
    cacheService.shutdown();
  });

  describe('generateKey', () => {
    it('should return prefix alone when no params provided', () => {
      const key = cacheService.generateKey('tests');
      expect(key).toBe('tests');
    });

    it('should return prefix alone when params is empty object', () => {
      const key = cacheService.generateKey('tests', {});
      expect(key).toBe('tests');
    });

    it('should generate key with sorted parameters', () => {
      const key = cacheService.generateKey('tests', { b: 2, a: 1 });
      // Parameters should be sorted alphabetically
      expect(key).toContain('tests:');
      expect(key).toContain('a=');
      expect(key).toContain('b=');
      // 'a' should come before 'b'
      expect(key.indexOf('a=')).toBeLessThan(key.indexOf('b='));
    });

    it('should handle string values in params', () => {
      const key = cacheService.generateKey('user', { id: 'abc123' });
      expect(key).toContain('user:');
      expect(key).toContain('"abc123"');
    });

    it('should handle number values in params', () => {
      const key = cacheService.generateKey('tests', { grade: 9 });
      expect(key).toContain('grade=9');
    });

    it('should handle boolean values in params', () => {
      const key = cacheService.generateKey('tests', { isDiagnostic: true });
      expect(key).toContain('isDiagnostic=true');
    });

    it('should handle array values in params', () => {
      const key = cacheService.generateKey('tests', { subjects: ['math', 'russian'] });
      expect(key).toContain('subjects=');
      expect(key).toContain('math');
      expect(key).toContain('russian');
    });

    it('should throw error for empty prefix', () => {
      expect(() => cacheService.generateKey('')).toThrow();
    });

    it('should generate consistent keys for same input', () => {
      const key1 = cacheService.generateKey('tests', { subject: 'math', grade: 9 });
      const key2 = cacheService.generateKey('tests', { subject: 'math', grade: 9 });
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different inputs', () => {
      const key1 = cacheService.generateKey('tests', { subject: 'math' });
      const key2 = cacheService.generateKey('tests', { subject: 'russian' });
      expect(key1).not.toBe(key2);
    });
  });

  describe('get and set', () => {
    it('should store and retrieve a value', () => {
      cacheService.set('test-key', { data: 'test-value' });
      const result = cacheService.get('test-key');

      expect(result).toEqual({ data: 'test-value' });
    });

    it('should return null for non-existent key', () => {
      const result = cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle string values', () => {
      cacheService.set('string-key', 'hello world');
      expect(cacheService.get('string-key')).toBe('hello world');
    });

    it('should handle number values', () => {
      cacheService.set('number-key', 42);
      expect(cacheService.get('number-key')).toBe(42);
    });

    it('should handle array values', () => {
      const array = [1, 2, 3, 4, 5];
      cacheService.set('array-key', array);
      expect(cacheService.get('array-key')).toEqual(array);
    });

    it('should handle complex object values', () => {
      const complexObject = {
        user: { id: 1, name: 'Test' },
        scores: [90, 85, 95],
        metadata: { created: new Date().toISOString() },
      };
      cacheService.set('complex-key', complexObject);
      expect(cacheService.get('complex-key')).toEqual(complexObject);
    });

    it('should handle null values', () => {
      cacheService.set('null-key', null);
      // Note: null is a valid cached value, but get returns null for missing keys
      // This test verifies the behavior
      expect(cacheService.get('null-key')).toBeNull();
    });

    it('should throw error when setting undefined', () => {
      expect(() => cacheService.set('undefined-key', undefined)).toThrow();
    });

    it('should overwrite existing values', () => {
      cacheService.set('overwrite-key', 'first');
      cacheService.set('overwrite-key', 'second');

      expect(cacheService.get('overwrite-key')).toBe('second');
    });
  });

  describe('TTL and expiration', () => {
    it('should expire entries after TTL', async () => {
      // Set with very short TTL (100ms)
      cacheService.set('expiring-key', 'value', 100);

      // Should exist immediately
      expect(cacheService.get('expiring-key')).toBe('value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      expect(cacheService.get('expiring-key')).toBeNull();
    });

    it('should not expire entries before TTL', async () => {
      cacheService.set('long-ttl-key', 'value', 5000);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should still exist
      expect(cacheService.get('long-ttl-key')).toBe('value');
    });
  });

  describe('delete', () => {
    it('should delete an existing key', () => {
      cacheService.set('delete-key', 'value');
      const deleted = cacheService.delete('delete-key');

      expect(deleted).toBe(true);
      expect(cacheService.get('delete-key')).toBeNull();
    });

    it('should return false when deleting non-existent key', () => {
      const deleted = cacheService.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('deleteByPrefix', () => {
    it('should delete all keys with given prefix', () => {
      cacheService.set('user:1', { id: 1 });
      cacheService.set('user:2', { id: 2 });
      cacheService.set('user:3', { id: 3 });
      cacheService.set('tests:1', { id: 1 });

      const deletedCount = cacheService.deleteByPrefix('user');

      expect(deletedCount).toBe(3);
      expect(cacheService.get('user:1')).toBeNull();
      expect(cacheService.get('user:2')).toBeNull();
      expect(cacheService.get('user:3')).toBeNull();
      expect(cacheService.get('tests:1')).not.toBeNull();
    });

    it('should return 0 when no keys match prefix', () => {
      cacheService.set('test:1', 'value');
      const deletedCount = cacheService.deleteByPrefix('nonexistent');
      expect(deletedCount).toBe(0);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cacheService.set('exists-key', 'value');
      expect(cacheService.has('exists-key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cacheService.has('does-not-exist')).toBe(false);
    });

    it('should return false for expired key', async () => {
      cacheService.set('expiring-has-key', 'value', 50);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(cacheService.has('expiring-has-key')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      cacheService.clear();

      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBeNull();
    });

    it('should reset statistics', () => {
      cacheService.set('stats-key', 'value');
      cacheService.get('stats-key'); // hit
      cacheService.get('non-existent'); // miss

      cacheService.clear();
      const stats = cacheService.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should track cache hits', () => {
      cacheService.set('hit-key', 'value');
      cacheService.get('hit-key');
      cacheService.get('hit-key');

      const stats = cacheService.getStats();
      expect(stats.hits).toBeGreaterThanOrEqual(2);
    });

    it('should track cache misses', () => {
      cacheService.get('miss-key-1');
      cacheService.get('miss-key-2');

      const stats = cacheService.getStats();
      expect(stats.misses).toBeGreaterThanOrEqual(2);
    });

    it('should report correct cache size', () => {
      cacheService.set('size-key-1', 'value');
      cacheService.set('size-key-2', 'value');

      const stats = cacheService.getStats();
      expect(stats.size).toBeGreaterThanOrEqual(2);
    });

    it('should list all keys', () => {
      cacheService.set('list-key-1', 'value');
      cacheService.set('list-key-2', 'value');

      const stats = cacheService.getStats();
      expect(stats.keys).toContain('list-key-1');
      expect(stats.keys).toContain('list-key-2');
    });
  });

  describe('getHitRate', () => {
    it('should return 0 when no requests made', () => {
      cacheService.clear();
      expect(cacheService.getHitRate()).toBe(0);
    });

    it('should calculate correct hit rate', () => {
      cacheService.clear();
      cacheService.set('rate-key', 'value');

      // 3 hits
      cacheService.get('rate-key');
      cacheService.get('rate-key');
      cacheService.get('rate-key');

      // 1 miss
      cacheService.get('non-existent');

      // 3/4 = 75%
      expect(cacheService.getHitRate()).toBe(75);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      cacheService.set('getorset-key', 'cached-value');

      const fetchFn = jest.fn().mockResolvedValue('new-value');
      const result = await cacheService.getOrSet('getorset-key', fetchFn);

      expect(result).toBe('cached-value');
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should call fetchFn and cache result if not exists', async () => {
      const fetchFn = jest.fn().mockResolvedValue('fetched-value');
      const result = await cacheService.getOrSet('new-getorset-key', fetchFn);

      expect(result).toBe('fetched-value');
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(cacheService.get('new-getorset-key')).toBe('fetched-value');
    });

    it('should use custom TTL when provided', async () => {
      const fetchFn = jest.fn().mockResolvedValue('ttl-value');
      await cacheService.getOrSet('ttl-getorset-key', fetchFn, 100);

      expect(cacheService.get('ttl-getorset-key')).toBe('ttl-value');

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cacheService.get('ttl-getorset-key')).toBeNull();
    });
  });

  describe('invalidateCache helper', () => {
    it('should invalidate cache by prefix', () => {
      cacheService.set('invalidate:1', 'value1');
      cacheService.set('invalidate:2', 'value2');
      cacheService.set('keep:1', 'value3');

      const count = invalidateCache('invalidate');

      expect(count).toBe(2);
      expect(cacheService.get('invalidate:1')).toBeNull();
      expect(cacheService.get('invalidate:2')).toBeNull();
      expect(cacheService.get('keep:1')).not.toBeNull();
    });
  });
});
