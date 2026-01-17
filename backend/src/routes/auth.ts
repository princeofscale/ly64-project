import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import dnevnikOAuthService from '../services/dnevnikOAuthService';

const router = Router();

// GET /api/auth/config - Получить конфигурацию аутентификации
router.get('/config', (_req, res) => {
  res.json({
    dnevnikOAuthEnabled: dnevnikOAuthService.isConfigured(),
  });
});

// POST /api/auth/register - Регистрация
router.post('/register', authController.register.bind(authController));

// POST /api/auth/login - Вход
router.post('/login', authController.login.bind(authController));

// GET /api/auth/me - Получить текущего пользователя (требует авторизации)
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

// POST /api/auth/logout - Выход (требует авторизации)
router.post('/logout', authenticateToken, authController.logout.bind(authController));

export default router;
