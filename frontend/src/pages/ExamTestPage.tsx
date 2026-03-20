import { SUBJECT_LABELS } from '@lyceum64/shared';
import DOMPurify from 'dompurify';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { BookmarkButton } from '../components/BookmarkButton';
import { Button } from '../components/Button';
import { CommentSection } from '../components/CommentSection';
import CoordinateLine from '../components/sdamgia/CoordinateLine';
import TestErrorAnalysis from '../components/TestErrorAnalysis';
import { TheoryDrawer } from '../components/theory';
import { getActiveTestService } from '../core/services';
import { ConfettiService } from '../core/services/ConfettiService';
import { AnswerValidationStrategyFactory } from '../core/strategies/AnswerValidationStrategies';
import { findTheoryForTask } from '../data/theory/theoryLookup';
import { analyzeTestErrors } from '../data/topicAdvice';
import api from '../services/api';
import testService from '../services/testService';
import { exportTestResultPDF } from '../utils/pdfExport';

import type { TheoryTopic } from '../data/theory/types';
import type { AnalyzedQuestion } from '../data/topicAdvice';
import type { TestVariant } from '../services/testService';

interface Task {
  id: string;
  number: number;
  text: string;
  type: 'short' | 'choice' | 'matching' | 'multiple_choice' | 'detailed' | 'proof';
  options?: string[];
  correctAnswer: string;
  points: number;
  topic: string;
  detailedSolution?: boolean;
  requiresProof?: boolean;
}

/** Detect if a task requires an interactive coordinate line input */
function isCoordinateLineTask(task: Task): boolean {
  if (task.type !== 'short') return false;
  const text = task.text.toLowerCase().replace(/<[^>]+>/g, ' ');
  const hasCoordLine = /координатн\w*\s+прям|числов\w*\s+прям/.test(text);
  const hasMarkAction = /отметь|постав|нанес|изобраз|укажи|найди\w*\s+точк|определи\w*\s+координат|поставь|отмеч/.test(text);
  return hasCoordLine && hasMarkAction;
}

/** Estimate coordinate range from the correct answer and task text */
function getCoordRange(task: Task): [number, number] {
  const stripped = task.text.replace(/<[^>]+>/g, ' ');
  const nums: number[] = [];

  // Parse correct answer
  const answer = parseFloat(task.correctAnswer.replace(',', '.'));
  if (!isNaN(answer)) nums.push(answer);

  // Extract numbers mentioned in text (reference points like A(2), B(-3.5), etc.)
  const refPattern = /[A-ZА-ЯЁa-zа-яё]\s*\(\s*([−–-]?\s*\d+(?:[.,]\d+)?)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = refPattern.exec(stripped)) !== null) {
    const val = parseFloat(m[1]!.replace(/[−–]/g, '-').replace(',', '.').replace(/\s/g, ''));
    if (!isNaN(val)) nums.push(val);
  }

  if (nums.length === 0) return [-5, 7];

  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return [Math.floor(lo) - 3, Math.ceil(hi) + 3];
}

/** Parse labeled reference points from task HTML (e.g. A(2), B(-3)) */
function parseTaskReferencePoints(task: Task): Array<{ value: number; label: string }> {
  const text = task.text.replace(/<[^>]+>/g, ' ');
  const points: Array<{ value: number; label: string }> = [];
  const seen = new Set<string>();

  const pattern = /([A-ZА-ЯЁ])\s*\(\s*([−–-]?\s*\d+(?:[.,]\d+)?)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const label = m[1]!.toUpperCase();
    if (seen.has(label)) continue;
    const val = parseFloat(m[2]!.replace(/[−–]/g, '-').replace(',', '.').replace(/\s/g, ''));
    if (!isNaN(val)) {
      points.push({ value: val, label });
      seen.add(label);
    }
  }
  return points;
}

export default function ExamTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade, subject, egeType, examMode } = location.state || {};

  const [examVariant, setExamVariant] = useState<TestVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tasks = (examVariant?.tasks as Task[]) || [];

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isTestRegistered, setIsTestRegistered] = useState(false);
  const [taskTimeSpent, setTaskTimeSpent] = useState<Record<string, number>>({});
  const [taskEnteredAt, setTaskEnteredAt] = useState<number>(Date.now());
  const [theoryTopic, setTheoryTopic] = useState<TheoryTopic | null>(null);
  // Used to track tab switches in exam mode
  const [, setTabSwitchCount] = useState(0);
  interface TestResults {
    score: number;
    correctCount: number;
    totalQuestions: number;
    questionResults?: Array<{
      number: number;
      userAnswer: string | null;
      correctAnswer: string;
      isCorrect: boolean;
      points: number;
      topic: string;
    }>;
  }
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTestData = async () => {
      if (!grade || !subject) {
        if (mounted) {
          setError('Не указаны параметры теста');
          setLoading(false);
        }
        return;
      }

      try {
        if (mounted) setLoading(true);

        let apiExamType: string;
        if (grade === 8 || grade === 10) {
          apiExamType = 'VPR';
        } else if (grade === 9) {
          apiExamType = 'OGE';
        } else if (grade === 11) {
          if (subject === 'MATHEMATICS') {
            apiExamType = egeType === 'base' ? 'EGE_BASE' : 'EGE_PROFILE';
          } else {
            apiExamType = 'EGE';
          }
        } else {
          apiExamType = 'REGULAR';
        }

        const variant = await testService.getTestVariant(subject, apiExamType, grade);

        if (!mounted) return;

        if (variant) {
          setExamVariant(variant);
          if (variant.duration && variant.duration > 0) {
            setTimeLeft(variant.duration * 60);
          } else {
            setTimeLeft(180 * 60);
          }
          setError(null);
        } else {
          setError('Тест не найден. Убедитесь, что вы авторизованы.');
        }
      } catch {
        if (mounted) setError('Ошибка загрузки теста');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadTestData();
    return () => { mounted = false; };
  }, [grade, subject, egeType]);

  const currentTask = tasks[currentTaskIndex];
  const progress = tasks.length > 0 ? ((currentTaskIndex + 1) / tasks.length) * 100 : 0;
  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

  const examTitle = useMemo(() => {
    const subjectName = subject
      ? SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS] || subject
      : 'Предмет';
    if (grade === 8) return `ВПР ${subjectName}`;
    if (grade === 9) return `ОГЭ ${subjectName}`;
    if (grade === 10) return `ВПР ${subjectName}`;
    if (grade === 11 && egeType === 'profile') return `ЕГЭ ${subjectName} (Профильный)`;
    if (grade === 11 && egeType === 'base') return `ЕГЭ ${subjectName} (Базовый)`;
    if (grade === 11) return `ЕГЭ ${subjectName}`;
    return subjectName;
  }, [grade, subject, egeType]);

  const examType = useMemo(() => {
    if (grade === 8 || grade === 10) return 'VPR' as const;
    if (grade === 9) return 'OGE' as const;
    if (grade === 11) {
      if (subject === 'MATHEMATICS') {
        return egeType === 'base' ? ('EGE_BASE' as const) : ('EGE_PROFILE' as const);
      }
      return 'EGE' as const;
    }
    return 'REGULAR' as const;
  }, [grade, subject, egeType]);

  useEffect(() => {
    if (!grade || !subject || !examVariant) return;

    const activeTestService = getActiveTestService();

    if (!isTestRegistered && examVariant.duration) {
      activeTestService.startTest({
        examType,
        subject: subject || 'MATHEMATICS',
        grade: grade as 8 | 9 | 10 | 11,
        title: examTitle,
        startedAt: new Date().toISOString(),
        currentTaskIndex: 0,
        answeredCount: 0,
        totalTasks: tasks.length,
        timeLeftSeconds: examVariant.duration * 60,
        route: '/test/oge-ege',
      });
      setIsTestRegistered(true);
    }
  }, [grade, subject, isTestRegistered, examVariant, tasks.length, examTitle, examType]);

  useEffect(() => {
    const activeTestService = getActiveTestService();
    activeTestService.updateProgress({
      currentTaskIndex,
      answeredCount,
      timeLeftSeconds: timeLeft,
    });
  }, [currentTaskIndex, answeredCount, timeLeft]);

  const validateAnswer = useCallback((taskType: string, userAnswer: string, correctAnswer: string): boolean => {
    const strategy = AnswerValidationStrategyFactory.getStrategy(taskType);
    return strategy.validate(userAnswer, correctAnswer);
  }, []);

  const calculateScore = useCallback(() => {
    const totalPoints = Object.entries(answers).reduce((sum, [num, ans]) => {
      const task = tasks.find(t => t.number === parseInt(num));
      if (task && validateAnswer(task.type, ans, task.correctAnswer)) {
        return sum + task.points;
      }
      return sum;
    }, 0);
    const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    return Math.round((totalPoints / maxPoints) * 100);
  }, [answers, tasks, validateAnswer]);

  const handleFinish = useCallback(async () => {
    if (!examVariant) return;

    try {
      // Format answers for API
      // Record time for the current task before submitting
      const finalTimeSpent = { ...taskTimeSpent };
      if (currentTask) {
        const elapsed = Date.now() - taskEnteredAt;
        finalTimeSpent[currentTask.id] = (finalTimeSpent[currentTask.id] || 0) + elapsed;
      }

      const formattedAnswers = Object.entries(answers).map(([num, ans]) => {
        const task = tasks.find(t => t.number === parseInt(num));
        return {
          questionId: task?.id || '',
          answer: ans,
          timeSpent: task ? (finalTimeSpent[task.id] || 0) : 0,
          timestamp: Date.now(),
        };
      });

      const questionsOrder = tasks.map(t => t.id);

      // Submit test to server
      const result = await testService.submitTest(
        examVariant.testId,
        formattedAnswers,
        questionsOrder
      );

      if (result.success) {
        setTestResults(result.data);
      }

      const activeTestService = getActiveTestService();
      activeTestService.completeTest();
      setShowResults(true);

      const scorePercent = calculateScore();
      setTimeout(() => {
        ConfettiService.scoreBasedCelebration(scorePercent);
      }, 300);

      toast.success('Тест завершен!');
    } catch {
      toast.error('Ошибка отправки теста. Попробуйте ещё раз.');
    }
  }, [calculateScore, examVariant, answers, tasks]);

  // Keep a stable ref so the timer always calls the latest handleFinish
  const handleFinishRef = useRef(handleFinish);
  useEffect(() => { handleFinishRef.current = handleFinish; }, [handleFinish]);

  useEffect(() => {
    // Don't start timer until test data is loaded and time is set
    if (!examVariant || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleFinishRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!examVariant, timeLeft > 0]);

  // Exam mode: fullscreen, tab switch detection, back prevention
  useEffect(() => {
    if (!examMode || showResults) return;

    // Request fullscreen
    const requestFullscreen = () => {
      document.documentElement.requestFullscreen?.().catch(() => {
        // Fullscreen not supported or denied
      });
    };
    requestFullscreen();

    // Prevent tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          toast.error(`Вы переключили вкладку! (${newCount} раз)`, {
            icon: '⚠️',
            duration: 3000,
          });
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Prevent back navigation
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      toast.error('В режиме экзамена нельзя вернуться назад', { icon: '🔒' });
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    // Prevent page close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [examMode, showResults]);

  // Exam mode: vibrate when less than 5 minutes
  useEffect(() => {
    if (!examMode || showResults) return;
    if (timeLeft === 300) {
      toast.error('Осталось 5 минут!', { icon: '⏰', duration: 5000 });
      navigator.vibrate?.(1000);
    }
  }, [examMode, timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    if (!currentTask) return;
    setAnswers(prev => ({
      ...prev,
      [currentTask.number]: answer,
    }));
  };

  const recordTimeForCurrentTask = useCallback(() => {
    if (!currentTask) return;
    const elapsed = Date.now() - taskEnteredAt;
    setTaskTimeSpent(prev => ({
      ...prev,
      [currentTask.id]: (prev[currentTask.id] || 0) + elapsed,
    }));
    setTaskEnteredAt(Date.now());
  }, [currentTask, taskEnteredAt]);

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      recordTimeForCurrentTask();
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      recordTimeForCurrentTask();
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    const activeTestService = getActiveTestService();
    activeTestService.abandonTest();
    toast('Тест прерван', { icon: '⚠️' });
    void navigate('/dashboard');
  };

  const getTimeColor = () => {
    const totalTime = (examVariant?.duration || 180) * 60;
    if (examMode) {
      if (timeLeft <= totalTime * 0.1) return 'text-red-600 animate-pulse';
      if (timeLeft <= totalTime * 0.25) return 'text-red-600';
      if (timeLeft <= totalTime * 0.5) return 'text-amber-600';
      return 'text-blue-600';
    }
    if (timeLeft > totalTime * 0.5) return 'text-blue-600';
    if (timeLeft > totalTime * 0.25) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
        </div>
      </div>
    );
  }

  if (error || !examVariant || tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="font-sans mb-4" style={{ color: 'var(--color-text-secondary)' }}>{error || (tasks.length === 0 ? 'В тесте нет заданий' : 'Тест не найден')}</p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Попробуйте выбрать другой вариант или вернитесь к панели.
          </p>
          <Button onClick={() => void navigate('/dashboard')}>Вернуться к панели</Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    // Use results from server if available, otherwise calculate locally
    const correctCount =
      testResults?.correctCount ??
      Object.entries(answers).filter(([num, ans]) => {
        const task = tasks.find(t => t.number === parseInt(num));
        return task ? validateAnswer(task.type, ans, task.correctAnswer) : false;
      }).length;

    const totalPoints =
      (testResults?.questionResults?.reduce((sum: number, qr: { points: number }) => sum + (qr.points || 0), 0)) ??
      Object.entries(answers).reduce((sum, [num, ans]) => {
        const task = tasks.find(t => t.number === parseInt(num));
        if (task && validateAnswer(task.type, ans, task.correctAnswer)) {
          return sum + task.points;
        }
        return sum;
      }, 0);

    const maxPoints =
      testResults?.totalQuestions ?? tasks.reduce((sum, task) => sum + task.points, 0);
    const scorePercent = testResults?.score ?? Math.round((totalPoints / maxPoints) * 100);

    const getScoreEmoji = () => {
      if (scorePercent >= 90) return '🏆';
      if (scorePercent >= 80) return '🎉';
      if (scorePercent >= 70) return '👏';
      if (scorePercent >= 60) return '👍';
      return '💪';
    };

    const getScoreMessage = () => {
      if (scorePercent >= 90) return 'Превосходно!';
      if (scorePercent >= 80) return 'Отлично!';
      if (scorePercent >= 70) return 'Хорошо!';
      if (scorePercent >= 60) return 'Неплохо!';
      return 'Есть над чем поработать';
    };

    // Build analyzed questions for error analysis
    const questionResults = testResults?.questionResults || tasks.map(task => ({
      number: task.number,
      userAnswer: answers[task.number] || null,
      correctAnswer: task.correctAnswer,
      isCorrect: answers[task.number] ? validateAnswer(task.type, answers[task.number] ?? '', task.correctAnswer) : false,
      points: task.points,
      topic: task.topic,
    }));

    const analyzedQuestions: AnalyzedQuestion[] = questionResults.map(
      (qr: { number: number; userAnswer: string | null; correctAnswer: string; isCorrect: boolean; points: number; topic: string }) => ({
        number: qr.number,
        topic: qr.topic || '',
        isCorrect: qr.isCorrect,
        userAnswer: qr.userAnswer,
        correctAnswer: qr.correctAnswer,
        points: qr.points,
      })
    );

    const errorAnalysis = analyzeTestErrors(
      (subject as string) || 'MATHEMATICS',
      examType,
      (grade as number) || 9,
      analyzedQuestions
    );

    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="backdrop-blur-xl border rounded-3xl p-8 text-center shadow-2xl" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h1 className="text-4xl font-display font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {getScoreMessage()}
            </h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Тест завершен</p>

            <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary, var(--color-surface))' }}>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {scorePercent}%
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden mb-4" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    scorePercent >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : scorePercent >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {correctCount}/{tasks.length}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>правильных ответов</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-violet-600">
                    {totalPoints}/{maxPoints}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>первичных баллов</div>
                </div>
              </div>
            </div>

            {/* Детальный разбор заданий */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-left" style={{ color: 'var(--color-text)' }}>Детальный разбор</h2>
              <div className="space-y-3">
                {(
                  testResults?.questionResults ||
                  tasks.map(task => ({
                    number: task.number,
                    userAnswer: answers[task.number] || null,
                    correctAnswer: task.correctAnswer,
                    isCorrect: answers[task.number] ? validateAnswer(task.type, answers[task.number] ?? '', task.correctAnswer) : false,
                    points: task.points,
                    topic: task.topic,
                  }))
                ).map((result: { number: number; userAnswer: string | null; correctAnswer: string; isCorrect: boolean; points: number; topic: string }) => {
                  const isAnswered = result.userAnswer !== null && result.userAnswer !== '';

                  return (
                    <div
                      key={result.number}
                      className={`p-4 rounded-xl border-2 ${
                        result.isCorrect
                          ? 'bg-green-50 border-green-200'
                          : isAnswered
                            ? 'bg-red-50 border-red-200'
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`text-2xl ${result.isCorrect ? '' : isAnswered ? '' : 'opacity-50'}`}
                            >
                              {result.isCorrect ? '✓' : isAnswered ? '✗' : '○'}
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                                Задание {result.number}
                                {result.topic && !result.topic.match(/^(Д?\d+|[0-9]+)$/) && (
                                  <span className="text-sm ml-2" style={{ color: 'var(--color-text-muted)' }}>
                                    ({result.topic})
                                  </span>
                                )}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {result.points || 1}{' '}
                                {result.points === 1
                                  ? 'балл'
                                  : (result.points || 1) < 5
                                    ? 'балла'
                                    : 'баллов'}
                              </div>
                            </div>
                          </div>

                          <div className="ml-11 space-y-2 text-sm">
                            {isAnswered && (
                              <div>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Ваш ответ:</span>{' '}
                                <span
                                  className={
                                    result.isCorrect
                                      ? 'text-green-600 font-medium'
                                      : 'text-red-600 font-medium'
                                  }
                                >
                                  {result.userAnswer}
                                </span>
                              </div>
                            )}
                            {!result.isCorrect && (
                              <div>
                                <span style={{ color: 'var(--color-text-secondary)' }}>Правильный ответ:</span>{' '}
                                <span className="text-green-600 font-medium">
                                  {result.correctAnswer}
                                </span>
                              </div>
                            )}
                            {!isAnswered && <div className="text-slate-600 italic">Не отвечено</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <BookmarkButton questionId={tasks.find(t => t.number === result.number)?.id || ''} size={16} />
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              result.isCorrect
                                ? 'bg-green-100 text-green-700'
                                : isAnswered
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {result.isCorrect ? `+${result.points || 1}` : '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => { void navigate('/dashboard'); }}>К панели управления</Button>
              <Button variant="outline" onClick={() => { void navigate('/leaderboard'); }}>
                Таблица лидеров
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!examVariant) return;
                  try {
                    const res = await testService.getLatestAttemptId(examVariant.testId);
                    if (res) {
                      const importRes = await api.post(`/srs/import-mistakes/${res}`);
                      if (importRes.data.success) {
                        toast.success(`Добавлено ${importRes.data.data.added} карточек для повторения`);
                      }
                    }
                  } catch {
                    toast.error('Ошибка импорта ошибок');
                  }
                }}
              >
                Добавить ошибки в повторение
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void exportTestResultPDF({
                    examTitle: examTitle || 'Тест',
                    date: new Date().toLocaleDateString('ru-RU'),
                    scorePercent,
                    correctCount,
                    totalQuestions: tasks.length,
                    totalPoints,
                    maxPoints,
                    questionResults: questionResults.map((qr: { number: number; userAnswer: string | null; correctAnswer: string; isCorrect: boolean; points: number; topic: string }) => ({
                      number: qr.number,
                      topic: qr.topic || '',
                      userAnswer: qr.userAnswer,
                      correctAnswer: qr.correctAnswer,
                      isCorrect: qr.isCorrect,
                      points: qr.points,
                    })),
                  });
                }}
              >
                Скачать PDF
              </Button>
            </div>
          </div>

          {/* Error Analysis */}
          <TestErrorAnalysis analysis={errorAnalysis} />

          {/* Comments for each question */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>Обсуждение задач</h2>
            {tasks.map(task => (
              <div key={task.id} className="border-b border-slate-100 last:border-b-0 py-2">
                <p className="text-sm font-medium text-slate-700">Задание {task.number}</p>
                <CommentSection questionId={task.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Задания не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-display font-bold text-slate-900">
                {examTitle}
              </div>
              <div className="text-sm text-slate-600 font-sans">{grade} класс</div>
              {examMode && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
                  РЕЖИМ ЭКЗАМЕНА
                </span>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-5 h-5 ${getTimeColor()}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className="text-sm font-sans text-slate-600">
                <span className="text-blue-600 font-semibold">{answeredCount}</span> /{' '}
                {tasks.length} отвечено
              </div>

              <button
                onClick={handleExit}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
              >
                Выйти
              </button>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className=" backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 font-display font-semibold">
                  Задание {currentTask.number}
                </span>
                <span className="text-sm text-slate-600 font-sans">
                  {currentTask.points}{' '}
                  {currentTask.points === 1 ? 'балл' : currentTask.points < 5 ? 'балла' : 'баллов'}
                </span>
              </div>
              {currentTask.topic && !currentTask.topic.match(/^(Д?\d+|[0-9]+)$/) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-sans">{currentTask.topic}</span>
                  {findTheoryForTask(subject, examType, currentTask.number, currentTask.topic) && (
                    <button
                      onClick={() => setTheoryTopic(findTheoryForTask(subject, examType, currentTask.number, currentTask.topic))}
                      className="text-xs px-2 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-sans"
                    >
                      Теория
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div
              className="question-content text-lg font-sans text-slate-900"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentTask.text) }}
            />
          </div>

          <div className="mb-8">
            {currentTask.type === 'choice' && currentTask.options && (
              <div className="space-y-3">
                {currentTask.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      answers[currentTask.number] === option
                        ? 'border-blue-500 bg-blue-50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-sans">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {currentTask.type === 'short' && isCoordinateLineTask(currentTask) && (
              <div>
                <CoordinateLine
                  value={answers[currentTask.number] ? parseFloat(answers[currentTask.number]!) : null}
                  onChange={(val) => {
                    if (isNaN(val)) {
                      setAnswers(prev => {
                        const next = { ...prev };
                        delete next[currentTask.number];
                        return next;
                      });
                    } else {
                      handleAnswer(String(val));
                    }
                  }}
                  range={getCoordRange(currentTask)}
                  markedPoints={parseTaskReferencePoints(currentTask)}
                />
              </div>
            )}

            {currentTask.type === 'short' && !isCoordinateLineTask(currentTask) && (
              <div>
                <label htmlFor="answer-input" className="block text-sm font-sans text-slate-700 mb-2">Введите ответ:</label>
                <input
                  id="answer-input"
                  type="text"
                  value={answers[currentTask.number] || ''}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder="Ваш ответ"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                />
              </div>
            )}

            {currentTask.type === 'matching' && (
              <div>
                <label htmlFor="matching-input" className="block text-sm font-sans text-slate-700 mb-2">
                  Установите соответствие:
                </label>
                <input
                  id="matching-input"
                  type="text"
                  value={answers[currentTask.number] || ''}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder="Например: А-1, Б-3, В-2"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                />
                <p className="mt-2 text-xs text-slate-500 font-sans">
                  Введите пары через запятую, например: А-1, Б-3, В-2
                </p>
              </div>
            )}

            {currentTask.type === 'multiple_choice' && (
              <div>
                <label htmlFor="multiple-choice-input" className="block text-sm font-sans text-slate-700 mb-2">
                  Выберите верные утверждения:
                </label>
                <input
                  id="multiple-choice-input"
                  type="text"
                  value={answers[currentTask.number] || ''}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder="Например: 1, 2"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                />
                <p className="mt-2 text-xs text-slate-500 font-sans">
                  Введите номера верных утверждений через запятую
                </p>
              </div>
            )}

            {(currentTask.type === 'detailed' || currentTask.type === 'proof') && (
              <div>
                <label htmlFor="exam-detailed-input" className="block text-sm font-sans text-slate-700 mb-2">
                  {currentTask.type === 'proof' ? 'Напишите доказательство:' : 'Подробное решение:'}
                </label>
                <textarea
                  id="exam-detailed-input"
                  value={answers[currentTask.number] || ''}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder={
                    currentTask.type === 'proof'
                      ? 'Опишите доказательство...'
                      : 'Опишите решение...'
                  }
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical font-sans"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {!examMode && (
              <Button variant="outline" onClick={handlePrevious} disabled={currentTaskIndex === 0}>
                ← Предыдущее
              </Button>
            )}
            {examMode && <div />}

            <div className="flex gap-3">
              {currentTaskIndex === tasks.length - 1 ? (
                <Button onClick={() => void handleFinish()}>Завершить тест</Button>
              ) : (
                <Button onClick={() => void handleNext()}>Следующее →</Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6  backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-sm font-sans text-slate-600 mb-3">Быстрая навигация:</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {tasks.map((task, index) => (
              <button
                key={task.number}
                onClick={() => {
                  if (examMode && index < currentTaskIndex) return;
                  recordTimeForCurrentTask();
                  setCurrentTaskIndex(index);
                }}
                disabled={examMode && index < currentTaskIndex}
                className={`aspect-square rounded-lg font-display font-semibold text-sm transition-all ${
                  examMode && index < currentTaskIndex ? 'opacity-40 cursor-not-allowed ' : ''
                }${
                  currentTaskIndex === index
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white scale-110'
                    : answers[task.number]
                      ? 'bg-blue-50 border border-blue-200 text-blue-600'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {task.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="exit-dialog-title">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 animate-scale-in">
            <h4 id="exit-dialog-title" className="text-xl font-semibold text-slate-900 mb-3">Выйти из теста?</h4>
            <p className="text-slate-600 mb-2">
              Вы ответили на <span className="text-blue-600 font-semibold">{answeredCount}</span> из{' '}
              <span className="text-slate-900">{tasks.length}</span> вопросов.
            </p>
            <p className="text-slate-600 mb-6">
              Вы можете вернуться и продолжить позже или завершить тест сейчас.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all"
              >
                Продолжить тест
              </button>
              <button
                onClick={() => void handleFinish()}
                className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all"
              >
                Завершить и сохранить результат
              </button>
              <button
                onClick={handleConfirmExit}
                className="w-full px-4 py-3 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-all"
              >
                Выйти без сохранения
              </button>
            </div>
          </div>
        </div>
      )}

      <TheoryDrawer topic={theoryTopic} subject={subject} onClose={() => setTheoryTopic(null)} />
    </div>
  );
}
