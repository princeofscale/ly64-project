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

// Моковые данные (в реальности загружаются с бэкенда)
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
  const [timeLeft, setTimeLeft] = useState(235 * 60); // 3 часа 55 минут в секундах
  const [showResults, setShowResults] = useState(false);

  const tasks = mockOgeTasks; // В реальности загружаем с сервера
  const currentTask = tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / tasks.length) * 100;

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
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
    toast.success('Тест завершен!');
  };

  const getTimeColor = () => {
    if (timeLeft > 60 * 60) return 'text-cyan-400';
    if (timeLeft > 30 * 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!grade || !subject) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 font-sans mb-4">Ошибка загрузки теста</p>
          <Button onClick={() => navigate('/dashboard')}>Вернуться к панели</Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = Object.entries(answers).filter(
      ([num, ans]) => tasks.find(t => t.number === parseInt(num))?.correctAnswer === ans
    ).length;

    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      {/* Header с таймером */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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

          {/* Прогресс бар */}
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 animate-fade-in">
          {/* Заголовок задания */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-display font-semibold">
                  Задание {currentTask.number}
                </span>
                <span className="text-sm text-gray-400 font-sans">
                  {currentTask.points} {currentTask.points === 1 ? 'балл' : 'балла'}
                </span>
              </div>
              <div className="text-sm text-gray-500 font-sans">{currentTask.topic}</div>
            </div>
          </div>

          {/* Текст задания */}
          <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <p className="text-lg text-gray-200 font-sans whitespace-pre-line leading-relaxed">
              {currentTask.text}
            </p>
          </div>

          {/* Варианты ответов */}
          <div className="mb-8">
            {currentTask.type === 'choice' && currentTask.options && (
              <div className="space-y-3">
                {currentTask.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      answers[currentTask.number] === option
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="font-sans">{option}</span>
                  </button>
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

            <div className="flex gap-3">
              {currentTaskIndex === tasks.length - 1 ? (
                <Button onClick={handleFinish}>Завершить тест</Button>
              ) : (
                <Button onClick={handleNext}>Следующее →</Button>
              )}
            </div>
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
    </div>
  );
}
