import { SUBJECT_LABELS } from '@lyceum64/shared';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';
import { sdamgiaService } from '../services/sdamgiaService';

import type { SdamgiaVariant } from '../services/sdamgiaService';

const SUPPORTED_GRADES = [4, 5, 6, 7, 8, 9, 10, 11];

export default function VariantSelectionPage() {
 const navigate = useNavigate();
 const location = useLocation();
 const { subject, grade, examMode } = location.state || {};

 const [variants, setVariants] = useState<SdamgiaVariant[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
 const [unsupportedGrade, setUnsupportedGrade] = useState(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);

 useEffect(() => {
 if (!subject || !grade) {
 toast.error('Не указан предмет или класс');
 void navigate('/dashboard');
 return;
 }

 if (!SUPPORTED_GRADES.includes(Number(grade))) {
 setUnsupportedGrade(true);
 setLoading(false);
 return;
 }

 const loadVariants = async () => {
 try {
 setLoading(true);
 setErrorMessage(null);
 const data = await sdamgiaService.getVariants(subject, grade);
 setVariants(data);
 } catch (error: unknown) {
 const axiosErr = error as { response?: { data?: { message?: string } } };
 const message = axiosErr.response?.data?.message || 'Ошибка загрузки вариантов';
 setErrorMessage(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 };

 void loadVariants();
 }, [subject, grade, navigate]);

 const handleStartTest = () => {
 if (!selectedVariant) {
 toast.error('Выберите вариант');
 return;
 }

 void navigate('/test/sdamgia', {
 state: {
 variantId: selectedVariant,
 subject,
 grade,
 examType: getExamType(grade),
 examMode,
 },
 });
 };

 const getExamType = (gradeNum: number): string => {
 if (gradeNum === 9) return 'OGE';
 if (gradeNum === 11) return 'EGE';
 return 'VPR';
 };

 const subjectLabel = subject
 ? SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS]
 : 'Неизвестный предмет';

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

 return (
 <div className="min-h-screen relative overflow-hidden py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="absolute top-20 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px] -z-10 animate-pulse" />
 <div
 className="absolute bottom-20 left-10 w-96 h-96 bg-violet-100/50 rounded-full blur-[120px] -z-10 animate-pulse"
 style={{ animationDelay: '1s' }}
 />

 <div className="relative z-10 max-w-4xl mx-auto">
 <button
 onClick={() => { void navigate(-1); }}
 className="group mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
 >
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
 />
 </svg>
 Назад
 </button>

 <div className=" backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="text-center mb-8">
 <h1 className="text-4xl md:text-5xl font-bold  mb-3" style={{ color: 'var(--color-text)' }}>
 Выберите вариант
 </h1>
 <p className="text-slate-600 text-lg">
 {subjectLabel} • {grade} класс • {getExamType(grade)}
 </p>
 </div>

 {unsupportedGrade ? (
 <div className="text-center py-12">
 <div className="text-6xl mb-6">🚧</div>
 <h2 className="text-2xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>Класс не поддерживается</h2>
 <p className="text-slate-600 mb-6 max-w-md mx-auto">
 Для {grade} класса варианты пока не доступны.
 </p>
 <Button variant="secondary" onClick={() => { void navigate(-1); }}>
 Вернуться назад
 </Button>
 </div>
 ) : errorMessage ? (
 <div className="text-center py-12">
 <div className="text-6xl mb-6">⚠️</div>
 <h2 className="text-2xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>Ошибка загрузки</h2>
 <p className="text-slate-600 mb-6 max-w-md mx-auto">{errorMessage}</p>
 <Button variant="secondary" onClick={() => { void navigate(-1); }}>
 Вернуться назад
 </Button>
 </div>
 ) : variants.length === 0 ? (
 <div className="text-center py-12">
 <p className="text-slate-600">Варианты не найдены</p>
 </div>
 ) : (
 <>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
 {variants.map((variant, index) => (
 <button
 key={variant.id}
 onClick={() => setSelectedVariant(variant.id)}
 className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 animate-scale-in ${
 selectedVariant === variant.id
 ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/25'
 : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
 }`}
 style={{ animationDelay: `${index * 50}ms` }}
 >
 <div className="text-center">
 <div
 className={`text-3xl font-bold mb-2 transition-colors ${
 selectedVariant === variant.id
 ? 'text-blue-600'
 : 'text-slate-700 group-hover:text-blue-600'
 }`}
 >
 {variant.number}
 </div>
 <div className="text-xs text-slate-500">Вариант</div>
 </div>

 {selectedVariant === variant.id && (
 <div className="absolute top-2 right-2">
 <svg
 className="w-5 h-5 text-blue-600"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
 clipRule="evenodd"
 />
 </svg>
 </div>
 )}
 </button>
 ))}
 </div>

 <div className="flex justify-center">
 <Button onClick={handleStartTest} disabled={!selectedVariant} className="px-8 py-3">
 Начать тест
 </Button>
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 );
}
