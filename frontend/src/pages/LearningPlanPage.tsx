import { SUBJECT_LABELS } from '@lyceum64/shared';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import api from '../services/api';

interface PlanItem {
 id: string;
 subject: string;
 topic: string;
 priority: number;
 estimatedHours: number;
 completed: boolean;
 order: number;
}

interface LearningPlan {
 id: string;
 direction: string | null;
 totalHours: number;
 completedHours: number;
 items: PlanItem[];
}

export default function LearningPlanPage() {
 const navigate = useNavigate();
 const [plan, setPlan] = useState<LearningPlan | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const loadPlan = async () => {
 try {
 const response = await api.get('/diagnostic/plan');
 const data = response.data;

 if (data.success) {
 setPlan(data.data);
 } else {
 void navigate('/dashboard');
 }
 } catch {
 toast.error('Ошибка загрузки плана');
 } finally {
 setLoading(false);
 }
 };

 void loadPlan();
 }, [navigate]);

 const markCompleted = async (itemId: string) => {
 try {
 const response = await api.post('/diagnostic/plan/complete-topic', { itemId });

 if (response.data.success) {
 setPlan(response.data.data);
 toast.success('Тема отмечена как изученная');
 }
 } catch {
 toast.error('Ошибка');
 }
 };

 const groupItemsBySubject = (items: PlanItem[]) => {
 const groups: Record<string, PlanItem[]> = {};
 for (const item of items) {
 if (!groups[item.subject]) {
 groups[item.subject] = [];
 }
 groups[item.subject]!.push(item);
 }
 return groups;
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="flex flex-col items-center gap-4">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 <p className="text-slate-600">Загрузка плана обучения...</p>
 </div>
 </div>
 );
 }

 if (!plan) {
 return (
 <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-4xl mx-auto text-center">
 <h1 className="text-2xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>План обучения не найден</h1>
 <p className="text-slate-600 mb-6">План обучения будет доступен позже</p>
 <Button onClick={() => void navigate('/dashboard')}>Перейти на дашборд</Button>
 </div>
 </div>
 );
 }

 const progress =
 plan.totalHours > 0 ? Math.round((plan.completedHours / plan.totalHours) * 100) : 0;
 const groupedItems = groupItemsBySubject(plan.items);

 return (
 <div className="min-h-screen py-12 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
 {}
 <div className="absolute top-20 right-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
 <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-100/50 rounded-full blur-3xl" />

 <div className="max-w-4xl mx-auto relative z-10">
 <div className=" rounded-2xl shadow-lg p-8 border border-slate-200 mb-6" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h1 className="text-3xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Персональный план обучения</h1>
 <p className="text-slate-600 mb-6">
 Следуйте плану для эффективной подготовки к поступлению
 </p>

 <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-6">
 <div className="flex justify-between items-center mb-3">
 <span className="text-slate-700">Общий прогресс</span>
 <span className="font-bold text-lg text-slate-900">{progress}%</span>
 </div>
 <div className="w-full bg-slate-100 rounded-full h-4 shadow-inner">
 <div
 className="bg-gradient-to-r from-blue-600 to-violet-600 h-4 rounded-full transition-all"
 style={{ width: `${progress}%` }}
 />
 </div>
 <div className="flex justify-between text-sm text-slate-600 mt-2">
 <span>Изучено: {plan.completedHours} ч</span>
 <span>Всего: {plan.totalHours} ч</span>
 </div>
 </div>
 </div>

 {Object.entries(groupedItems).map(([subject, items]) => {
 const subjectLabel = SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS] || subject;
 const completedCount = items.filter(i => i.completed).length;
 const subjectProgress = Math.round((completedCount / items.length) * 100);

 return (
 <div
 key={subject}
 className=" rounded-2xl shadow-lg p-6 border border-slate-200 mb-4" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-xl font-bold " style={{ color: 'var(--color-text)' }}>{subjectLabel}</h2>
 <span className="text-sm text-slate-600">
 {completedCount}/{items.length} тем ({subjectProgress}%)
 </span>
 </div>

 <div className="space-y-3">
 {items.map(item => (
 <div
 key={item.id}
 className={`flex items-center justify-between p-4 rounded-xl border ${
 item.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
 }`}
 >
 <div className="flex items-center gap-3">
 <button
 onClick={() => !item.completed && void markCompleted(item.id)}
 className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
 item.completed
 ? 'bg-green-500 border-green-500 text-white'
 : 'border-slate-300 hover:border-blue-600'
 }`}
 disabled={item.completed}
 >
 {item.completed && (
 <svg
 className="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M5 13l4 4L19 7"
 />
 </svg>
 )}
 </button>
 <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-900'}>
 {item.topic}
 </span>
 </div>
 <span className="text-sm text-slate-500">{item.estimatedHours} ч</span>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
