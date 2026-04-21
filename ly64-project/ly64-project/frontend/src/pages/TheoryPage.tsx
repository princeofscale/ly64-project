import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';

// ==========================================
// Types
// ==========================================

interface TheoryTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // в минутах
  tasks: number[]; // Номера заданий ЕГЭ/ОГЭ
  sections: TheorySection[];
}

interface TheorySection {
  id: string;
  title: string;
  content: string;
  formulas?: string[];
  examples?: TheoryExample[];
  tips?: string[];
}

interface TheoryExample {
  problem: string;
  solution: string;
  answer: string;
}

// ==========================================
// Data
// ==========================================

const mathTopics: TheoryTopic[] = [
  {
    id: 'arithmetic',
    title: 'Арифметика и числа',
    description: 'Действия с числами, дроби, проценты, пропорции',
    icon: '🔢',
    difficulty: 'easy',
    estimatedTime: 30,
    tasks: [1, 2, 3],
    sections: [
      {
        id: 'fractions',
        title: 'Обыкновенные дроби',
        content: `Дробь — это часть целого. Обыкновенная дробь записывается в виде a/b, где a — числитель, b — знаменатель.

**Основные операции:**
- Сложение: a/b + c/d = (ad + bc) / bd
- Вычитание: a/b - c/d = (ad - bc) / bd
- Умножение: a/b × c/d = ac / bd
- Деление: a/b ÷ c/d = ad / bc`,
        formulas: ['a/b + c/d = (ad + bc) / bd', 'a/b × c/d = ac / bd', 'a/b ÷ c/d = ad / bc'],
        examples: [
          {
            problem: 'Вычислите: 2/3 + 1/4',
            solution: '2/3 + 1/4 = (2×4 + 1×3) / (3×4) = (8 + 3) / 12 = 11/12',
            answer: '11/12',
          },
        ],
        tips: [
          'Перед сложением приведите дроби к общему знаменателю',
          'При делении на дробь — умножайте на обратную',
        ],
      },
      {
        id: 'percent',
        title: 'Проценты',
        content: `Процент — это одна сотая часть числа. Обозначается символом %.

**Ключевые формулы:**
- Найти p% от числа a: (a × p) / 100
- Найти число по его p%: (a × 100) / p
- Найти процентное соотношение: (a / b) × 100%`,
        formulas: ['p% от a = (a × p) / 100', 'Число = (часть × 100) / p'],
        examples: [
          {
            problem: 'Найдите 15% от 240',
            solution: '15% от 240 = (240 × 15) / 100 = 3600 / 100 = 36',
            answer: '36',
          },
        ],
        tips: ['1% = 0.01, 50% = 0.5, 100% = 1', 'Чтобы увеличить на p%, умножьте на (1 + p/100)'],
      },
    ],
  },
  {
    id: 'algebra',
    title: 'Алгебра',
    description: 'Уравнения, неравенства, функции, графики',
    icon: '📐',
    difficulty: 'medium',
    estimatedTime: 45,
    tasks: [4, 5, 9, 10],
    sections: [
      {
        id: 'equations',
        title: 'Линейные уравнения',
        content: `Линейное уравнение имеет вид ax + b = 0, где a ≠ 0.

**Решение:** x = -b/a

**Виды уравнений:**
- Линейные: ax + b = 0
- Квадратные: ax² + bx + c = 0
- Дробно-рациональные`,
        formulas: [
          'ax + b = 0 → x = -b/a',
          'ax² + bx + c = 0 → x = (-b ± √D) / 2a',
          'D = b² - 4ac',
        ],
        examples: [
          {
            problem: 'Решите: 3x - 12 = 0',
            solution: '3x = 12, x = 12/3 = 4',
            answer: 'x = 4',
          },
        ],
      },
      {
        id: 'quadratic',
        title: 'Квадратные уравнения',
        content: `Квадратное уравнение: ax² + bx + c = 0

**Дискриминант:** D = b² - 4ac

**Корни:**
- D > 0: два корня x₁,₂ = (-b ± √D) / 2a
- D = 0: один корень x = -b / 2a
- D < 0: нет действительных корней

**Теорема Виета:** x₁ + x₂ = -b/a, x₁ × x₂ = c/a`,
        formulas: ['D = b² - 4ac', 'x = (-b ± √D) / 2a', 'x₁ + x₂ = -b/a', 'x₁ × x₂ = c/a'],
        examples: [
          {
            problem: 'Решите: x² - 5x + 6 = 0',
            solution: 'D = 25 - 24 = 1, x₁ = (5+1)/2 = 3, x₂ = (5-1)/2 = 2',
            answer: 'x = 2 или x = 3',
          },
        ],
        tips: ['По теореме Виета: сумма корней = 5, произведение = 6 → корни 2 и 3'],
      },
    ],
  },
  {
    id: 'geometry',
    title: 'Геометрия',
    description: 'Треугольники, окружности, площади, объёмы',
    icon: '📏',
    difficulty: 'hard',
    estimatedTime: 60,
    tasks: [15, 16, 17, 18, 19],
    sections: [
      {
        id: 'triangles',
        title: 'Треугольники',
        content: `**Виды треугольников:**
- Равносторонний: все стороны равны
- Равнобедренный: две стороны равны
- Прямоугольный: один угол 90°

**Площадь треугольника:**
- S = (1/2) × a × h
- S = (1/2) × a × b × sin(C)
- Формула Герона: S = √(p(p-a)(p-b)(p-c))`,
        formulas: [
          'S = (1/2) × a × h',
          'S = (1/2) × a × b × sin(C)',
          'S = √(p(p-a)(p-b)(p-c))',
          'p = (a + b + c) / 2',
        ],
        examples: [
          {
            problem: 'Найдите площадь треугольника со сторонами 3, 4, 5',
            solution: 'Это прямоугольный треугольник (3² + 4² = 5²). S = (1/2) × 3 × 4 = 6',
            answer: 'S = 6',
          },
        ],
      },
    ],
  },
  {
    id: 'probability',
    title: 'Теория вероятностей',
    description: 'Вероятность событий, комбинаторика',
    icon: '🎲',
    difficulty: 'medium',
    estimatedTime: 30,
    tasks: [6, 7],
    sections: [
      {
        id: 'basic',
        title: 'Классическая вероятность',
        content: `Вероятность события A равна отношению числа благоприятных исходов к общему числу исходов.

**P(A) = m / n**

где m — число благоприятных исходов, n — общее число исходов.

**Свойства:**
- 0 ≤ P(A) ≤ 1
- P(достоверное событие) = 1
- P(невозможное событие) = 0`,
        formulas: [
          'P(A) = m / n',
          'P(A или B) = P(A) + P(B) - P(A и B)',
          'P(A и B) = P(A) × P(B) (для независимых)',
        ],
        examples: [
          {
            problem: 'В коробке 3 красных и 5 синих шаров. Какова вероятность вытащить красный?',
            solution: 'Всего шаров: 3 + 5 = 8. Благоприятных: 3. P = 3/8 = 0.375',
            answer: '0.375 или 3/8',
          },
        ],
      },
    ],
  },
];

// ==========================================
// Components
// ==========================================

const DifficultyBadge: React.FC<{ difficulty: 'easy' | 'medium' | 'hard' }> = ({ difficulty }) => {
  const colors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-amber-500/20 text-amber-400',
    hard: 'bg-red-500/20 text-red-400',
  };
  const labels = {
    easy: 'Базовый',
    medium: 'Средний',
    hard: 'Сложный',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
};

const TopicCard: React.FC<{ topic: TheoryTopic; onClick: () => void }> = ({ topic, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-cyan-500/50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{topic.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">{topic.title}</h3>
            <DifficultyBadge difficulty={topic.difficulty} />
          </div>
          <p className="text-slate-400 text-sm mb-3">{topic.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span>⏱</span> {topic.estimatedTime} мин
            </span>
            <span className="flex items-center gap-1">
              <span>📝</span> Задания: {topic.tasks.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SectionContent: React.FC<{ section: TheorySection }> = ({ section }) => {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="bg-slate-800/30 rounded-xl p-5 mb-4">
      <h4 className="text-lg font-semibold text-white mb-3">{section.title}</h4>

      {/* Content */}
      <div className="text-slate-300 whitespace-pre-line mb-4 leading-relaxed">
        {section.content}
      </div>

      {/* Formulas */}
      {section.formulas && section.formulas.length > 0 && (
        <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
          <h5 className="text-sm font-medium text-cyan-400 mb-2">Формулы:</h5>
          <div className="space-y-1">
            {section.formulas.map((formula, idx) => (
              <div
                key={idx}
                className="text-slate-200 font-mono text-sm bg-slate-800/50 px-3 py-1 rounded"
              >
                {formula}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {section.tips && section.tips.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
          <h5 className="text-sm font-medium text-amber-400 mb-2">💡 Советы:</h5>
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            {section.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      {section.examples && section.examples.length > 0 && (
        <div>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-cyan-400 text-sm font-medium flex items-center gap-1 hover:text-cyan-300"
          >
            {showExamples ? '▼' : '▶'} Примеры ({section.examples.length})
          </button>

          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-3"
              >
                {section.examples.map((example, idx) => (
                  <div key={idx} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-white font-medium mb-2">Задача: {example.problem}</div>
                    <div className="text-slate-400 text-sm mb-2">
                      <span className="text-slate-500">Решение:</span> {example.solution}
                    </div>
                    <div className="text-green-400 font-medium">Ответ: {example.answer}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Main Component
// ==========================================

const TheoryPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<TheoryTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = mathTopics.filter(
    topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 inline-block"
          >
            ← Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Теория по математике</h1>
          <p className="text-slate-400">Изучайте теорию по темам перед решением задач</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Поиск по темам..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <AnimatePresence mode="wait">
          {selectedTopic ? (
            /* Topic Detail View */
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-1"
              >
                ← Назад к списку тем
              </button>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{selectedTopic.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">{selectedTopic.title}</h2>
                      <DifficultyBadge difficulty={selectedTopic.difficulty} />
                    </div>
                    <p className="text-slate-400">{selectedTopic.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <span>⏱ Время изучения: ~{selectedTopic.estimatedTime} мин</span>
                  <span>📝 Задания ЕГЭ: {selectedTopic.tasks.join(', ')}</span>
                  <span>📚 Разделов: {selectedTopic.sections.length}</span>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {selectedTopic.sections.map(section => (
                  <SectionContent key={section.id} section={section} />
                ))}
              </div>

              {/* Practice Button */}
              <div className="mt-8 text-center">
                <Link
                  to={`/test/setup/MATHEMATICS`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-xl transition-colors"
                >
                  Перейти к практике →
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Topics List */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {filteredTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} onClick={() => setSelectedTopic(topic)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredTopics.length === 0 && !selectedTopic && (
          <div className="text-center text-slate-500 py-12">Темы не найдены</div>
        )}
      </main>
    </div>
  );
};

export default TheoryPage;
