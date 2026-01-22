/**
 * Exam Page
 * Главная страница прохождения экзамена с новой архитектурой
 *
 * Использует:
 * - Factory pattern для создания экзаменов
 * - Strategy pattern для валидации ответов
 * - Custom hooks для управления состоянием
 * - Компонентную архитектуру с разделением ответственности
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// Core
import { ExamFactory } from '../core/factories';
import { IExam } from '../core/interfaces';
import { ExamType, Subject, Grade, TestResults } from '../core/types';
import { MESSAGES } from '../core/constants';

// Hooks
import { useTimer } from '../hooks/useTimer';
import { useTestSession } from '../hooks/useTestSession';

// Components
import { ExamHeader, TaskNavigation, TaskCard, ExamResults } from '../components/exam';
import { Button } from '../components/Button';

interface LocationState {
  grade: Grade;
  subject: Subject;
  egeType?: 'profile' | 'base';
}

/**
 * Страница экзамена
 */
export default function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // Состояние
  const [exam, setExam] = useState<IExam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResults | null>(null);

  // Определяем тип экзамена
  const examType = useMemo((): ExamType => {
    if (!state) return 'REGULAR';
    if (state.grade === 9) return 'OGE';
    if (state.grade === 11) {
      return state.egeType === 'base' ? 'EGE_BASE' : 'EGE_PROFILE';
    }
    return 'REGULAR';
  }, [state]);

  // Загрузка экзамена
  useEffect(() => {
    if (!state?.grade || !state?.subject) {
      setError('Некорректные параметры');
      setIsLoading(false);
      return;
    }

    try {
      const factory = ExamFactory.getInstance();
      const loadedExam = factory.create(examType, state.subject, state.grade);
      setExam(loadedExam);
      setError(null);
    } catch (err) {
      setError(MESSAGES.ERROR_LOADING_EXAM);
      console.error('Ошибка загрузки экзамена:', err);
    } finally {
      setIsLoading(false);
    }
  }, [state, examType]);

  // Показываем загрузку
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Показываем ошибку
  if (error || !exam) {
    return <ErrorScreen error={error || 'Экзамен не найден'} onBack={() => navigate('/dashboard')} />;
  }

  // Показываем результаты
  if (results) {
    return (
      <ExamResults
        results={results}
        examTitle={exam.title}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Основной экзамен
  return (
    <ExamContent
      exam={exam}
      onComplete={(res) => {
        setResults(res);
        toast.success(MESSAGES.TEST_COMPLETED);
      }}
      onTimeExpired={() => {
        toast.error(MESSAGES.TIME_EXPIRED);
      }}
    />
  );
}

/**
 * Основной контент экзамена
 */
interface ExamContentProps {
  exam: IExam;
  onComplete: (results: TestResults) => void;
  onTimeExpired: () => void;
}

const ExamContent: React.FC<ExamContentProps> = ({ exam, onComplete, onTimeExpired }) => {
  // Хук тестовой сессии
  const {
    currentTask,
    currentTaskIndex,
    isFirstTask,
    isLastTask,
    goToTask,
    nextTask,
    previousTask,
    submitAnswer,
    getAnswer,
    progress,
    answeredCount,
    totalTasks,
    complete,
    expireTime,
    getTaskStatus,
  } = useTestSession({
    exam,
    autoSave: true,
    onComplete,
    onTimeExpired,
  });

  // Хук таймера
  const {
    timeLeft,
    status: timerStatus,
    start: startTimer,
  } = useTimer(0, {
    onComplete: () => {
      const results = expireTime();
      onComplete(results);
    },
    onWarning: () => {
      toast('Осталось 25% времени!', { icon: '⚠️' });
    },
    onCritical: () => {
      toast.error('Осталось менее 10% времени!');
    },
  });

  // Запуск таймера при монтировании
  useEffect(() => {
    startTimer(exam.getDurationInSeconds());
  }, [exam, startTimer]);

  // Текущий ответ
  const currentAnswer = useMemo(() => {
    if (!currentTask) return '';
    const answer = getAnswer(currentTask.number);
    return answer?.value || '';
  }, [currentTask, getAnswer]);

  // Обработчик ответа
  const handleAnswer = useCallback((answer: string) => {
    submitAnswer(answer);
  }, [submitAnswer]);

  // Обработчик завершения
  const handleFinish = useCallback(() => {
    if (answeredCount < totalTasks) {
      const confirmed = window.confirm(MESSAGES.UNANSWERED_WARNING);
      if (!confirmed) return;
    }

    const results = complete();
    onComplete(results);
  }, [answeredCount, totalTasks, complete, onComplete]);

  // Обработчик выбора задания
  const handleTaskSelect = useCallback((taskNumber: number) => {
    goToTask(taskNumber);
  }, [goToTask]);

  if (!currentTask) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Фоновая сетка */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      {/* Заголовок */}
      <ExamHeader
        title={exam.title}
        subtitle={`${exam.grade} класс`}
        timeLeft={timeLeft}
        timerStatus={timerStatus}
        currentTask={currentTaskIndex + 1}
        totalTasks={totalTasks}
        progress={progress}
      />

      {/* Основной контент */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Карточка задания */}
        <TaskCard
          task={currentTask}
          currentAnswer={currentAnswer}
          onAnswer={handleAnswer}
          onPrevious={previousTask}
          onNext={nextTask}
          onFinish={handleFinish}
          isFirst={isFirstTask}
          isLast={isLastTask}
        />

        {/* Навигация по заданиям */}
        <div className="mt-6">
          <TaskNavigation
            tasks={exam.tasks}
            currentTaskNumber={currentTask.number}
            getTaskStatus={getTaskStatus}
            onTaskSelect={handleTaskSelect}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Экран загрузки
 */
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-400 font-sans">Загрузка экзамена...</p>
    </div>
  </div>
);

/**
 * Экран ошибки
 */
const ErrorScreen: React.FC<{ error: string; onBack: () => void }> = ({ error, onBack }) => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">😕</div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">Ошибка</h1>
      <p className="text-gray-400 font-sans mb-6">{error}</p>
      <Button onClick={onBack}>Вернуться к панели</Button>
    </div>
  </div>
);
