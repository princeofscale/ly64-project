import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';

// Расширяем тип Request для добавления userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Токен не предоставлен', 401);
    }

    // Верификация токена
    const decoded = verifyToken(token);

    // Добавляем userId в request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication - не выбрасывает ошибку если токена нет
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Игнорируем ошибки для optional auth
    next();
  }
};
