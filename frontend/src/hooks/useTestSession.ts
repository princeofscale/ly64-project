import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { TestSession } from '../core/models';
import { TestSessionStorage } from '../core/services';

import type { IExam, ITask } from '../core/interfaces';
import type { SavedTestSession } from '../core/services';
import type { TestStatus, UserAnswer, TestResults } from '../core/types';

interface UseTestSessionOptions {
  exam: IExam;
  autoSave?: boolean;
  restoreSession?: boolean;
  sessionMetadata?: Partial<SavedTestSession>;
  onComplete?: (results: TestResults) => void;
  onTimeExpired?: () => void;
  onSessionRestored?: () => void;
}

interface UseTestSessionReturn {
  session: TestSession;
  status: TestStatus;
  currentTask: ITask | undefined;
  currentTaskIndex: number;
  isFirstTask: boolean;
  isLastTask: boolean;
  goToTask: (taskNumber: number) => void;
  nextTask: () => void;
  previousTask: () => void;
  submitAnswer: (answer: string) => void;
  getAnswer: (taskNumber: number) => UserAnswer | undefined;
  isTaskAnswered: (taskNumber: number) => boolean;
  progress: number;
  answeredCount: number;
  totalTasks: number;
  complete: () => TestResults;
  expireTime: () => TestResults;
  pause: () => void;
  resume: () => void;
  getTaskStatus: (taskNumber: number) => 'current' | 'answered' | 'unanswered' | 'flagged';
}

export function useTestSession(options: UseTestSessionOptions): UseTestSessionReturn {
  const {
    exam,
    autoSave = true,
    restoreSession = true,
    sessionMetadata,
    onComplete,
    onTimeExpired,
    onSessionRestored,
  } = options;

  const storage = useMemo(() => new TestSessionStorage(), []);
  const isInitialized = useRef(false);

  // Попытка восстановить сессию или создать новую
  const [session] = useState(() => {
    if (restoreSession) {
      const savedData = storage.loadSessionData();
      if (savedData) {
        try {
          const restored = TestSession.deserialize(savedData, exam);
          console.log('[useTestSession] Сессия восстановлена из localStorage');
          return restored;
        } catch (e) {
          console.warn('[useTestSession] Не удалось восстановить сессию:', e);
          storage.clearSession();
        }
      }
    }
    return new TestSession(exam);
  });

  const [, forceUpdate] = useState({});

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Функция сохранения сессии
  const saveSession = useCallback(() => {
    if (session.status === 'in_progress' || session.status === 'paused') {
      const serialized = session.serialize();
      storage.saveSession(serialized, {
        examId: exam.id,
        examType: exam.type,
        subject: exam.subject,
        grade: exam.grade,
        ...sessionMetadata,
      });
    }
  }, [session, storage, exam, sessionMetadata]);

  // Инициализация и автосохранение
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Проверяем была ли сессия восстановлена
      const savedSession = storage.loadSession();
      if (savedSession && onSessionRestored) {
        onSessionRestored();
      }
    }

    if (autoSave) {
      // Сохраняем при первой загрузке
      saveSession();

      // Запускаем автосохранение каждые 5 секунд
      storage.startAutoSave(saveSession);

      // Сохраняем при закрытии страницы
      const handleBeforeUnload = () => {
        saveSession();
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Сохраняем при потере фокуса (переключение вкладки)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          saveSession();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        storage.stopAutoSave();
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [autoSave, saveSession, storage, onSessionRestored]);

  const currentTask = session.getCurrentTask();
  const currentTaskIndex = session.getCurrentTaskIndex();

  const goToTask = useCallback(
    (taskNumber: number) => {
      session.goToTask(taskNumber);
      triggerUpdate();
    },
    [session, triggerUpdate]
  );

  const nextTask = useCallback(() => {
    session.nextTask();
    triggerUpdate();
  }, [session, triggerUpdate]);

  const previousTask = useCallback(() => {
    session.previousTask();
    triggerUpdate();
  }, [session, triggerUpdate]);

  const submitAnswer = useCallback(
    (answer: string) => {
      const task = session.getCurrentTask();
      if (task) {
        session.submitAnswer(task.number, answer);
        if (autoSave) {
          // Сохраняем ответы сразу
          storage.backupAnswers(session.getAllAnswers() as Map<number, unknown>);
          // Сохраняем всю сессию
          saveSession();
        }
        triggerUpdate();
      }
    },
    [session, autoSave, storage, triggerUpdate, saveSession]
  );

  const getAnswer = useCallback(
    (taskNumber: number) => {
      return session.getAnswer(taskNumber);
    },
    [session]
  );

  const isTaskAnswered = useCallback(
    (taskNumber: number) => {
      return session.isTaskAnswered(taskNumber);
    },
    [session]
  );

  const progress = session.getProgress();
  const answeredCount = session.getAnsweredCount();
  const totalTasks = exam.tasks.length;

  const complete = useCallback(() => {
    const results = session.complete();
    storage.clearSession();
    if (onComplete) {
      onComplete(results);
    }
    triggerUpdate();
    return results;
  }, [session, storage, onComplete, triggerUpdate]);

  const expireTime = useCallback(() => {
    const results = session.expireTime();
    storage.clearSession();
    if (onTimeExpired) {
      onTimeExpired();
    }
    triggerUpdate();
    return results;
  }, [session, storage, onTimeExpired, triggerUpdate]);

  const pause = useCallback(() => {
    session.pause();
    triggerUpdate();
  }, [session, triggerUpdate]);

  const resume = useCallback(() => {
    session.resume();
    triggerUpdate();
  }, [session, triggerUpdate]);

  const getTaskStatus = useCallback(
    (taskNumber: number): 'current' | 'answered' | 'unanswered' | 'flagged' => {
      if (session.isCurrentTask(taskNumber)) {
        return 'current';
      }
      const answer = session.getAnswer(taskNumber);
      if (!answer) {
        return 'unanswered';
      }
      if (answer.status === 'flagged') {
        return 'flagged';
      }
      if (answer.value.trim()) {
        return 'answered';
      }
      return 'unanswered';
    },
    [session]
  );

  return {
    session,
    status: session.status,
    currentTask,
    currentTaskIndex,
    isFirstTask: session.isFirstTask(),
    isLastTask: session.isLastTask(),
    goToTask,
    nextTask,
    previousTask,
    submitAnswer,
    getAnswer,
    isTaskAnswered,
    progress,
    answeredCount,
    totalTasks,
    complete,
    expireTime,
    pause,
    resume,
    getTaskStatus,
  };
}
