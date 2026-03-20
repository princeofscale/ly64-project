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
      return { grade: 5, label: 'Отлично!', color: 'from-emerald-50 to-green-50', textColor: 'text-emerald-600', emoji: '🏆' };
    if (percentage >= 75)
      return { grade: 4, label: 'Хорошо!', color: 'from-blue-50 to-cyan-50', textColor: 'text-blue-600', emoji: '🎉' };
    if (percentage >= 50)
      return {
        grade: 3,
        label: 'Удовлетворительно',
        color: 'from-amber-50 to-yellow-50',
        textColor: 'text-amber-600',
        emoji: '👍',
      };
    return { grade: 2, label: 'Нужно повторить', color: 'from-red-50 to-rose-50', textColor: 'text-red-600', emoji: '📚' };
  };

  const gradeInfo = getGradeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white relative overflow-hidden py-12 px-4">
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className={`bg-gradient-to-br ${gradeInfo.color} border border-slate-200 rounded-3xl p-8 text-center shadow-2xl animate-scale-in`}>
          <div className="text-7xl mb-6 animate-bounce">{gradeInfo.emoji}</div>

          <h1
            className={`text-4xl font-bold ${gradeInfo.textColor} mb-2`}
          >
            {gradeInfo.label}
          </h1>

          <p className="text-slate-700 mb-8">{examTitle} завершен</p>

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

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Результат</span>
              <span
                className={`text-lg font-bold ${gradeInfo.textColor}`}
              >
                {results.percentageScore}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full ${gradeInfo.textColor.replace('text-', 'bg-')} transition-all duration-1000`}
                style={{ width: `${results.percentageScore}%` }}
              />
            </div>
          </div>

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

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => void navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              К панели управления
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-medium transition-all duration-200"
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

const StatCard: React.FC<{
  label: string;
  value: number;
  suffix: string;
  color: 'cyan' | 'purple';
}> = ({ label, value, suffix, color }) => {
  const colorClasses = {
    cyan: 'text-blue-600',
    purple: 'text-violet-600',
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-lg">
      <p className="text-sm text-slate-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className={`text-sm ${colorClasses[color]}`}>{suffix}</p>
    </div>
  );
};

const InfoItem: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
    <span className="text-xl">{icon}</span>
    <div className="text-left">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="text-sm text-slate-900 font-medium">{value}</p>
    </div>
  </div>
);
