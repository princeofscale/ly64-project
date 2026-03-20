import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'sepia' | 'high-contrast';

const VALID_THEMES: Theme[] = ['light', 'dark', 'sepia', 'high-contrast'];

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme');
  if (saved && VALID_THEMES.includes(saved as Theme)) return saved as Theme;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...VALID_THEMES);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
};
