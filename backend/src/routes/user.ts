import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { requireDiagnosticCompleted } from '../middlewares/requireDiagnostic';
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

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, requireDiagnosticCompleted, updateProfile);
router.put('/avatar', authenticateToken, requireDiagnosticCompleted, updateAvatar);
router.put('/privacy', authenticateToken, requireDiagnosticCompleted, updatePrivacy);
router.get('/stats', authenticateToken, getStats);
router.get('/achievements', authenticateToken, getAchievements);
router.post('/check-achievements', authenticateToken, checkAchievements);
router.get('/leaderboard', authenticateToken, requireDiagnosticCompleted, getLeaderboard);
router.get('/my-rank', authenticateToken, requireDiagnosticCompleted, getUserRank);
router.get('/error-analysis', authenticateToken, getErrorAnalysis);
router.get('/search', searchUsers);
router.get('/:username', getPublicProfile);

export default router;
