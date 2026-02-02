import { SUBJECT_LABELS } from '@lyceum64/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/ui/Card';
import { getActiveTestService } from '../core/services';
import { ConfettiService } from '../core/services/ConfettiService';
import testService from '../services/testService';
import { cardVariants, slideInRightVariants, fadeInVariants } from '../utils/animations';

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

export default function ExamTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade, subject, egeType } = location.state || {};

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
  const [testResults, setTestResults] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [questionDirection, setQuestionDirection] = useState<'next' | 'prev'>('next');

  // Load test data from API
  useEffect(() => {
    const loadTestData = async () => {
      console.log('📖 ExamTestPage loadTestData:', { grade, subject, egeType });

      if (!grade || !subject) {
        console.warn('⚠️ Missing parameters:', { grade, subject });
        setError('Не указаны параметры теста');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Определяем тип экзамена в зависимости от класса
        let apiExamType: string;
        if (grade === 8 || grade === 10) {
          apiExamType = 'VPR';
        } else if (grade === 9) {
          apiExamType = 'OGE';
        } else if (grade === 11) {
          // Для математики используем EGE_BASE/EGE_PROFILE, для остальных предметов - EGE
          if (subject === 'MATHEMATICS') {
            apiExamType = egeType === 'base' ? 'EGE_BASE' : 'EGE_PROFILE';
          } else {
            apiExamType = 'EGE';
          }
        } else {
          apiExamType = 'REGULAR';
        }

        console.log('🎯 Calling getTestVariant:', { subject, apiExamType, grade });
        const variant = await testService.getTestVariant(subject, apiExamType, grade);

        if (variant) {
          setExamVariant(variant);
          // Устанавливаем время только если duration определен
          if (variant.duration && variant.duration > 0) {
            setTimeLeft(variant.duration * 60);
          } else {
            // Значение по умолчанию: 3 часа для ОГЭ/ЕГЭ
            setTimeLeft(180 * 60);
          }
          setError(null);
        } else {
          setError('Тест не найден. Убедитесь, что вы авторизованы.');
        }
      } catch (err) {
        console.error('Error loading test:', err);
        setError('Ошибка загрузки теста');
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, [grade, subject, egeType]);

  const currentTask = tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / tasks.length) * 100;
  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

  const getExamTitle = () => {
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
  };

  const getExamType = () => {
    if (grade === 8 || grade === 10) return 'VPR' as const;
    if (grade === 9) return 'OGE' as const;
    if (grade === 11) {
      if (subject === 'MATHEMATICS') {
        return egeType === 'base' ? ('EGE_BASE' as const) : ('EGE_PROFILE' as const);
      }
      return 'EGE' as const;
    }
    return 'REGULAR' as const;
  };

  useEffect(() => {
    if (!grade || !subject || !examVariant) return;

    const activeTestService = getActiveTestService();

    if (!isTestRegistered && examVariant.duration) {
      activeTestService.startTest({
        examType: getExamType(),
        subject: subject || 'MATHEMATICS',
        grade: grade as 8 | 9 | 10 | 11,
        title: getExamTitle(),
        startedAt: new Date().toISOString(),
        currentTaskIndex: 0,
        answeredCount: 0,
        totalTasks: tasks.length,
        timeLeftSeconds: examVariant.duration * 60,
        route: '/test/oge-ege',
      });
      setIsTestRegistered(true);
    }
  }, [grade, subject, isTestRegistered, examVariant]);

  useEffect(() => {
    const activeTestService = getActiveTestService();
    activeTestService.updateProgress({
      currentTaskIndex,
      answeredCount,
      timeLeftSeconds: timeLeft,
    });
  }, [currentTaskIndex, answeredCount, timeLeft]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentTask.number]: answer,
    }));
  };

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setQuestionDirection('next');
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setQuestionDirection('prev');
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    setQuestionDirection(index > currentTaskIndex ? 'next' : 'prev');
    setCurrentTaskIndex(index);
    setShowQuestionNav(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showResults || showExitConfirm) return;

      if (e.key === 'ArrowLeft' && currentTaskIndex > 0) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && currentTaskIndex < tasks.length - 1) {
        handleNext();
      } else if (e.key === 'Enter' && e.ctrlKey && currentTaskIndex === tasks.length - 1) {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTaskIndex, tasks.length, showResults, showExitConfirm]);

  const calculateScore = useCallback(() => {
    const totalPoints = Object.entries(answers).reduce((sum, [num, ans]) => {
      const task = tasks.find(t => t.number === parseInt(num));
      if (task && task.correctAnswer === ans) {
        return sum + task.points;
      }
      return sum;
    }, 0);
    const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    return Math.round((totalPoints / maxPoints) * 100);
  }, [answers, tasks]);

  const handleFinish = useCallback(async () => {
    if (!examVariant) return;

    try {
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([num, ans]) => {
        const task = tasks.find(t => t.number === parseInt(num));
        return {
          questionId: task?.id || '',
          answer: ans,
          timeSpent: 5000, // TODO: track actual time per question
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
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Ошибка отправки теста');
    }

    const activeTestService = getActiveTestService();
    activeTestService.completeTest();
    setShowResults(true);

    const scorePercent = calculateScore();
    setTimeout(() => {
      ConfettiService.scoreBasedCelebration(scorePercent);
    }, 300);

    toast.success('Тест завершен!');
  }, [calculateScore, examVariant, answers, tasks]);

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    const activeTestService = getActiveTestService();
    activeTestService.abandonTest();
    toast('Тест прерван', { icon: '⚠️' });
    navigate('/dashboard');
  };

  const getTimeColor = () => {
    const totalTime = (examVariant?.duration || 180) * 60;
    if (timeLeft > totalTime * 0.5) return 'text-cyan-400';
    if (timeLeft > totalTime * 0.25) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-sans">Загрузка теста...</p>
        </div>
      </div>
    );
  }

  if (error || !examVariant) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-400 font-sans mb-4">{error || 'Тест не найден'}</p>
          <p className="text-sm text-gray-500 mb-6">
            Войдите в систему, чтобы начать прохождение теста.
          </p>
          <Button onClick={async () => navigate('/dashboard')}>Вернуться к панели</Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    // Use results from server if available, otherwise calculate locally
    const correctCount =
      testResults?.correctCount ??
      Object.entries(answers).filter(
        ([num, ans]) => tasks.find(t => t.number === parseInt(num))?.correctAnswer === ans
      ).length;

    const totalPoints =
      testResults?.questionResults?.reduce((sum: number, qr: any) => sum + qr.points, 0) ??
      Object.entries(answers).reduce((sum, [num, ans]) => {
        const task = tasks.find(t => t.number === parseInt(num));
        if (task && task.correctAnswer === ans) {
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

    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center animate-scale-in">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {getScoreMessage()}
            </h1>
            <p className="text-gray-400 mb-6">Тест завершен</p>

            <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {scorePercent}%
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
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
                  <div className="text-2xl font-bold text-cyan-400">
                    {correctCount}/{tasks.length}
                  </div>
                  <div className="text-sm text-gray-400">правильных ответов</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {totalPoints}/{maxPoints}
                  </div>
                  <div className="text-sm text-gray-400">первичных баллов</div>
                </div>
              </div>
            </div>

            {/* Детальный разбор заданий */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-200 mb-4 text-left">Детальный разбор</h2>
              <div className="space-y-3">
                {(
                  testResults?.questionResults ||
                  tasks.map(task => ({
                    number: task.number,
                    userAnswer: answers[task.number] || null,
                    correctAnswer: task.correctAnswer,
                    isCorrect: task.correctAnswer === answers[task.number],
                    points: task.points,
                    topic: task.topic,
                  }))
                ).map((result: any) => {
                  const isAnswered = result.userAnswer !== null && result.userAnswer !== '';

                  return (
                    <div
                      key={result.number}
                      className={`p-4 rounded-xl border-2 ${
                        result.isCorrect
                          ? 'bg-green-500/10 border-green-500/30'
                          : isAnswered
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-gray-800/50 border-gray-700/50'
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
                              <div className="font-semibold text-gray-200">
                                Задание {result.number}
                                {result.topic && !result.topic.match(/^(Д?\d+|[0-9]+)$/) && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({result.topic})
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">
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
                                <span className="text-gray-500">Ваш ответ:</span>{' '}
                                <span
                                  className={
                                    result.isCorrect
                                      ? 'text-green-400 font-medium'
                                      : 'text-red-400 font-medium'
                                  }
                                >
                                  {result.userAnswer}
                                </span>
                              </div>
                            )}
                            {!result.isCorrect && (
                              <div>
                                <span className="text-gray-500">Правильный ответ:</span>{' '}
                                <span className="text-green-400 font-medium">
                                  {result.correctAnswer}
                                </span>
                              </div>
                            )}
                            {!isAnswered && <div className="text-gray-500 italic">Не отвечено</div>}
                          </div>
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            result.isCorrect
                              ? 'bg-green-500/20 text-green-400'
                              : isAnswered
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-700/50 text-gray-500'
                          }`}
                        >
                          {result.isCorrect ? `+${result.points || 1}` : '0'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={async () => navigate('/dashboard')}>К панели управления</Button>
              <Button variant="outline" onClick={async () => navigate('/leaderboard')}>
                🏆 Таблица лидеров
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentTaskIndex + 1) / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      {/* Modern Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <div className="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {getExamTitle()}
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg font-medium">
                {grade} класс
              </span>
            </div>

            {/* Right: Timer, Progress, Settings */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Timer */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 rounded-xl border border-gray-700"
              >
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
                <span className={`font-mono text-lg font-bold ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </motion.div>

              {/* Progress Indicator */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800/80 rounded-xl border border-gray-700">
                <span className="text-cyan-400 font-bold text-lg">{currentTaskIndex + 1}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">{tasks.length}</span>
              </div>

              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
              </motion.button>

              {/* Exit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExit}
                className="hidden sm:block px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl border border-red-500/30 transition-colors text-sm font-medium"
              >
                Выйти
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress Stats */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">
              <span className="text-cyan-400 font-semibold">{answeredCount}</span> отвечено
            </span>
            <span className="text-gray-400">{tasks.length - answeredCount} осталось</span>
          </div>
        </div>
      </motion.div>

      {/* Main Layout: Desktop Sidebar + Content */}
      <div className="relative z-10 flex max-w-7xl mx-auto gap-6 px-4 sm:px-6 py-6">
        {/* Desktop Sidebar - Question Navigator */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:block w-72 flex-shrink-0"
        >
          <div className="sticky top-24">
            <Card variant="glass" padding="lg" className="mb-6">
              {/* Progress Circle */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                      className="text-cyan-500 transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">Прогресс теста</p>
              </div>

              {/* Question Navigator Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Навигация
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {tasks.map((task, index) => (
                    <motion.button
                      key={task.number}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => jumpToQuestion(index)}
                      className={`aspect-square rounded-lg font-display font-bold text-sm transition-all ${
                        currentTaskIndex === index
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                          : answers[task.number]
                            ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-800 border-2 border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:bg-gray-700'
                      }`}
                    >
                      {task.number}
                    </motion.button>
                  ))}
                </div>

                {/* Legend */}
                <div className="pt-4 space-y-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-500"></div>
                    <span>Текущий</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500/50"></div>
                    <span>Отвечено</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded bg-gray-800 border-2 border-gray-700"></div>
                    <span>Не отвечено</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.aside>

        {/* Main Content - Question Card */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTaskIndex}
              initial={{
                opacity: 0,
                x: questionDirection === 'next' ? 100 : -100,
                scale: 0.95,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: questionDirection === 'next' ? -100 : 100,
                scale: 0.95,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Card variant="glass" padding="none" className="overflow-hidden">
                {/* Question Header */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-b border-gray-700/50">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-display font-bold text-lg shadow-lg"
                      >
                        Задание {currentTask.number}
                      </motion.span>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-semibold">
                        {currentTask.points}{' '}
                        {currentTask.points === 1
                          ? 'балл'
                          : currentTask.points < 5
                            ? 'балла'
                            : 'баллов'}
                      </span>
                    </div>
                    {currentTask.topic && !currentTask.topic.match(/^(Д?\d+|[0-9]+)$/) && (
                      <span className="px-3 py-1 bg-gray-800/80 rounded-lg text-gray-400 text-sm">
                        {currentTask.topic}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-6 sm:p-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
                  >
                    <div
                      className="question-content text-lg leading-relaxed font-sans text-gray-200"
                      dangerouslySetInnerHTML={{ __html: currentTask.text }}
                    />
                  </motion.div>

                  {/* Answer Input Section */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentTask.type === 'choice' && currentTask.options && (
                      <div className="space-y-3">
                        {currentTask.options.map((option, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(option)}
                            className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 group ${
                              answers[currentTask.number] === option
                                ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg shadow-cyan-500/20'
                                : 'border-gray-700 bg-gray-800/40 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 transition-all ${
                                  answers[currentTask.number] === option
                                    ? 'border-cyan-400 bg-cyan-400'
                                    : 'border-gray-600 group-hover:border-cyan-500/50'
                                }`}
                              >
                                {answers[currentTask.number] === option && (
                                  <svg
                                    className="w-full h-full text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="font-sans flex-1">{option}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {currentTask.type === 'short' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-3">
                          Введите ответ:
                        </label>
                        <input
                          type="text"
                          value={answers[currentTask.number] || ''}
                          onChange={e => handleAnswer(e.target.value)}
                          placeholder="Ваш ответ"
                          autoFocus
                          className="w-full px-5 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans hover:border-gray-600"
                        />
                      </div>
                    )}

                    {(currentTask.type === 'detailed' || currentTask.type === 'proof') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-3">
                          {currentTask.type === 'proof'
                            ? 'Напишите доказательство:'
                            : 'Подробное решение:'}
                        </label>
                        <textarea
                          value={answers[currentTask.number] || ''}
                          onChange={e => handleAnswer(e.target.value)}
                          placeholder={
                            currentTask.type === 'proof'
                              ? 'Опишите доказательство...'
                              : 'Опишите решение...'
                          }
                          rows={10}
                          autoFocus
                          className="w-full px-5 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-vertical font-sans hover:border-gray-600"
                        />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Navigation Footer */}
                <div className="p-6 sm:p-8 bg-gray-800/30 border-t border-gray-700/50">
                  <div className="flex items-center justify-between gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentTaskIndex === 0}
                        className="flex items-center gap-2"
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
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                          />
                        </svg>
                        Назад
                      </Button>
                    </motion.div>

                    {/* Mobile Question Nav Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowQuestionNav(true)}
                      className="lg:hidden px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium text-gray-300 transition-colors"
                    >
                      {currentTaskIndex + 1} / {tasks.length}
                    </motion.button>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {currentTaskIndex === tasks.length - 1 ? (
                        <Button onClick={handleFinish} className="flex items-center gap-2">
                          Завершить тест
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
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </Button>
                      ) : (
                        <Button onClick={handleNext} className="flex items-center gap-2">
                          Далее
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
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </Button>
                      )}
                    </motion.div>
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="hidden sm:flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
                    <span className="text-xs text-gray-500">Подсказка:</span>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">←</kbd>
                      <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">→</kbd>
                      <span>для навигации</span>
                    </div>
                    {currentTaskIndex === tasks.length - 1 && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                          Ctrl
                        </kbd>
                        <span>+</span>
                        <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                          Enter
                        </kbd>
                        <span>завершить</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Question Navigator Modal */}
      <AnimatePresence>
        {showQuestionNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4 lg:hidden"
            onClick={() => setShowQuestionNav(false)}
          >
            <motion.div
              initial={{ y: 100, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Навигация по заданиям</h3>
                <button
                  onClick={() => setShowQuestionNav(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-6">
                {tasks.map((task, index) => (
                  <motion.button
                    key={task.number}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => jumpToQuestion(index)}
                    className={`aspect-square rounded-lg font-display font-bold text-sm transition-all ${
                      currentTaskIndex === index
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg'
                        : answers[task.number]
                          ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
                          : 'bg-gray-700 border-2 border-gray-600 text-gray-400 hover:border-cyan-500/50'
                    }`}
                  >
                    {task.number}
                  </motion.button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-blue-500"></div>
                  <span>Текущий</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-5 h-5 rounded bg-green-500/20 border-2 border-green-500/50"></div>
                  <span>Отвечено</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-5 h-5 rounded bg-gray-700 border-2 border-gray-600"></div>
                  <span>Не отвечено</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Настройки</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Статистика теста</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Отвечено:</span>
                      <span className="text-cyan-400 font-semibold">
                        {answeredCount} / {tasks.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Осталось:</span>
                      <span className="text-white font-semibold">
                        {tasks.length - answeredCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Прогресс:</span>
                      <span className="text-purple-400 font-semibold">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">Горячие клавиши</h4>
                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>Предыдущий вопрос</span>
                      <kbd className="px-2 py-1 bg-gray-700 rounded border border-gray-600">←</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Следующий вопрос</span>
                      <kbd className="px-2 py-1 bg-gray-700 rounded border border-gray-600">→</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Завершить тест</span>
                      <span className="flex gap-1">
                        <kbd className="px-2 py-1 bg-gray-700 rounded border border-gray-600">
                          Ctrl
                        </kbd>
                        <span>+</span>
                        <kbd className="px-2 py-1 bg-gray-700 rounded border border-gray-600">
                          Enter
                        </kbd>
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExit}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  Выйти из теста
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-8 h-8 text-yellow-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Выйти из теста?</h3>
                <p className="text-gray-400 mb-4">
                  Вы ответили на{' '}
                  <span className="text-cyan-400 font-semibold">{answeredCount}</span> из{' '}
                  <span className="text-white font-semibold">{tasks.length}</span> вопросов.
                </p>
                <p className="text-sm text-gray-500">
                  Вы можете продолжить позже или завершить тест сейчас.
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Продолжить тест
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFinish}
                  className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all"
                >
                  Завершить и сохранить
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmExit}
                  className="w-full px-4 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-all"
                >
                  Выйти без сохранения
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
