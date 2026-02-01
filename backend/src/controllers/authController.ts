import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../utils/validation';
import { AppError } from '../middlewares/errorHandler';
import accountLockoutService from '../services/accountLockoutService';
import authResponseService from '../services/authResponseService';
import { logRegistration } from '../utils/logger';
import { RequestUtils } from '../utils/requestUtils';
import { HTTP_STATUS_CODES } from '../constants/authConstants';
import { AuthResult, AuthUser } from '../types/authTypes';

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = this.parseRegisterData(req.body);
      const result = await this.executeRegistration(validatedData, req);

      authResponseService.sendRegistrationSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = this.parseLoginData(req.body);

      this.checkAccountLockout(validatedData.email, req);

      const result = await this.executeLogin(validatedData, req);

      authResponseService.sendLoginSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  public async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = RequestUtils.extractUserId(req);
      const user = await this.fetchCurrentUser(userId);

      authResponseService.sendCurrentUser(res, user);
    } catch (error) {
      next(error);
    }
  }

  public async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      authResponseService.sendLogoutSuccess(res);
    } catch (error) {
      next(error);
    }
  }

  private parseRegisterData(body: unknown): RegisterInput {
    return registerSchema.parse(body);
  }

  private parseLoginData(body: unknown): LoginInput {
    return loginSchema.parse(body);
  }

  private async executeRegistration(data: RegisterInput, request: Request): Promise<AuthResult> {
    const result = await authService.register(data);

    logRegistration(result.user.id, result.user.email, request);

    return result;
  }

  private checkAccountLockout(email: string, request: Request): void {
    const lockoutStatus = accountLockoutService.checkLockout(email);

    if (lockoutStatus.locked) {
      accountLockoutService.logBlockedLogin(email, request);

      const message = accountLockoutService.formatLockoutMessage(lockoutStatus.remainingTime);
      throw new AppError(message, HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
    }
  }

  private async executeLogin(data: LoginInput, request: Request): Promise<AuthResult> {
    try {
      const result = await authService.login(data);

      accountLockoutService.clearAttempts(data.email);
      accountLockoutService.logSuccessfulLogin(result.user.id, result.user.email, request);

      return result;
    } catch (error) {
      this.handleLoginFailure(data.email, request, error);
      throw error;
    }
  }

  private handleLoginFailure(email: string, request: Request, error: unknown): void {
    const errorMessage = RequestUtils.extractErrorMessage(error);
    const failedAttempt = accountLockoutService.recordFailedAttempt(email);

    accountLockoutService.logFailedLogin(email, request, errorMessage);

    if (failedAttempt.locked) {
      accountLockoutService.logBlockedLogin(email, request);

      const lockoutMessage = accountLockoutService.formatLockoutMessage();
      throw new AppError(lockoutMessage, HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
    }

    this.appendRemainingAttemptsToError(error, failedAttempt.attempts);
  }

  private appendRemainingAttemptsToError(error: unknown, attempts: number): void {
    if (!(error instanceof AppError)) {
      return;
    }

    if (!accountLockoutService.shouldShowRemainingAttempts(attempts)) {
      return;
    }

    const attemptsMessage = accountLockoutService.formatRemainingAttemptsMessage(attempts);
    error.message = `${error.message} ${attemptsMessage}`;
  }

  private async fetchCurrentUser(userId: string): Promise<AuthUser> {
    return authService.getCurrentUser(userId);
  }
}

export default new AuthController();
