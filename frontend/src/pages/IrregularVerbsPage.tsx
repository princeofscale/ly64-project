import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import {
  IRREGULAR_VERBS,
  LEVEL_COLOR,
  type VerbLevel,
} from '../data/irregularVerbs';

const LEVELS: VerbLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default function IrregularVerbsPage() {
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState<VerbLevel | 'all'>('all');
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return IRREGULAR_VERBS.filter((v, i) => {
      // deduplicate by v1+v2+v3 combo (win appears twice)
      const isDupe = IRREGULAR_VERBS.findIndex(
        x => x.v1 === v.v1 && x.v2 === v.v2 && x.v3 === v.v3,
      ) !== i;
      if (isDupe) return false;
      const matchLevel = activeLevel === 'all' || v.level === activeLevel;
      const matchSearch =
        !q ||
        v.v1.toLowerCase().includes(q) ||
        v.v2.toLowerCase().includes(q) ||
        v.v3.toLowerCase().includes(q) ||
        v.ru.toLowerCase().includes(q);
      return matchLevel && matchSearch;
    });
  }, [search, activeLevel]);

  function toggleFlip(idx: number) {
    setFlipped(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Title */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            &larr; Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            Неправильные глаголы
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {IRREGULAR_VERBS.length} глаголов · Infinitive / Past Simple / Past Participle
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск: be, went, сделать..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Очистить"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Level filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveLevel('all')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={activeLevel === 'all'
              ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
              : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Все уровни
          </button>
          {LEVELS.map(lv => (
            <button
              key={lv}
              onClick={() => setActiveLevel(lv)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={activeLevel === lv
                ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              {lv}
            </button>
          ))}
        </div>

        {/* Count */}
        {search && (
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {filtered.length > 0
              ? `Найдено: ${filtered.length}`
              : 'Ничего не найдено'}
          </p>
        )}

        {/* Table — desktop */}
        <div className="hidden md:block rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
          {/* Header row */}
          <div className="grid grid-cols-[2fr_2fr_2fr_3fr_auto] text-xs font-semibold uppercase tracking-wider px-4 py-3"
            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
            <span>Infinitive (V1)</span>
            <span>Past Simple (V2)</span>
            <span>Past Participle (V3)</span>
            <span>Перевод</span>
            <span>Уровень</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
              Ничего не найдено
            </div>
          ) : (
            filtered.map((verb, i) => (
              <div
                key={`${verb.v1}-${verb.v2}-${i}`}
                className="grid grid-cols-[2fr_2fr_2fr_3fr_auto] px-4 py-3 transition-colors menu-item-hover"
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : undefined,
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <span className="font-semibold text-blue-500">{verb.v1}</span>
                <span style={{ color: 'var(--color-text)' }}>{verb.v2}</span>
                <span style={{ color: 'var(--color-text)' }}>{verb.v3}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{verb.ru}</span>
                <span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[verb.level].badge}`}>
                    {verb.level}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>Ничего не найдено</div>
          ) : (
            filtered.map((verb, i) => {
              const isFlipped = flipped.has(i);
              return (
                <button
                  key={`${verb.v1}-${verb.v2}-${i}`}
                  onClick={() => toggleFlip(i)}
                  className="w-full text-left rounded-xl px-4 py-3 shadow-sm transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-blue-500">{verb.v1}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      <span style={{ color: 'var(--color-text)' }}>{verb.v2}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      <span style={{ color: 'var(--color-text)' }}>{verb.v3}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 ${LEVEL_COLOR[verb.level].badge}`}>
                      {verb.level}
                    </span>
                  </div>
                  {isFlipped && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {verb.ru}
                    </p>
                  )}
                  {!isFlipped && (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      нажмите, чтобы увидеть перевод
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Уровни:</span>
          {LEVELS.map(lv => (
            <span key={lv} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[lv].badge}`}>
              {lv}
            </span>
          ))}
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            — уровень владения по CEFR
          </span>
        </div>

      </main>
    </div>
  );
}
