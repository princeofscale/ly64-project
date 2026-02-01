import { Router, Request, Response } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authLimiter, registrationLimiter, requestSizeLimiter } from '../middlewares/security';
import { tokenService } from '../services/tokenService';

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

router.post('/refresh', async (req: Request, res: Response) => {
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
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления токена',
    });
  }
});

router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Выход выполнен успешно',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка выхода',
    });
  }
});

router.post('/logout-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

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
    res.status(500).json({
      success: false,
      message: 'Ошибка выхода',
    });
  }
});

router.get('/sessions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

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
    res.status(500).json({
      success: false,
      message: 'Ошибка получения сессий',
    });
  }
});

export default router;
