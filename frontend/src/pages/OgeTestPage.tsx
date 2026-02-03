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
  {
    number: 6,
    text: 'Дана арифметическая прогрессия: -4; -1; 2; 5; ...\n\nНайдите сумму первых десяти её членов.',
    type: 'short',
    correctAnswer: '95',
    points: 1,
    topic: 'Арифметическая прогрессия',
  },
  {
    number: 7,
    text: 'Найдите значение выражения (a⁵)³ : a¹² при a = 5',
    type: 'short',
    correctAnswer: '125',
    points: 1,
    topic: 'Степени',
  },
  {
    number: 8,
    text: 'На каком рисунке изображено множество решений неравенства x² - 4x - 5 ≤ 0?',
    type: 'choice',
    options: [
      'Отрезок [-1; 5]',
      'Отрезок [-5; 1]',
      'Два луча: (-∞; -1] и [5; +∞)',
      'Два луча: (-∞; -5] и [1; +∞)',
    ],
    correctAnswer: 'Отрезок [-1; 5]',
    points: 1,
    topic: 'Квадратные неравенства',
  },
  {
    number: 9,
    text: 'Турист идёт из одного города в другой, каждый день проходя больше, чем в предыдущий день, на одно и то же расстояние. Известно, что за первый день турист прошёл 10 километров. Определите, сколько километров прошёл турист за третий день, если весь путь он прошёл за 6 дней, а расстояние между городами составляет 120 километров.',
    type: 'short',
    correctAnswer: '20',
    points: 2,
    topic: 'Арифметическая прогрессия - задача',
  },
  {
    number: 10,
    text: 'Вероятность того, что новый электрический чайник прослужит больше года, равна 0,93. Вероятность того, что он прослужит больше двух лет, равна 0,82. Найдите вероятность того, что он прослужит меньше двух лет, но больше года.',
    type: 'short',
    correctAnswer: '0,11',
    points: 1,
    topic: 'Теория вероятностей',
  },
  {
    number: 11,
    text: 'На рисунке изображены графики функций y = 3 - x² и y = 2x. Вычислите абсциссу точки B.',
    type: 'short',
    correctAnswer: '3',
    points: 1,
    topic: 'Графики функций',
  },
  {
    number: 12,
    text: 'Площадь четырёхугольника можно вычислить по формуле S = (d₁ · d₂ · sin α)/2, где d₁ и d₂ — длины диагоналей четырёхугольника, α — угол между диагоналями. Пользуясь этой формулой, найдите длину диагонали d₂, если d₁ = 12, sin α = 1/3, а S = 12.',
    type: 'short',
    correctAnswer: '6',
    points: 1,
    topic: 'Формулы',
  },
  {
    number: 13,
    text: 'Укажите решение неравенства:\n\n5x - 7,5 ≥ 6x + 3,2',
    type: 'choice',
    options: ['x ≥ -10,7', 'x ≤ -10,7', 'x ≥ 10,7', 'x ≤ 10,7'],
    correctAnswer: 'x ≤ -10,7',
    points: 1,
    topic: 'Неравенства',
  },
  {
    number: 14,
    text: 'В среднем из 2000 садовых насосов, поступивших в продажу, 12 подтекают. Найдите вероятность того, что один случайно выбранный для контроля насос не подтекает.',
    type: 'short',
    correctAnswer: '0,994',
    points: 1,
    topic: 'Теория вероятностей',
  },
  {
    number: 15,
    text: 'В треугольнике ABC угол C равен 90°, AC = 4, cos A = 0,8. Найдите AB.',
    type: 'short',
    correctAnswer: '5',
    points: 1,
    topic: 'Прямоугольный треугольник',
  },
  {
    number: 16,
    text: 'Радиус окружности, описанной около квадрата, равен 4√2. Найдите длину стороны этого квадрата.',
    type: 'short',
    correctAnswer: '8',
    points: 1,
    topic: 'Окружность и квадрат',
  },
  {
    number: 17,
    text: 'Площадь прямоугольной трапеции равна 120. Одно из оснований трапеции в два раза больше другого, а её высота равна 6. Найдите меньшее основание трапеции.',
    type: 'short',
    correctAnswer: '10',
    points: 1,
    topic: 'Трапеция',
  },
  {
    number: 18,
    text: 'На клетчатой бумаге с размером клетки 1×1 изображён угол. Найдите тангенс этого угла.',
    type: 'short',
    correctAnswer: '2',
    points: 1,
    topic: 'Тригонометрия на клетчатой бумаге',
  },
  {
    number: 19,
    text: 'Какие из следующих утверждений верны?\n\n1) Через точку, не лежащую на данной прямой, можно провести прямую, параллельную этой прямой\n2) Если диагонали параллелограмма равны, то это прямоугольник\n3) У любой трапеции боковые стороны равны',
    type: 'short',
    correctAnswer: '1, 2',
    points: 1,
    topic: 'Геометрические утверждения',
  },
  {
    number: 20,
    text: 'Решите систему уравнений:\n\n{\n  y - x² = 6\n  y + x = 6\n}\n\nЗапишите решение в виде пары чисел (x; y). Если решений несколько, запишите их через точку с запятой.',
    type: 'detailed',
    correctAnswer: '(0; 6); (-5; 31)',
    points: 2,
    topic: 'Системы уравнений',
  },
  {
    number: 21,
    text: 'Из пункта А в пункт В выехал автомобиль. Одновременно с ним из В в А выехал мотоциклист. Автомобиль прибыл в пункт В через 1 час 20 минут после встречи, а мотоциклист прибыл в А через 3 часа после встречи. Сколько времени потратил на путь из А в В автомобиль?',
    type: 'detailed',
    correctAnswer: '3 часа',
    points: 2,
    topic: 'Задачи на движение',
  },
  {
    number: 22,
    text: 'Постройте график функции y = |x|·(x + 2) - 2x\n\nОпределите, при каких значениях m прямая y = m имеет с графиком ровно две общие точки.',
    type: 'detailed',
    correctAnswer: 'm = 0 или m < -1',
    points: 2,
    topic: 'Построение и исследование графиков',
  },
  {
    number: 23,
    text: 'Биссектриса угла A параллелограмма ABCD пересекает сторону BC в точке K. Найдите периметр параллелограмма, если BK = 7, CK = 12.',
    type: 'detailed',
    correctAnswer: '50',
    points: 2,
    topic: 'Параллелограмм',
  },
  {
    number: 24,
    text: 'В прямоугольной трапеции ABCD с основаниями AD и BC угол BAD прямой. Окружность, построенная на боковой стороне AB как на диаметре, касается боковой стороны CD. Докажите, что треугольник BCD — равнобедренный.',
    type: 'proof',
    correctAnswer: '',
    points: 2,
    topic: 'Доказательство - окружность и трапеция',
  },
  {
    number: 25,
    text: 'Середина M стороны AD выпуклого четырёхугольника ABCD равноудалена от всех его вершин. Найдите AD, если BC = 4, а углы B и C четырёхугольника равны соответственно 112° и 113°.',
    type: 'detailed',
    correctAnswer: '8',
    points: 2,
    topic: 'Четырёхугольник и окружность',
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
    if (!currentTask) return;
    setAnswers(prev => ({
      ...prev,
      [currentTask.number]: answer,
    }));
  };

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
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
    const correctCount = Object.entries(answers).filter(
      ([num, ans]) => tasks.find(t => t.number === parseInt(num))?.correctAnswer === ans
    ).length;

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

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center animate-scale-in">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Тест завершен!
            </h1>
            <p className="text-xl text-gray-300 font-sans mb-8">
              Правильных ответов: <span className="font-bold text-cyan-400">{correctCount}</span> из{' '}
              {tasks.length}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')}>К панели управления</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Пройти заново
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Задания не найдены</p>
        </div>
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
              <div className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ОГЭ Математика
              </div>
              <div className="text-sm text-gray-400 font-sans">{grade} класс</div>
            </div>

            <div className="flex items-center gap-6">
              {/* Таймер */}
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

              {/* Прогресс */}
              <div className="text-sm font-sans text-gray-400">
                <span className="text-cyan-400 font-semibold">{currentTaskIndex + 1}</span> /{' '}
                {tasks.length}
              </div>
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
              <div>
                <label className="block text-sm font-sans text-gray-400 mb-2">Введите ответ:</label>
                <input
                  type="text"
                  value={answers[currentTask.number] || ''}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder="Ваш ответ"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                />
              </div>
            )}

            {(currentTask.type === 'detailed' || currentTask.type === 'proof') && (
              <div>
                <label className="block text-sm font-sans text-gray-400 mb-2">
                  {currentTask.type === 'proof' ? 'Напишите доказательство:' : 'Подробное решение:'}
                </label>
                <textarea
                  value={answers[currentTask.number] || ''}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder={
                    currentTask.type === 'proof'
                      ? 'Опишите доказательство...'
                      : 'Опишите решение...'
                  }
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-vertical font-sans"
                />
              </div>
            )}
          </div>

          {/* Навигация */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700/50">
            <Button variant="outline" onClick={handlePrevious} disabled={currentTaskIndex === 0}>
              ← Предыдущее
            </Button>

              {currentTaskIndex === tasks.length - 1 ? (
                <Button onClick={handleFinish}>Завершить тест</Button>
              ) : (
                <Button onClick={handleNext}>Следующее →</Button>
              )}
            </div>
          </div>

        {/* Навигация по заданиям */}
        <div className="mt-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-sm font-sans text-gray-400 mb-3">Быстрая навигация:</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {tasks.map((task, index) => (
              <button
                key={task.number}
                onClick={() => setCurrentTaskIndex(index)}
                className={`aspect-square rounded-lg font-display font-semibold text-sm transition-all ${
                  currentTaskIndex === index
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white scale-110'
                    : answers[task.number]
                      ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                      : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-cyan-500/50'
                }`}
              >
                {task.number}
              </button>
            ))}
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
