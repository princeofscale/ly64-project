import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import api from '../services/api';

interface Question {
 id: string;
 question: string;
 type: string;
 options: string[] | null;
}

interface TestData {
 test: {
 id: string;
 title: string;
 timeLimit: number | null;
 preventBackNavigation: boolean;
 questionsCount: number;
 };
 questions: Question[];
 questionsOrder: string[];
}

interface Answer {
 questionId: string;
 answer: string | string[];
 timeSpent: number;
 timestamp: number;
}

export default function TestPage() {
 const { testId, subject } = useParams();
 const navigate = useNavigate();

 const [testData, setTestData] = useState<TestData | null>(null);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [answers, setAnswers] = useState<Answer[]>([]);
 const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
 const [timeLeft, setTimeLeft] = useState<number | null>(null);

 const loadTest = useCallback(async () => {
 try {
 let url = '';
 if (subject) {
 const testsResponse = await api.get(`/tests`, { params: { subject, isDiagnostic: true } });
 const testsData = testsResponse.data;
 if (testsData.data && testsData.data.length > 0) {
 url = `/tests/${testsData.data[0].id}/start`;
 } else {
 toast.error('Тест не найден');
 void navigate('/dashboard');
 return;
 }
 } else if (testId) {
 url = `/tests/${testId}/start`;
 }

 const response = await api.get(url);
 const data = response.data;

 if (data.success) {
 setTestData(data.data);
 if (data.data.test.timeLimit) {
 setTimeLeft(data.data.test.timeLimit * 60);
 }
 } else {
 toast.error('Ошибка загрузки теста');
 void navigate('/dashboard');
 }
 } catch (error) {
 toast.error('Ошибка загрузки');
 void navigate('/dashboard');
 } finally {
 setLoading(false);
 }
 }, [testId, subject, navigate]);

 useEffect(() => {
 void loadTest();
 }, [loadTest]);

 // Prevent browser back button during test
 useEffect(() => {
 if (!testData?.test.preventBackNavigation) return;
 const handlePopState = () => {
 window.history.pushState(null, '', window.location.href);
 };
 window.history.pushState(null, '', window.location.href);
 window.addEventListener('popstate', handlePopState);
 return () => window.removeEventListener('popstate', handlePopState);
 }, [testData?.test.preventBackNavigation]);

 const handleSubmit = useCallback(async (finalAnswers?: Answer[]) => {
 if (!testData) return;

 setSubmitting(true);
 const answersToSubmit = finalAnswers || answers;

 try {
 const response = await api.post(`/tests/${testData.test.id}/submit`, {
 answers: answersToSubmit,
 questionsOrder: testData.questionsOrder,
 });

 const data = response.data;

 if (data.success) {
 // Детали об ошибках собраны для возможного будущего использования
 // в системе рекомендаций

 toast.success(`Тест завершён! Результат: ${data.data.score}%`);

 if (data.data.analysis) {
 toast.error('Обнаружена подозрительная активность', { duration: 5000 });
 }

 void navigate('/dashboard');
 }
 } catch {
 toast.error('Ошибка отправки');
 } finally {
 setSubmitting(false);
 }
 }, [testData, answers, navigate]);

 useEffect(() => {
 if (timeLeft === null || timeLeft <= 0) return;

 const timer = setInterval(() => {
 setTimeLeft(prev => {
 if (prev === null || prev <= 1) {
 clearInterval(timer);
 void handleSubmit();
 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(timer);
 }, [timeLeft, handleSubmit]);

 const handleAnswer = (answer: string) => {
 setSelectedAnswer(answer);
 };

 const handleNext = () => {
 if (!testData || selectedAnswer === null) return;

 const currentQuestion = testData.questions[currentIndex];
 if (!currentQuestion) return;
 const timeSpent = Date.now() - questionStartTime;

 const newAnswer: Answer = {
 questionId: currentQuestion.id,
 answer: selectedAnswer,
 timeSpent,
 timestamp: Date.now(),
 };

 setAnswers(prev => [...prev, newAnswer]);
 setSelectedAnswer(null);
 setQuestionStartTime(Date.now());

 if (currentIndex < testData.questions.length - 1) {
 setCurrentIndex(prev => prev + 1);
 } else {
 void handleSubmit([...answers, newAnswer]);
 }
 };

 const formatTime = (seconds: number) => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins}:${secs.toString().padStart(2, '0')}`;
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="relative">
 <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 <div
 className="absolute inset-0 w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"
 style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
 />
 </div>
 </div>
 );
 }

 if (!testData) return null;

 const currentQuestion = testData.questions[currentIndex];
 if (!currentQuestion) return null;
 const progress = ((currentIndex + 1) / testData.questions.length) * 100;

 return (
 <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-3xl mx-auto">
 <div className=" rounded-2xl shadow-xl p-8 border border-slate-200" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="flex justify-between items-center mb-6">
 <h1 className="text-xl font-bold " style={{ color: 'var(--color-text)' }}>{testData.test.title}</h1>
 {timeLeft !== null && (
 <div
 className={`px-4 py-2 rounded-lg font-mono text-lg ${
 timeLeft < 60 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
 }`}
 >
 {formatTime(timeLeft)}
 </div>
 )}
 </div>

 <div className="mb-6">
 <div className="flex justify-between text-sm text-slate-600 mb-2">
 <span>
 Вопрос {currentIndex + 1} из {testData.questions.length}
 </span>
 <span>{Math.round(progress)}%</span>
 </div>
 <div className="w-full bg-slate-200 rounded-full h-2">
 <div
 className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all"
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>

 <div className="mb-8">
 <h2 className="text-lg font-medium mb-6 " style={{ color: 'var(--color-text)' }}>{currentQuestion.question}</h2>

 {currentQuestion.options && (
 <div className="space-y-3">
 {currentQuestion.options.map((option, idx) => (
 <button
 key={idx}
 onClick={() => handleAnswer(option)}
 className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
 selectedAnswer === option
 ? 'border-blue-500 bg-blue-50 text-slate-900'
 : 'border-slate-200 hover:border-blue-300 text-slate-700 hover:bg-slate-50'
 }`}
 >
 <span className="font-medium mr-3 text-blue-600">
 {String.fromCharCode(65 + idx)}.
 </span>
 {option}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="flex justify-between items-center pt-6 border-t border-slate-200">
 {testData.test.preventBackNavigation ? (
 <span className="text-sm text-slate-500">Возврат к предыдущим вопросам запрещён</span>
 ) : (
 <div />
 )}

 <Button onClick={handleNext} disabled={selectedAnswer === null || submitting}>
 {submitting
 ? 'Отправка...'
 : currentIndex < testData.questions.length - 1
 ? 'Далее'
 : 'Завершить'}
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
}
