import type { Achievement } from '@lyceum64/shared';

export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
}
