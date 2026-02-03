/**
 * Task Card Component
 * Карточка с заданием
 */

import React from 'react';

import { QUESTION_TYPE_INFO } from '../../core/constants';
import { QuestionRenderer } from '../questions';

import type { ITask } from '../../core/interfaces';

interface TaskCardProps {
  task: ITask;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onFinish?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentAnswer,
  onAnswer,
  onPrevious,
  onNext,
  onFinish,
  isFirst = false,
  isLast = false,
  disabled = false,
}) => {
  const questionInfo = QUESTION_TYPE_INFO[task.type] || QUESTION_TYPE_INFO.short;

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-xl animate-fade-in">
      {/* Заголовок задания */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* Номер задания */}
            <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 font-semibold">
              Задание {task.number}
            </span>

            {/* Баллы */}
            <span className="text-sm text-slate-600">
              {task.points} {getPointsForm(task.points)}
            </span>

            {/* Тип вопроса */}
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <span>{questionInfo.icon}</span>
              <span>{questionInfo.name}</span>
            </span>
          </div>

          {/* Тема */}
          <div className="text-sm text-slate-500">{task.topic}</div>
        </div>

        {/* Флаг для отметки */}
        <FlagButton />
      </div>

      {/* Вопрос и поле ответа */}
      <QuestionRenderer
        task={task}
        currentAnswer={currentAnswer}
        onAnswer={onAnswer}
        disabled={disabled}
      />

      {/* Навигация */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
        <button
          onClick={onPrevious}
          disabled={isFirst || disabled}
          className={`
            flex items-center gap-2 px-4 py-2.5
            rounded-xl font-medium
            transition-all duration-200
            ${
              isFirst || disabled
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }
          `}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Предыдущее
        </button>

        <div className="flex gap-3">
          {isLast ? (
            <button
              onClick={onFinish}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-6 py-2.5
                bg-gradient-to-r from-emerald-500 to-emerald-600
                hover:from-emerald-400 hover:to-emerald-500
                text-white rounded-xl font-semibold
                transition-all duration-200
                shadow-lg shadow-emerald-500/25
                hover:shadow-xl hover:shadow-emerald-500/30
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Завершить тест
              <CheckIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-6 py-2.5
                bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-400 hover:to-blue-500
                text-white rounded-xl font-semibold
                transition-all duration-200
                shadow-lg shadow-blue-500/25
                hover:shadow-xl hover:shadow-blue-500/30
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Следующее
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Кнопка флага
 */
const FlagButton: React.FC = () => (
  <button
    className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
    title="Отметить для проверки"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.71l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
      />
    </svg>
  </button>
);

/**
 * Иконки
 */
const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

/**
 * Склонение слова "балл"
 */
function getPointsForm(points: number): string {
  const lastDigit = points % 10;
  const lastTwoDigits = points % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'баллов';
  if (lastDigit === 1) return 'балл';
  if (lastDigit >= 2 && lastDigit <= 4) return 'балла';
  return 'баллов';
}
