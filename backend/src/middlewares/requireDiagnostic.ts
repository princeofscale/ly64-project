import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const requireDiagnosticCompleted = async (
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
      select: { diagnosticCompleted: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден',
      });
    }

    // Админы могут обходить диагностику
    if (user.role === 'ADMIN') {
      return next();
    }

    if (!user.diagnosticCompleted) {
      return res.status(403).json({
        success: false,
        message: 'Требуется завершить входную диагностику',
        redirectTo: '/diagnostic',
        requiresDiagnostic: true,
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireDiagnosticCompleted middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
    });
  }
};
