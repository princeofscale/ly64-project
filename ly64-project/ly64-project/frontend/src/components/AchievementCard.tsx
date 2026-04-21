import { Lock, Trophy, Sparkles } from 'lucide-react';

import { ProgressBar } from './ProgressBar';

import type { Achievement, AchievementRarity } from '@lyceum64/shared';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  unlockedAt?: Date;
}

const RARITY_STYLES: Record<AchievementRarity, {
  border: string;
  glow: string;
  bg: string;
  badge: string;
  badgeText: string;
  ring: string;
  label: string;
  iconGlow: string;
}> = {
  COMMON: {
    border: 'border-slate-200',
    glow: 'shadow-slate-200/50',
    bg: 'from-slate-50 to-white',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeText: 'Обычное',
    ring: 'ring-slate-200',
    label: 'text-slate-500',
    iconGlow: '',
  },
  RARE: {
    border: 'border-blue-300/60',
    glow: 'shadow-blue-200/60',
    bg: 'from-blue-50 via-white to-sky-50',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeText: 'Редкое',
    ring: 'ring-blue-300/60',
    label: 'text-blue-600',
    iconGlow: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]',
  },
  EPIC: {
    border: 'border-violet-300/70',
    glow: 'shadow-violet-300/60',
    bg: 'from-violet-50 via-white to-fuchsia-50',
    badge: 'bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 border-violet-200',
    badgeText: 'Эпическое',
    ring: 'ring-violet-400/60',
    label: 'text-violet-600',
    iconGlow: 'drop-shadow-[0_0_16px_rgba(139,92,246,0.5)]',
  },
  LEGENDARY: {
    border: 'border-amber-300/80',
    glow: 'shadow-amber-300/60',
    bg: 'from-amber-50 via-yellow-50 to-orange-50',
    badge: 'bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 text-amber-800 border-amber-300',
    badgeText: 'Легендарное',
    ring: 'ring-amber-400/70',
    label: 'text-amber-600',
    iconGlow: 'drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]',
  },
};

export function AchievementCard({
  achievement,
  isUnlocked,
  progress,
  unlockedAt,
}: AchievementCardProps) {
  const rarity = (achievement.rarity ?? 'COMMON') as AchievementRarity;
  const styles = RARITY_STYLES[rarity];
  const reward = achievement.rutheniumReward ?? 0;

  return (
    <div
      className={`group relative rounded-2xl border-2 p-6 transition-all duration-300 overflow-hidden ${
        isUnlocked
          ? `${styles.border} bg-gradient-to-br ${styles.bg} shadow-lg ${styles.glow} hover:shadow-2xl hover:-translate-y-1`
          : 'border-slate-200 bg-white opacity-70 hover:opacity-90'
      }`}
    >
      {isUnlocked && rarity !== 'COMMON' && (
        <>
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-2 right-6 w-1 h-1 bg-white rounded-full animate-pulse" />
            <div className="absolute top-10 right-12 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-6 right-16 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          {rarity === 'LEGENDARY' && (
            <div
              className="absolute -inset-px rounded-2xl pointer-events-none opacity-40"
              style={{
                background: 'conic-gradient(from 0deg, transparent, #fbbf24, transparent, #f59e0b, transparent)',
                animation: 'spin 6s linear infinite',
              }}
            />
          )}
        </>
      )}

      <div className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}>
        <Sparkles className="w-2.5 h-2.5" />
        {styles.badgeText}
      </div>

      {!isUnlocked && (
        <div className="absolute top-3 right-3">
          <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      )}

      {isUnlocked && (
        <div className="absolute top-3 right-3">
          <div className={`w-7 h-7 bg-gradient-to-br ${
            rarity === 'LEGENDARY' ? 'from-amber-400 to-orange-500' :
            rarity === 'EPIC' ? 'from-violet-500 to-fuchsia-500' :
            rarity === 'RARE' ? 'from-blue-500 to-cyan-500' :
            'from-slate-400 to-slate-500'
          } rounded-full flex items-center justify-center shadow-lg animate-scale-in`}>
            <Trophy className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center mt-6 mb-4">
        <div className={`relative ${isUnlocked ? 'animate-float' : ''}`}>
          <span
            className={`block text-6xl transition-all duration-500 ${
              isUnlocked ? `${styles.iconGlow} group-hover:scale-110` : 'grayscale opacity-50 scale-90'
            }`}
          >
            {achievement.icon}
          </span>
          {isUnlocked && rarity === 'LEGENDARY' && (
            <span className="absolute -top-1 -right-1 text-lg animate-bounce">✨</span>
          )}
        </div>
      </div>

      <h3
        className={`text-lg font-bold text-center mb-2 ${
          isUnlocked ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        {achievement.name}
      </h3>

      <p
        className={`text-sm text-center mb-4 min-h-[40px] ${
          isUnlocked ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        {achievement.description}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div
          className={`inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold ${
            isUnlocked
              ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md shadow-blue-500/25'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          +{achievement.points}
        </div>
        <div
          className={`inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-bold ${
            reward > 0 && isUnlocked
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25'
              : reward > 0
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-400'
          }`}
          title="Награда в рутениях"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.3" />
            <circle cx="12" cy="12" r="6" />
          </svg>
          {reward > 0 ? `+${reward} Ru` : '—'}
        </div>
      </div>

      {isUnlocked && unlockedAt && (
        <p className={`text-xs text-center ${styles.label} font-medium`}>
          Получено · {new Date(unlockedAt).toLocaleDateString('ru-RU')}
        </p>
      )}

      {!isUnlocked && progress !== undefined && progress > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Прогресс</span>
            <span className="text-xs font-bold text-slate-600 tabular-nums">{progress}%</span>
          </div>
          <ProgressBar current={progress} total={100} showLabel={false} />
        </div>
      )}
    </div>
  );
}
