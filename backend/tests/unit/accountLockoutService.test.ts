/**
 * AccountLockoutService Unit Tests
 *
 * Tests for the account lockout functionality including:
 * - Lockout message formatting
 * - Remaining attempts calculation
 * - Warning threshold logic
 */

import { LOCKOUT_SETTINGS, AUTH_MESSAGES } from '../../src/constants/authConstants';
import { AccountLockoutService } from '../../src/services/accountLockoutService';

// Mock the security middleware functions
jest.mock('../../src/middlewares/security', () => ({
  checkAccountLockout: jest.fn(),
  recordFailedLogin: jest.fn(),
  clearFailedLogins: jest.fn(),
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  logSuccessfulLogin: jest.fn(),
  logFailedLogin: jest.fn(),
  logBlockedLogin: jest.fn(),
}));

describe('AccountLockoutService', () => {
  let service: AccountLockoutService;

  beforeEach(() => {
    service = new AccountLockoutService();
    jest.clearAllMocks();
  });

  describe('formatLockoutMessage', () => {
    it('should format message with remaining time when provided', () => {
      const message = service.formatLockoutMessage(10);

      expect(message).toContain(AUTH_MESSAGES.ACCOUNT_LOCKED_RETRY);
      expect(message).toContain('10');
      expect(message).toContain(AUTH_MESSAGES.MINUTES);
    });

    it('should return default duration message when no time provided', () => {
      const message = service.formatLockoutMessage();

      expect(message).toBe(AUTH_MESSAGES.ACCOUNT_LOCKED_DURATION);
    });

    it('should format message correctly for 1 minute', () => {
      const message = service.formatLockoutMessage(1);

      expect(message).toContain('1');
      expect(message).toContain(AUTH_MESSAGES.MINUTES);
    });

    it('should format message correctly for 15 minutes', () => {
      const message = service.formatLockoutMessage(15);

      expect(message).toContain('15');
    });

    it('should handle 0 minutes', () => {
      const message = service.formatLockoutMessage(0);

      expect(message).toContain('0');
    });
  });

  describe('shouldShowRemainingAttempts', () => {
    // LOCKOUT_SETTINGS.MAX_ATTEMPTS = 5
    // LOCKOUT_SETTINGS.WARNING_THRESHOLD = 3

    it('should return false when no attempts have been made', () => {
      const result = service.shouldShowRemainingAttempts(0);
      // Remaining = 5 - 0 = 5, which is > 0 but also > WARNING_THRESHOLD (3)
      // So should return false (don't show warning until closer to lockout)
      expect(result).toBe(false);
    });

    it('should return false when attempts are below warning threshold', () => {
      const result = service.shouldShowRemainingAttempts(1);
      // Remaining = 5 - 1 = 4, which is > WARNING_THRESHOLD (3)
      expect(result).toBe(false);
    });

    it('should return true when remaining attempts equal warning threshold', () => {
      // attempts = 2, remaining = 5 - 2 = 3 = WARNING_THRESHOLD
      const result = service.shouldShowRemainingAttempts(2);
      expect(result).toBe(true);
    });

    it('should return true when remaining attempts are below warning threshold', () => {
      // attempts = 3, remaining = 5 - 3 = 2 < WARNING_THRESHOLD
      const result = service.shouldShowRemainingAttempts(3);
      expect(result).toBe(true);
    });

    it('should return true for 4 attempts (1 remaining)', () => {
      const result = service.shouldShowRemainingAttempts(4);
      // Remaining = 5 - 4 = 1
      expect(result).toBe(true);
    });

    it('should return false when at max attempts (0 remaining)', () => {
      const result = service.shouldShowRemainingAttempts(5);
      // Remaining = 5 - 5 = 0, which is NOT > 0
      expect(result).toBe(false);
    });

    it('should return false when over max attempts', () => {
      const result = service.shouldShowRemainingAttempts(6);
      // Remaining = 5 - 6 = -1, which is NOT > 0
      expect(result).toBe(false);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts when no attempts made', () => {
      const remaining = service.getRemainingAttempts(0);
      expect(remaining).toBe(LOCKOUT_SETTINGS.MAX_ATTEMPTS);
    });

    it('should return correct remaining for 1 attempt', () => {
      const remaining = service.getRemainingAttempts(1);
      expect(remaining).toBe(LOCKOUT_SETTINGS.MAX_ATTEMPTS - 1);
    });

    it('should return 0 when at max attempts', () => {
      const remaining = service.getRemainingAttempts(LOCKOUT_SETTINGS.MAX_ATTEMPTS);
      expect(remaining).toBe(0);
    });

    it('should return negative when over max attempts', () => {
      const remaining = service.getRemainingAttempts(LOCKOUT_SETTINGS.MAX_ATTEMPTS + 1);
      expect(remaining).toBe(-1);
    });

    it('should handle large numbers', () => {
      const remaining = service.getRemainingAttempts(100);
      expect(remaining).toBe(LOCKOUT_SETTINGS.MAX_ATTEMPTS - 100);
    });
  });

  describe('formatRemainingAttemptsMessage', () => {
    it('should include remaining attempts in message', () => {
      const message = service.formatRemainingAttemptsMessage(3);
      const remaining = LOCKOUT_SETTINGS.MAX_ATTEMPTS - 3;

      expect(message).toContain(AUTH_MESSAGES.REMAINING_ATTEMPTS);
      expect(message).toContain(String(remaining));
    });

    it('should show correct message for 0 attempts', () => {
      const message = service.formatRemainingAttemptsMessage(0);

      expect(message).toContain(String(LOCKOUT_SETTINGS.MAX_ATTEMPTS));
    });

    it('should show 1 remaining for MAX_ATTEMPTS - 1', () => {
      const message = service.formatRemainingAttemptsMessage(
        LOCKOUT_SETTINGS.MAX_ATTEMPTS - 1
      );

      expect(message).toContain('1');
    });

    it('should show 0 remaining for MAX_ATTEMPTS', () => {
      const message = service.formatRemainingAttemptsMessage(
        LOCKOUT_SETTINGS.MAX_ATTEMPTS
      );

      expect(message).toContain('0');
    });
  });

  describe('integration with LOCKOUT_SETTINGS', () => {
    it('should use correct MAX_ATTEMPTS value', () => {
      expect(LOCKOUT_SETTINGS.MAX_ATTEMPTS).toBe(5);
    });

    it('should use correct WARNING_THRESHOLD value', () => {
      expect(LOCKOUT_SETTINGS.WARNING_THRESHOLD).toBe(3);
    });

    it('should use correct LOCKOUT_DURATION_MINUTES value', () => {
      expect(LOCKOUT_SETTINGS.LOCKOUT_DURATION_MINUTES).toBe(15);
    });
  });

  describe('AUTH_MESSAGES constants', () => {
    it('should have ACCOUNT_LOCKED_RETRY message', () => {
      expect(AUTH_MESSAGES.ACCOUNT_LOCKED_RETRY).toBeDefined();
      expect(typeof AUTH_MESSAGES.ACCOUNT_LOCKED_RETRY).toBe('string');
    });

    it('should have ACCOUNT_LOCKED_DURATION message', () => {
      expect(AUTH_MESSAGES.ACCOUNT_LOCKED_DURATION).toBeDefined();
      expect(typeof AUTH_MESSAGES.ACCOUNT_LOCKED_DURATION).toBe('string');
    });

    it('should have REMAINING_ATTEMPTS message', () => {
      expect(AUTH_MESSAGES.REMAINING_ATTEMPTS).toBeDefined();
      expect(typeof AUTH_MESSAGES.REMAINING_ATTEMPTS).toBe('string');
    });

    it('should have MINUTES suffix', () => {
      expect(AUTH_MESSAGES.MINUTES).toBeDefined();
      expect(AUTH_MESSAGES.MINUTES).toBe('минут');
    });
  });
});
