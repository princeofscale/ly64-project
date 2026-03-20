import { Router } from 'express';

import authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authLimiter, registrationLimiter, requestSizeLimiter } from '../middlewares/security';
import { tokenService } from '../services/tokenService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Request, Response } from 'express';

const router = Router();

router.post(
  '/register',
  registrationLimiter,
  requestSizeLimiter(50),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  requestSizeLimiter(10),
  authController.login.bind(authController)
);

router.post('/refresh', authLimiter, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token обязателен',
      });
    }

    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;

    const tokens = await tokenService.refreshTokens(refreshToken, deviceInfo, ipAddress);

    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный или истёкший refresh token',
      });
    }

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления токена',
    });
  }
});

    const tokens = await tokenService.refreshTokens(refreshToken, deviceInfo, ipAddress);

    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный или истёкший refresh token',
      });
    }

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления токена',
    });
  }
});

// Get current user (authenticated)
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (refreshToken && userId) {
      await tokenService.revokeRefreshToken(refreshToken, userId);
    }

    res.json({
      success: true,
      message: 'Выход выполнен успешно',
    });
  } catch (error) {
    logger.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка выхода',
    });
  }
});

router.post('/logout-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Не авторизован',
      });
    }

    const revokedCount = await tokenService.revokeAllUserTokens(userId);

    res.json({
      success: true,
      message: `Выход выполнен со всех устройств (${revokedCount})`,
    });
  } catch (error) {
    logger.error('Error during logout-all:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка выхода',
    });
  }
});

router.get('/sessions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Не авторизован',
      });
    }

    const sessions = await tokenService.getUserSessions(userId);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения сессий',
    });
  }
});

export default router;
