import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { GLOSSARY, type GlossaryTerm } from '../data/glossary';

const SUBJECT_COLORS: Record<string, string> = {
  MATHEMATICS: 'bg-blue-100 text-blue-700',
  PHYSICS:     'bg-yellow-100 text-yellow-700',
  CHEMISTRY:   'bg-green-100 text-green-700',
  BIOLOGY:     'bg-emerald-100 text-emerald-700',
  RUSSIAN:     'bg-purple-100 text-purple-700',
  INFORMATICS: 'bg-cyan-100 text-cyan-700',
  SOCIAL:      'bg-orange-100 text-orange-700',
};

function getFirstLetter(term: string): string {
  return term[0]?.toUpperCase() ?? '#';
}

function groupByLetter(terms: GlossaryTerm[]): Map<string, GlossaryTerm[]> {
  const sorted = [...terms].sort((a, b) =>
    a.term.localeCompare(b.term, 'ru', { sensitivity: 'base' })
  );
  const map = new Map<string, GlossaryTerm[]>();
  for (const term of sorted) {
    const letter = getFirstLetter(term.term);
    const existing = map.get(letter);
    if (existing) {
      existing.push(term);
    } else {
      map.set(letter, [term]);
    }
  }
  return map;
}

// Lookup by subject CODE (not term name) — no collisions possible
const SUBJECT_INFO: Record<string, { label: string; icon: string; color: string }> = Object.fromEntries(
  GLOSSARY.map(s => [
    s.subject,
    { label: s.label, icon: s.icon, color: SUBJECT_COLORS[s.subject] ?? 'bg-slate-100 text-slate-600' },
  ])
);

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const allTerms = useMemo(
    () => GLOSSARY.flatMap(s => s.terms),
    []
  );

  const totalCount = allTerms.length;

  const filtered = useMemo(() => {
    let terms = activeSubject
      ? (GLOSSARY.find(s => s.subject === activeSubject)?.terms ?? [])
      : allTerms;

    if (query.trim()) {
      const q = query.toLowerCase();
      terms = terms.filter(
        t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
      );
    }
    return terms;
  }, [query, activeSubject, allTerms]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);
  const letters = useMemo(() => Array.from(grouped.keys()), [grouped]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="container-wide py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
            <span>📖</span>
            Словарь терминов
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {totalCount} терминов по {GLOSSARY.length} предметам
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="search"
            className="input pl-10"
            placeholder="Поиск терминов..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Subject tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveSubject(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeSubject === null
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Все
          </button>
          {GLOSSARY.map(s => (
            <button
              key={s.subject}
              onClick={() => setActiveSubject(s.subject === activeSubject ? null : s.subject)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSubject === s.subject
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {(query || activeSubject) && (
          <p className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Найдено: {filtered.length} {filtered.length === 1 ? 'термин' : filtered.length < 5 ? 'термина' : 'терминов'}
          </p>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
              Ничего не найдено
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Попробуйте другой запрос или снимите фильтр
            </p>
          </div>
        )}

        {/* Alphabetical groups */}
        <div className="space-y-6">
          {letters.map(letter => {
            const terms = grouped.get(letter) ?? [];
            return (
              <section key={letter}>
                <h2
                  className="text-lg font-bold mb-3 pb-1 border-b"
                  style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                >
                  — {letter} —
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {terms.map(term => {
                    const meta = SUBJECT_INFO[term.subject];
                    return (
                      <div
                        key={`${term.subject}|${term.term}`}
                        className="card p-4 rounded-xl"
                        style={{
                          background: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                            {term.term}
                          </p>
                          {meta && (
                            <span
                              className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}
                            >
                              {meta.icon} {meta.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                          {term.definition}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
