import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';

export default function EgeTypePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade, subject } = location.state || {};

  if (!grade || !subject) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 font-sans mb-4">Ошибка: данные не переданы</p>
          <Button onClick={() => navigate('/dashboard')}>Вернуться к панели</Button>
        </div>
      </div>
    );
  }

  const handleTypeSelect = (type: 'profile' | 'base') => {
    navigate('/test/ege', {
      state: { grade, subject, egeType: type },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="group mb-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-sans"
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
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Выберите уровень ЕГЭ
          </h1>
          <p className="text-gray-400 text-lg font-sans">Математика для 11 класса</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Профильный уровень */}
          <button
            onClick={() => handleTypeSelect('profile')}
            className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] hover:scale-105 animate-slide-up"
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
              <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                Профильный
              </h2>
              <p className="text-gray-400 font-sans text-sm">
                Для поступления на технические специальности
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-orange-400 mt-1">•</span>
                <span>19 заданий повышенной сложности</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-orange-400 mt-1">•</span>
                <span>Задания с развёрнутым решением</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-orange-400 mt-1">•</span>
                <span>Максимум 31 первичный балл</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-orange-400 mt-1">•</span>
                <span>Время: 3 часа 55 минут</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-orange-400 font-sans font-semibold group-hover:text-orange-300 transition-colors">
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

          {/* Базовый уровень */}
          <button
            onClick={() => handleTypeSelect('base')}
            className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-[0_0_50px_rgba(34,197,94,0.2)] hover:scale-105 animate-slide-up"
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
              <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                Базовый
              </h2>
              <p className="text-gray-400 font-sans text-sm">Для получения аттестата</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>21 задание базового уровня</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>Только краткие ответы</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>Оценка по пятибалльной шкале</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 font-sans text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>Время: 3 часа</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-400 font-sans font-semibold group-hover:text-green-300 transition-colors">
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
          className="mt-8 p-6 bg-gray-900/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-sans">
                <span className="text-cyan-400 font-semibold">Важно:</span> Профильный уровень
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
