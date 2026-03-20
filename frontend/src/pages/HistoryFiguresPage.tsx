import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import { HISTORY_FIGURES } from '../data/historyFigures';
import { TIMELINE_PERIODS } from '../data/historyTimeline';

const PERIOD_COLOR: Record<string, { badge: string; border: string }> = {
  amber:   { badge: 'bg-amber-50 text-amber-700',   border: 'border-amber-200' },
  red:     { badge: 'bg-red-50 text-red-700',       border: 'border-red-200' },
  orange:  { badge: 'bg-orange-50 text-orange-700', border: 'border-orange-200' },
  yellow:  { badge: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
  blue:    { badge: 'bg-blue-50 text-blue-700',     border: 'border-blue-200' },
  violet:  { badge: 'bg-violet-50 text-violet-700', border: 'border-violet-200' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
  slate:   { badge: 'bg-slate-100 text-slate-600',  border: 'border-slate-200' },
  rose:    { badge: 'bg-rose-50 text-rose-700',     border: 'border-rose-200' },
  sky:     { badge: 'bg-sky-50 text-sky-700',       border: 'border-sky-200' },
};

export default function HistoryFiguresPage() {
  const [activePeriod, setActivePeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HISTORY_FIGURES.filter(f => {
      const matchPeriod = activePeriod === 'all' || f.period === activePeriod;
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.role.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.achievements.some(a => a.toLowerCase().includes(q));
      return matchPeriod && matchSearch;
    });
  }, [activePeriod, searchQuery]);

  const selectedFigure = selectedId ? HISTORY_FIGURES.find(f => f.id === selectedId) : null;

  const getPeriodForFigure = (periodKey: string) =>
    TIMELINE_PERIODS.find(p => p.key === periodKey);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back + Title */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
            &larr; Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Деятели истории</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Биографии ключевых личностей для подготовки к ЕГЭ · {HISTORY_FIGURES.length} персон</p>
        </div>

        {/* Detail modal */}
        {selectedFigure && (() => {
          const period = getPeriodForFigure(selectedFigure.period);
          const colors = PERIOD_COLOR[period?.color ?? 'slate']!;
          return (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={() => setSelectedId(null)}>
              <div
                className="rounded-2xl shadow-2xl w-full max-w-lg my-8"
                style={{ backgroundColor: 'var(--color-surface)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{selectedFigure.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{selectedFigure.name}</h2>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selectedFigure.dates}</p>
                      {period && (
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                          {period.icon} {period.label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-slate-400 hover:text-slate-600 shrink-0"
                      aria-label="Закрыть"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">
                    {selectedFigure.role}
                  </p>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-slate-700 text-sm leading-relaxed mb-5">{selectedFigure.description}</p>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ключевые факты</h3>
                  <ul className="space-y-2">
                    {selectedFigure.achievements.map((a, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Search */}
        <div className="relative mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по имени, роли, достижениям..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Очистить поиск"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Period tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActivePeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activePeriod === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Все эпохи
          </button>
          {TIMELINE_PERIODS.map(p => {
            const count = HISTORY_FIGURES.filter(f => f.period === p.key).length;
            if (count === 0) return null;
            return (
              <button
                key={p.key}
                onClick={() => setActivePeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activePeriod === p.key
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{p.icon}</span>
                <span className="hidden sm:inline">{p.label}</span>
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Count */}
        {searchQuery && (
          <p className="text-sm text-slate-500 mb-4">
            {filtered.length > 0 ? `Найдено: ${filtered.length}` : 'Ничего не найдено'}
          </p>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-medium text-slate-700">Ничего не найдено</p>
            <p className="text-sm text-slate-400 mt-1">Попробуйте другой запрос</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(figure => {
              const period = getPeriodForFigure(figure.period);
              const colors = PERIOD_COLOR[period?.color ?? 'slate']!;
              return (
                <button
                  key={figure.id}
                  onClick={() => setSelectedId(figure.id)}
                  className={`bg-white border rounded-2xl p-4 text-left cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 ${colors.border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl shrink-0">{figure.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm leading-tight">{figure.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{figure.dates}</p>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{figure.role}</p>
                      {period && (
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                          {period.icon} {period.label}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
