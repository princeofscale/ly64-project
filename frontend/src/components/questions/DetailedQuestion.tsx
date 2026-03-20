import React, { useState, useCallback } from 'react';

import type { ITask } from '../../core/interfaces';

interface DetailedQuestionProps {
  task: ITask;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  isProof?: boolean;
}

export const DetailedQuestion: React.FC<DetailedQuestionProps> = ({
  task,
  currentAnswer,
  onAnswer,
  disabled = false,
  isProof = false,
}) => {
  const [localValue, setLocalValue] = useState(currentAnswer);

  const wordCount = localValue
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0).length;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalValue(value);
      onAnswer(value);
    },
    [onAnswer]
  );

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 400) + 'px';
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-sans text-slate-500">
          {isProof ? 'Напишите доказательство:' : 'Подробное решение:'}
        </label>

        <span className="text-sm text-violet-600 font-sans">До {task.points} баллов</span>
      </div>

      <div className="relative">
        <textarea
          value={localValue}
          onChange={handleChange}
          onInput={handleInput}
          disabled={disabled}
          placeholder={
            isProof
              ? 'Опишите доказательство шаг за шагом...'
              : 'Опишите решение задачи с пояснениями...'
          }
          rows={8}
          className={`
            w-full px-4 py-3
            bg-slate-50
            border border-slate-200
            rounded-xl
            text-slate-900
            placeholder-slate-400
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200
            resize-y min-h-[200px]
            font-sans leading-relaxed
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}
          `}
          spellCheck="false"
        />

        <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-mono">
          {wordCount} {getWordForm(wordCount)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <Hint icon="💡" text="Записывайте все этапы решения" />
        <Hint icon="📐" text="Обосновывайте каждый шаг" />
        {isProof && <Hint icon="✓" text="Укажите, что требовалось доказать" />}
      </div>

      <div className="mt-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
        <div className="flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-violet-600 font-sans">
            Это задание требует развернутого ответа и будет проверено вручную. Постарайтесь
            максимально подробно объяснить ход решения.
          </p>
        </div>
      </div>
    </div>
  );
};

const Hint: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-500 font-sans">
    <span>{icon}</span>
    <span>{text}</span>
  </div>
);

function getWordForm(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'слов';
  }

  if (lastDigit === 1) {
    return 'слово';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'слова';
  }

  return 'слов';
}
