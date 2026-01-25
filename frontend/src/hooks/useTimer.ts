import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerService } from '../core/services';
import { TimerState } from '../core/types';

interface UseTimerOptions {
  onComplete?: () => void;
  onWarning?: () => void;
  onCritical?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  formattedTime: string;
  isRunning: boolean;
  isPaused: boolean;
  status: 'normal' | 'warning' | 'critical';
  percentRemaining: number;
  start: (duration: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: (duration: number) => void;
  addTime: (seconds: number) => void;
}

export function useTimer(
  initialDuration: number = 0,
  options: UseTimerOptions = {}
): UseTimerReturn {
  const { onComplete, onWarning, onCritical, autoStart = false } = options;

  const timerService = useRef(TimerService.getInstance());
  const [state, setState] = useState<TimerState>({
    timeLeft: initialDuration,
    isRunning: false,
    isPaused: false,
    status: 'normal',
  });

  const prevStatus = useRef<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    const unsubscribeTick = timerService.current.onTick((newState) => {
      setState(newState);

      if (newState.status !== prevStatus.current) {
        if (newState.status === 'warning' && onWarning) {
          onWarning();
        } else if (newState.status === 'critical' && onCritical) {
          onCritical();
        }
        prevStatus.current = newState.status;
      }
    });

    const unsubscribeComplete = timerService.current.onComplete(() => {
      if (onComplete) {
        onComplete();
      }
    });

    return () => {
      unsubscribeTick();
      unsubscribeComplete();
    };
  }, [onComplete, onWarning, onCritical]);

  useEffect(() => {
    if (autoStart && initialDuration > 0) {
      timerService.current.start(initialDuration);
    }

    return () => {};
  }, [autoStart, initialDuration]);

  const start = useCallback((duration: number) => {
    timerService.current.start(duration);
  }, []);

  const pause = useCallback(() => {
    timerService.current.pause();
  }, []);

  const resume = useCallback(() => {
    timerService.current.resume();
  }, []);

  const stop = useCallback(() => {
    timerService.current.stop();
  }, []);

  const reset = useCallback((duration: number) => {
    timerService.current.reset(duration);
  }, []);

  const addTime = useCallback((seconds: number) => {
    timerService.current.addTime(seconds);
  }, []);

  return {
    timeLeft: state.timeLeft,
    formattedTime: TimerService.formatTime(state.timeLeft),
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    status: state.status,
    percentRemaining: timerService.current.getPercentRemaining(),
    start,
    pause,
    resume,
    stop,
    reset,
    addTime,
  };
}
