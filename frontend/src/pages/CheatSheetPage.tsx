import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { CHEAT_SHEETS } from '../data/cheatSheets';

interface FormulaResult {
  subjectIcon: string;
  subjectLabel: string;
  subject: string;
  sectionTitle: string;
  name: string;
  formula: string;
  note?: string;
}

export default function CheatSheetPage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string>(CHEAT_SHEETS[0]!.subject);
  const [searchQuery, setSearchQuery] = useState('');

  const sheet = CHEAT_SHEETS.find(s => s.subject === selectedSubject) ?? CHEAT_SHEETS[0]!;

  const searchResults = useMemo<FormulaResult[] | null>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const results: FormulaResult[] = [];
    for (const s of CHEAT_SHEETS) {
      for (const section of s.sections) {
        for (const f of section.formulas) {
          if (
            f.name.toLowerCase().includes(q) ||
            f.formula.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q) ||
            (f.note && f.note.toLowerCase().includes(q))
          ) {
            results.push({
              subjectIcon: s.icon,
              subjectLabel: s.label,
              subject: s.subject,
              sectionTitle: section.title,
              name: f.name,
              formula: f.formula,
              note: f.note,
            });
          }
        }
      }
    }
    return results;
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cheat-sheet-print, #cheat-sheet-print * { visibility: visible; }
          #cheat-sheet-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-size: 11px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 no-print">
            <button
              onClick={() => void navigate('/dashboard')}
              className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Назад
            </button>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Шпаргалки</h1>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12z" />
              </svg>
              Печать / PDF
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4 no-print">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по всем формулам и правилам..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border rounded-xl pl-10 pr-10 py-2.5 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm text-sm"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            />
            {isSearching && (
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

          {/* Subject Tabs */}
          <div className={`flex flex-wrap gap-2 mb-6 no-print${isSearching ? ' opacity-50 pointer-events-none' : ''}`}>
            {CHEAT_SHEETS.map(s => (
              <button
                key={s.subject}
                onClick={() => setSelectedSubject(s.subject)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedSubject === s.subject
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'border hover:opacity-80'
                }`}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {isSearching && searchResults !== null && (
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-3">
                {searchResults.length > 0
                  ? `Найдено ${searchResults.length} ${searchResults.length === 1 ? 'формула' : searchResults.length < 5 ? 'формулы' : 'формул'} по всем предметам`
                  : 'Ничего не найдено'}
              </p>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-slate-500">Попробуйте другой запрос</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => { setSelectedSubject(r.subject); setSearchQuery(''); }}
                      className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          {r.subjectIcon} {r.subjectLabel}
                        </span>
                        <span className="text-xs text-slate-400">{r.sectionTitle}</span>
                      </div>
                      <div className="flex gap-2 items-baseline">
                        <span className="text-xs text-slate-500 font-medium shrink-0">{r.name}:</span>
                        <span className="text-sm font-mono text-slate-900 font-medium">{r.formula}</span>
                        {r.note && <span className="text-xs text-slate-400 italic">({r.note})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cheat Sheet Content */}
          <div id="cheat-sheet-print" className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm${isSearching ? ' hidden' : ''}`}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>
                {sheet.icon} {sheet.label} — Шпаргалка
              </h2>
              <p className="text-sm text-slate-500 mt-1">Основные формулы и правила</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sheet.sections.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  className="border border-slate-200 rounded-xl p-4 break-inside-avoid"
                >
                  <h3 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wide border-b border-emerald-100 pb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.formulas.map((formula, fIndex) => (
                      <div key={fIndex} className="flex gap-2 items-baseline">
                        <span className="text-xs text-slate-500 min-w-0 flex-shrink-0 font-medium">
                          {formula.name}:
                        </span>
                        <span className="text-sm font-mono text-slate-900 font-medium">
                          {formula.formula}
                        </span>
                        {formula.note && (
                          <span className="text-xs text-slate-400 italic">({formula.note})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
              Лицей №64, Саратов — lyceum64.ru
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
