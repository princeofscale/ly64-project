"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class AchievementService {
    async getAllAchievements() {
        return await database_1.default.achievement.findMany({
            orderBy: { points: 'asc' },
        });
    }
    async getUserAchievements(userId) {
        const userAchievements = await database_1.default.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true,
            },
            orderBy: { unlockedAt: 'desc' },
        });
        return userAchievements.map((ua) => ({
            ...ua.achievement,
            unlockedAt: ua.unlockedAt,
        }));
    }
    async getAllAchievementsWithProgress(userId) {
        const allAchievements = await this.getAllAchievements();
        const userAchievements = await database_1.default.userAchievement.findMany({
            where: { userId },
        });
        const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
        return allAchievements.map((achievement) => {
            const userAchievement = userAchievements.find((ua) => ua.achievementId === achievement.id);
            return {
                ...achievement,
                isUnlocked: unlockedIds.has(achievement.id),
                unlockedAt: userAchievement?.unlockedAt,
            };
        });
    }
    async unlockAchievement(userId, achievementId) {
        const achievement = await database_1.default.achievement.findUnique({
            where: { id: achievementId },
        });
        if (!achievement) {
            throw new errorHandler_1.AppError('Достижение не найдено', 404);
        }
        const existing = await database_1.default.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId,
                },
            },
        });
        if (existing) {
            return { alreadyUnlocked: true, achievement };
        }
        await database_1.default.userAchievement.create({
            data: {
                userId,
                achievementId,
            },
        });
        return { alreadyUnlocked: false, achievement };
    }
    async checkAndUnlockAchievements(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                progress: true,
                testAttempts: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Пользователь не найден', 404);
        }
        const allAchievements = await this.getAllAchievements();
        const newlyUnlocked = [];
        for (const achievement of allAchievements) {
            const shouldUnlock = await this.checkAchievementCondition(achievement.condition, user);
            if (shouldUnlock) {
                const result = await this.unlockAchievement(userId, achievement.id);
                if (!result.alreadyUnlocked) {
                    newlyUnlocked.push(achievement);
                }
            }
        }
        return newlyUnlocked;
    }
    async checkAchievementCondition(condition, user) {
        switch (condition) {
            case 'register':
                return true;
            case 'complete_diagnostic':
                const diagnosticResults = await database_1.default.diagnosticResult.findMany({
                    where: { userId: user.id }
                });
                return diagnosticResults.length > 0;
            case 'complete_first_test':
                return user.testAttempts.some((attempt) => attempt.completedAt !== null);
            case 'complete_10_tests':
                const completedTests = user.testAttempts.filter((attempt) => attempt.completedAt !== null);
                return completedTests.length >= 10;
            case 'score_90_percent':
                return user.testAttempts.some((attempt) => attempt.score !== null && attempt.score >= 90);
            case 'perfect_score':
                return user.testAttempts.some((attempt) => attempt.score !== null && attempt.score >= 100);
            default:
                console.warn(`Unknown achievement condition: ${condition}`);
                return false;
        }
    }
    async getUserAchievementStats(userId) {
        const allAchievements = await this.getAllAchievements();
        const userAchievements = await database_1.default.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
        });
        const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0);
        const maxPoints = allAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
        return {
            total: allAchievements.length,
            unlocked: userAchievements.length,
            totalPoints,
            maxPoints,
            percentage: allAchievements.length > 0
                ? Math.round((userAchievements.length / allAchievements.length) * 100)
                : 0,
        };
    }
}
exports.AchievementService = AchievementService;
exports.default = new AchievementService();
//# sourceMappingURL=achievementService.js.map