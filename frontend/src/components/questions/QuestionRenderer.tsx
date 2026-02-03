/**
 * Question Renderer
 * Паттерн Strategy для рендеринга различных типов вопросов
 */

import React from 'react';

import { ChoiceQuestion } from './ChoiceQuestion';
import { DetailedQuestion } from './DetailedQuestion';
import { ShortAnswerQuestion } from './ShortAnswerQuestion';

import type { ITask } from '../../core/interfaces';

interface QuestionRendererProps {
  task: ITask;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

/**
 * Компонент для рендеринга вопросов в зависимости от типа
 */
export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  task,
  currentAnswer,
  onAnswer,
  disabled = false,
}) => {
  const renderQuestion = () => {
    switch (task.type) {
      case 'choice':
      case 'multiple_choice':
        return (
          <ChoiceQuestion
            task={task}
            currentAnswer={currentAnswer}
            onAnswer={onAnswer}
            disabled={disabled}
            multiple={task.type === 'multiple_choice'}
          />
        );

      case 'detailed':
      case 'proof':
        return (
          <DetailedQuestion
            task={task}
            currentAnswer={currentAnswer}
            onAnswer={onAnswer}
            disabled={disabled}
            isProof={task.type === 'proof'}
          />
        );

      case 'short':
      case 'matching':
      default:
        return (
          <ShortAnswerQuestion
            task={task}
            currentAnswer={currentAnswer}
            onAnswer={onAnswer}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Текст задания */}
      <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
        <p className="text-lg text-gray-200 font-sans whitespace-pre-line leading-relaxed">
          {task.getDisplayText()}
        </p>
      </div>

      {/* Поле для ответа */}
      <div className="mt-6">{renderQuestion()}</div>
    </div>
  );
};

/**
 * HOC для добавления общих стилей к вопросам
 */
export function withQuestionStyles<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const WithStyles: React.FC<P> = (props: P) => (
    <div className="transition-all duration-200">
      <WrappedComponent {...props} />
    </div>
  );

  WithStyles.displayName = `withQuestionStyles(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithStyles;
}
