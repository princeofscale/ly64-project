"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authenticateToken, userController_1.getProfile);
router.put('/profile', auth_1.authenticateToken, userController_1.updateProfile);
router.put('/avatar', auth_1.authenticateToken, userController_1.updateAvatar);
router.put('/privacy', auth_1.authenticateToken, userController_1.updatePrivacy);
router.get('/stats', auth_1.authenticateToken, userController_1.getStats);
router.get('/achievements', auth_1.authenticateToken, userController_1.getAchievements);
router.post('/check-achievements', auth_1.authenticateToken, userController_1.checkAchievements);
router.get('/leaderboard', userController_1.getLeaderboard);
router.get('/my-rank', auth_1.authenticateToken, userController_1.getUserRank);
router.get('/search', userController_1.searchUsers);
router.get('/:username', userController_1.getPublicProfile);
exports.default = router;
//# sourceMappingURL=user.js.map