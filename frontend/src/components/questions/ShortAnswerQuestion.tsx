/**
 * Short Answer Question Component
 * Компонент для вопросов с кратким ответом
 */

import React, { useState, useCallback } from 'react';
import { ITask } from '../../core/interfaces';

interface ShortAnswerQuestionProps {
  task: ITask;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({
  task,
  currentAnswer,
  onAnswer,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(currentAnswer);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    onAnswer(value);
  }, [onAnswer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Предотвращаем отправку формы при нажатии Enter
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-sans text-gray-400">
        {task.type === 'matching' ? 'Введите соответствие (например: А-1, Б-2, В-3):' : 'Введите ответ:'}
      </label>

      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={task.type === 'matching' ? 'А-1, Б-2, В-3' : 'Ваш ответ'}
          className={`
            w-full px-4 py-3
            bg-gray-800/50
            border border-gray-700
            rounded-xl
            text-white
            placeholder-gray-500
            focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
            transition-all duration-200
            font-sans
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
          `}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Индикатор ввода */}
        {localValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-cyan-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Подсказка для типа matching */}
      {task.type === 'matching' && (
        <p className="text-xs text-gray-500 font-sans">
          Запишите соответствие через запятую, например: А-1, Б-3, В-2
        </p>
      )}
    </div>
  );
};
