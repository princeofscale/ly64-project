import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';

export default function EgeTypePage() {
 const navigate = useNavigate();
 const location = useLocation();
 const { grade, subject } = location.state || {};

 if (!grade || !subject) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="text-center">
 <p className="text-slate-600 mb-4">Ошибка: данные не переданы</p>
 <Button onClick={() => void navigate('/dashboard')}>Вернуться к панели</Button>
 </div>
 </div>
 );
 }

 const handleTypeSelect = (type: 'profile' | 'base') => {
 void navigate('/test/ege', {
 state: { grade, subject, egeType: type },
 });
 };

 return (
 <div className="min-h-screen relative overflow-hidden py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="absolute top-20 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px] -z-10 animate-pulse" />
 <div
 className="absolute bottom-20 left-10 w-96 h-96 bg-violet-100/50 rounded-full blur-[120px] -z-10 animate-pulse"
 style={{ animationDelay: '1s' }}
 />

 <div className="relative z-10 max-w-5xl mx-auto">
 <button
 onClick={() => void navigate(-1)}
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

 <div className="text-center mb-12">
 <div className="text-7xl mb-4 animate-bounce">🎯</div>
 <h1 className="text-4xl md:text-5xl font-bold  mb-3" style={{ color: 'var(--color-text)' }}>
 Выберите уровень ЕГЭ
 </h1>
 <p className="text-slate-600 text-lg">Математика для 11 класса</p>
 </div>

 <div className="grid md:grid-cols-2 gap-6">
 {}
 <button
 onClick={() => handleTypeSelect('profile')}
 className="group relative bg-white border-2 border-orange-200 rounded-3xl p-8 hover:border-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 animate-slide-up"
 >
 <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className="w-6 h-6 text-white"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
 />
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
 />
 </svg>
 </div>

 <div className="mb-6">
 <h2 className="text-3xl font-bold text-orange-600 mb-2">
 Профильный
 </h2>
 <p className="text-slate-600 text-sm">
 Для поступления на технические специальности
 </p>
 </div>

 <div className="space-y-3 mb-6">
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-orange-600 mt-1">•</span>
 <span>19 заданий повышенной сложности</span>
 </div>
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-orange-600 mt-1">•</span>
 <span>Задания с развёрнутым решением</span>
 </div>
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-orange-600 mt-1">•</span>
 <span>Максимум 31 первичный балл</span>
 </div>
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-orange-600 mt-1">•</span>
 <span>Время: 3 часа 55 минут</span>
 </div>
 </div>

 <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
 <span>Выбрать профильный</span>
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
 />
 </svg>
 </div>
 </button>

 {}
 <button
 onClick={() => handleTypeSelect('base')}
 className="group relative bg-white border-2 border-emerald-200 rounded-3xl p-8 hover:border-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 animate-slide-up"
 style={{ animationDelay: '100ms' }}
 >
 <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className="w-6 h-6 text-white"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
 />
 </svg>
 </div>

 <div className="mb-6">
 <h2 className="text-3xl font-bold text-emerald-600 mb-2">
 Базовый
 </h2>
 <p className="text-slate-600 text-sm">Для получения аттестата</p>
 </div>

 <div className="space-y-3 mb-6">
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-emerald-600 mt-1">•</span>
 <span>21 задание базового уровня</span>
 </div>
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-emerald-600 mt-1">•</span>
 <span>Только краткие ответы</span>
 </div>
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-emerald-600 mt-1">•</span>
 <span>Оценка по пятибалльной шкале</span>
 </div>
 <div className="flex items-start gap-3 text-slate-700 text-sm">
 <span className="text-emerald-600 mt-1">•</span>
 <span>Время: 3 часа</span>
 </div>
 </div>

 <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold group-hover:text-emerald-700 transition-colors">
 <span>Выбрать базовый</span>
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
 />
 </svg>
 </div>
 </button>
 </div>

 <div
 className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl animate-fade-in"
 style={{ animationDelay: '200ms' }}
 >
 <div className="flex items-start gap-3">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
 />
 </svg>
 <div className="flex-1">
 <p className="text-sm text-slate-700">
 <span className="text-blue-600 font-semibold">Важно:</span> Профильный уровень
 необходим для поступления на технические, экономические и IT-специальности. Базовый
 уровень достаточен для получения аттестата и поступления на гуманитарные
 направления.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
