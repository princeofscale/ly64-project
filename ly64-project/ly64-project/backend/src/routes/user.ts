import { Router } from 'express';

import {
  getProfile,
  getPublicProfile,
  updateProfile,
  updateAvatar,
  updatePrivacy,
  searchUsers,
  getStats,
  getAchievements,
  checkAchievements,
  getLeaderboard,
  getUserRank,
  getErrorAnalysis,
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/avatar', authenticateToken, updateAvatar);
router.put('/privacy', authenticateToken, updatePrivacy);
router.get('/stats', authenticateToken, getStats);
router.get('/achievements', authenticateToken, getAchievements);
router.post('/check-achievements', authenticateToken, checkAchievements);
router.get('/leaderboard', authenticateToken, getLeaderboard);
router.get('/my-rank', authenticateToken, getUserRank);
router.get('/error-analysis', authenticateToken, getErrorAnalysis);
router.get('/search', searchUsers);
router.get('/:username', getPublicProfile);

export default router;
