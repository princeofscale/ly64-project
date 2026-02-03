import { useState, useRef, useCallback } from 'react';

import { Header } from '../components/Header';

interface WheelSegment {
  label: string;
  color: string;
}

const DEFAULT_SEGMENTS: WheelSegment[] = [
  { label: 'Математика', color: '#06b6d4' },
  { label: 'Физика', color: '#8b5cf6' },
  { label: 'Информатика', color: '#10b981' },
  { label: 'Русский язык', color: '#f59e0b' },
  { label: 'История', color: '#ef4444' },
  { label: 'Биология', color: '#ec4899' },
  { label: 'Химия', color: '#6366f1' },
  { label: 'География', color: '#14b8a6' },
];

function SpinWheelPage() {
  const [segments, setSegments] = useState<WheelSegment[]>(DEFAULT_SEGMENTS);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = useCallback(() => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const segmentAngle = 360 / segments.length;

    // Случайное количество оборотов (5-10) + случайный угол
    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + randomAngle;

    setRotation(totalRotation);

    // Определяем победителя после остановки
    setTimeout(() => {
      // Нормализуем угол (0-360)
      const normalizedRotation = ((totalRotation % 360) + 360) % 360;
      // Колесо крутится по часовой стрелке. Указатель сверху. Сегмент 0 изначально сверху.
      // При повороте на R градусов по часовой:
      // - Сегмент 0 уходит вправо
      // - Под указатель приходит сегмент, который был слева (против часовой)
      // - Это сегмент с индексом (n - R/segmentAngle) mod n
      const winnerIndex =
        Math.floor((360 - normalizedRotation) / segmentAngle + segments.length) % segments.length;
      setWinner(segments[winnerIndex].label);
      setIsSpinning(false);
    }, 5000);
  }, [isSpinning, rotation, segments]);

  const addCustomSegments = () => {
    if (!customInput.trim()) return;

    // Разделяем по запятой, точке с запятой или новой строке
    const newLabels = customInput
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (newLabels.length < 2) {
      alert('Введите минимум 2 варианта, разделённых запятой, точкой с запятой или новой строкой');
      return;
    }

    const colors = [
      '#06b6d4',
      '#8b5cf6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#ec4899',
      '#6366f1',
      '#14b8a6',
      '#84cc16',
      '#f97316',
    ];

    const newSegments = newLabels.map((label, i) => ({
      label,
      color: colors[i % colors.length],
    }));

    setSegments(newSegments);
    setCustomInput('');
    setWinner(null);
    setRotation(0);
  };

  const resetToDefault = () => {
    setSegments(DEFAULT_SEGMENTS);
    setWinner(null);
    setRotation(0);
  };

  // Создаем SVG сегменты колеса
  const renderWheel = () => {
    const centerX = 200;
    const centerY = 200;
    const radius = 190;
    const segmentAngle = 360 / segments.length;

    return segments.map((segment, index) => {
      const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArc = segmentAngle > 180 ? 1 : 0;

      const pathD = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      // Позиция текста
      const textAngle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);
      const textRotation = index * segmentAngle + segmentAngle / 2;

      return (
        <g key={index}>
          <path
            d={pathD}
            fill={segment.color}
            stroke="#1f2937"
            strokeWidth="2"
            className="transition-all duration-300 hover:brightness-110"
          />
          <text
            x={textX}
            y={textY}
            fill="white"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            {segment.label.length > 12 ? segment.label.slice(0, 10) + '...' : segment.label}
          </text>
        </g>
      );
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white relative overflow-hidden">
        {/* Фоновые эффекты */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px]" />

        <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Колесо Фортуны
            </h1>
            <p className="text-slate-600 text-lg">
              Крутите колесо для случайного выбора темы, ученика или любого варианта!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Колесо */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Указатель */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
                </div>

                {/* Внешнее свечение */}
                <div
                  className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${isSpinning ? 'bg-gradient-to-r from-violet-200/70 to-blue-200/70 scale-110' : 'bg-gradient-to-r from-violet-200/40 to-blue-200/40'}`}
                />

                {/* Колесо */}
                <div
                  ref={wheelRef}
                  className="relative"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning
                      ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                      : 'none',
                  }}
                >
                  <svg width="400" height="400" viewBox="0 0 400 400">
                    {/* Внешний круг */}
                    <circle
                      cx="200"
                      cy="200"
                      r="198"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="4"
                    />
                    {renderWheel()}
                    {/* Центральный круг */}
                    <circle
                      cx="200"
                      cy="200"
                      r="30"
                      fill="#1f2937"
                      stroke="#6366f1"
                      strokeWidth="3"
                    />
                    <circle cx="200" cy="200" r="15" fill="#6366f1" />
                  </svg>
                </div>
              </div>

              {/* Кнопка вращения */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || segments.length === 0}
                className={`mt-8 px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
                  isSpinning || segments.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSpinning ? 'Крутится...' : 'Крутить!'}
              </button>

              {/* Результат */}
              {winner && (
                <div className="mt-8 p-6 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-2xl animate-fade-in shadow-lg">
                  <p className="text-slate-600 text-sm mb-2">Выпало:</p>
                  <p className="text-3xl font-bold text-violet-600">
                    {winner}
                  </p>
                </div>
              )}
            </div>

            {/* Настройки */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Настроить варианты</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 text-sm mb-2">
                      Введите варианты (каждый с новой строки или через запятую):
                    </label>
                    <textarea
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder={
                        'Иванов\nПетров\nСидоров\nКозлова\n\nили: Иванов, Петров, Сидоров'
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors resize-none"
                      rows={4}
                    />
                    {customInput.trim() && (
                      <p className="text-sm text-slate-500 mt-2">
                        Распознано вариантов:{' '}
                        {
                          customInput
                            .split(/[,;\n]+/)
                            .map(s => s.trim())
                            .filter(s => s.length > 0).length
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={addCustomSegments}
                      className="flex-1 px-4 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors shadow-lg"
                    >
                      Применить
                    </button>
                    <button
                      onClick={resetToDefault}
                      className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:text-slate-900 transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                </div>
              </div>

              {/* Текущие варианты */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Текущие варианты ({segments.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {segments.map((segment, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-md"
                      style={{
                        backgroundColor: segment.color,
                      }}
                    >
                      {segment.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Подсказки */}
              <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-600 mb-3">Идеи для использования</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Выбор ученика для ответа у доски
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-2">•</span>
                    Случайная тема для обсуждения
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    Распределение заданий между группами
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    Выбор предмета для повторения
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default SpinWheelPage;
