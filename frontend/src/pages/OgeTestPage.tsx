/**
 * OgeTestPage - Modern ОГЭ Test Interface
 * Redesigned with glassmorphic UI, smooth animations, and better UX
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Settings,
  AlertTriangle,
  LogOut,
  Grid3x3,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/ui/Card';

interface Task {
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

// Mock ОГЭ tasks data
const mockOgeTasks: Task[] = [
  {
    number: 1,
    text: 'Найдите значение выражения: 6,3 - 8 : 2',
    type: 'short',
    correctAnswer: '2,3',
    points: 1,
    topic: 'Арифметика',
  },
  {
    number: 2,
    text: 'На координатной прямой отмечены числа a и b. Какое из следующих неравенств неверно?',
    type: 'choice',
    options: ['a - b < 0', 'ab < 0', 'a + b > 0', 'a² > b²'],
    correctAnswer: 'a + b > 0',
    points: 1,
    topic: 'Числа на координатной прямой',
  },
  {
    number: 3,
    text: 'Значение какого из выражений является числом рациональным?\n\n1) (√7 - 3)(√7 + 3)\n2) √5 · √20\n3) (√6 - 2)²\n4) √48 : √3',
    type: 'choice',
    options: ['1', '2', '3', '4'],
    correctAnswer: '1',
    points: 1,
    topic: 'Иррациональные числа',
  },
  {
    number: 4,
    text: 'Решите уравнение: x² - 5x - 14 = 0\n\nЕсли корней несколько, запишите их через точку с запятой в порядке возрастания.',
    type: 'short',
    correctAnswer: '-2; 7',
    points: 1,
    topic: 'Квадратные уравнения',
  },
  {
    number: 5,
    text: 'На рисунке изображены графики функций вида y = kx + b. Установите соответствие между графиками и знаками коэффициентов k и b.\n\nГРАФИКИ:\nА) Прямая возрастает, пересекает ось Y выше 0\nБ) Прямая убывает, пересекает ось Y ниже 0\nВ) Прямая возрастает, пересекает ось Y ниже 0\n\nКОЭФФИЦИЕНТЫ:\n1) k > 0, b > 0\n2) k > 0, b < 0\n3) k < 0, b < 0\n4) k < 0, b > 0',
    type: 'short',
    correctAnswer: 'А-1, Б-3, В-2',
    points: 1,
    topic: 'Линейная функция',
  },
];

export default function OgeTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade, subject } = location.state || {};

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(235 * 60); // 3h 55m in seconds
  const [showResults, setShowResults] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [questionDirection, setQuestionDirection] = useState<'next' | 'prev'>('next');

  const tasks = mockOgeTasks;
  const currentTask = tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / tasks.length) * 100;
  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

  // Timer
  useEffect(() => {
    if (showResults) return;

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
  }, [showResults]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showResults || showSettings || showExitConfirm) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.ctrlKey && e.key === 'Enter' && currentTaskIndex === tasks.length - 1) {
        e.preventDefault();
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTaskIndex, showResults, showSettings, showExitConfirm]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 60 * 60) return 'text-cyan-600 dark:text-cyan-400';
    if (timeLeft > 30 * 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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

  const goToQuestion = (index: number) => {
    setQuestionDirection(index > currentTaskIndex ? 'next' : 'prev');
    setCurrentTaskIndex(index);
    setShowQuestionNav(false);
  };

  const handleFinish = () => {
    setShowResults(true);
    toast.success('Тест завершен!');
  };

  const handleExit = () => {
    navigate('/dashboard');
  };

  if (!grade || !subject) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Параметры теста не указаны
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Пожалуйста, выберите предмет и класс
            </p>
            <Button onClick={() => navigate('/dashboard')}>Вернуться к панели</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full"
        >
          <Card variant="glass" padding="lg">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Тест завершен!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                ОГЭ по математике • {tasks.length} заданий
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {answeredCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Отвечено</div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {tasks.length - answeredCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Пропущено</div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatTime(235 * 60 - timeLeft)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Затрачено</div>
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={handleExit}>
                Вернуться к панели
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(true)}>
                <LogOut className="w-4 h-4" />
              </Button>

              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  ОГЭ • Математика
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Вопрос {currentTaskIndex + 1} из {tasks.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 font-mono text-lg font-bold ${getTimeColor()}`}
              >
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="lg:hidden"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionNav(true)}
                className="lg:hidden"
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">
                Прогресс: {answeredCount} / {tasks.length}
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="absolute h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentTaskIndex}
                initial={{
                  x: questionDirection === 'next' ? 100 : -100,
                  opacity: 0,
                }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: questionDirection === 'next' ? -100 : 100,
                  opacity: 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="glass" padding="none">
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">
                        Задание {currentTask.number}
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                        {currentTask.points} {currentTask.points === 1 ? 'балл' : 'балла'}
                      </span>
                    </div>
                    <div className="text-sm opacity-75">{currentTask.topic}</div>
                  </div>

                  {/* Question Content */}
                  <div className="p-8">
                    <div className="prose dark:prose-invert max-w-none mb-6">
                      <p className="text-lg text-slate-900 dark:text-white whitespace-pre-wrap">
                        {currentTask.text}
                      </p>
                    </div>

                    {/* Answer Input */}
                    {currentTask.type === 'choice' && currentTask.options && (
                      <div className="space-y-3">
                        {currentTask.options.map((option, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAnswer(option)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                              answers[currentTask.number] === option
                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                                : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-slate-900 dark:text-white">{option}</span>
                              {answers[currentTask.number] === option && (
                                <Check className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {currentTask.type === 'short' && (
                      <input
                        type="text"
                        value={answers[currentTask.number] || ''}
                        onChange={e => handleAnswer(e.target.value)}
                        placeholder="Введите ваш ответ"
                        className="w-full px-6 py-4 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all"
                      />
                    )}

                    {(currentTask.type === 'detailed' || currentTask.type === 'proof') && (
                      <textarea
                        value={answers[currentTask.number] || ''}
                        onChange={e => handleAnswer(e.target.value)}
                        placeholder="Введите ваше решение"
                        rows={8}
                        className="w-full px-6 py-4 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all resize-none"
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentTaskIndex === 0}
                icon={<ChevronLeft className="w-5 h-5" />}
              >
                Назад
              </Button>

              {currentTaskIndex === tasks.length - 1 ? (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleFinish}
                  rightIcon={<Check className="w-5 h-5" />}
                >
                  Завершить тест
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  rightIcon={<ChevronRight className="w-5 h-5" />}
                >
                  Следующий
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-24 space-y-6">
              {/* Progress Circle */}
              <Card variant="glass" padding="md">
                <div className="text-center">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100),
                        }}
                        transition={{ duration: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {Math.round(progress)}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {answeredCount}/{tasks.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Question Navigator */}
              <Card variant="glass" padding="md">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Навигация по заданиям
                </h3>

                <div className="grid grid-cols-5 gap-2">
                  {tasks.map((task, index) => {
                    const isAnswered = answers[task.number]?.trim();
                    const isCurrent = index === currentTaskIndex;

                    return (
                      <motion.button
                        key={task.number}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToQuestion(index)}
                        className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                            : isAnswered
                              ? 'bg-emerald-500 text-white border-2 border-emerald-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {task.number}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">Текущий</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">Отвечено</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600" />
                    <span className="text-slate-600 dark:text-slate-400">Не отвечено</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Question Navigator */}
      <AnimatePresence>
        {showQuestionNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowQuestionNav(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Навигация по заданиям
                </h3>
                <button
                  onClick={() => setShowQuestionNav(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {tasks.map((task, index) => {
                  const isAnswered = answers[task.number]?.trim();
                  const isCurrent = index === currentTaskIndex;

                  return (
                    <button
                      key={task.number}
                      onClick={() => goToQuestion(index)}
                      className={`aspect-square rounded-lg font-semibold transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg'
                          : isAnswered
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {task.number}
                    </button>
                  );
                })}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-md w-full"
            >
              <Card variant="glass" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Настройки</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Статистика
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Отвечено:</span>
                        <span className="font-semibold">{answeredCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Осталось:</span>
                        <span className="font-semibold">{tasks.length - answeredCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Прогресс:</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Горячие клавиши
                    </h4>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>← / →</span>
                        <span>Переключение вопросов</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ctrl + Enter</span>
                        <span>Завершить тест</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="secondary" fullWidth onClick={() => setShowSettings(false)}>
                    Закрыть
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowExitConfirm(false)}
            />

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-md w-full"
            >
              <Card variant="glass" padding="lg">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Вы уверены?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Ваш прогресс не будет сохранен
                  </p>

                  <div className="space-y-3">
                    <Button variant="primary" fullWidth onClick={() => setShowExitConfirm(false)}>
                      Продолжить тест
                    </Button>
                    <Button variant="secondary" fullWidth onClick={handleExit}>
                      Выйти без сохранения
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Footer */}
      <div className="hidden lg:block fixed bottom-4 right-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-800">
          ← / → для навигации • Ctrl + Enter для завершения
        </div>
      </div>
    </div>
  );
}
