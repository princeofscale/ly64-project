import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден',
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещён. Требуются права администратора.',
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
    });
  }
};
