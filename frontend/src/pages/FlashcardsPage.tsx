import { useState, useMemo, useRef, useEffect } from 'react';

import { Header } from '../components/Header';
import {
 DEFAULT_SETS,
 DIFFICULTY_CONFIG,
 GRADE_LABELS,
} from '../data/flashcardSets';

import type { Flashcard, FlashcardSet } from '../data/flashcardSets';

const GRADES = [8, 9, 10, 11] as const;

function FlashcardsPage() {
 const [sets, setSets] = useState<FlashcardSet[]>(() => {
 const customSets = localStorage.getItem('flashcard-sets');
 if (customSets) {
 try {
 const parsed = JSON.parse(customSets);
 return [...DEFAULT_SETS, ...parsed];
 } catch {
 return DEFAULT_SETS;
 }
 }
 return DEFAULT_SETS;
 });
 const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isFlipped, setIsFlipped] = useState(false);
 const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [newSetName, setNewSetName] = useState('');
 const [newCards, setNewCards] = useState('');
 const [studyMode, setStudyMode] = useState<'all' | 'unknown'>('all');
 const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
 const flipTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

 // Cleanup pending flip timer on unmount
 useEffect(() => () => { clearTimeout(flipTimerRef.current); }, []);

 const filteredSets = useMemo(() => {
 if (selectedGrade === null) return sets;
 return sets.filter(s => s.grade === selectedGrade || s.isCustom);
 }, [sets, selectedGrade]);

 const gradeCounts = useMemo(() => {
 const counts: Record<number, number> = {};
 for (const g of GRADES) {
 counts[g] = sets.filter(s => s.grade === g).length;
 }
 return counts;
 }, [sets]);

 const saveCustomSets = (allSets: FlashcardSet[]) => {
 const customOnly = allSets.filter(s => s.isCustom);
 localStorage.setItem('flashcard-sets', JSON.stringify(customOnly));
 };

 const selectSet = (set: FlashcardSet) => {
 setSelectedSet(set);
 setCurrentIndex(0);
 setIsFlipped(false);
 // Restore progress from localStorage
 const saved = localStorage.getItem(`flashcard-progress-${set.id}`);
 let restoredKnown: string[] = [];
 if (saved) { try { restoredKnown = JSON.parse(saved) as string[]; } catch {} }
 setKnownCards(new Set(restoredKnown));
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
 clearTimeout(flipTimerRef.current);
 flipTimerRef.current = setTimeout(() => {
 if (currentIndex < currentCards.length - 1) {
 setCurrentIndex(currentIndex + 1);
 } else {
 setCurrentIndex(0);
 }
 }, 150);
 };

 const prevCard = () => {
 setIsFlipped(false);
 clearTimeout(flipTimerRef.current);
 flipTimerRef.current = setTimeout(() => {
 if (currentIndex > 0) {
 setCurrentIndex(currentIndex - 1);
 } else {
 setCurrentIndex(currentCards.length - 1);
 }
 }, 150);
 };

 const markAsKnown = () => {
 if (currentCard && selectedSet) {
 const newKnown = new Set(knownCards);
 newKnown.add(currentCard.id);
 setKnownCards(newKnown);
 localStorage.setItem(`flashcard-progress-${selectedSet.id}`, JSON.stringify([...newKnown]));
 nextCard();
 }
 };

 const markAsUnknown = () => {
 if (currentCard && selectedSet) {
 const newKnown = new Set(knownCards);
 newKnown.delete(currentCard.id);
 setKnownCards(newKnown);
 localStorage.setItem(`flashcard-progress-${selectedSet.id}`, JSON.stringify([...newKnown]));
 nextCard();
 }
 };

 const resetProgress = () => {
 if (selectedSet) {
 localStorage.removeItem(`flashcard-progress-${selectedSet.id}`);
 }
 setKnownCards(new Set());
 setCurrentIndex(0);
 setIsFlipped(false);
 };

 const createNewSet = () => {
 if (!newSetName.trim() || !newCards.trim()) {
 alert('Заполните название и карточки');
 return;
 }

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
 grade: selectedGrade || 9,
 difficulty: 'medium',
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

 const progress = selectedSet && selectedSet.cards.length > 0 ? Math.round((knownCards.size / selectedSet.cards.length) * 100) : 0;

 return (
 <>
 <Header />
 <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
 {/* Background blur circles */}
 <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
 <div
 className="absolute bottom-20 left-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"
 style={{ animationDelay: '1s' }}
 />

 <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-5xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>
 Флеш-карточки
 </h1>
 <p className="text-slate-600 text-lg">
 Эффективный способ запоминания формул, терминов и дат
 </p>
 </div>

 {!selectedSet ? (
 // Выбор набора
 <div>
 {/* Grade tabs */}
 <div className="flex flex-wrap gap-2 mb-6 justify-center">
 <button
 onClick={() => setSelectedGrade(null)}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
 selectedGrade === null
 ? 'bg-blue-600 text-white shadow-md'
 : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
 }`}
 >
 Все ({sets.length})
 </button>
 {GRADES.map(g => (
 <button
 key={g}
 onClick={() => setSelectedGrade(g)}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
 selectedGrade === g
 ? 'bg-blue-600 text-white shadow-md'
 : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
 }`}
 >
 {GRADE_LABELS[g]} ({gradeCounts[g]})
 </button>
 ))}
 </div>

 <div className="flex justify-between items-center mb-6">
 <h2 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>
 {selectedGrade ? GRADE_LABELS[selectedGrade] : 'Все наборы'}
 </h2>
 <button
 onClick={() => setShowCreateModal(true)}
 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-colors"
 >
 + Создать свой
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredSets.map(set => {
 const diffConfig = DIFFICULTY_CONFIG[set.difficulty];
 return (
 <div
 key={set.id}
 role="button"
 tabIndex={0}
 className="group relative bg-white border border-slate-200 shadow-lg rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl transition-all cursor-pointer"
 onClick={() => selectSet(set)}
 onKeyDown={(e) => e.key === 'Enter' && selectSet(set)}
 >
 <div className="flex justify-between items-start mb-3">
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
 {set.subject}
 </span>
 <span className={`px-2 py-1 text-xs rounded-lg font-medium ${diffConfig.className}`}>
 {diffConfig.label}
 </span>
 {!set.isCustom && (
 <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium">
 {GRADE_LABELS[set.grade]}
 </span>
 )}
 </div>
 {set.isCustom && (
 <button
 onClick={e => {
 e.stopPropagation();
 deleteSet(set.id);
 }}
 className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <svg
 className="w-5 h-5"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
 />
 </svg>
 </button>
 )}
 </div>
 <h3 className="text-xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>{set.name}</h3>
 {(() => {
 const saved = localStorage.getItem(`flashcard-progress-${set.id}`);
 let _parsed: string[] = [];
 try { if (saved) _parsed = JSON.parse(saved) as string[]; } catch {}
 const knownCount = _parsed.length;
 const pct = set.cards.length > 0 ? Math.round((knownCount / set.cards.length) * 100) : 0;
 return knownCount > 0 ? (
 <div className="mb-2">
 <div className="flex justify-between text-xs text-slate-500 mb-1">
 <span>{knownCount}/{set.cards.length} изучено</span>
 <span className="text-emerald-600 font-medium">{pct}%</span>
 </div>
 <div
 role="progressbar"
 aria-valuenow={pct}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-label={`Прогресс набора: ${pct}%`}
 className="w-full h-1.5 rounded-full bg-slate-100"
 >
 <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
 </div>
 </div>
 ) : null;
 })()}
 <p className="text-slate-600 text-sm">{set.cards.length} карточек</p>
 </div>
 );
 })}
 </div>
 </div>
 ) : (
 // Режим изучения
 <div>
 <button
 onClick={() => setSelectedSet(null)}
 className="mb-6 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2"
 >
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 19l-7-7 7-7"
 />
 </svg>
 Назад к наборам
 </button>

 <div className="text-center mb-8">
 <div className="flex justify-center gap-2 mb-3">
 <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
 {selectedSet.subject}
 </span>
 <span className={`px-2 py-1 text-xs rounded-lg font-medium ${DIFFICULTY_CONFIG[selectedSet.difficulty].className}`}>
 {DIFFICULTY_CONFIG[selectedSet.difficulty].label}
 </span>
 {!selectedSet.isCustom && (
 <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium">
 {GRADE_LABELS[selectedSet.grade]}
 </span>
 )}
 </div>
 <h2 className="text-2xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>{selectedSet.name}</h2>
 <div className="flex justify-center gap-4 text-sm">
 <span className="text-slate-600">
 Карточка {currentIndex + 1} из {currentCards.length}
 </span>
 <span className="text-emerald-600 font-medium">
 Изучено: {knownCards.size} / {selectedSet.cards.length}
 </span>
 </div>

 {/* Прогресс */}
 <div
 role="progressbar"
 aria-valuenow={progress}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-label={`Изучено ${knownCards.size} из ${selectedSet.cards.length} карточек`}
 className="w-full max-w-md mx-auto mt-4 h-2 bg-slate-200 rounded-full overflow-hidden"
 >
 <div
 className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>

 {currentCards.length > 0 ? (
 <>
 {/* Карточка */}
 <div className="flex justify-center mb-8">
 <div
 role="button"
 tabIndex={0}
 className="relative w-full max-w-lg h-72 cursor-pointer perspective-1000"
 onClick={() => setIsFlipped(!isFlipped)}
 onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}
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
 className="absolute inset-0 bg-white border-2 border-emerald-300 shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden"
 style={{ backfaceVisibility: 'hidden' }}
 >
 <p className="text-slate-500 text-sm mb-4 font-medium">Вопрос</p>
 <p className="text-2xl font-bold text-slate-900 text-center">
 {currentCard?.front}
 </p>
 <p className="text-slate-400 text-sm mt-6">Нажмите, чтобы перевернуть</p>
 </div>

 {/* Задняя сторона */}
 <div
 className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-400 shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center"
 style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
 >
 <p className="text-emerald-600 text-sm mb-4 font-medium">Ответ</p>
 <p className="text-2xl font-bold text-slate-900 text-center">
 {currentCard?.back}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Управление */}
 <div className="flex justify-center gap-4 mb-8">
 <button
 onClick={prevCard}
 aria-label="Предыдущая карточка"
 className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
 >
 <svg
 className="w-6 h-6"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 19l-7-7 7-7"
 />
 </svg>
 </button>

 <button
 onClick={markAsKnown}
 aria-label="Знаю — отметить и перейти к следующей"
 className="px-6 py-3 bg-green-500/20 border border-green-500/50 text-emerald-600 rounded-xl font-medium hover:bg-green-500/30 transition-colors"
 >
 Знаю!
 </button>

 <button
 onClick={markAsUnknown}
 className="px-6 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
 aria-label="Не знаю — снять отметку и перейти к следующей"
 >
 Не знаю
 </button>
 </div>

 {/* Опции */}
 <div className="flex justify-center gap-4">
 <button
 onClick={() => setStudyMode(studyMode === 'all' ? 'unknown' : 'all')}
 className={`px-4 py-2 rounded-xl text-sm transition-colors ${
 studyMode === 'unknown'
 ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
 : 'bg-slate-50 border border-slate-200 text-slate-500'
 }`}
 >
 {studyMode === 'all' ? 'Показать только неизученные' : 'Показать все'}
 </button>

 <button
 onClick={resetProgress}
 className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-sm hover:text-slate-900 transition-colors"
 >
 Сбросить прогресс
 </button>
 </div>
 </>
 ) : (
 <div className="text-center py-16">
 <div className="text-6xl mb-4">🎉</div>
 <h3 className="text-2xl font-bold text-emerald-600 mb-2">Поздравляем!</h3>
 <p className="text-slate-500 mb-6">Вы выучили все карточки в этом наборе!</p>
 <button
 onClick={resetProgress}
 className="px-6 py-3 bg-green-500/20 border border-green-500/50 text-emerald-600 rounded-xl font-medium hover:bg-green-500/30 transition-colors"
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
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
 <div className=" border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-xl" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h3 className="text-xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>Создать набор карточек</h3>

 <div className="space-y-4">
 <div>
 <label htmlFor="set-name-input" className="block text-slate-500 text-sm mb-2">Название набора</label>
 <input
 id="set-name-input"
 type="text"
 value={newSetName}
 onChange={e => setNewSetName(e.target.value)}
 placeholder="Например: Английские слова"
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
 />
 </div>

 <div>
 <label htmlFor="cards-input" className="block text-slate-500 text-sm mb-2">
 Карточки (формат: вопрос | ответ)
 </label>
 <textarea
 id="cards-input"
 value={newCards}
 onChange={e => setNewCards(e.target.value)}
 placeholder={'Hello | Привет\nGoodbye | До свидания\nThank you | Спасибо'}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
 rows={6}
 />
 <p className="text-slate-400 text-xs mt-1">
 Каждая карточка на новой строке. Разделитель: | или -
 </p>
 </div>
 </div>

 <div className="flex gap-3 mt-6">
 <button
 onClick={() => setShowCreateModal(false)}
 className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl hover:text-slate-900 transition-colors"
 >
 Отмена
 </button>
 <button
 onClick={createNewSet}
 className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500/50 text-emerald-600 rounded-xl font-medium hover:bg-green-500/30 transition-colors"
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
