import { SUBJECT_LABELS } from '@lyceum64/shared';
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface DuelQuestion {
 id: string;
 question: string;
 options: string[] | null;
 type: string;
 topic: string | null;
}

interface DuelState {
 id: string;
 code: string;
 subject: string;
 status: string;
 creatorId: string;
 opponentId: string | null;
 creatorScore: number | null;
 opponentScore: number | null;
 winnerId: string | null;
 questionsCount: number;
 timePerQuestion: number;
}

type Phase = 'loading' | 'waiting' | 'playing' | 'finished';

export default function DuelPage() {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { user } = useAuthStore();
 const userId = user?.id;

 const [phase, setPhase] = useState<Phase>('loading');
 const [duel, setDuel] = useState<DuelState | null>(null);
 const [questions, setQuestions] = useState<DuelQuestion[]>([]);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [selectedAnswer, setSelectedAnswer] = useState('');
 const [textAnswer, setTextAnswer] = useState('');
 const [myScore, setMyScore] = useState(0);
 const [opponentScore, setOpponentScore] = useState(0);
 const [timeLeft, setTimeLeft] = useState(30);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [opponentAnswered, setOpponentAnswered] = useState(false);
 const [lastResult, setLastResult] = useState<boolean | null>(null);
 const [winnerId, setWinnerId] = useState<string | null>(null);
 const questionStartTime = useRef(Date.now());

 // Load duel info
 useEffect(() => {
 if (!id) return;

 const loadDuel = async () => {
 try {
 const response = await api.get(`/duels/${id}`);
 const duelData = response.data.data;
 setDuel(duelData);

 if (duelData.status === 'active') {
 // Try to start and get questions
 try {
 const startRes = await api.post(`/duels/${id}/start`);
 setQuestions(startRes.data.data.questions);
 setPhase('playing');
 } catch {
 setPhase('playing');
 }
 } else if (duelData.status === 'finished') {
 setPhase('finished');
 setWinnerId(duelData.winnerId);
 setMyScore(
 duelData.creatorId === userId ? (duelData.creatorScore || 0) : (duelData.opponentScore || 0)
 );
 setOpponentScore(
 duelData.creatorId === userId ? (duelData.opponentScore || 0) : (duelData.creatorScore || 0)
 );
 } else {
 setPhase('waiting');
 }
 } catch {
 toast.error('Ошибка загрузки дуэли');
 void navigate('/duel');
 }
 };

 void loadDuel();
 }, [id, userId, navigate]);

 // Polling for duel state updates
 useEffect(() => {
 if (phase !== 'waiting' && phase !== 'playing') return;

 const interval = setInterval(async () => {
 try {
 const response = await api.get(`/duels/${id}`);
 const duelData = response.data.data;
 setDuel(duelData);

 if (duelData.status === 'finished') {
 setPhase('finished');
 setWinnerId(duelData.winnerId);
 setMyScore(
 duelData.creatorId === userId ? (duelData.creatorScore || 0) : (duelData.opponentScore || 0)
 );
 setOpponentScore(
 duelData.creatorId === userId ? (duelData.opponentScore || 0) : (duelData.creatorScore || 0)
 );
 clearInterval(interval);
 } else if (phase === 'waiting' && duelData.opponentId && duelData.status === 'active') {
 // Duel started by server
 try {
 const startRes = await api.post(`/duels/${id}/start`);
 setQuestions(startRes.data.data.questions);
 } catch {
 // Questions already sent
 }
 setPhase('playing');
 }
 } catch {
 // Polling error, ignore
 }
 }, 2000);

 return () => clearInterval(interval);
 }, [id, phase, userId]);

 // Timer per question
 useEffect(() => {
 if (phase !== 'playing' || questions.length === 0) return;

 const timePerQ = duel?.timePerQuestion || 30;
 setTimeLeft(timePerQ);
 questionStartTime.current = Date.now();

 const timer = setInterval(() => {
 setTimeLeft(prev => {
 if (prev <= 1) {
 clearInterval(timer);
 void submitAnswer(true);
 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(timer);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [currentIndex, phase, questions.length]);

 const submitAnswer = useCallback(async (timeout: boolean = false) => {
 if (isSubmitting || !id || currentIndex >= questions.length) return;

 const currentQ = questions[currentIndex]!;
 const answer = timeout ? '' : (currentQ.options ? selectedAnswer : textAnswer);
 const timeMs = Date.now() - questionStartTime.current;

 setIsSubmitting(true);
 try {
 const response = await api.post(`/duels/${id}/answer`, {
 questionId: currentQ.id,
 answer,
 timeMs,
 });

 const result = response.data.data;
 setMyScore(result.score);
 setLastResult(result.isCorrect);

 // Brief pause to show result
 setTimeout(() => {
 setLastResult(null);
 setSelectedAnswer('');
 setTextAnswer('');
 setOpponentAnswered(false);

 if (currentIndex + 1 < questions.length) {
 setCurrentIndex(prev => prev + 1);
 }
 // else: will be finished by polling
 }, 800);
 } catch {
 toast.error('Ошибка отправки ответа');
 } finally {
 setIsSubmitting(false);
 }
 }, [id, currentIndex, questions, selectedAnswer, textAnswer, isSubmitting]);

 const isMe = (playerId: string | null) => playerId === userId;
 const currentQuestion = questions[currentIndex];

 return (
 <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-3xl mx-auto">
 {/* Loading */}
 {phase === 'loading' && (
 <div className="flex items-center justify-center py-20">
 <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
 </div>
 )}

 {/* Waiting for Opponent */}
 {phase === 'waiting' && duel && (
 <div className=" border border-slate-200 rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="relative mx-auto w-20 h-20 mb-6">
 <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
 <div className="absolute inset-0 flex items-center justify-center text-3xl">⚔️</div>
 </div>
 <h2 className="text-2xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Ожидание соперника...</h2>
 <p className="text-slate-600 mb-4">
 {SUBJECT_LABELS[duel.subject as keyof typeof SUBJECT_LABELS]} | {duel.questionsCount} вопросов
 </p>
 <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
 <p className="text-sm text-purple-700 mb-1">Код комнаты:</p>
 <p className="text-3xl font-mono font-bold text-purple-700 tracking-widest">{duel.code}</p>
 </div>
 <button
 onClick={() => void navigate('/duel')}
 className="py-3 px-6 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
 >
 Вернуться в лобби
 </button>
 </div>
 )}

 {/* Playing */}
 {phase === 'playing' && currentQuestion && (
 <div>
 {/* Score Bar */}
 <div className=" border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center justify-between">
 <div className="text-center">
 <p className="text-xs text-purple-600 font-medium">Вы</p>
 <p className="text-2xl font-bold text-purple-700">{myScore}</p>
 </div>
 <div className="flex flex-col items-center gap-1">
 <div className="text-sm text-slate-500">
 {currentIndex + 1} / {questions.length}
 </div>
 <div className={`text-2xl font-mono font-bold ${
 timeLeft <= 5 ? 'text-red-600 animate-pulse' : timeLeft <= 10 ? 'text-amber-600' : 'text-slate-700'
 }`}>
 {timeLeft}с
 </div>
 {opponentAnswered && (
 <div className="text-xs text-amber-600 font-medium animate-pulse">
 Соперник ответил!
 </div>
 )}
 </div>
 <div className="text-center">
 <p className="text-xs text-red-600 font-medium">Соперник</p>
 <p className="text-2xl font-bold text-red-700">{opponentScore}</p>
 </div>
 </div>
 </div>

 {/* Question */}
 <div className={`bg-white border-2 rounded-2xl p-6 shadow-sm transition-all ${
 lastResult !== null
 ? lastResult ? 'border-green-400 bg-green-50/50' : 'border-red-400 bg-red-50/50'
 : 'border-slate-200'
 }`}>
 {currentQuestion.topic && (
 <div className="text-sm text-slate-500 mb-2">{currentQuestion.topic}</div>
 )}

 <div className="text-lg font-medium text-slate-900 mb-6 whitespace-pre-wrap">
 {currentQuestion.question}
 </div>

 {currentQuestion.options && currentQuestion.options.length > 0 ? (
 <div className="space-y-3 mb-4">
 {currentQuestion.options.map((option, i) => (
 <button
 key={i}
 onClick={() => !isSubmitting && setSelectedAnswer(option)}
 disabled={isSubmitting || lastResult !== null}
 className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
 selectedAnswer === option
 ? 'border-purple-500 bg-purple-50'
 : 'border-slate-200 hover:border-purple-300'
 }`}
 >
 {option}
 </button>
 ))}
 </div>
 ) : (
 <input
 type="text"
 value={textAnswer}
 onChange={e => setTextAnswer(e.target.value)}
 onKeyDown={e => { if (e.key === 'Enter' && textAnswer) void submitAnswer(); }}
 disabled={isSubmitting || lastResult !== null}
 placeholder="Введите ответ..."
 className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 outline-none mb-4"
 />
 )}

 {lastResult !== null && (
 <div className={`text-center py-2 rounded-xl font-semibold ${
 lastResult ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
 }`}>
 {lastResult ? 'Правильно!' : 'Неправильно!'}
 </div>
 )}

 {lastResult === null && (
 <button
 onClick={() => void submitAnswer()}
 disabled={isSubmitting || (!selectedAnswer && !textAnswer)}
 className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
 >
 {isSubmitting ? 'Отправка...' : 'Ответить'}
 </button>
 )}
 </div>
 </div>
 )}

 {/* Finished */}
 {phase === 'finished' && duel && (
 <div className=" border border-slate-200 rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="text-6xl mb-4">
 {winnerId === null ? '🤝' : isMe(winnerId) ? '🏆' : '😔'}
 </div>
 <h2 className="text-3xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>
 {winnerId === null ? 'Ничья!' : isMe(winnerId) ? 'Победа!' : 'Поражение'}
 </h2>
 <p className="text-slate-600 mb-6">
 {SUBJECT_LABELS[duel.subject as keyof typeof SUBJECT_LABELS]}
 </p>

 <div className="flex items-center justify-center gap-8 mb-8">
 <div className="text-center">
 <p className="text-sm text-purple-600 mb-1">Вы</p>
 <p className="text-4xl font-bold text-purple-700">{myScore}</p>
 </div>
 <div className="text-3xl text-slate-300">—</div>
 <div className="text-center">
 <p className="text-sm text-red-600 mb-1">Соперник</p>
 <p className="text-4xl font-bold text-red-700">{opponentScore}</p>
 </div>
 </div>

 <div className="flex gap-4">
 <button
 onClick={() => void navigate('/duel')}
 className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
 >
 Новая дуэль
 </button>
 <button
 onClick={() => void navigate('/dashboard')}
 className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
 >
 На главную
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
