import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import {
  getProfile,
  getPublicProfile,
  updateProfile,
  getStats,
  getAchievements,
  checkAchievements,
} from '../controllers/userController';

const router = Router();

/**
 * Защищенные роуты (требуют аутентификации)
 * ВАЖНО: Эти роуты должны быть ПЕРЕД /:username, чтобы не конфликтовать
 */

/**
 * GET /api/users/profile
 * Получить профиль текущего пользователя
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * PUT /api/users/profile
 * Обновить профиль пользователя
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * GET /api/users/stats
 * Получить статистику пользователя
 */
router.get('/stats', authenticateToken, getStats);

/**
 * GET /api/users/achievements
 * Получить достижения пользователя
 */
router.get('/achievements', authenticateToken, getAchievements);

/**
 * POST /api/users/check-achievements
 * Проверить и разблокировать новые достижения
 */
router.post('/check-achievements', authenticateToken, checkAchievements);

/**
 * GET /api/users/:username
 * Получить публичный профиль пользователя по username (без аутентификации)
 * ВАЖНО: Этот роут ДОЛЖЕН быть последним, чтобы не перехватывать другие маршруты
 */
router.get('/:username', getPublicProfile);

export default router;
