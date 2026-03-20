import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import {
  SOCIAL_TERMS,
  SOCIAL_CATEGORIES,
  CAT_COLOR,
} from '../data/socialTerms';

export default function SocialTermsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SOCIAL_TERMS.filter(t => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory;
      const matchSearch =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.example ?? '').toLowerCase().includes(q) ||
        (t.note ?? '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  // Group by first Cyrillic letter
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const term of filtered) {
      const letter = term.term[0]?.toUpperCase() ?? '#';
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(term);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ru'));
  }, [filtered]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
            &larr; Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold  mb-1" style={{ color: 'var(--color-text)' }}>Словарь по обществознанию</h1>
          <p className="text-slate-500">
            Право, экономика, политология, социология, философия · {SOCIAL_TERMS.length} терминов
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по термину, определению, примеру..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Очистить"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Все разделы
          </button>
          {SOCIAL_CATEGORIES.map(cat => {
            const count = SOCIAL_TERMS.filter(t => t.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.key
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {(search || activeCategory !== 'all') && (
          <p className="text-sm text-slate-500 mb-4">
            {filtered.length > 0 ? `Найдено: ${filtered.length} терминов` : 'Ничего не найдено'}
          </p>
        )}

        {/* Terms */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-lg font-medium text-slate-700">Ничего не найдено</p>
            <p className="text-sm text-slate-400 mt-1">Попробуйте другой запрос или раздел</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([letter, terms]) => (
              <section key={letter}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-slate-300">{letter}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {terms.map(term => {
                    const colors = CAT_COLOR[term.category] ?? CAT_COLOR['law']!;
                    const cat = SOCIAL_CATEGORIES.find(c => c.key === term.category);
                    return (
                      <div
                        key={term.id}
                        className={`bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow ${colors.border}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold  text-base leading-tight" style={{ color: 'var(--color-text)' }}>{term.term}</h3>
                          {cat && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${colors.badge}`}>
                              {cat.icon} {cat.label}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed mb-2">{term.definition}</p>

                        {term.example && (
                          <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-2 leading-relaxed">
                            {term.example}
                          </p>
                        )}

                        {term.note && (
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            💡 {term.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
