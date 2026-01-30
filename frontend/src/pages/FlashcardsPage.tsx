import { useState, useEffect } from 'react';
import { Header } from '../components/Header';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardSet {
  id: string;
  name: string;
  subject: string;
  cards: Flashcard[];
  isCustom?: boolean;
}

const DEFAULT_SETS: FlashcardSet[] = [
  {
    id: 'math-formulas',
    name: 'Формулы математики',
    subject: 'Математика',
    cards: [
      { id: '1', front: 'Площадь круга', back: 'S = πr²' },
      { id: '2', front: 'Теорема Пифагора', back: 'a² + b² = c²' },
      { id: '3', front: 'Дискриминант', back: 'D = b² - 4ac' },
      { id: '4', front: 'Корни квадратного уравнения', back: 'x = (-b ± √D) / 2a' },
      { id: '5', front: 'Площадь треугольника', back: 'S = ½ · a · h' },
      { id: '6', front: 'Объём шара', back: 'V = (4/3)πr³' },
      { id: '7', front: 'Сумма арифметической прогрессии', back: 'Sn = (a₁ + aₙ) · n / 2' },
      { id: '8', front: 'Формула n-го члена арифм. прогрессии', back: 'aₙ = a₁ + (n-1) · d' },
    ],
  },
  {
    id: 'physics-formulas',
    name: 'Формулы физики',
    subject: 'Физика',
    cards: [
      { id: '1', front: 'Скорость', back: 'v = S / t' },
      { id: '2', front: 'Ускорение', back: 'a = (v - v₀) / t' },
      { id: '3', front: 'Сила', back: 'F = m · a' },
      { id: '4', front: 'Кинетическая энергия', back: 'Eₖ = mv² / 2' },
      { id: '5', front: 'Потенциальная энергия', back: 'Eₚ = mgh' },
      { id: '6', front: 'Закон Ома', back: 'I = U / R' },
      { id: '7', front: 'Мощность', back: 'P = A / t = U · I' },
      { id: '8', front: 'Давление', back: 'p = F / S' },
    ],
  },
  {
    id: 'russian-terms',
    name: 'Термины русского языка',
    subject: 'Русский язык',
    cards: [
      { id: '1', front: 'Метафора', back: 'Скрытое сравнение, перенос свойств одного предмета на другой' },
      { id: '2', front: 'Эпитет', back: 'Образное определение, придающее выражению яркость' },
      { id: '3', front: 'Олицетворение', back: 'Наделение неживых предметов человеческими качествами' },
      { id: '4', front: 'Гипербола', back: 'Художественное преувеличение' },
      { id: '5', front: 'Литота', back: 'Художественное преуменьшение' },
      { id: '6', front: 'Анафора', back: 'Повторение слов в начале строк или предложений' },
      { id: '7', front: 'Антитеза', back: 'Противопоставление понятий или образов' },
      { id: '8', front: 'Оксюморон', back: 'Сочетание противоположных по смыслу слов' },
    ],
  },
  {
    id: 'history-dates',
    name: 'Даты истории России',
    subject: 'История',
    cards: [
      { id: '1', front: 'Крещение Руси', back: '988 год' },
      { id: '2', front: 'Куликовская битва', back: '1380 год' },
      { id: '3', front: 'Освобождение от ордынского ига', back: '1480 год' },
      { id: '4', front: 'Начало правления Петра I', back: '1682 год' },
      { id: '5', front: 'Основание Санкт-Петербурга', back: '1703 год' },
      { id: '6', front: 'Отечественная война', back: '1812 год' },
      { id: '7', front: 'Отмена крепостного права', back: '1861 год' },
      { id: '8', front: 'Октябрьская революция', back: '1917 год' },
    ],
  },
];

function FlashcardsPage() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newCards, setNewCards] = useState('');
  const [studyMode, setStudyMode] = useState<'all' | 'unknown'>('all');

  // Загрузка наборов из localStorage
  useEffect(() => {
    const customSets = localStorage.getItem('flashcard-sets');
    if (customSets) {
      const parsed = JSON.parse(customSets);
      setSets([...DEFAULT_SETS, ...parsed]);
    } else {
      setSets(DEFAULT_SETS);
    }
  }, []);

  // Сохранение кастомных наборов
  const saveCustomSets = (allSets: FlashcardSet[]) => {
    const customOnly = allSets.filter(s => s.isCustom);
    localStorage.setItem('flashcard-sets', JSON.stringify(customOnly));
  };

  const selectSet = (set: FlashcardSet) => {
    setSelectedSet(set);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setStudyMode('all');
  };

  const currentCards = selectedSet
    ? studyMode === 'all'
      ? selectedSet.cards
      : selectedSet.cards.filter(c => !knownCards.has(c.id))
    : [];

  const currentCard = currentCards[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < currentCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        setCurrentIndex(currentCards.length - 1);
      }
    }, 150);
  };

  const markAsKnown = () => {
    if (currentCard) {
      const newKnown = new Set(knownCards);
      newKnown.add(currentCard.id);
      setKnownCards(newKnown);
      nextCard();
    }
  };

  const resetProgress = () => {
    setKnownCards(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const createNewSet = () => {
    if (!newSetName.trim() || !newCards.trim()) {
      alert('Заполните название и карточки');
      return;
    }

    // Парсим карточки: каждая строка = "вопрос | ответ" или "вопрос - ответ"
    const cardLines = newCards.split('\n').filter(l => l.trim());
    const cards: Flashcard[] = cardLines.map((line, i) => {
      const [front, back] = line.split(/[|\-—]/).map(s => s.trim());
      return {
        id: `custom-${Date.now()}-${i}`,
        front: front || line,
        back: back || '?',
      };
    });

    if (cards.length < 2) {
      alert('Добавьте минимум 2 карточки');
      return;
    }

    const newSet: FlashcardSet = {
      id: `custom-${Date.now()}`,
      name: newSetName,
      subject: 'Свой набор',
      cards,
      isCustom: true,
    };

    const updatedSets = [...sets, newSet];
    setSets(updatedSets);
    saveCustomSets(updatedSets);
    setShowCreateModal(false);
    setNewSetName('');
    setNewCards('');
    selectSet(newSet);
  };

  const deleteSet = (setId: string) => {
    if (confirm('Удалить этот набор?')) {
      const updatedSets = sets.filter(s => s.id !== setId);
      setSets(updatedSets);
      saveCustomSets(updatedSets);
      if (selectedSet?.id === setId) {
        setSelectedSet(null);
      }
    }
  };

  const progress = selectedSet
    ? Math.round((knownCards.size / selectedSet.cards.length) * 100)
    : 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-30" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

        <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Флеш-карточки
            </h1>
            <p className="text-gray-400 text-lg">
              Эффективный способ запоминания формул, терминов и дат
            </p>
          </div>

          {!selectedSet ? (
            // Выбор набора
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Выберите набор</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition-colors"
                >
                  + Создать свой
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sets.map(set => (
                  <div
                    key={set.id}
                    className="group relative bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all cursor-pointer"
                    onClick={() => selectSet(set)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                        {set.subject}
                      </span>
                      {set.isCustom && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSet(set.id); }}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{set.name}</h3>
                    <p className="text-gray-400 text-sm">{set.cards.length} карточек</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Режим изучения
            <div>
              <button
                onClick={() => setSelectedSet(null)}
                className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к наборам
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedSet.name}</h2>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-gray-400">
                    Карточка {currentIndex + 1} из {currentCards.length}
                  </span>
                  <span className="text-green-400">
                    Изучено: {knownCards.size} / {selectedSet.cards.length}
                  </span>
                </div>

                {/* Прогресс */}
                <div className="w-full max-w-md mx-auto mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {currentCards.length > 0 ? (
                <>
                  {/* Карточка */}
                  <div className="flex justify-center mb-8">
                    <div
                      className="relative w-full max-w-lg h-72 cursor-pointer perspective-1000"
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <div
                        className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Передняя сторона */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500/30 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <p className="text-gray-400 text-sm mb-4">Вопрос</p>
                          <p className="text-2xl font-bold text-white text-center">{currentCard?.front}</p>
                          <p className="text-gray-500 text-sm mt-6">Нажмите, чтобы перевернуть</p>
                        </div>

                        {/* Задняя сторона */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-2 border-green-500/50 rounded-2xl p-8 flex flex-col items-center justify-center"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <p className="text-green-400 text-sm mb-4">Ответ</p>
                          <p className="text-2xl font-bold text-white text-center">{currentCard?.back}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Управление */}
                  <div className="flex justify-center gap-4 mb-8">
                    <button
                      onClick={prevCard}
                      className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={markAsKnown}
                      className="px-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition-colors"
                    >
                      Знаю!
                    </button>

                    <button
                      onClick={nextCard}
                      className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                    >
                      Не знаю
                    </button>

                    <button
                      onClick={nextCard}
                      className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Опции */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setStudyMode(studyMode === 'all' ? 'unknown' : 'all')}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        studyMode === 'unknown'
                          ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                          : 'bg-gray-800 border border-gray-700 text-gray-400'
                      }`}
                    >
                      {studyMode === 'all' ? 'Показать только неизученные' : 'Показать все'}
                    </button>

                    <button
                      onClick={resetProgress}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl text-sm hover:text-white transition-colors"
                    >
                      Сбросить прогресс
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Поздравляем!</h3>
                  <p className="text-gray-400 mb-6">Вы выучили все карточки в этом наборе!</p>
                  <button
                    onClick={resetProgress}
                    className="px-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition-colors"
                  >
                    Повторить ещё раз
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Модалка создания набора */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-white mb-4">Создать набор карточек</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Название набора</label>
                  <input
                    type="text"
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    placeholder="Например: Английские слова"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Карточки (формат: вопрос | ответ)
                  </label>
                  <textarea
                    value={newCards}
                    onChange={(e) => setNewCards(e.target.value)}
                    placeholder={"Hello | Привет\nGoodbye | До свидания\nThank you | Спасибо"}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none"
                    rows={6}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Каждая карточка на новой строке. Разделитель: | или -
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={createNewSet}
                  className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition-colors"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FlashcardsPage;
