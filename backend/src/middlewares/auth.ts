import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    currentGrade?: number;
    desiredDirection?: string;
  };
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Токен не предоставлен', 401);
    }


    const decoded = verifyToken(token);


    req.userId = decoded.userId;

    // Загружаем данные пользователя для AuthRequest
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        currentGrade: true,
        desiredDirection: true,
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 401);
    }

    (req as any).user = user;

    next();
  } catch (error) {
    next(error);
  }
};


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
    
    next();
  }
};
