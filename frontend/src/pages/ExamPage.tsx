import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';
import { ExamHeader, TaskNavigation, TaskCard, ExamResults } from '../components/exam';
import { MESSAGES } from '../core/constants';
import { ExamFactory } from '../core/factories';
import { useTestSession } from '../hooks/useTestSession';
import { useTimer } from '../hooks/useTimer';

import type { IExam } from '../core/interfaces';
import type { ExamType, Subject, Grade, TestResults } from '../core/types';

interface LocationState {
 grade: Grade;
 subject: Subject;
 egeType?: 'profile' | 'base';
}

export default function ExamPage() {
 const navigate = useNavigate();
 const location = useLocation();
 const state = location.state as LocationState | undefined;

 const [exam, setExam] = useState<IExam | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [results, setResults] = useState<TestResults | null>(null);

 const examType = useMemo((): ExamType => {
 if (!state) return 'REGULAR';
 if (state.grade === 9) return 'OGE';
 if (state.grade === 11) {
 return state.egeType === 'base' ? 'EGE_BASE' : 'EGE_PROFILE';
 }
 return 'REGULAR';
 }, [state]);

 useEffect(() => {
 if (!state?.grade || !state?.subject) {
 setError('Некорректные параметры');
 setIsLoading(false);
 return;
 }

 try {
 const factory = ExamFactory.getInstance();
 const loadedExam = factory.create(examType, state.subject, state.grade);
 setExam(loadedExam);
 setError(null);
 } catch {
 setError(MESSAGES.ERROR_LOADING_EXAM);
 } finally {
 setIsLoading(false);
 }
 }, [state, examType]);

 if (isLoading) {
 return <LoadingScreen />;
 }

 if (error || !exam) {
 return (
 <ErrorScreen error={error || 'Экзамен не найден'} onBack={() => void navigate('/dashboard')} />
 );
 }

 if (results) {
 return (
 <ExamResults
 results={results}
 examTitle={exam.title}
 onRetry={() => window.location.reload()}
 />
 );
 }

 return (
 <ExamContent
 exam={exam}
 onComplete={res => {
 setResults(res);
 toast.success(MESSAGES.TEST_COMPLETED);
 }}
 onTimeExpired={() => {
 toast.error(MESSAGES.TIME_EXPIRED);
 }}
 />
 );
}

interface ExamContentProps {
 exam: IExam;
 onComplete: (results: TestResults) => void;
 onTimeExpired: () => void;
}

const ExamContent: React.FC<ExamContentProps> = ({ exam, onComplete, onTimeExpired }) => {
 const [showFinishConfirm, setShowFinishConfirm] = useState(false);

 const {
 currentTask,
 currentTaskIndex,
 isFirstTask,
 isLastTask,
 goToTask,
 nextTask,
 previousTask,
 submitAnswer,
 getAnswer,
 progress,
 answeredCount,
 totalTasks,
 complete,
 expireTime,
 getTaskStatus,
 } = useTestSession({
 exam,
 autoSave: true,
 onComplete,
 onTimeExpired,
 });

 const {
 timeLeft,
 status: timerStatus,
 start: startTimer,
 } = useTimer(0, {
 onComplete: () => {
 const results = expireTime();
 onComplete(results);
 },
 onWarning: () => {
 toast('Осталось 25% времени!', { icon: '⚠️' });
 },
 onCritical: () => {
 toast.error('Осталось менее 10% времени!');
 },
 });

 useEffect(() => {
 startTimer(exam.getDurationInSeconds());
 }, [exam, startTimer]);

 const currentAnswer = useMemo(() => {
 if (!currentTask) return '';
 const answer = getAnswer(currentTask.number);
 return answer?.value || '';
 }, [currentTask, getAnswer]);

 const handleAnswer = useCallback(
 (answer: string) => {
 submitAnswer(answer);
 },
 [submitAnswer]
 );

 const handleFinish = useCallback(() => {
 if (answeredCount < totalTasks) {
 setShowFinishConfirm(true);
 return;
 }

 const results = complete();
 onComplete(results);
 }, [answeredCount, totalTasks, complete, onComplete]);

 const handleConfirmFinish = useCallback(() => {
 setShowFinishConfirm(false);
 const results = complete();
 onComplete(results);
 }, [complete, onComplete]);

 const handleTaskSelect = useCallback(
 (taskNumber: number) => {
 goToTask(taskNumber);
 },
 [goToTask]
 );

 if (!currentTask) {
 return <LoadingScreen />;
 }

 return (
 <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>

 <ExamHeader
 title={exam.title}
 subtitle={`${exam.grade} класс`}
 timeLeft={timeLeft}
 timerStatus={timerStatus}
 currentTask={currentTaskIndex + 1}
 totalTasks={totalTasks}
 progress={progress}
 />

 <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
 <TaskCard
 task={currentTask}
 currentAnswer={currentAnswer}
 onAnswer={handleAnswer}
 onPrevious={previousTask}
 onNext={nextTask}
 onFinish={handleFinish}
 isFirst={isFirstTask}
 isLast={isLastTask}
 />

 <div className="mt-6">
 <TaskNavigation
 tasks={exam.tasks}
 currentTaskNumber={currentTask.number}
 getTaskStatus={getTaskStatus}
 onTaskSelect={handleTaskSelect}
 />
 </div>
 </div>

 {showFinishConfirm && (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="finish-dialog-title">
 <div className=" rounded-2xl p-6 max-w-md w-full border border-slate-200 animate-scale-in" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h4 id="finish-dialog-title" className="text-xl font-semibold text-slate-900 mb-3">Завершить тест?</h4>
 <p className="text-slate-600 mb-2">
 Вы ответили на <span className="text-blue-600 font-semibold">{answeredCount}</span> из{' '}
 <span className="text-slate-900">{totalTasks}</span> вопросов.
 </p>
 <p className="text-slate-600 mb-6">Неотвеченные вопросы будут засчитаны как неправильные.</p>
 <div className="flex flex-col gap-3">
 <button
 onClick={() => setShowFinishConfirm(false)}
 className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all"
 >
 Продолжить тест
 </button>
 <button
 onClick={handleConfirmFinish}
 className="w-full px-4 py-3 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-all"
 >
 Завершить
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

const LoadingScreen: React.FC = () => (
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

const ErrorScreen: React.FC<{ error: string; onBack: () => void }> = ({ error, onBack }) => (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="text-center">
 <div className="text-6xl mb-4">😕</div>
 <h1 className="text-2xl font-display font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Ошибка</h1>
 <p className="text-slate-600 font-sans mb-6">{error}</p>
 <Button onClick={onBack}>Вернуться к панели</Button>
 </div>
 </div>
);
