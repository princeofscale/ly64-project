/**
 * useKeyboardShortcuts Hook
 * Горячие клавиши для навигации по тесту
 */

import { useEffect, useCallback, useRef } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: ShortcutConfig[];
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      // Allow some shortcuts even in input fields
      const allowInInput = ['Escape'];

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.disabled) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatches = !!shortcut.shift === event.shiftKey;
        const altMatches = !!shortcut.alt === event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          // Skip if in input field and shortcut not allowed
          if (isInputField && !allowInInput.includes(shortcut.key)) {
            continue;
          }

          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current,
  };
}

/**
 * Test-specific keyboard shortcuts
 */
interface UseTestShortcutsOptions {
  enabled?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  onFlag?: () => void;
  onPause?: () => void;
  onSelectAnswer?: (index: number) => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  canSubmit?: boolean;
}

export function useTestShortcuts({
  enabled = true,
  onNext,
  onPrevious,
  onSubmit,
  onFlag,
  onPause,
  onSelectAnswer,
  canGoNext = true,
  canGoPrevious = true,
  canSubmit = false,
}: UseTestShortcutsOptions) {
  const shortcuts: ShortcutConfig[] = [
    // Navigation
    {
      key: 'ArrowRight',
      action: () => onNext?.(),
      description: 'Следующий вопрос',
      disabled: !canGoNext,
    },
    {
      key: 'ArrowLeft',
      action: () => onPrevious?.(),
      description: 'Предыдущий вопрос',
      disabled: !canGoPrevious,
    },
    // Quick navigation with N/P
    {
      key: 'n',
      action: () => onNext?.(),
      description: 'Следующий вопрос (N)',
      disabled: !canGoNext,
    },
    {
      key: 'p',
      action: () => onPrevious?.(),
      description: 'Предыдущий вопрос (P)',
      disabled: !canGoPrevious,
    },
    // Actions
    {
      key: 'Enter',
      ctrl: true,
      action: () => onSubmit?.(),
      description: 'Завершить тест',
      disabled: !canSubmit,
    },
    {
      key: 'f',
      action: () => onFlag?.(),
      description: 'Отметить вопрос (F)',
    },
    {
      key: 'Escape',
      action: () => onPause?.(),
      description: 'Пауза',
    },
    // Answer selection with number keys
    {
      key: '1',
      action: () => onSelectAnswer?.(0),
      description: 'Выбрать ответ 1',
    },
    {
      key: '2',
      action: () => onSelectAnswer?.(1),
      description: 'Выбрать ответ 2',
    },
    {
      key: '3',
      action: () => onSelectAnswer?.(2),
      description: 'Выбрать ответ 3',
    },
    {
      key: '4',
      action: () => onSelectAnswer?.(3),
      description: 'Выбрать ответ 4',
    },
    {
      key: '5',
      action: () => onSelectAnswer?.(4),
      description: 'Выбрать ответ 5',
    },
  ];

  return useKeyboardShortcuts({ enabled, shortcuts });
}

/**
 * Component to display keyboard shortcuts help
 */
export const testShortcutsHelp = [
  { keys: ['←', '→'], description: 'Навигация между вопросами' },
  { keys: ['N', 'P'], description: 'Следующий / Предыдущий вопрос' },
  { keys: ['1-5'], description: 'Выбор варианта ответа' },
  { keys: ['F'], description: 'Отметить вопрос для проверки' },
  { keys: ['Esc'], description: 'Пауза' },
  { keys: ['Ctrl', 'Enter'], description: 'Завершить тест' },
];

export default useKeyboardShortcuts;
