import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';
import { getActiveTestService } from '../core/services';
import { ConfettiService } from '../core/services/ConfettiService';
import { ogeRussianVariants } from '../data/oge-russian-variants';
import api from '../services/api';

import type { OgeRussianVariant } from '../data/oge-russian-variants';

type TestPhase = 'select' | 'test' | 'results';

export default function OgeRussianTestPage() {
 const navigate = useNavigate();
 const location = useLocation();
 const { grade } = location.state || {};

 const [phase, setPhase] = useState<TestPhase>('select');
 const [selectedVariant, setSelectedVariant] = useState<OgeRussianVariant | null>(null);
 const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
 const [answers, setAnswers] = useState<Record<number, string>>({});
 const [timeLeft, setTimeLeft] = useState(0);
 const [showExitConfirm, setShowExitConfirm] = useState(false);

 const currentTask = selectedVariant?.tasks[currentTaskIndex];
 const progress = selectedVariant && selectedVariant.tasks.length > 0
 ? ((currentTaskIndex + 1) / selectedVariant.tasks.length) * 100
 : 0;
 const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

 const calculateScore = useCallback(() => {
 if (!selectedVariant) return 0;
 let totalPoints = 0;
 let maxPoints = 0;

 selectedVariant.tasks.forEach(task => {
 maxPoints += task.points;
 const userAnswerRaw = answers[task.number];
 if (task.type !== 'detailed' && userAnswerRaw) {
 const userAnswer = userAnswerRaw.toLowerCase().replace(/\s+/g, '');
 const correctAnswer = task.correctAnswer.toLowerCase().replace(/\s+/g, '');
 if (userAnswer === correctAnswer) {
 totalPoints += task.points;
 }
 }
 });

 return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
 }, [answers, selectedVariant]);

 const handleFinish = useCallback(() => {
 const activeTestService = getActiveTestService();
 activeTestService.completeTest();
 setPhase('results');

 const score = calculateScore();
 const totalTasks = selectedVariant?.tasks.length || 0;
 const correctCount = totalTasks > 0 ? Math.round((score / 100) * totalTasks) : 0;

 void api.post('/tests/submit-result', {
 subject: 'RUSSIAN',
 examType: 'OGE',
 score,
 totalQuestions: totalTasks,
 correctCount,
 title: `ОГЭ Русский язык - ${selectedVariant?.title || 'Вариант'}`,
 }).catch(() => {
 // Don't block results display if submission fails
 });

 setTimeout(() => {
 ConfettiService.scoreBasedCelebration(score);
 }, 300);

 toast.success('Тест завершён!');
 }, [calculateScore, selectedVariant]);

 useEffect(() => {
 if (phase === 'test' && selectedVariant) {
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
 }
 }, [phase, selectedVariant, handleFinish]);

 const formatTime = (seconds: number) => {
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = seconds % 60;
 return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 };

 const handleSelectVariant = (variant: OgeRussianVariant) => {
 setSelectedVariant(variant);
 setAnswers({});
 setCurrentTaskIndex(0);
 setTimeLeft(variant.duration * 60);
 setPhase('test');

 const activeTestService = getActiveTestService();
 activeTestService.startTest({
 examType: 'OGE',
 subject: 'RUSSIAN',
 grade: 9,
 title: `ОГЭ Русский язык - ${variant.title}`,
 startedAt: new Date().toISOString(),
 currentTaskIndex: 0,
 answeredCount: 0,
 totalTasks: variant.tasks.length,
 timeLeftSeconds: variant.duration * 60,
 route: '/test/oge-russian',
 });

 toast.success(`Начинаем ${variant.title}`);
 };

 const handleAnswer = (answer: string) => {
 if (!currentTask) return;
 setAnswers(prev => ({
 ...prev,
 [currentTask.number]: answer,
 }));
 };

 const handleNext = () => {
 if (selectedVariant && currentTaskIndex < selectedVariant.tasks.length - 1) {
 setCurrentTaskIndex(prev => prev + 1);
 }
 };

 const handlePrevious = () => {
 if (currentTaskIndex > 0) {
 setCurrentTaskIndex(prev => prev - 1);
 }
 };

 const handleExit = () => {
 setShowExitConfirm(true);
 };

 const handleConfirmExit = () => {
 const activeTestService = getActiveTestService();
 activeTestService.abandonTest();
 toast('Тест прерван', { icon: '⚠️' });
 void navigate('/dashboard');
 };

 const getTimeColor = () => {
 if (!selectedVariant) return 'text-blue-600';
 const totalTime = selectedVariant.duration * 60;
 if (timeLeft > totalTime * 0.5) return 'text-blue-600';
 if (timeLeft > totalTime * 0.25) return 'text-amber-600';
 return 'text-red-600';
 };

 if (!grade) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="text-center">
 <p className="text-slate-600 mb-4">Ошибка загрузки теста</p>
 <Button onClick={() => { void navigate('/dashboard'); }}>Вернуться</Button>
 </div>
 </div>
 );
 }

 if (phase === 'select') {
 return (
 <div className="min-h-screen relative overflow-hidden py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>

 <div className="relative z-10 max-w-4xl mx-auto">
 <button
 onClick={() => { void navigate('/dashboard'); }}
 className="group mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
 >
 <svg
 className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
 />
 </svg>
 Назад
 </button>

 <div className="text-center mb-10">
 <div className="text-6xl mb-4">📖</div>
 <h1 className="text-4xl font-bold  mb-3" style={{ color: 'var(--color-text)' }}>
 ОГЭ Русский язык
 </h1>
 <p className="text-slate-600 text-lg">Выберите вариант из открытого банка ФИПИ</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {ogeRussianVariants.map((variant, index) => (
 <button
 key={variant.id}
 onClick={() => handleSelectVariant(variant)}
 className="group bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-6 text-left hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
 style={{ animationDelay: `${index * 50}ms` }}
 >
 <div className="flex items-center justify-between mb-4">
 <span className="text-3xl font-bold text-blue-600">#{variant.id}</span>
 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-200">
 ФИПИ
 </span>
 </div>
 <h3 className="text-lg font-semibold  mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--color-text)' }}>
 {variant.title}
 </h3>
 <div className="space-y-1 text-sm text-slate-600">
 <div className="flex items-center gap-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
 />
 </svg>
 {variant.tasks.length} заданий
 </div>
 <div className="flex items-center gap-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 {Math.floor(variant.duration / 60)} ч {variant.duration % 60} мин
 </div>
 </div>
 </button>
 ))}
 </div>

 <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
 <h3 className="text-lg font-semibold  mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
 <span>ℹ️</span> Структура ОГЭ по русскому языку
 </h3>
 <ul className="space-y-2 text-slate-700 text-sm">
 <li>
 • <strong>Задание 1:</strong> Сжатое изложение (7 баллов)
 </li>
 <li>
 • <strong>Задания 2-12:</strong> Тестовые задания с кратким ответом (по 1 баллу)
 </li>
 <li>
 • <strong>Задание 13:</strong> Сочинение-рассуждение (9 баллов)
 </li>
 <li>
 • <strong>Время:</strong> 3 часа 55 минут
 </li>
 </ul>
 </div>
 </div>
 </div>
 );
 }

 if (phase === 'results' && selectedVariant) {
 const score = calculateScore();
 const getScoreEmoji = () => {
 if (score >= 90) return '🏆';
 if (score >= 80) return '🎉';
 if (score >= 70) return '👏';
 if (score >= 60) return '👍';
 return '💪';
 };

 const getScoreMessage = () => {
 if (score >= 90) return 'Превосходно!';
 if (score >= 80) return 'Отлично!';
 if (score >= 70) return 'Хорошо!';
 if (score >= 60) return 'Неплохо!';
 return 'Есть над чем поработать';
 };

 return (
 <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="relative z-10 max-w-3xl mx-auto">
 <div className=" backdrop-blur-xl border border-slate-200 rounded-3xl p-8 text-center shadow-2xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="text-6xl mb-4">{getScoreEmoji()}</div>
 <h1 className="text-4xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>
 {getScoreMessage()}
 </h1>
 <p className="text-slate-600 mb-6">{selectedVariant.title} завершён</p>

 <div className="mb-8 p-6 bg-slate-50 rounded-2xl">
 <div className="text-5xl font-bold text-blue-600 mb-2">
 {score}%
 </div>
 <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
 <div
 className={`h-full rounded-full transition-all duration-1000 ${
 score >= 80
 ? 'bg-gradient-to-r from-green-500 to-emerald-500'
 : score >= 60
 ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
 : 'bg-gradient-to-r from-red-500 to-orange-500'
 }`}
 style={{ width: `${score}%` }}
 />
 </div>
 <div className="grid grid-cols-2 gap-4 text-center">
 <div>
 <div className="text-2xl font-bold text-blue-600">
 {answeredCount}/{selectedVariant.tasks.length}
 </div>
 <div className="text-sm text-slate-600">отвечено</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-violet-600">
 {selectedVariant.tasks.reduce((sum, t) => sum + t.points, 0)}
 </div>
 <div className="text-sm text-slate-600">макс. баллов</div>
 </div>
 </div>
 </div>

 <div className="flex gap-4 justify-center">
 <Button onClick={() => { void navigate('/dashboard'); }}>К панели управления</Button>
 <Button variant="outline" onClick={() => setPhase('select')}>
 Выбрать другой вариант
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (!selectedVariant || !currentTask) return null;

 return (
 <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="sticky top-0 z-50 /80 backdrop-blur-xl border-b border-slate-200" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="max-w-7xl mx-auto px-4 py-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="text-2xl font-bold text-slate-900">
 ОГЭ Русский язык
 </div>
 <div className="text-sm text-slate-600">{selectedVariant.title}</div>
 </div>

 <div className="flex items-center gap-6">
 <div className="flex items-center gap-2">
 <svg
 className={`w-5 h-5 ${getTimeColor()}`}
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
 {formatTime(timeLeft)}
 </span>
 </div>

 <div className="text-sm text-slate-600">
 <span className="text-blue-600 font-semibold">{answeredCount}</span> /{' '}
 {selectedVariant.tasks.length}
 </div>

 <button
 onClick={handleExit}
 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
 >
 Выйти
 </button>
 </div>
 </div>

 <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
 <div
 className="h-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>
 </div>

 <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
 <div className=" backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="flex items-start justify-between mb-6">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 font-semibold">
 Задание {currentTask.number}
 </span>
 <span className="text-sm text-slate-600">
 {currentTask.points}{' '}
 {currentTask.points === 1 ? 'балл' : currentTask.points < 5 ? 'балла' : 'баллов'}
 </span>
 </div>
 <div className="text-sm text-slate-500">{currentTask.topic}</div>
 </div>
 </div>

 {currentTask.number === 1 && currentTask.audioUrl && currentTask.audioTitle && (
 <div className="mb-6">
 </div>
 )}

 <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
 <p className="text-lg text-slate-900 whitespace-pre-line leading-relaxed">
 {currentTask.text}
 </p>
 </div>

 <div className="mb-8">
 {currentTask.type === 'choice' && currentTask.options && (
 <div className="space-y-3">
 {currentTask.options.map((option, index) => (
 <button
 key={index}
 onClick={() => handleAnswer(option)}
 className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
 answers[currentTask.number] === option
 ? 'border-blue-500 bg-blue-50 text-slate-900'
 : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
 }`}
 >
 {option}
 </button>
 ))}
 </div>
 )}

 {currentTask.type === 'multiple_choice' && currentTask.options && (
 <div className="space-y-3">
 <p className="text-sm text-slate-600 mb-2">Выберите все правильные ответы</p>
 {currentTask.options.map((option, index) => {
 const currentAnswers = answers[currentTask.number]?.split(',') || [];
 const optionKey = (index + 1).toString();
 const isSelected = currentAnswers.includes(optionKey);

 return (
 <button
 key={index}
 onClick={() => {
 let newAnswers: string[];
 if (isSelected) {
 newAnswers = currentAnswers.filter(a => a !== optionKey);
 } else {
 newAnswers = [...currentAnswers, optionKey].sort();
 }
 handleAnswer(newAnswers.filter(a => a).join(','));
 }}
 className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
 isSelected
 ? 'border-blue-500 bg-blue-50 text-slate-900'
 : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
 }`}
 >
 <div
 className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
 isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-400'
 }`}
 >
 {isSelected && (
 <svg
 className="w-3 h-3 text-white"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={3}
 d="M5 13l4 4L19 7"
 />
 </svg>
 )}
 </div>
 {option}
 </button>
 );
 })}
 </div>
 )}

 {(currentTask.type === 'short' || currentTask.type === 'matching') && (
 <div>
 <label htmlFor="oge-russian-answer" className="block text-sm text-slate-700 mb-2">Введите ответ:</label>
 <input
 id="oge-russian-answer"
 type="text"
 value={answers[currentTask.number] || ''}
 onChange={e => handleAnswer(e.target.value)}
 placeholder="Ваш ответ"
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
 />
 </div>
 )}

 {currentTask.type === 'detailed' && (
 <div>
 <label htmlFor="oge-russian-detailed" className="block text-sm text-slate-700 mb-2">Развёрнутый ответ:</label>
 <textarea
 id="oge-russian-detailed"
 value={answers[currentTask.number] || ''}
 onChange={e => handleAnswer(e.target.value)}
 placeholder="Напишите ваш ответ..."
 rows={10}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical"
 />
 <p className="mt-2 text-sm text-slate-500">Минимальный объём — 70 слов</p>
 </div>
 )}
 </div>

 <div className="flex items-center justify-between pt-6 border-t border-slate-200">
 <Button variant="outline" onClick={handlePrevious} disabled={currentTaskIndex === 0}>
 ← Предыдущее
 </Button>

 <div className="flex gap-3">
 {currentTaskIndex === selectedVariant.tasks.length - 1 ? (
 <Button onClick={handleFinish}>Завершить тест</Button>
 ) : (
 <Button onClick={handleNext}>Следующее →</Button>
 )}
 </div>
 </div>
 </div>

 <div className="mt-6  backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h3 className="text-sm text-slate-600 mb-3">Навигация:</h3>
 <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
 {selectedVariant.tasks.map((task, index) => (
 <button
 key={task.number}
 onClick={() => setCurrentTaskIndex(index)}
 className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
 currentTaskIndex === index
 ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white scale-110'
 : answers[task.number]
 ? 'bg-blue-50 border border-blue-200 text-blue-600'
 : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300'
 }`}
 >
 {task.number}
 </button>
 ))}
 </div>
 </div>
 </div>

 {showExitConfirm && (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
 <div className=" rounded-2xl p-6 max-w-md w-full border border-slate-200 animate-scale-in" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h4 className="text-xl font-semibold text-slate-900 mb-3">Выйти из теста?</h4>
 <p className="text-slate-600 mb-2">
 Вы ответили на <span className="text-blue-600 font-semibold">{answeredCount}</span>{' '}
 из <span className="text-slate-900">{selectedVariant.tasks.length}</span> вопросов.
 </p>
 <p className="text-slate-600 mb-6">
 Вы можете вернуться и продолжить позже или завершить тест сейчас.
 </p>
 <div className="flex flex-col gap-3">
 <button
 onClick={() => setShowExitConfirm(false)}
 className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all"
 >
 Продолжить тест
 </button>
 <button
 onClick={handleFinish}
 className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all"
 >
 Завершить и сохранить
 </button>
 <button
 onClick={handleConfirmExit}
 className="w-full px-4 py-3 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-all"
 >
 Выйти без сохранения
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
