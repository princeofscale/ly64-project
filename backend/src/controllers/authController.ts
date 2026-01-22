import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { registerSchema, loginSchema } from '../utils/validation';
import { AppError } from '../middlewares/errorHandler';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);

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

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);

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
