import prisma from '../config/database';
import { verifyToken } from '../utils/jwt';

import { AppError } from './errorHandler';

import type { Request, Response, NextFunction } from 'express';

const userCache = new Map<string, { user: { id: string; email: string; currentGrade: number | null; desiredDirection: string | null }; expiry: number }>();
const USER_CACHE_TTL = 30_000;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
    currentGrade?: number | null;
    desiredDirection?: string | null;
  };
}

export const authenticateToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Токен не предоставлен', 401);
    }

    const decoded = verifyToken(token);

    req.userId = decoded.userId;

    const cached = userCache.get(decoded.userId);
    let user: { id: string; email: string; currentGrade: number | null; desiredDirection: string | null } | null;

    if (cached && cached.expiry > Date.now()) {
      user = cached.user;
    } else {
      userCache.delete(decoded.userId);
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          currentGrade: true,
          desiredDirection: true,
        },
      });

      if (user) {
        if (userCache.size > 200) {
          const oldestKey = userCache.keys().next().value as string;
          userCache.delete(oldestKey);
        }
        userCache.set(decoded.userId, { user, expiry: Date.now() + USER_CACHE_TTL });
      }
    }

    if (!user) {
      throw new AppError('Пользователь не найден', 401);
    }

    (req as AuthRequest).user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    }

    next();
  } catch {
    next();
  }
};
