/**
 * useSound Hook
 * React hook для управления звуковыми эффектами
 */

import { useCallback, useSyncExternalStore } from 'react';

import soundService from '../core/services/SoundService';

type SoundType =
  | 'click'
  | 'success'
  | 'error'
  | 'warning'
  | 'complete'
  | 'achievement'
  | 'navigation'
  | 'timer'
  | 'levelUp';

// External store for sound settings
let listeners: (() => void)[] = [];

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const getSnapshot = () => ({
  enabled: soundService.isEnabled(),
  volume: soundService.getVolume(),
});

/**
 * Hook for playing sounds
 */
export function useSound() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const play = useCallback((sound: SoundType) => {
    soundService.play(sound);
  }, []);

  const setVolume = useCallback((volume: number) => {
    soundService.setVolume(volume);
    notifyListeners();
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    soundService.setEnabled(enabled);
    notifyListeners();
  }, []);

  const toggle = useCallback(() => {
    soundService.toggleEnabled();
    notifyListeners();
    return soundService.isEnabled();
  }, []);

  return {
    play,
    isEnabled: settings.enabled,
    volume: settings.volume,
    setVolume,
    setEnabled,
    toggle,
  };
}

/**
 * Shorthand hooks for specific sounds
 */
export function useClickSound() {
  const { play } = useSound();
  return useCallback(() => play('click'), [play]);
}

export function useSuccessSound() {
  const { play } = useSound();
  return useCallback(() => play('success'), [play]);
}

export function useErrorSound() {
  const { play } = useSound();
  return useCallback(() => play('error'), [play]);
}

export default useSound;
