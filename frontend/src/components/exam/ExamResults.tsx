/**
 * Exam Results Component
 * Компонент отображения результатов экзамена
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

import { TimerService } from '../../core/services';

import type { TestResults } from '../../core/types';

interface ExamResultsProps {
  results: TestResults;
  examTitle: string;
  onRetry?: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({ results, examTitle, onRetry }) => {
  const navigate = useNavigate();

  const getGradeInfo = () => {
    const percentage = results.percentageScore;
    if (percentage >= 90)
      return { grade: 5, label: 'Отлично!', color: 'from-green-400 to-emerald-400', emoji: '🏆' };
    if (percentage >= 75)
      return { grade: 4, label: 'Хорошо!', color: 'from-cyan-400 to-blue-400', emoji: '🎉' };
    if (percentage >= 50)
      return {
        grade: 3,
        label: 'Удовлетворительно',
        color: 'from-yellow-400 to-orange-400',
        emoji: '👍',
      };
    return { grade: 2, label: 'Нужно повторить', color: 'from-red-400 to-pink-400', emoji: '📚' };
  };

  const gradeInfo = getGradeInfo();

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4">
      {/* Фон */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center animate-scale-in">
          {/* Эмодзи */}
          <div className="text-7xl mb-6 animate-bounce">{gradeInfo.emoji}</div>

          {/* Заголовок */}
          <h1
            className={`text-4xl font-display font-bold bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent mb-2`}
          >
            {gradeInfo.label}
          </h1>

          <p className="text-gray-400 font-sans mb-8">{examTitle} завершен</p>

          {/* Основная статистика */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard
              label="Правильных ответов"
              value={results.correctAnswers}
              suffix={`из ${results.totalTasks}`}
              color="cyan"
            />
            <StatCard
              label="Первичных баллов"
              value={results.earnedPoints}
              suffix={`из ${results.maxPoints}`}
              color="purple"
            />
          </div>

          {/* Процентная шкала */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-sans">Результат</span>
              <span
                className={`text-lg font-bold bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent`}
              >
                {results.percentageScore}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${gradeInfo.color} transition-all duration-1000`}
                style={{ width: `${results.percentageScore}%` }}
              />
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <InfoItem
              icon="📝"
              label="Отвечено заданий"
              value={`${results.answeredTasks} из ${results.totalTasks}`}
            />
            <InfoItem
              icon="⏱️"
              label="Затраченное время"
              value={TimerService.formatTime(results.timeSpent)}
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-sans font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/25"
            >
              К панели управления
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl font-sans font-medium transition-all duration-200"
              >
                Пройти заново
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Карточка статистики
 */
const StatCard: React.FC<{
  label: string;
  value: number;
  suffix: string;
  color: 'cyan' | 'purple';
}> = ({ label, value, suffix, color }) => {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-500 text-cyan-400',
    purple: 'from-purple-500 to-pink-500 text-purple-400',
  };

  return (
    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
      <p className="text-sm text-gray-500 font-sans mb-1">{label}</p>
      <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
      <p className={`text-sm font-sans ${colorClasses[color].split(' ')[1]}`}>{suffix}</p>
    </div>
  );
};

/**
 * Элемент информации
 */
const InfoItem: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
    <span className="text-xl">{icon}</span>
    <div className="text-left">
      <p className="text-xs text-gray-500 font-sans">{label}</p>
      <p className="text-sm text-gray-300 font-sans font-medium">{value}</p>
    </div>
  </div>
);
