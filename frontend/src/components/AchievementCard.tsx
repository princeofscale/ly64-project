import { Achievement } from '@lyceum64/shared';
import { ProgressBar } from './ProgressBar';

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
            ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]'
            : 'border-gray-700 bg-gray-800/30 opacity-60'
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
        className={`text-xl font-display font-bold text-center mb-2 ${
          isUnlocked ? 'text-white' : 'text-gray-500'
        }`}
      >
        {achievement.name}
      </h3>

      <p
        className={`text-sm text-center mb-4 font-sans ${
          isUnlocked ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        {achievement.description}
      </p>

      <div
        className={`
          inline-flex items-center justify-center w-full px-3 py-2 rounded-xl text-sm font-semibold font-sans
          ${
            isUnlocked
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-gray-700 text-gray-400'
          }
        `}
      >
        +{achievement.points} баллов
      </div>

      {isUnlocked && unlockedAt && (
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-3 font-sans">
          Получено: {new Date(unlockedAt).toLocaleDateString('ru-RU')}
        </p>
      )}

      {!isUnlocked && progress !== undefined && progress > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 text-center font-sans">
            Прогресс: {progress}%
          </p>
          <ProgressBar current={progress} total={100} showLabel={false} />
        </div>
      )}

      {!isUnlocked && (
        <div className="absolute top-3 right-3">
          <div className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded-full">
            🔒
          </div>
        </div>
      )}
    </div>
  );
}
