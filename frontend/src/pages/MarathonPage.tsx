import { SUBJECT_LABELS } from '@lyceum64/shared';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

interface MarathonQuestion {
 id: string;
 question: string;
 options: string[] | null;
 type: string;
 topic: string | null;
 difficulty: string;
 subject: string;
}

interface LeaderboardEntry {
 id: string;
 userId: string;
 username: string;
 name: string;
 score: number;
 questionsAnswered: number;
 maxStreak: number;
 difficulty: string;
}

type Tab = 'play' | 'leaderboard';
type GameState = 'select' | 'playing' | 'gameover';

const SUBJECTS = Object.entries(SUBJECT_LABELS) as [string, string][];

const difficultyLabels: Record<string, string> = {
 EASY: 'Лёгкий',
 MEDIUM: 'Средний',
 HARD: 'Сложный',
};

const difficultyColors: Record<string, string> = {
 EASY: 'text-green-600 bg-green-50 border-green-200',
 MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
 HARD: 'text-red-600 bg-red-50 border-red-200',
};

export default function MarathonPage() {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState<Tab>('play');
 const [gameState, setGameState] = useState<GameState>('select');
 const [selectedSubject, setSelectedSubject] = useState<string>('');

 // Game state
 const [runId, setRunId] = useState<string>('');
 const [currentQuestion, setCurrentQuestion] = useState<MarathonQuestion | null>(null);
 const [score, setScore] = useState(0);
 const [mistakes, setMistakes] = useState(0);
 const [streak, setStreak] = useState(0);
 const [difficulty, setDifficulty] = useState('EASY');
 const [questionsAnswered, setQuestionsAnswered] = useState(0);
 const [answeredIds, setAnsweredIds] = useState<string[]>([]);
 const [selectedAnswer, setSelectedAnswer] = useState<string>('');
 const [textAnswer, setTextAnswer] = useState('');
 const [showResult, setShowResult] = useState(false);
 const [lastCorrect, setLastCorrect] = useState(false);
 const [lastCorrectAnswer, setLastCorrectAnswer] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 // Leaderboard
 const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
 const [leaderboardSubject, setLeaderboardSubject] = useState<string>('MATHEMATICS');
 const [leaderboardLoading, setLeaderboardLoading] = useState(false);

 // Game over stats
 const [finalScore, setFinalScore] = useState(0);
 const [finalQuestions, setFinalQuestions] = useState(0);
 const [finalMaxStreak, setFinalMaxStreak] = useState(0);

 const startMarathon = useCallback(async () => {
 if (!selectedSubject) return;
 setIsLoading(true);
 try {
 const response = await api.post('/marathon/start', { subject: selectedSubject });
 const data = response.data.data;
 setRunId(data.runId);
 setCurrentQuestion(data.firstQuestion);
 setScore(0);
 setMistakes(0);
 setStreak(0);
 setDifficulty('EASY');
 setQuestionsAnswered(0);
 setAnsweredIds([]);
 setGameState('playing');
 } catch {
 // Error handled by axios interceptor
 } finally {
 setIsLoading(false);
 }
 }, [selectedSubject]);

 const submitAnswer = useCallback(async () => {
 if (!currentQuestion || !runId) return;

 const answer = currentQuestion.options ? selectedAnswer : textAnswer;
 if (!answer) return;

 setIsLoading(true);
 try {
 const response = await api.post(`/marathon/${runId}/answer`, {
 questionId: currentQuestion.id,
 answer,
 answeredIds,
 });

 const result = response.data.data;
 setLastCorrect(result.isCorrect);
 setLastCorrectAnswer(result.correctAnswer);
 setShowResult(true);
 setScore(result.score);
 setMistakes(result.mistakes);
 setStreak(result.streak);
 setDifficulty(result.newDifficulty);
 setQuestionsAnswered(result.questionsAnswered);
 setAnsweredIds(prev => [...prev, currentQuestion.id]);

 if (result.isGameOver) {
 setFinalScore(result.score);
 setFinalQuestions(result.questionsAnswered);
 setFinalMaxStreak(result.streak);
 setTimeout(() => {
 setGameState('gameover');
 setShowResult(false);
 }, 1500);
 } else {
 setTimeout(() => {
 setCurrentQuestion(result.nextQuestion);
 setSelectedAnswer('');
 setTextAnswer('');
 setShowResult(false);
 }, 1500);
 }
 } catch {
 // Error
 } finally {
 setIsLoading(false);
 }
 }, [currentQuestion, runId, selectedAnswer, textAnswer, answeredIds]);

 const loadLeaderboard = useCallback(async (subject: string) => {
 setLeaderboardLoading(true);
 try {
 const response = await api.get(`/marathon/leaderboard?subject=${subject}&limit=20`);
 setLeaderboard(response.data.data);
 } catch {
 setLeaderboard([]);
 } finally {
 setLeaderboardLoading(false);
 }
 }, []);

 useEffect(() => {
 if (activeTab === 'leaderboard') {
 void loadLeaderboard(leaderboardSubject);
 }
 }, [activeTab, leaderboardSubject, loadLeaderboard]);

 const renderHearts = () => {
 const hearts = [];
 for (let i = 0; i < 3; i++) {
 hearts.push(
 <span key={i} className={`text-2xl transition-all ${i < 3 - mistakes ? 'scale-100' : 'scale-75 opacity-30 grayscale'}`}>
 {i < 3 - mistakes ? '❤️' : '🖤'}
 </span>
 );
 }
 return hearts;
 };

 return (
 <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-4xl mx-auto">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <button
 onClick={() => void navigate('/dashboard')}
 className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
 </svg>
 Назад
 </button>
 <h1 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>Марафон</h1>
 <div className="w-16" />
 </div>

 {/* Tabs */}
 {gameState === 'select' && (
 <div className="flex gap-2 mb-6">
 <button
 onClick={() => setActiveTab('play')}
 className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
 activeTab === 'play'
 ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
 : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
 }`}
 >
 Играть
 </button>
 <button
 onClick={() => setActiveTab('leaderboard')}
 className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
 activeTab === 'leaderboard'
 ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
 : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
 }`}
 >
 Рейтинг
 </button>
 </div>
 )}

 {/* Subject Selection */}
 {gameState === 'select' && activeTab === 'play' && (
 <div className=" border border-slate-200 rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="text-center mb-8">
 <div className="text-6xl mb-4">🏃</div>
 <h2 className="text-3xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Режим «Марафон»</h2>
 <p className="text-slate-600">
 Бесконечная цепочка задач с нарастающей сложностью. У вас 3 жизни — постарайтесь набрать максимальный счёт!
 </p>
 </div>

 <div className="mb-8">
 <h3 className="text-lg font-semibold  mb-4" style={{ color: 'var(--color-text)' }}>Выберите предмет</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
 {SUBJECTS.map(([key, label]) => (
 <button
 key={key}
 onClick={() => setSelectedSubject(key)}
 className={`p-4 rounded-xl border-2 transition-all text-center ${
 selectedSubject === key
 ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20'
 : 'border-slate-200 bg-white hover:border-orange-300'
 }`}
 >
 <div className={`text-sm font-medium ${selectedSubject === key ? 'text-orange-700' : 'text-slate-700'}`}>
 {label}
 </div>
 </button>
 ))}
 </div>
 </div>

 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
 <h4 className="font-semibold text-orange-900 mb-2">Правила:</h4>
 <ul className="text-sm text-orange-800 space-y-1">
 <li>• Вопросы идут бесконечно с нарастающей сложностью</li>
 <li>• За каждый правильный ответ — очки (бонус за серию и сложность)</li>
 <li>• 3 ошибки — конец марафона</li>
 <li>• Сложность растёт: Лёгкий → Средний → Сложный</li>
 </ul>
 </div>

 <button
 onClick={() => void startMarathon()}
 disabled={!selectedSubject || isLoading}
 className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
 >
 {isLoading ? 'Загрузка...' : !selectedSubject ? 'Выберите предмет' : 'Начать марафон'}
 </button>
 </div>
 )}

 {/* Leaderboard Tab */}
 {gameState === 'select' && activeTab === 'leaderboard' && (
 <div className=" border border-slate-200 rounded-2xl p-6 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center gap-3 mb-6">
 <span className="text-3xl">🏆</span>
 <h2 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>Таблица рекордов</h2>
 </div>

 <div className="flex flex-wrap gap-2 mb-6">
 {SUBJECTS.map(([key, label]) => (
 <button
 key={key}
 onClick={() => setLeaderboardSubject(key)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
 leaderboardSubject === key
 ? 'bg-orange-100 text-orange-700 border border-orange-300'
 : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
 }`}
 >
 {label}
 </button>
 ))}
 </div>

 {leaderboardLoading ? (
 <div className="flex justify-center py-12">
 <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
 </div>
 ) : leaderboard.length === 0 ? (
 <div className="text-center py-12 text-slate-500">
 <div className="text-4xl mb-2">🏜️</div>
 <p>Пока нет результатов. Будьте первым!</p>
 </div>
 ) : (
 <div className="space-y-2">
 {leaderboard.map((entry, index) => (
 <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-xl border ${
 index === 0 ? 'bg-amber-50 border-amber-200' :
 index === 1 ? 'bg-slate-50 border-slate-200' :
 index === 2 ? 'bg-orange-50 border-orange-200' :
 'bg-white border-slate-100'
 }`}>
 <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
 {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-slate-900 truncate">{entry.name}</p>
 <p className="text-sm text-slate-500">@{entry.username}</p>
 </div>
 <div className="text-right">
 <p className="font-bold text-lg text-orange-600">{entry.score}</p>
 <p className="text-xs text-slate-500">{entry.questionsAnswered} вопросов</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Playing State */}
 {gameState === 'playing' && currentQuestion && (
 <div>
 {/* Stats Bar */}
 <div className=" border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center justify-between flex-wrap gap-3">
 <div className="flex items-center gap-1">{renderHearts()}</div>
 <div className="flex items-center gap-4">
 <div className="text-center">
 <p className="text-xs text-slate-500">Счёт</p>
 <p className="text-xl font-bold text-orange-600">{score}</p>
 </div>
 <div className="text-center">
 <p className="text-xs text-slate-500">Серия</p>
 <p className="text-xl font-bold text-blue-600">{streak}</p>
 </div>
 <div className="text-center">
 <p className="text-xs text-slate-500">Вопрос</p>
 <p className="text-xl font-bold text-slate-700">#{questionsAnswered + 1}</p>
 </div>
 </div>
 <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${difficultyColors[difficulty] || difficultyColors.EASY}`}>
 {difficultyLabels[difficulty] || difficulty}
 </div>
 </div>
 </div>

 {/* Question Card */}
 <div className={`bg-white border-2 rounded-2xl p-6 shadow-sm transition-all ${
 showResult
 ? lastCorrect
 ? 'border-green-400 bg-green-50/50'
 : 'border-red-400 bg-red-50/50'
 : 'border-slate-200'
 }`}>
 {currentQuestion.topic && (
 <div className="text-sm text-slate-500 mb-2">Тема: {currentQuestion.topic}</div>
 )}

 <div className="text-lg font-medium text-slate-900 mb-6 whitespace-pre-wrap">
 {currentQuestion.question}
 </div>

 {/* Options */}
 {currentQuestion.options && currentQuestion.options.length > 0 ? (
 <div className="space-y-3 mb-6">
 {currentQuestion.options.map((option, index) => (
 <button
 key={index}
 onClick={() => !showResult && setSelectedAnswer(option)}
 disabled={showResult || isLoading}
 className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
 showResult
 ? option === lastCorrectAnswer
 ? 'border-green-500 bg-green-50 text-green-900'
 : selectedAnswer === option && !lastCorrect
 ? 'border-red-500 bg-red-50 text-red-900'
 : 'border-slate-100 text-slate-400'
 : selectedAnswer === option
 ? 'border-orange-500 bg-orange-50 text-orange-900'
 : 'border-slate-200 hover:border-orange-300 text-slate-700'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
 selectedAnswer === option ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300'
 }`}>
 {String.fromCharCode(1040 + index)}
 </div>
 <span>{option}</span>
 </div>
 </button>
 ))}
 </div>
 ) : (
 <div className="mb-6">
 <input
 type="text"
 value={textAnswer}
 onChange={e => setTextAnswer(e.target.value)}
 onKeyDown={e => { if (e.key === 'Enter' && textAnswer) void submitAnswer(); }}
 disabled={showResult || isLoading}
 placeholder="Введите ответ..."
 className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-lg"
 />
 {showResult && (
 <div className={`mt-2 text-sm font-medium ${lastCorrect ? 'text-green-600' : 'text-red-600'}`}>
 Правильный ответ: {lastCorrectAnswer}
 </div>
 )}
 </div>
 )}

 {/* Result Indicator */}
 {showResult && (
 <div className={`text-center py-3 rounded-xl font-semibold text-lg ${
 lastCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
 }`}>
 {lastCorrect ? 'Правильно! +' + (score - (score - 10)) : 'Неправильно!'}
 </div>
 )}

 {/* Submit Button */}
 {!showResult && (
 <button
 onClick={() => void submitAnswer()}
 disabled={isLoading || (!selectedAnswer && !textAnswer)}
 className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isLoading ? 'Проверка...' : 'Ответить'}
 </button>
 )}
 </div>
 </div>
 )}

 {/* Game Over */}
 {gameState === 'gameover' && (
 <div className=" border border-slate-200 rounded-2xl p-8 shadow-sm text-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="text-6xl mb-4">🏁</div>
 <h2 className="text-3xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Марафон завершён!</h2>
 <p className="text-slate-600 mb-8">
 {selectedSubject && SUBJECT_LABELS[selectedSubject as keyof typeof SUBJECT_LABELS]}
 </p>

 <div className="grid grid-cols-3 gap-4 mb-8">
 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
 <p className="text-3xl font-bold text-orange-600">{finalScore}</p>
 <p className="text-sm text-orange-700">Очков</p>
 </div>
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
 <p className="text-3xl font-bold text-blue-600">{finalQuestions}</p>
 <p className="text-sm text-blue-700">Вопросов</p>
 </div>
 <div className="bg-green-50 border border-green-200 rounded-xl p-4">
 <p className="text-3xl font-bold text-green-600">{finalMaxStreak}</p>
 <p className="text-sm text-green-700">Макс. серия</p>
 </div>
 </div>

 <div className="flex gap-4">
 <button
 onClick={() => {
 setGameState('select');
 setActiveTab('play');
 }}
 className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
 >
 Выбрать предмет
 </button>
 <button
 onClick={() => void startMarathon()}
 className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
 >
 Ещё раз
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
