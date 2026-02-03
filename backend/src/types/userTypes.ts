export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly name: string;
  readonly status: string;
  readonly currentGrade: number;
  readonly desiredDirection: string | null;
  readonly motivation: string | null;
  readonly authProvider: string;
  readonly avatar: string | null;
  readonly bio: string | null;
  readonly isPublic: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ProfileStats {
  readonly totalTests: number;
  readonly averageScore: number;
  readonly bestScore: number;
  readonly achievementsCount: number;
}

export interface AchievementData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly points: number;
  readonly unlockedAt: Date;
}

export interface RecentTestData {
  readonly score: number | null;
  readonly subject: string;
  readonly completedAt: Date | null;
}

export interface PublicProfileResponse {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly status: string;
  readonly currentGrade: number;
  readonly desiredDirection: string | null;
  readonly avatar: string | null;
  readonly bio: string | null;
  readonly isPublic: boolean;
  readonly createdAt: Date;
  readonly stats: ProfileStats;
  readonly achievements: ReadonlyArray<AchievementData>;
  readonly recentTests: ReadonlyArray<RecentTestData>;
}

export interface PrivateProfileResponse {
  readonly username: string;
  readonly name: string;
  readonly avatar: string | null;
  readonly isPublic: false;
  readonly message: string;
}

export interface UpdateProfileData {
  readonly name?: string;
  readonly status?: string;
  readonly currentGrade?: number;
  readonly desiredDirection?: string;
  readonly motivation?: string | null;
  readonly avatar?: string | null;
  readonly bio?: string | null;
  readonly isPublic?: boolean;
}

export interface DailyActivity {
  readonly date: string;
  readonly count: number;
  readonly avgScore: number;
}

export interface TimeHeatmapEntry {
  readonly hour: number;
  readonly testCount: number;
  readonly avgScore: number;
}

export interface SubjectStats {
  readonly subject: string;
  readonly totalAttempts: number;
  readonly averageScore: number;
  readonly bestScore: number;
  readonly lastAttemptDate: Date | null;
}

export interface WeakTopic {
  readonly topic: string;
  readonly subject: string;
  readonly avgScore: number;
  readonly totalAttempts: number;
  readonly wrongAnswers: number;
}

export interface PredictionData {
  readonly predictedScore: number;
  readonly confidence: number;
  readonly factors: ReadonlyArray<string>;
}

export interface UserStatsResponse {
  readonly totalTests: number;
  readonly averageScore: number;
  readonly bestScore: number;
  readonly statsBySubject: ReadonlyArray<SubjectStats>;
  readonly recentAttempts: ReadonlyArray<RecentAttemptData>;
  readonly dailyActivity: ReadonlyArray<DailyActivity>;
  readonly timeHeatmap: ReadonlyArray<TimeHeatmapEntry>;
  readonly platformAverage: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly totalTimeSpent: number;
  readonly weeklyProgress: number;
  readonly favoriteSubject: string;
  readonly predictedScore: number;
  readonly predictionConfidence: number;
  readonly predictionFactors: ReadonlyArray<string>;
  readonly weakTopics: ReadonlyArray<WeakTopic>;
  readonly percentile: number;
  readonly usersBeaten: number;
  readonly totalUsers: number;
  readonly userRank: number;
}

export interface RecentAttemptData {
  readonly id: string;
  readonly testId: string;
  readonly subject: string;
  readonly score: number | null;
  readonly completedAt: Date | null;
}

export interface LeaderboardEntry {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly avatar: string | null;
  readonly currentGrade: number;
  readonly stats: {
    readonly totalTests: number;
    readonly averageScore: number;
    readonly bestScore: number;
    readonly achievementsCount: number;
    readonly points: number;
  };
  readonly rank: number;
}

export interface LeaderboardResponse {
  readonly period: string;
  readonly subject: string;
  readonly total: number;
  readonly leaderboard: ReadonlyArray<LeaderboardEntry>;
}

export interface UserRankResponse {
  readonly rank: number;
  readonly points: number;
  readonly stats: {
    readonly totalTests: number;
    readonly averageScore: number;
    readonly bestScore: number;
    readonly achievementsCount: number;
  };
}

export interface SearchUserResult {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly avatar: string | null;
  readonly currentGrade: number;
}
