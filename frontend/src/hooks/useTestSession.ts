import { useState, useCallback, useMemo, useEffect } from 'react';
import { TestSession } from '../core/models';
import { IExam, ITask } from '../core/interfaces';
import { TestStatus, UserAnswer, TestResults } from '../core/types';
import { TestSessionStorage } from '../core/services';

interface UseTestSessionOptions {
  exam: IExam;
  autoSave?: boolean;
  onComplete?: (results: TestResults) => void;
  onTimeExpired?: () => void;
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
  const { exam, autoSave = true, onComplete, onTimeExpired } = options;

  const [session] = useState(() => new TestSession(exam));
  const [, forceUpdate] = useState({});
  const storage = useMemo(() => new TestSessionStorage(), []);

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    if (autoSave && session.status === 'in_progress') {
      const serialized = session.serialize();
      storage.saveSession(serialized);
    }
  }, [session, autoSave, storage, session.status]);

  const currentTask = session.getCurrentTask();
  const currentTaskIndex = session.getCurrentTaskIndex();

  const goToTask = useCallback((taskNumber: number) => {
    session.goToTask(taskNumber);
    triggerUpdate();
  }, [session, triggerUpdate]);

  const nextTask = useCallback(() => {
    session.nextTask();
    triggerUpdate();
  }, [session, triggerUpdate]);

  const previousTask = useCallback(() => {
    session.previousTask();
    triggerUpdate();
  }, [session, triggerUpdate]);

  const submitAnswer = useCallback((answer: string) => {
    const task = session.getCurrentTask();
    if (task) {
      session.submitAnswer(task.number, answer);
      if (autoSave) {
        storage.backupAnswers(session.getAllAnswers() as Map<number, unknown>);
      }
      triggerUpdate();
    }
  }, [session, autoSave, storage, triggerUpdate]);

  const getAnswer = useCallback((taskNumber: number) => {
    return session.getAnswer(taskNumber);
  }, [session]);

  const isTaskAnswered = useCallback((taskNumber: number) => {
    return session.isTaskAnswered(taskNumber);
  }, [session]);

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

  const getTaskStatus = useCallback((taskNumber: number): 'current' | 'answered' | 'unanswered' | 'flagged' => {
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
  }, [session]);

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
