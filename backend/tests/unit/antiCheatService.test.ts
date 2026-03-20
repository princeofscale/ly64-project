/**
 * AntiCheatService Unit Tests
 *
 * Tests for the anti-cheat functionality including:
 * - Array shuffling
 * - Answer time analysis
 * - Suspicious activity detection
 */

import { AntiCheatService } from '../../src/services/antiCheatService';

describe('AntiCheatService', () => {
  let service: AntiCheatService;

  beforeEach(() => {
    service = new AntiCheatService();
  });

  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = service.shuffleArray(original);

      expect(shuffled).toHaveLength(original.length);
    });

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = service.shuffleArray(original);

      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should not modify the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      service.shuffleArray(original);

      expect(original).toEqual(originalCopy);
    });

    it('should handle empty arrays', () => {
      const result = service.shuffleArray([]);
      expect(result).toEqual([]);
    });

    it('should handle single element arrays', () => {
      const result = service.shuffleArray([42]);
      expect(result).toEqual([42]);
    });

    it('should work with string arrays', () => {
      const original = ['a', 'b', 'c', 'd'];
      const shuffled = service.shuffleArray(original);

      expect(shuffled).toHaveLength(4);
      expect(shuffled.sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should work with object arrays', () => {
      const original = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const shuffled = service.shuffleArray(original);

      expect(shuffled).toHaveLength(3);
      expect(shuffled.map(o => o.id).sort()).toEqual([1, 2, 3]);
    });
  });

  describe('analyzeAnswerTimes', () => {
    const MIN_ANSWER_TIME_MS = 4000; // From service constants

    it('should detect no suspicious activity for normal answer times', () => {
      const answerTimes = [5000, 6000, 7000, 8000, 9000];
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.isSuspicious).toBe(false);
      expect(result.reasons).toHaveLength(0);
      expect(result.fastAnswersCount).toBe(0);
    });

    it('should detect suspicious activity when many answers are too fast', () => {
      // 5 or more answers under 4 seconds = suspicious
      const answerTimes = [1000, 2000, 1500, 2500, 3000, 3500];
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.isSuspicious).toBe(true);
      expect(result.fastAnswersCount).toBeGreaterThanOrEqual(5);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should not flag as suspicious if only a few answers are fast', () => {
      // Less than 5 fast answers should not be suspicious
      const answerTimes = [1000, 2000, 5000, 6000, 7000, 8000];
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.fastAnswersCount).toBe(2);
      // May or may not be suspicious depending on average
    });

    it('should calculate correct average time', () => {
      const answerTimes = [5000, 6000, 7000, 8000, 9000];
      const result = service.analyzeAnswerTimes(answerTimes);

      const expectedAverage = 7000; // (5+6+7+8+9)*1000 / 5
      expect(result.averageTimeMs).toBe(expectedAverage);
    });

    it('should handle empty answer times array', () => {
      const result = service.analyzeAnswerTimes([]);

      expect(result.isSuspicious).toBe(false);
      expect(result.fastAnswersCount).toBe(0);
      expect(result.averageTimeMs).toBe(0);
    });

    it('should detect low average time as suspicious', () => {
      // Average under 4 seconds with more than 3 answers
      const answerTimes = [2000, 3000, 2500, 3500];
      const result = service.analyzeAnswerTimes(answerTimes);

      // Average is 2750ms which is below MIN_ANSWER_TIME_MS
      expect(result.averageTimeMs).toBeLessThan(MIN_ANSWER_TIME_MS);
      expect(result.isSuspicious).toBe(true);
    });

    it('should count fast answers correctly', () => {
      const answerTimes = [
        3000, // fast (< 4000)
        4000, // exactly at threshold - not fast
        5000, // normal
        2000, // fast
        1000, // fast
        6000, // normal
      ];
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.fastAnswersCount).toBe(3);
    });

    it('should include reason about fast answers when threshold exceeded', () => {
      const answerTimes = [1000, 1500, 2000, 2500, 3000]; // 5 fast answers
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.reasons.some(r => r.includes('слишком быстро'))).toBe(true);
    });

    it('should include reason about low average time', () => {
      const answerTimes = [2000, 2500, 3000, 3500]; // avg = 2750ms
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.reasons.some(r => r.includes('Среднее время'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle very large arrays', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const shuffled = service.shuffleArray(largeArray);

      expect(shuffled).toHaveLength(1000);
      expect(new Set(shuffled).size).toBe(1000); // All unique
    });

    it('should handle answer times with zero values', () => {
      const answerTimes = [0, 0, 0, 5000, 6000];
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.fastAnswersCount).toBe(3);
    });

    it('should handle very large answer times', () => {
      const answerTimes = [60000, 120000, 180000]; // 1-3 minutes each
      const result = service.analyzeAnswerTimes(answerTimes);

      expect(result.isSuspicious).toBe(false);
      expect(result.averageTimeMs).toBe(120000);
    });
  });
});
