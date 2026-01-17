import { Achievement } from '@lyceum64/shared';
import { ProgressBar } from './ProgressBar';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  unlockedAt?: Date;
}

/**
 * AchievementCard компонент
 * Отображает карточку достижения (заблокированную или разблокированную)
 */
export function AchievementCard({
  achievement,
  isUnlocked,
  progress,
  unlockedAt,
}: AchievementCardProps) {
  return (
    <div
      className={`
        relative rounded-lg border-2 p-6 transition-all duration-300
        ${
          isUnlocked
            ? 'border-green-400 bg-green-50 shadow-md hover:shadow-lg'
            : 'border-gray-300 bg-gray-100 opacity-60'
        }
      `}
    >
      {/* Иконка */}
      <div className="flex items-center justify-center mb-4">
        <span
          className={`text-6xl ${
            !isUnlocked && 'grayscale'
          }`}
        >
          {achievement.icon}
        </span>
      </div>

      {/* Название */}
      <h3
        className={`text-xl font-bold text-center mb-2 ${
          isUnlocked ? 'text-gray-900' : 'text-gray-600'
        }`}
      >
        {achievement.name}
      </h3>

      {/* Описание */}
      <p
        className={`text-sm text-center mb-4 ${
          isUnlocked ? 'text-gray-700' : 'text-gray-500'
        }`}
      >
        {achievement.description}
      </p>

      {/* Баллы */}
      <div
        className={`
          inline-flex items-center justify-center w-full px-3 py-1 rounded-full text-sm font-semibold
          ${
            isUnlocked
              ? 'bg-green-600 text-white'
              : 'bg-gray-400 text-gray-700'
          }
        `}
      >
        +{achievement.points} баллов
      </div>

      {/* Дата разблокировки */}
      {isUnlocked && unlockedAt && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Получено: {new Date(unlockedAt).toLocaleDateString('ru-RU')}
        </p>
      )}

      {/* Прогресс для заблокированных */}
      {!isUnlocked && progress !== undefined && progress > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2 text-center">
            Прогресс: {progress}%
          </p>
          <ProgressBar current={progress} total={100} showLabel={false} />
        </div>
      )}

      {/* Бейдж "Заблокировано" */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2">
          <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
            🔒
          </div>
        </div>
      )}
    </div>
  );
}
