import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { registerSchema, loginSchema } from '../utils/validation';
import { AppError } from '../middlewares/errorHandler';
import {
  checkAccountLockout,
  recordFailedLogin,
  clearFailedLogins,
} from '../middlewares/security';
import {
  logSuccessfulLogin,
  logFailedLogin,
  logBlockedLogin,
  logRegistration,
} from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);

      const result = await authService.register(validatedData);

      // Log successful registration
      logRegistration(result.user.id, result.user.email, req);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Check if account is locked due to too many failed attempts
      const lockoutStatus = checkAccountLockout(validatedData.email);
      if (lockoutStatus.locked) {
        // Log blocked login attempt
        logBlockedLogin(validatedData.email, req);

        throw new AppError(
          `Аккаунт временно заблокирован из-за множества неудачных попыток входа. Попробуйте через ${lockoutStatus.remainingTime} минут.`,
          429
        );
      }

      try {
        const result = await authService.login(validatedData);

        // Clear failed login attempts on successful login
        clearFailedLogins(validatedData.email);

        // Log successful login
        logSuccessfulLogin(result.user.id, result.user.email, req);

        res.status(200).json({
          success: true,
          message: 'Вход выполнен успешно',
          data: result,
        });
      } catch (loginError) {
        // Record failed login attempt
        const failedAttempt = recordFailedLogin(validatedData.email);

        // Log failed login
        logFailedLogin(
          validatedData.email,
          req,
          loginError instanceof Error ? loginError.message : 'Unknown error'
        );

        if (failedAttempt.locked) {
          // Log account locked
          logBlockedLogin(validatedData.email, req);

          throw new AppError(
            'Аккаунт заблокирован на 15 минут из-за множества неудачных попыток входа.',
            429
          );
        }

        // Re-throw the original error with attempt count hint
        if (loginError instanceof AppError) {
          const remainingAttempts = 5 - failedAttempt.attempts;
          if (remainingAttempts > 0 && remainingAttempts <= 3) {
            loginError.message += ` Осталось попыток: ${remainingAttempts}`;
          }
        }
        throw loginError;
      }
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError('Не авторизован', 401);
      }

      const user = await authService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: 'Выход выполнен успешно',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
