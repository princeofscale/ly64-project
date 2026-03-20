import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import { TIMELINE_EVENTS, TIMELINE_PERIODS } from '../data/historyTimeline';

const IMPORTANCE_STYLE = {
  major: 'border-l-4',
  medium: 'border-l-2',
  minor: 'border-l',
};

const PERIOD_COLOR_CLASSES: Record<string, { border: string; badge: string; dot: string }> = {
  amber:   { border: 'border-amber-400',   badge: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-400' },
  red:     { border: 'border-red-400',     badge: 'bg-red-50 text-red-700',       dot: 'bg-red-400' },
  orange:  { border: 'border-orange-400',  badge: 'bg-orange-50 text-orange-700', dot: 'bg-orange-400' },
  yellow:  { border: 'border-yellow-400',  badge: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
  blue:    { border: 'border-blue-400',    badge: 'bg-blue-50 text-blue-700',     dot: 'bg-blue-400' },
  violet:  { border: 'border-violet-400',  badge: 'bg-violet-50 text-violet-700', dot: 'bg-violet-400' },
  emerald: { border: 'border-emerald-400', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  slate:   { border: 'border-slate-400',   badge: 'bg-slate-100 text-slate-700',  dot: 'bg-slate-400' },
  rose:    { border: 'border-rose-400',    badge: 'bg-rose-50 text-rose-700',     dot: 'bg-rose-400' },
  sky:     { border: 'border-sky-400',     badge: 'bg-sky-50 text-sky-700',       dot: 'bg-sky-400' },
};

export default function TimelinePage() {
  const [activePeriod, setActivePeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TIMELINE_EVENTS.filter(e => {
      const matchPeriod = activePeriod === 'all' || e.period === activePeriod;
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.yearLabel.toLowerCase().includes(q);
      return matchPeriod && matchSearch;
    });
  }, [activePeriod, searchQuery]);

  // Group by period key in display order
  const grouped = useMemo(() => {
    const order = TIMELINE_PERIODS.map(p => p.key);
    const map: Record<string, typeof filtered> = {};
    for (const e of filtered) {
      if (!map[e.period]) map[e.period] = [];
      map[e.period]!.push(e);
    }
    return order.filter(k => map[k]?.length).map(k => ({
      period: TIMELINE_PERIODS.find(p => p.key === k)!,
      events: map[k]!,
    }));
  }, [filtered]);

  const totalEvents = TIMELINE_EVENTS.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back + Title */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            &larr; Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Историческая лента</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Ключевые события истории России для подготовки к ЕГЭ · {totalEvents} событий</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по событиям, датам, описаниям..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
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

        {/* Period Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActivePeriod('all')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={activePeriod === 'all'
              ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
              : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Все периоды
          </button>
          {TIMELINE_PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePeriod(p.key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              style={activePeriod === p.key
                ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.yearFrom}–{p.yearTo > 2000 ? 'н.в.' : p.yearTo}</span>
            </button>
          ))}
        </div>

        {/* Results count when searching */}
        {searchQuery && (
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {filtered.length > 0
              ? `Найдено ${filtered.length} событий`
              : 'Ничего не найдено — попробуйте другой запрос'}
          </p>
        )}

        {/* Timeline */}
        {grouped.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📜</p>
            <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>Ничего не найдено</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Попробуйте другой запрос или период</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ period, events }) => {
              const colors = PERIOD_COLOR_CLASSES[period.color] ?? PERIOD_COLOR_CLASSES['slate']!;
              return (
                <div key={period.key}>
                  {/* Period header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{period.icon}</span>
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{period.label}</h2>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{period.yearFrom} — {period.yearTo > 2020 ? 'настоящее время' : period.yearTo}</p>
                    </div>
                  </div>

                  {/* Events list */}
                  <div className="relative ml-4">
                    {/* Vertical line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />

                    <div className="space-y-3 pl-6">
                      {events.map(event => {
                        const isExpanded = expandedId === event.id;
                        return (
                          <div key={event.id} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-[26px] top-4 w-3 h-3 rounded-full border-2 border-white ${colors.dot} shadow-sm`} />

                            <div
                              onClick={() => setExpandedId(isExpanded ? null : event.id)}
                              className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${
                                IMPORTANCE_STYLE[event.importance]
                              } ${colors.border} ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}
                              style={{ backgroundColor: 'var(--color-surface)' }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                                      {event.yearLabel}
                                    </span>
                                    {event.importance === 'major' && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">★ Ключевое</span>
                                    )}
                                  </div>
                                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{event.title}</h3>
                                  {isExpanded && (
                                    <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{event.description}</p>
                                  )}
                                  {!isExpanded && (
                                    <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>{event.description}</p>
                                  )}
                                </div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className={`w-4 h-4 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  style={{ color: 'var(--color-text-muted)' }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
