import { useState } from 'react';

import { Header } from '../components/Header';

interface Challenge {
 id: string;
 subject: string;
 subjectIcon: string;
 question: string;
 options?: string[];
 answer: string;
 explanation: string;
 difficulty: 'easy' | 'medium' | 'hard';
 points: number;
}

const CHALLENGES_POOL: Challenge[] = [
 {
 id: '1',
 subject: 'Математика',
 subjectIcon: '📐',
 question: 'Чему равен дискриминант уравнения x² - 5x + 6 = 0?',
 options: ['1', '25', '49', '-1'],
 answer: '1',
 explanation: 'D = b² - 4ac = (-5)² - 4·1·6 = 25 - 24 = 1',
 difficulty: 'easy',
 points: 10,
 },
 {
 id: '2',
 subject: 'Физика',
 subjectIcon: '⚛️',
 question: 'Тело массой 2 кг движется со скоростью 3 м/с. Чему равна его кинетическая энергия?',
 options: ['6 Дж', '9 Дж', '18 Дж', '3 Дж'],
 answer: '9 Дж',
 explanation: 'Eₖ = mv²/2 = 2·3²/2 = 2·9/2 = 9 Дж',
 difficulty: 'easy',
 points: 10,
 },
 {
 id: '3',
 subject: 'Русский язык',
 subjectIcon: '📖',
 question: 'Какое средство выразительности использовано:"Горит восток зарёю новой"?',
 options: ['Метафора', 'Эпитет', 'Олицетворение', 'Сравнение'],
 answer: 'Метафора',
 explanation: 'Метафора — скрытое сравнение."Горит" — перенос свойств огня на зарю.',
 difficulty: 'medium',
 points: 15,
 },
 {
 id: '4',
 subject: 'История',
 subjectIcon: '📜',
 question: 'В каком году произошла Куликовская битва?',
 options: ['1240', '1380', '1480', '1612'],
 answer: '1380',
 explanation:
 'Куликовская битва состоялась 8 сентября 1380 года под предводительством Дмитрия Донского.',
 difficulty: 'easy',
 points: 10,
 },
 {
 id: '5',
 subject: 'Химия',
 subjectIcon: '🧪',
 question: 'Какой газ выделяется при взаимодействии соляной кислоты с цинком?',
 options: ['Кислород', 'Водород', 'Хлор', 'Азот'],
 answer: 'Водород',
 explanation: 'Zn + 2HCl → ZnCl₂ + H₂↑. Цинк вытесняет водород из кислоты.',
 difficulty: 'medium',
 points: 15,
 },
 {
 id: '6',
 subject: 'Информатика',
 subjectIcon: '💻',
 question: 'Чему равно 1010₂ в десятичной системе счисления?',
 options: ['8', '10', '12', '5'],
 answer: '10',
 explanation: '1010₂ = 1·2³ + 0·2² + 1·2¹ + 0·2⁰ = 8 + 0 + 2 + 0 = 10',
 difficulty: 'easy',
 points: 10,
 },
 {
 id: '7',
 subject: 'Биология',
 subjectIcon: '🧬',
 question: 'Какая органелла клетки отвечает за синтез белка?',
 options: ['Митохондрия', 'Рибосома', 'Лизосома', 'Аппарат Гольджи'],
 answer: 'Рибосома',
 explanation: 'Рибосомы — органеллы, осуществляющие биосинтез белка (трансляцию).',
 difficulty: 'medium',
 points: 15,
 },
 {
 id: '8',
 subject: 'Математика',
 subjectIcon: '📐',
 question: 'Найдите производную функции f(x) = x³ + 2x',
 options: ['3x² + 2', 'x² + 2', '3x + 2', '3x²'],
 answer: '3x² + 2',
 explanation:"f'(x) = (x³)' + (2x)' = 3x² + 2",
 difficulty: 'medium',
 points: 15,
 },
 {
 id: '9',
 subject: 'Физика',
 subjectIcon: '⚛️',
 question: 'Чему равна сила тока в цепи, если напряжение 12 В, а сопротивление 4 Ом?',
 options: ['48 А', '3 А', '8 А', '0.33 А'],
 answer: '3 А',
 explanation: 'По закону Ома: I = U/R = 12/4 = 3 А',
 difficulty: 'easy',
 points: 10,
 },
 {
 id: '10',
 subject: 'География',
 subjectIcon: '🌍',
 question: 'Какая река является самой длинной в России?',
 options: ['Волга', 'Обь', 'Лена', 'Енисей'],
 answer: 'Лена',
 explanation:
 'Лена — 4400 км (с притоками). Часто путают с Волгой (3530 км), которая самая длинная в Европе.',
 difficulty: 'medium',
 points: 15,
 },
];

function getDailyChallenge(): Challenge {
 const today = new Date();
 const dayOfYear = Math.floor(
 (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
 );
 const index = dayOfYear % CHALLENGES_POOL.length;
 return CHALLENGES_POOL[index]!;
}

function DailyChallengePage() {
 const [challenge] = useState<Challenge>(getDailyChallenge);

 const [state, setState] = useState(() => {
 const saved = localStorage.getItem('daily-challenge-progress');
 if (saved) {
 let data: { lastAnswered?: string; lastAnswer?: string | null; streak?: number; totalPoints?: number };
 try { data = JSON.parse(saved); } catch { return { selectedAnswer: null, isAnswered: false, streak: 0, totalPoints: 0 }; }
 const today = new Date().toDateString();
 const isAnsweredToday = data.lastAnswered === today;
 return {
 selectedAnswer: isAnsweredToday ? (data.lastAnswer ?? null) : null,
 isAnswered: isAnsweredToday,
 streak: data.streak || 0,
 totalPoints: data.totalPoints || 0,
 };
 }
 return {
 selectedAnswer: null,
 isAnswered: false,
 streak: 0,
 totalPoints: 0,
 };
 });

 const setSelectedAnswer = (answer: string | null) => setState(s => ({ ...s, selectedAnswer: answer }));
 const setIsAnswered = (answered: boolean) => setState(s => ({ ...s, isAnswered: answered }));
 const setStreak = (streak: number) => setState(s => ({ ...s, streak }));
 const setTotalPoints = (points: number) => setState(s => ({ ...s, totalPoints: points }));

 const { selectedAnswer, isAnswered, streak, totalPoints } = state;

 const handleAnswer = (answer: string) => {
 if (isAnswered) return;

 setSelectedAnswer(answer);
 setIsAnswered(true);

 const isCorrect = answer === challenge.answer;
 const today = new Date().toDateString();

 const newStreak = isCorrect ? streak + 1 : 0;
 const newPoints = isCorrect ? totalPoints + challenge.points : totalPoints;

 setStreak(newStreak);
 setTotalPoints(newPoints);

 localStorage.setItem(
 'daily-challenge-progress',
 JSON.stringify({
 streak: newStreak,
 totalPoints: newPoints,
 lastAnswered: today,
 lastAnswer: answer,
 })
 );
 };

 const isCorrect = selectedAnswer === challenge.answer;
 const timeUntilNext = getTimeUntilMidnight();

 return (
 <>
 <Header />
 <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="absolute top-20 left-10 w-72 h-72 bg-amber-100/50 rounded-full blur-[120px]" />
 <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-100/50 rounded-full blur-[120px]" />

 <main className="relative z-10 max-w-3xl mx-auto px-4 py-12">
 <div className="text-center mb-8">
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-200 rounded-full text-amber-700 text-sm mb-4 shadow-md">
 <span className="animate-pulse">🔥</span>
 <span>Ежедневный челлендж</span>
 </div>
 <h1 className="text-4xl md:text-5xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>
 Задача дня
 </h1>
 <p className="text-slate-600">Решай одну задачу каждый день и набирай очки!</p>
 </div>

 <div className="flex justify-center gap-4 mb-8">
 <div className="bg-orange-50 border border-orange-200 rounded-xl px-6 py-3 text-center shadow-lg">
 <p className="text-2xl font-bold text-orange-600">🔥 {streak}</p>
 <p className="text-orange-600/70 text-sm">дней подряд</p>
 </div>
 <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-3 text-center shadow-lg">
 <p className="text-2xl font-bold text-amber-600">⭐ {totalPoints}</p>
 <p className="text-amber-600/70 text-sm">очков</p>
 </div>
 </div>

 <div className=" border border-slate-200 rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
 <div className="flex items-center gap-3">
 <span className="text-3xl">{challenge.subjectIcon}</span>
 <div>
 <p className="text-slate-900 font-semibold">{challenge.subject}</p>
 <p className="text-slate-600 text-sm">
 {challenge.difficulty === 'easy' && '🟢 Легко'}
 {challenge.difficulty === 'medium' && '🟡 Средне'}
 {challenge.difficulty === 'hard' && '🔴 Сложно'}
 {' · '}
 {challenge.points} очков
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-slate-600 text-sm">Следующая через</p>
 <p className="text-slate-900 font-mono">{timeUntilNext}</p>
 </div>
 </div>

 <div className="p-6">
 <p className="text-xl text-slate-900 font-medium mb-6 leading-relaxed">
 {challenge.question}
 </p>

 <div className="space-y-3">
 {challenge.options?.map((option, index) => {
 const letter = String.fromCharCode(65 + index);
 const isSelected = selectedAnswer === option;
 const isCorrectOption = option === challenge.answer;

 let bgColor = 'bg-slate-50 hover:bg-slate-100';
 let borderColor = 'border-slate-200';
 let textColor = 'text-slate-700';

 if (isAnswered) {
 if (isCorrectOption) {
 bgColor = 'bg-emerald-50';
 borderColor = 'border-emerald-500';
 textColor = 'text-emerald-700';
 } else if (isSelected && !isCorrectOption) {
 bgColor = 'bg-red-50';
 borderColor = 'border-red-500';
 textColor = 'text-red-700';
 }
 } else if (isSelected) {
 bgColor = 'bg-amber-50';
 borderColor = 'border-amber-500';
 textColor = 'text-amber-700';
 }

 return (
 <button
 key={option}
 onClick={() => !isAnswered && handleAnswer(option)}
 disabled={isAnswered}
 className={`w-full p-4 rounded-xl border ${borderColor} ${bgColor} ${textColor} text-left transition-all ${
 !isAnswered ? 'cursor-pointer' : 'cursor-default'
 }`}
 >
 <span className="font-bold mr-3">{letter}.</span>
 {option}
 {isAnswered && isCorrectOption && <span className="float-right">✓</span>}
 {isAnswered && isSelected && !isCorrectOption && (
 <span className="float-right">✗</span>
 )}
 </button>
 );
 })}
 </div>

 {isAnswered && (
 <div
 className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}
 >
 <p className={`font-bold mb-2 ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
 {isCorrect ? '🎉 Отлично! +' + challenge.points + ' очков' : '😔 Неверно'}
 </p>
 <p className="text-slate-700 text-sm">
 <span className="text-slate-600">Объяснение:</span> {challenge.explanation}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Подсказка */}
 <p className="text-center text-slate-500 text-sm mt-6">
 Новая задача появляется каждый день в полночь
 </p>
 </main>
 </div>
 </>
 );
}

function getTimeUntilMidnight(): string {
 const now = new Date();
 const midnight = new Date(now);
 midnight.setHours(24, 0, 0, 0);

 const diff = midnight.getTime() - now.getTime();
 const hours = Math.floor(diff / (1000 * 60 * 60));
 const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

 return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export default DailyChallengePage;
