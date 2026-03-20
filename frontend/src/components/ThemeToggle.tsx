import { useEffect, useRef, useState } from 'react';

import { useTheme } from '../hooks/useTheme';

const THEME_OPTIONS = [
  { value: 'light' as const, icon: '☀️', label: 'Светлая' },
  { value: 'dark' as const, icon: '🌙', label: 'Тёмная' },
  { value: 'sepia' as const, icon: '📜', label: 'Сепия' },
  { value: 'high-contrast' as const, icon: '⬛', label: 'Высокий контраст' },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = THEME_OPTIONS.find(t => t.value === theme) ?? THEME_OPTIONS[0]!;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm"
        aria-label="Выбрать тему"
        aria-expanded={isOpen}
      >
        <span>{current.icon}</span>
        <span className="text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
          {THEME_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => { setTheme(option.value); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                theme === option.value
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
