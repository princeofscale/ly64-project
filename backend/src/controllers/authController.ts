import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { registerSchema, loginSchema } from '../utils/validation';
import { AppError } from '../middlewares/errorHandler';

export class AuthController {
  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Валидация данных
      const validatedData = registerSchema.parse(req.body);

      // Регистрация пользователя
      const result = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Валидация данных
      const validatedData = loginSchema.parse(req.body);

      // Вход пользователя
      const result = await authService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Вход выполнен успешно',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      // userId устанавливается в auth middleware
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

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // В текущей реализации с JWT logout происходит на клиенте
      // (удаление токена из localStorage)
      // Здесь можно добавить blacklist токенов если нужно

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
