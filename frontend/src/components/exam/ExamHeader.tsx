/**
 * Exam Header Component
 * Заголовок экзамена с таймером и прогрессом
 */

import React from 'react';
import { TimerService } from '../../core/services';

interface ExamHeaderProps {
  title: string;
  subtitle?: string;
  timeLeft: number;
  timerStatus: 'normal' | 'warning' | 'critical';
  currentTask: number;
  totalTasks: number;
  progress: number;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  title,
  subtitle,
  timeLeft,
  timerStatus,
  currentTask,
  totalTasks,
  progress,
}) => {
  const getTimerColor = () => {
    switch (timerStatus) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-cyan-400';
    }
  };

  const getTimerBgColor = () => {
    switch (timerStatus) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-cyan-500/10 border-cyan-500/30';
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Название экзамена */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <span className="text-sm text-gray-400 font-sans">
                {subtitle}
              </span>
            )}
          </div>

          {/* Правая часть: таймер и прогресс */}
          <div className="flex items-center gap-6">
            {/* Таймер */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getTimerBgColor()}`}>
              <TimerIcon className={`w-5 h-5 ${getTimerColor()}`} />
              <span className={`font-mono text-lg font-semibold ${getTimerColor()}`}>
                {TimerService.formatTime(timeLeft)}
              </span>
            </div>

            {/* Счетчик заданий */}
            <div className="text-sm font-sans text-gray-400">
              <span className="text-cyan-400 font-semibold">{currentTask}</span>
              <span className="mx-1">/</span>
              <span>{totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Иконка таймера
 */
const TimerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
