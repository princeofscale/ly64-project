/**
 * Streak Component - Duolingo-style streak tracker
 * Gamification element for motivation
 */

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import React from 'react';

interface StreakProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const Streak: React.FC<StreakProps> = ({ count, size = 'md', animated = true }) => {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      icon: 'w-6 h-6',
      text: 'text-lg',
    },
    md: {
      container: 'gap-3',
      icon: 'w-8 h-8',
      text: 'text-2xl',
    },
    lg: {
      container: 'gap-4',
      icon: 'w-12 h-12',
      text: 'text-4xl',
    },
  };

  const flames = Array.from({ length: Math.min(count, 7) }, (_, i) => i);

  return (
    <div className={`inline-flex items-center ${sizeClasses[size].container}`}>
      {/* Streak Icon */}
      <motion.div
        animate={
          animated
            ? {
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, -10, 0],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        className="relative"
      >
        <div className="relative">
          <Flame
            className={`${sizeClasses[size].icon} text-orange-500 dark:text-orange-400`}
            fill="currentColor"
          />

          {/* Glow effect */}
          <div className="absolute inset-0 blur-md">
            <Flame className={`${sizeClasses[size].icon} text-orange-500/50`} fill="currentColor" />
          </div>
        </div>
      </motion.div>

      {/* Streak Count */}
      <div className="flex flex-col">
        <motion.span
          key={count}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`font-bold text-slate-900 dark:text-white ${sizeClasses[size].text}`}
        >
          {count}
        </motion.span>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium -mt-1">
          day streak
        </span>
      </div>

      {/* Mini flames for visual effect */}
      {size === 'lg' && count > 0 && (
        <div className="flex gap-0.5">
          {flames.map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Flame className="w-3 h-3 text-orange-400" fill="currentColor" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Streak Calendar - Shows streak history
export const StreakCalendar: React.FC<{
  days: boolean[]; // Last 7 days, true = completed
}> = ({ days }) => {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex gap-2">
      {days.map((completed, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">{dayLabels[i]}</span>

          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
              completed
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {completed ? '✓' : '○'}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Streak Milestone - Achievement for reaching streak milestones
export const StreakMilestone: React.FC<{
  current: number;
  next: number;
}> = ({ current, next }) => {
  const progress = (current / next) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" fill="currentColor" />
          <span className="font-semibold text-slate-900 dark:text-white">Next Milestone</span>
        </div>

        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {current} / {next} days
        </span>
      </div>

      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
        />
      </div>

      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        {next - current} more days to reach {next}-day streak!
      </div>
    </div>
  );
};
