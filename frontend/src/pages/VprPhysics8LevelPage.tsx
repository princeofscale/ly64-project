import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';

export default function VprPhysics8LevelPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade } = location.state || {};

  const handleLevelSelect = (level: 'base' | 'advanced') => {
    navigate('/test/vpr-physics8', {
      state: { grade, subject: 'PHYSICS', level }
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="group mb-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>

        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">⚛️</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            ВПР по физике — 8 класс
          </h1>
          <p className="text-gray-400 text-xl">
            Выберите уровень сложности
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => handleLevelSelect('base')}
            className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-cyan-500/50 hover:border-cyan-400 rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] text-left animate-scale-in"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-3xl">
                📘
              </div>
              <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-semibold border border-cyan-500/30">
                БАЗОВЫЙ
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
              Базовый уровень
            </h3>

            <p className="text-gray-400 mb-6 leading-relaxed">
              Стандартный вариант ВПР для проверки базовых знаний по физике за 8 класс
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>10 заданий</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>90 минут</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Средний уровень сложности</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-500">
                💡 Подходит для общей подготовки к ВПР
              </p>
            </div>
          </button>

          <button
            onClick={() => handleLevelSelect('advanced')}
            className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-purple-500/50 hover:border-purple-400 rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] text-left animate-scale-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                🔬
              </div>
              <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm font-semibold border border-purple-500/30">
                ПРОФИЛЬНЫЙ
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
              Профильный уровень
            </h3>

            <p className="text-gray-400 mb-6 leading-relaxed">
              Углублённый вариант ВПР с экспериментальными заданиями и сложными расчётами
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>7 заданий повышенной сложности</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>90 минут</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Экспериментальные задания</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-500">
                🔥 Для углублённой подготовки и высоких результатов
              </p>
            </div>
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>ℹ️</span> Информация о ВПР по физике
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2">Базовый уровень:</h4>
              <ul className="space-y-1">
                <li>• Задачи на вычисления</li>
                <li>• Анализ графиков и таблиц</li>
                <li>• Объяснение физических явлений</li>
                <li>• Практические измерения</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Профильный уровень:</h4>
              <ul className="space-y-1">
                <li>• Комплексные задачи с несколькими частями</li>
                <li>• Расчёт погрешностей измерений</li>
                <li>• Экспериментальная работа</li>
                <li>• Углублённый анализ явлений</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
