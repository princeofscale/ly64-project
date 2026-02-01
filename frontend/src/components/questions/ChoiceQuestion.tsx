/**
 * Choice Question Component
 * Компонент для вопросов с выбором ответа
 */

import React, { useCallback, useMemo } from 'react';

import type { ITask } from '../../core/interfaces';

interface ChoiceQuestionProps {
  task: ITask;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  multiple?: boolean;
}

export const ChoiceQuestion: React.FC<ChoiceQuestionProps> = ({
  task,
  currentAnswer,
  onAnswer,
  disabled = false,
  multiple = false,
}) => {
  // Для множественного выбора храним массив выбранных ответов
  const selectedAnswers = useMemo(() => {
    if (multiple && currentAnswer) {
      return currentAnswer.split(',').map(s => s.trim());
    }
    return [];
  }, [currentAnswer, multiple]);

  const handleSingleChoice = useCallback(
    (option: string) => {
      if (!disabled) {
        onAnswer(option);
      }
    },
    [onAnswer, disabled]
  );

  const handleMultipleChoice = useCallback(
    (option: string) => {
      if (disabled) return;

      const newSelected = selectedAnswers.includes(option)
        ? selectedAnswers.filter(s => s !== option)
        : [...selectedAnswers, option];

      onAnswer(newSelected.join(', '));
    },
    [selectedAnswers, onAnswer, disabled]
  );

  const isSelected = useCallback(
    (option: string): boolean => {
      if (multiple) {
        return selectedAnswers.includes(option);
      }
      return currentAnswer === option;
    },
    [currentAnswer, selectedAnswers, multiple]
  );

  if (!task.options || task.options.length === 0) {
    return <div className="text-gray-500 font-sans">Варианты ответов отсутствуют</div>;
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-sans text-gray-400 mb-4">
        {multiple ? 'Выберите все подходящие варианты:' : 'Выберите один вариант:'}
      </label>

      <div className="space-y-3">
        {task.options.map((option, index) => {
          const selected = isSelected(option);
          const handleClick = multiple ? handleMultipleChoice : handleSingleChoice;

          return (
            <button
              key={index}
              onClick={() => handleClick(option)}
              disabled={disabled}
              className={`
                w-full p-4 rounded-xl
                border-2 text-left
                transition-all duration-200
                ${
                  selected
                    ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                group
              `}
            >
              <div className="flex items-center gap-4">
                {/* Индикатор выбора */}
                <div
                  className={`
                  flex-shrink-0 w-6 h-6
                  border-2 rounded-${multiple ? 'md' : 'full'}
                  flex items-center justify-center
                  transition-all duration-200
                  ${
                    selected
                      ? 'border-cyan-500 bg-cyan-500'
                      : 'border-gray-600 group-hover:border-cyan-500/50'
                  }
                `}
                >
                  {selected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {/* Текст варианта */}
                <span className="font-sans flex-1 leading-relaxed">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Счетчик для множественного выбора */}
      {multiple && selectedAnswers.length > 0 && (
        <div className="mt-4 text-sm text-cyan-400 font-sans">
          Выбрано: {selectedAnswers.length}
        </div>
      )}
    </div>
  );
};
