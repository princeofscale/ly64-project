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

  const updateStats = useCallback(() => {
    const currentStats = antiCheatService.getStats();
    setStats(currentStats);

    const limits = antiCheatService.checkLimits();
    if (limits.exceeded) {
      setWarnings(limits.warnings);

      const now = Date.now();
      const firstWarning = limits.warnings[0];
      if (showWarnings && firstWarning && now - lastWarningTime.current > 30000) {
        lastWarningTime.current = now;
        toast.error(firstWarning, {
          duration: 5000,
          icon: '⚠️',
        });
        onLimitExceeded?.(limits.warnings);
      }
    }
  }, [showWarnings, onLimitExceeded]);

  const handleSuspiciousEvent = useCallback(
    (event: SuspiciousEvent) => {
      updateStats();
      onSuspiciousActivity?.(event);

      if (showWarnings) {
        switch (event.type) {
          case 'copy_attempt': {
            toast.error('Копирование текста запрещено во время теста', {
              duration: 2000,
              icon: '🚫',
            });
            break;
          }
          case 'right_click': {
            toast.error('Контекстное меню недоступно', {
              duration: 1500,
              icon: '🚫',
            });
            break;
          }
          case 'dev_tools': {
            toast.error('Инструменты разработчика недоступны', {
              duration: 2000,
              icon: '🚫',
            });
            break;
          }
          case 'tab_switch': {
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
      }
    },
    [updateStats, showWarnings, onSuspiciousActivity]
  );

  const startMonitoring = useCallback(() => {
    if (!enabled) return undefined;

    antiCheatService.startMonitoring(sessionId);

    const unsubscribe = antiCheatService.onEvent(handleSuspiciousEvent);

    return () => {
      unsubscribe();
    };
  }, [enabled, sessionId, handleSuspiciousEvent]);

  const stopMonitoring = useCallback((): AntiCheatReport => {
    setIsMonitoring(false);
    return antiCheatService.stopMonitoring();
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMonitoring(true);
    antiCheatService.startMonitoring(sessionId);
    const unsubscribe = antiCheatService.onEvent(handleSuspiciousEvent);

    return () => {
      unsubscribe();
      antiCheatService.stopMonitoring();
      setIsMonitoring(false);
    };
  }, [enabled, sessionId, handleSuspiciousEvent]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [isMonitoring, updateStats]);

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
