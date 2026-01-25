export declare class AchievementService {
    getAllAchievements(): Promise<{
        name: string;
        id: string;
        description: string;
        icon: string;
        condition: string;
        points: number;
        createdAt: Date;
    }[]>;
    getUserAchievements(userId: string): Promise<{
        unlockedAt: Date;
        name: string;
        id: string;
        description: string;
        icon: string;
        condition: string;
        points: number;
        createdAt: Date;
    }[]>;
    getAllAchievementsWithProgress(userId: string): Promise<{
        isUnlocked: boolean;
        unlockedAt: Date | undefined;
        name: string;
        id: string;
        description: string;
        icon: string;
        condition: string;
        points: number;
        createdAt: Date;
    }[]>;
    unlockAchievement(userId: string, achievementId: string): Promise<{
        alreadyUnlocked: boolean;
        achievement: {
            name: string;
            id: string;
            description: string;
            icon: string;
            condition: string;
            points: number;
            createdAt: Date;
        };
    }>;
    checkAndUnlockAchievements(userId: string): Promise<any[]>;
    private checkAchievementCondition;
    getUserAchievementStats(userId: string): Promise<{
        total: number;
        unlocked: number;
        totalPoints: number;
        maxPoints: number;
        percentage: number;
    }>;
}
declare const _default: AchievementService;
export default _default;
//# sourceMappingURL=achievementService.d.ts.map