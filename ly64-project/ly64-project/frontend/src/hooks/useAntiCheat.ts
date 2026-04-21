import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { antiCheatService } from '../core/services/AntiCheatService';

import type { SuspiciousEvent, AntiCheatReport } from '../core/services/AntiCheatService';

interface UseAntiCheatOptions {
  sessionId: string;
  enabled?: boolean;
  showWarnings?: boolean;
  onSuspiciousActivity?: (event: SuspiciousEvent) => void;
  onLimitExceeded?: (warnings: string[]) => void;
}

interface UseAntiCheatReturn {
  isMonitoring: boolean;
  stats: {
    tabSwitches: number;
    copyAttempts: number;
    blurTime: number;
  };
  suspiciousScore: number;
  warnings: string[];
  startMonitoring: () => void;
  stopMonitoring: () => AntiCheatReport;
}

export function useAntiCheat(options: UseAntiCheatOptions): UseAntiCheatReturn {
  const {
    sessionId,
    enabled = true,
    showWarnings = true,
    onSuspiciousActivity,
    onLimitExceeded,
  } = options;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({ tabSwitches: 0, copyAttempts: 0, blurTime: 0 });
  const [warnings, setWarnings] = useState<string[]>([]);
  const lastWarningTime = useRef<number>(0);

  // Обновление статистики
  const updateStats = useCallback(() => {
    const currentStats = antiCheatService.getStats();
    setStats(currentStats);

    const limits = antiCheatService.checkLimits();
    if (limits.exceeded) {
      setWarnings(limits.warnings);

      // Показываем предупреждение не чаще чем раз в 30 секунд
      const now = Date.now();
      if (showWarnings && now - lastWarningTime.current > 30000) {
        lastWarningTime.current = now;
        const firstWarning = limits.warnings[0];
        if (firstWarning) {
          toast.error(firstWarning, {
            duration: 5000,
            icon: '⚠️',
          });
        }
        onLimitExceeded?.(limits.warnings);
      }
    }
  }, [showWarnings, onLimitExceeded]);

  // Обработка подозрительных событий
  const handleSuspiciousEvent = useCallback(
    (event: SuspiciousEvent) => {
      updateStats();
      onSuspiciousActivity?.(event);

      // Показываем тост для некоторых событий
      if (showWarnings) {
        switch (event.type) {
          case 'copy_attempt':
            toast.error('Копирование текста запрещено во время теста', {
              duration: 2000,
              icon: '🚫',
            });
            break;
          case 'right_click':
            toast.error('Контекстное меню недоступно', {
              duration: 1500,
              icon: '🚫',
            });
            break;
          case 'dev_tools':
            toast.error('Инструменты разработчика недоступны', {
              duration: 2000,
              icon: '🚫',
            });
            break;
          case 'tab_switch':
            const switches = antiCheatService.getStats().tabSwitches;
            if (switches <= 3) {
              toast(`Переключение вкладки зафиксировано (${switches}/3)`, {
                duration: 2000,
                icon: '👁️',
              });
            }
            break;
        }
      }
    },
    [updateStats, showWarnings, onSuspiciousActivity]
  );

  // Запуск мониторинга
  const startMonitoring = useCallback(() => {
    if (!enabled) return;

    antiCheatService.startMonitoring(sessionId);
    setIsMonitoring(true);

    // Подписываемся на события
    const unsubscribe = antiCheatService.onEvent(handleSuspiciousEvent);

    return () => {
      unsubscribe();
    };
  }, [enabled, sessionId, handleSuspiciousEvent]);

  // Остановка мониторинга
  const stopMonitoring = useCallback((): AntiCheatReport => {
    setIsMonitoring(false);
    return antiCheatService.stopMonitoring();
  }, []);

  // Автозапуск при монтировании
  useEffect(() => {
    if (enabled && sessionId) {
      const cleanup = startMonitoring();

      return () => {
        cleanup?.();
        antiCheatService.stopMonitoring();
      };
    }
  }, [enabled, sessionId, startMonitoring]);

  // Периодическое обновление статистики
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [isMonitoring, updateStats]);

  // Рассчёт подозрительности
  const suspiciousScore = Math.min(
    stats.tabSwitches * 15 + stats.copyAttempts * 10 + Math.floor(stats.blurTime / 10000) * 5,
    100
  );

  return {
    isMonitoring,
    stats,
    suspiciousScore,
    warnings,
    startMonitoring,
    stopMonitoring,
  };
}

export default useAntiCheat;
