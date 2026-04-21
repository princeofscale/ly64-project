import { ProgressBar } from './ProgressBar';

import type { Achievement } from '@lyceum64/shared';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  unlockedAt?: Date;
}

export function AchievementCard({
  achievement,
  isUnlocked,
  progress,
  unlockedAt,
}: AchievementCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl border-2 p-6 transition-all duration-300
        ${
          isUnlocked
            ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 shadow-lg hover:shadow-xl hover:-translate-y-1'
            : 'border-slate-200 bg-white opacity-60'
        }
      `}
    >
      <div className="flex items-center justify-center mb-4">
        <span
          className={`text-6xl transform transition-transform duration-300 ${
            isUnlocked ? 'scale-100' : 'scale-90 grayscale'
          }`}
        >
          {achievement.icon}
        </span>
      </div>

      <h3
        className={`text-xl font-bold text-center mb-2 ${
          isUnlocked ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        {achievement.name}
      </h3>

      <p
        className={`text-sm text-center mb-4 ${
          isUnlocked ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        {achievement.description}
      </p>

      <div
        className={`
          inline-flex items-center justify-center w-full px-3 py-2 rounded-xl text-sm font-semibold
          ${
            isUnlocked
              ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-100 text-slate-400'
          }
        `}
      >
        +{achievement.points} баллов
      </div>

      {isUnlocked && unlockedAt && (
        <p className="text-xs text-slate-500 text-center mt-3">
          Получено: {new Date(unlockedAt).toLocaleDateString('ru-RU')}
        </p>
      )}

      {!isUnlocked && progress !== undefined && progress > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2 text-center">
            Прогресс: {progress}%
          </p>
          <ProgressBar current={progress} total={100} showLabel={false} />
        </div>
      )}

      {!isUnlocked && (
        <div className="absolute top-3 right-3">
          <div className="bg-slate-100 text-slate-400 text-xs px-2 py-1 rounded-full">🔒</div>
        </div>
      )}
    </div>
  );
}
