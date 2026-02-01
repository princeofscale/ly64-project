import { useState, useCallback, useMemo } from 'react';

import { SUBJECT_NAMES, EXAM_CONFIG } from '../core/constants';
import { ExamFactory, ExamNotFoundError } from '../core/factories';

import type { IExam } from '../core/interfaces';
import type { ExamType, Subject, Grade } from '../core/types';

interface UseExamOptions {
  subject: Subject;
  grade: Grade;
  examType?: ExamType;
}

interface UseExamReturn {
  exam: IExam | null;
  isLoading: boolean;
  error: string | null;
  title: string;
  description: string;
  duration: number;
  formattedDuration: string;
  taskCount: number;
  maxPoints: number;
  availableExamTypes: ExamType[];
  isExamAvailable: boolean;
  loadExam: (type?: ExamType) => void;
  changeExamType: (type: ExamType) => void;
}

export function useExam(options: UseExamOptions): UseExamReturn {
  const { subject, grade, examType } = options;

  const factory = useMemo(() => ExamFactory.getInstance(), []);
  const [exam, setExam] = useState<IExam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<ExamType | undefined>(examType);

  const availableExamTypes = useMemo(() => {
    return factory.getAvailableExamTypes(subject, grade);
  }, [factory, subject, grade]);

  const isExamAvailable = useMemo(() => {
    if (!currentType) return availableExamTypes.length > 0;
    return factory.isExamAvailable(currentType, subject, grade);
  }, [factory, currentType, subject, grade, availableExamTypes]);

  const loadExam = useCallback(
    (type?: ExamType) => {
      setIsLoading(true);
      setError(null);

      try {
        const targetType = type || currentType || availableExamTypes[0];
        if (!targetType) {
          throw new Error('Нет доступных типов экзаменов');
        }

        const loadedExam = factory.create(targetType, subject, grade);
        setExam(loadedExam);
        setCurrentType(targetType);
      } catch (err) {
        if (err instanceof ExamNotFoundError) {
          setError(err.message);
        } else {
          setError('Ошибка загрузки экзамена');
        }
        setExam(null);
      } finally {
        setIsLoading(false);
      }
    },
    [factory, subject, grade, currentType, availableExamTypes]
  );

  const changeExamType = useCallback(
    (type: ExamType) => {
      setCurrentType(type);
      loadExam(type);
    },
    [loadExam]
  );

  const title = useMemo(() => {
    if (exam) return exam.title;
    if (currentType) {
      return `${EXAM_CONFIG[currentType].title} ${SUBJECT_NAMES[subject]}`;
    }
    return SUBJECT_NAMES[subject];
  }, [exam, currentType, subject]);

  const description = useMemo(() => {
    if (exam && 'getDescription' in exam) {
      return (exam as any).getDescription();
    }
    return '';
  }, [exam]);

  const duration = useMemo(() => {
    if (exam) return exam.duration;
    if (currentType) return EXAM_CONFIG[currentType].duration;
    return 30;
  }, [exam, currentType]);

  const formattedDuration = useMemo(() => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours} ч ${minutes} мин`;
    } else if (hours > 0) {
      return `${hours} ч`;
    }
    return `${minutes} мин`;
  }, [duration]);

  const taskCount = exam?.tasks.length ?? 0;
  const maxPoints = exam?.maxPoints ?? 0;

  return {
    exam,
    isLoading,
    error,
    title,
    description,
    duration,
    formattedDuration,
    taskCount,
    maxPoints,
    availableExamTypes,
    isExamAvailable,
    loadExam,
    changeExamType,
  };
}

export function useOGEMath() {
  return useExam({
    subject: 'MATHEMATICS',
    grade: 9,
    examType: 'OGE',
  });
}

export function useEGEProfileMath() {
  return useExam({
    subject: 'MATHEMATICS',
    grade: 11,
    examType: 'EGE_PROFILE',
  });
}

export function useEGEBaseMath() {
  return useExam({
    subject: 'MATHEMATICS',
    grade: 11,
    examType: 'EGE_BASE',
  });
}
