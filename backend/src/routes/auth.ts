import { Router, Request, Response } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { authLimiter, registrationLimiter, requestSizeLimiter } from '../middlewares/security';
import { tokenService } from '../services/tokenService';

const router = Router();

// Registration with strict rate limiting and size limit
router.post(
  '/register',
  registrationLimiter,
  requestSizeLimiter(50), // 50KB max for registration
  authController.register.bind(authController)
);

// Login with strict rate limiting to prevent brute force
router.post(
  '/login',
  authLimiter,
  requestSizeLimiter(10), // 10KB max for login
  authController.login.bind(authController)
);

// Refresh token endpoint
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

// Get current user (authenticated)
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

// Logout - revoke refresh token
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

// Logout from all devices
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

// Get active sessions
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
