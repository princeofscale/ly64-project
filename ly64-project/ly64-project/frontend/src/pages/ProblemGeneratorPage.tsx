import { useState } from 'react';

import { Header } from '../components/Header';

interface Problem {
  question: string;
  answer: string | number;
  hint?: string;
}

interface ProblemType {
  id: string;
  name: string;
  icon: string;
  generate: () => Problem;
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const PROBLEM_TYPES: ProblemType[] = [
  {
    id: 'addition',
    name: 'Сложение',
    icon: '➕',
    generate: () => {
      const a = rand(10, 999);
      const b = rand(10, 999);
      return { question: `${a} + ${b} = ?`, answer: a + b };
    },
  },
  {
    id: 'subtraction',
    name: 'Вычитание',
    icon: '➖',
    generate: () => {
      const a = rand(100, 999);
      const b = rand(10, a);
      return { question: `${a} - ${b} = ?`, answer: a - b };
    },
  },
  {
    id: 'multiplication',
    name: 'Умножение',
    icon: '✖️',
    generate: () => {
      const a = rand(2, 12);
      const b = rand(2, 12);
      return { question: `${a} × ${b} = ?`, answer: a * b };
    },
  },
  {
    id: 'division',
    name: 'Деление',
    icon: '➗',
    generate: () => {
      const b = rand(2, 12);
      const answer = rand(2, 12);
      const a = b * answer;
      return { question: `${a} ÷ ${b} = ?`, answer };
    },
  },
  {
    id: 'percent',
    name: 'Проценты',
    icon: '%',
    generate: () => {
      const percents = [10, 20, 25, 50, 75];
      const p = percents[rand(0, percents.length - 1)]!;
      const base = rand(2, 20) * 10;
      return {
        question: `${p}% от ${base} = ?`,
        answer: (base * p) / 100,
        hint: `${p}% = ${p}/100`,
      };
    },
  },
  {
    id: 'square',
    name: 'Квадрат числа',
    icon: 'x²',
    generate: () => {
      const a = rand(2, 15);
      return { question: `${a}² = ?`, answer: a * a };
    },
  },
  {
    id: 'sqrt',
    name: 'Корень квадратный',
    icon: '√',
    generate: () => {
      const answer = rand(2, 15);
      const a = answer * answer;
      return { question: `√${a} = ?`, answer };
    },
  },
  {
    id: 'equation',
    name: 'Уравнения',
    icon: '🔢',
    generate: () => {
      const x = rand(2, 20);
      const a = rand(2, 10);
      const b = rand(1, 50);
      const result = a * x + b;
      return {
        question: `${a}x + ${b} = ${result}. Найди x`,
        answer: x,
        hint: `${a}x = ${result} - ${b}`,
      };
    },
  },
  {
    id: 'fraction',
    name: 'Дроби',
    icon: '½',
    generate: () => {
      const types = [
        () => {
          const a = rand(1, 5);
          const b = rand(a + 1, 10);
          const c = rand(1, 5);
          return {
            question: `${a}/${b} + ${c}/${b} = ?`,
            answer: `${a + c}/${b}`,
          };
        },
        () => {
          const whole = rand(1, 5);
          const num = rand(1, 3);
          const den = rand(num + 1, 8);
          return {
            question: `Преобразуй ${whole} ${num}/${den} в неправильную дробь`,
            answer: `${whole * den + num}/${den}`,
          };
        },
      ];
      const generator = types[rand(0, types.length - 1)];
      return generator ? generator() : types[0]!();
    },
  },
  {
    id: 'geometry',
    name: 'Геометрия',
    icon: '📐',
    generate: () => {
      const types = [
        () => {
          const a = rand(3, 15);
          const b = rand(3, 15);
          return {
            question: `Площадь прямоугольника ${a} × ${b} = ?`,
            answer: a * b,
            hint: 'S = a × b',
          };
        },
        () => {
          const a = rand(3, 10);
          return {
            question: `Периметр квадрата со стороной ${a} = ?`,
            answer: a * 4,
            hint: 'P = 4a',
          };
        },
        () => {
          const a = rand(3, 12);
          const h = rand(2, 10);
          return {
            question: `Площадь треугольника с основанием ${a} и высотой ${h} = ?`,
            answer: (a * h) / 2,
            hint: 'S = (a × h) / 2',
          };
        },
      ];
      const generator = types[rand(0, types.length - 1)];
      return generator ? generator() : types[0]!();
    },
  },
];

function ProblemGeneratorPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['addition', 'multiplication']);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [showHint, setShowHint] = useState(false);

  const generateProblem = () => {
    if (selectedTypes.length === 0) return;

    const typeId = selectedTypes[rand(0, selectedTypes.length - 1)];
    const type = PROBLEM_TYPES.find(t => t.id === typeId);
    if (type) {
      setCurrentProblem(type.generate());
      setUserAnswer('');
      setShowAnswer(false);
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const checkAnswer = () => {
    if (!currentProblem || !userAnswer.trim()) return;

    const correct =
      String(currentProblem.answer).toLowerCase().replace(/\s/g, '') ===
      userAnswer.toLowerCase().replace(/\s/g, '');

    setIsCorrect(correct);
    setShowAnswer(true);
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const resetStats = () => {
    setStats({ correct: 0, wrong: 0 });
    setCurrentProblem(null);
  };

  const accuracy =
    stats.correct + stats.wrong > 0
      ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
      : 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-100/50 rounded-full blur-[120px]" />

        <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Генератор задач
            </h1>
            <p className="text-slate-600 text-lg">Тренируйся решать задачи на скорость</p>
          </div>

          {/* Статистика */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-3 text-center shadow-lg">
              <p className="text-2xl font-bold text-emerald-600">{stats.correct}</p>
              <p className="text-emerald-600/70 text-sm">Верно</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-3 text-center shadow-lg">
              <p className="text-2xl font-bold text-red-600">{stats.wrong}</p>
              <p className="text-red-600/70 text-sm">Ошибок</p>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-6 py-3 text-center shadow-lg">
              <p className="text-2xl font-bold text-violet-600">{accuracy}%</p>
              <p className="text-violet-600/70 text-sm">Точность</p>
            </div>
            {(stats.correct > 0 || stats.wrong > 0) && (
              <button
                onClick={resetStats}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-600 hover:text-slate-900 transition-colors shadow-lg"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* Выбор типов задач */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Типы задач</h2>
            <div className="flex flex-wrap gap-2">
              {PROBLEM_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedTypes.includes(type.id)
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Задача */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
            {currentProblem ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    {currentProblem.question}
                  </p>

                  {currentProblem.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      {showHint ? `Подсказка: ${currentProblem.hint}` : '💡 Показать подсказку'}
                    </button>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !showAnswer && checkAnswer()}
                    placeholder="Ваш ответ"
                    disabled={showAnswer}
                    className="w-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-2xl text-center font-bold focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:opacity-50"
                    autoFocus
                  />
                </div>

                {showAnswer ? (
                  <div className="text-center space-y-4">
                    <div
                      className={`text-2xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {isCorrect ? '✓ Верно!' : `✗ Неверно. Ответ: ${currentProblem.answer}`}
                    </div>
                    <button
                      onClick={generateProblem}
                      className="px-8 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors shadow-lg"
                    >
                      Следующая задача →
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={checkAnswer}
                      disabled={!userAnswer.trim()}
                      className="px-8 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Проверить
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-6">Выберите типы задач и нажмите кнопку</p>
                <button
                  onClick={generateProblem}
                  disabled={selectedTypes.length === 0}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  Начать тренировку
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default ProblemGeneratorPage;
