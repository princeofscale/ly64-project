import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GLOSSARY } from '../data/glossary';
import { ALL_SUBJECTS } from '../data/theory';

interface GlobalSearchProps {
  onClose: () => void;
}

interface TopicResult {
  kind: 'topic';
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectLabel: string;
  subjectIcon: string;
  icon: string;
}

interface GlossaryResult {
  kind: 'glossary';
  term: string;
  definition: string;
  subjectLabel: string;
  subjectIcon: string;
}

type SearchResult = TopicResult | GlossaryResult;

const allTopics: TopicResult[] = ALL_SUBJECTS.flatMap(s =>
  s.topics.map(t => ({
    kind: 'topic' as const,
    id: t.id,
    title: t.title,
    description: t.description,
    subject: s.subject,
    subjectLabel: s.label,
    subjectIcon: s.icon,
    icon: t.icon,
  }))
);

const allGlossaryTerms: GlossaryResult[] = GLOSSARY.flatMap(s =>
  s.terms.map(t => ({
    kind: 'glossary' as const,
    term: t.term,
    definition: t.definition,
    subjectLabel: s.label,
    subjectIcon: s.icon,
  }))
);

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const topicResults = allTopics
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const glossaryResults = allGlossaryTerms
      .filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
      )
      .slice(0, 5);

    return [...topicResults, ...glossaryResults];
  }, [query]);

  const selectResult = useCallback((result: SearchResult) => {
    onClose();
    if (result.kind === 'topic') {
      void navigate(`/theory/${result.subject}/${result.id}`);
    } else {
      void navigate('/glossary');
    }
  }, [onClose, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const active = results[activeIndex];
        if (active) selectResult(active);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, activeIndex, onClose, selectResult]);

  const topicResults = results.filter((r): r is TopicResult => r.kind === 'topic');
  const glossaryResults = results.filter((r): r is GlossaryResult => r.kind === 'glossary');

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            placeholder="Поиск тем и терминов..."
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: 'var(--color-text)' }}
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {!query.trim() && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Введите запрос для поиска
            </p>
          )}

          {query.trim() && results.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Ничего не найдено
            </p>
          )}

          {topicResults.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Теория ({topicResults.length})
              </p>
              {topicResults.map((r, i) => {
                const globalIdx = i;
                return (
                  <button
                    key={`${r.subject}-${r.id}`}
                    onClick={() => selectResult(r)}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      activeIndex === globalIdx ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl shrink-0">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{r.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{r.description}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                      {r.subjectIcon} {r.subjectLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {glossaryResults.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Словарь ({glossaryResults.length})
              </p>
              {glossaryResults.map((r, i) => {
                const globalIdx = topicResults.length + i;
                return (
                  <button
                    key={`glossary-${r.term}`}
                    onClick={() => selectResult(r)}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      activeIndex === globalIdx ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl shrink-0">📖</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{r.term}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{r.definition}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                      {r.subjectIcon} {r.subjectLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <span>↑↓ навигация</span>
          <span>Enter выбор</span>
          <span>Esc закрыть</span>
        </div>
      </div>
    </div>
  );
}
