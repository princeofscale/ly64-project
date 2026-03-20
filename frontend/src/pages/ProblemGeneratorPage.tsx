import { useState, useMemo } from 'react';

import { Header } from '../components/Header';
import { PROBLEM_TYPES, GRADE_LABELS } from '../data/problemTypes';

import type { Problem } from '../data/problemTypes';

const GRADES = [8, 9, 10, 11] as const;

function ProblemGeneratorPage() {
 const [selectedGrade, setSelectedGrade] = useState<number>(8);
 const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
 const grade8 = PROBLEM_TYPES.filter(t => t.grade === 8);
 return grade8.slice(0, 2).map(t => t.id);
 });
 const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
 const [userAnswer, setUserAnswer] = useState('');
 const [showAnswer, setShowAnswer] = useState(false);
 const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
 const [stats, setStats] = useState({ correct: 0, wrong: 0 });
 const [showHint, setShowHint] = useState(false);

 const gradeTypes = useMemo(
 () => PROBLEM_TYPES.filter(t => t.grade === selectedGrade),
 [selectedGrade],
 );

 const gradeCounts = useMemo(() => {
 const counts: Record<number, number> = {};
 for (const g of GRADES) counts[g] = PROBLEM_TYPES.filter(t => t.grade === g).length;
 return counts;
 }, []);

 const handleGradeChange = (grade: number) => {
 setSelectedGrade(grade);
 const types = PROBLEM_TYPES.filter(t => t.grade === grade);
 setSelectedTypes(types.slice(0, 2).map(t => t.id));
 setCurrentProblem(null);
 setUserAnswer('');
 setShowAnswer(false);
 setIsCorrect(null);
 setShowHint(false);
 };

 const generateProblem = () => {
 if (selectedTypes.length === 0) return;
 const typeId = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
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

 const normalize = (s: string) => s.toLowerCase().replace(/\s/g, '').replace(',', '.');
 const expected = normalize(String(currentProblem.answer));
 const actual = normalize(userAnswer);

 let correct = expected === actual;

 if (!correct) {
 const numExpected = parseFloat(expected);
 const numActual = parseFloat(actual);
 if (!isNaN(numExpected) && !isNaN(numActual)) {
 correct = Math.abs(numExpected - numActual) < 0.01;
 }
 }

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

 const toggleAll = () => {
 if (selectedTypes.length === gradeTypes.length) {
 setSelectedTypes([]);
 } else {
 setSelectedTypes(gradeTypes.map(t => t.id));
 }
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
 <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="absolute top-20 left-10 w-72 h-72 bg-pink-100/50 rounded-full blur-[120px]" />
 <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-100/50 rounded-full blur-[120px]" />

 <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-5xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>
 Генератор задач
 </h1>
 <p className="text-slate-600 text-lg">Тренируйся решать задачи на скорость</p>
 </div>

 {}
 <div className="flex flex-wrap gap-2 mb-8 justify-center">
 {GRADES.map(g => (
 <button
 key={g}
 onClick={() => handleGradeChange(g)}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
 selectedGrade === g
 ? 'bg-pink-500 text-white shadow-md'
 : 'bg-white border border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-600'
 }`}
 >
 {GRADE_LABELS[g]} ({gradeCounts[g]})
 </button>
 ))}
 </div>

 {/* Статистика */}
 <div className="flex flex-wrap justify-center gap-4 mb-8">
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
 <div className=" border border-slate-200 rounded-2xl p-6 mb-8 shadow-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-bold " style={{ color: 'var(--color-text)' }}>Типы задач</h2>
 <button
 onClick={toggleAll}
 className="text-sm text-pink-600 hover:text-pink-700 font-medium"
 >
 {selectedTypes.length === gradeTypes.length ? 'Снять все' : 'Выбрать все'}
 </button>
 </div>
 <div className="flex flex-wrap gap-2">
 {gradeTypes.map(type => (
 <button
 key={type.id}
 onClick={() => toggleType(type.id)}
 className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
 selectedTypes.includes(type.id)
 ? 'bg-pink-500 text-white shadow-lg'
 : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
 }`}
 >
 <span className="mr-1.5">{type.icon}</span>
 {type.name}
 </button>
 ))}
 </div>
 </div>

 {/* Задача */}
 <div className=" border border-slate-200 rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
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
 {showHint ? `Подсказка: ${currentProblem.hint}` : 'Показать подсказку'}
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
 // eslint-disable-next-line jsx-a11y/no-autofocus
 autoFocus
 />
 </div>

 {showAnswer ? (
 <div className="text-center space-y-4">
 <div
 className={`text-2xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}
 >
 {isCorrect ? 'Верно!' : `Неверно. Ответ: ${currentProblem.answer}`}
 </div>
 <button
 onClick={generateProblem}
 className="px-8 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors shadow-lg"
 >
 Следующая задача
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
