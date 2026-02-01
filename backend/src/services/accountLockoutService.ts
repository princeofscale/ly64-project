import { Request } from 'express';
import {
  checkAccountLockout as checkLockout,
  recordFailedLogin as recordFailed,
  clearFailedLogins as clearFailed,
} from '../middlewares/security';
import {
  logSuccessfulLogin,
  logFailedLogin,
  logBlockedLogin,
} from '../utils/logger';
import { LockoutStatus, FailedLoginAttempt } from '../types/authTypes';
import { LOCKOUT_SETTINGS, AUTH_MESSAGES } from '../constants/authConstants';

export class AccountLockoutService {
  public checkLockout(email: string): LockoutStatus {
    return checkLockout(email);
  }

  public recordFailedAttempt(email: string): FailedLoginAttempt {
    return recordFailed(email);
  }

  public clearAttempts(email: string): void {
    clearFailed(email);
  }

  public logSuccessfulLogin(userId: string, email: string, request: Request): void {
    logSuccessfulLogin(userId, email, request);
  }

  public logFailedLogin(email: string, request: Request, reason: string): void {
    logFailedLogin(email, request, reason);
  }

  public logBlockedLogin(email: string, request: Request): void {
    logBlockedLogin(email, request);
  }

  public formatLockoutMessage(remainingTime?: number): string {
    if (remainingTime !== undefined) {
      return `${AUTH_MESSAGES.ACCOUNT_LOCKED_RETRY} ${remainingTime} ${AUTH_MESSAGES.MINUTES}.`;
    }
    return AUTH_MESSAGES.ACCOUNT_LOCKED_DURATION;
  }

  public shouldShowRemainingAttempts(attempts: number): boolean {
    const remainingAttempts = LOCKOUT_SETTINGS.MAX_ATTEMPTS - attempts;
    return remainingAttempts > 0 && remainingAttempts <= LOCKOUT_SETTINGS.WARNING_THRESHOLD;
  }

  public getRemainingAttempts(attempts: number): number {
    return LOCKOUT_SETTINGS.MAX_ATTEMPTS - attempts;
  }

  public formatRemainingAttemptsMessage(attempts: number): string {
    const remaining = this.getRemainingAttempts(attempts);
    return `${AUTH_MESSAGES.REMAINING_ATTEMPTS} ${remaining}`;
  }
}

export default new AccountLockoutService();
