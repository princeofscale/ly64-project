import { memo, useEffect, useRef } from 'react';

import { useRocketStore } from '../../store/rocketStore';

interface AutoCashoutWatcherProps {
  autoEnabled: boolean;
  autoTarget: string;
  canCashOut: boolean;
  cashingOut: boolean;
  roundId: string | null | undefined;
  onCashOut: () => void;
}

/**
 * Invisible component that fires auto-cashout when the target multiplier is reached.
 *
 * Uses useRocketStore.subscribe() (not the Zustand hook) so it produces ZERO React
 * re-renders from multiplier ticks. The subscribe callback runs directly in response
 * to store updates, bypassing React's render cycle entirely.
 */
export const AutoCashoutWatcher = memo(function AutoCashoutWatcher({
  autoEnabled,
  autoTarget,
  canCashOut,
  cashingOut,
  roundId,
  onCashOut,
}: AutoCashoutWatcherProps) {
  // Mirror all props into refs so the subscribe callback always reads fresh values
  // without needing to re-subscribe when props change.
  const autoEnabledRef = useRef(autoEnabled);
  const autoTargetRef = useRef(autoTarget);
  const canCashOutRef = useRef(canCashOut);
  const cashingOutRef = useRef(cashingOut);
  const roundIdRef = useRef(roundId);
  const onCashOutRef = useRef(onCashOut);
  const autoFiredFor = useRef<string | null>(null);

  autoEnabledRef.current = autoEnabled;
  autoTargetRef.current = autoTarget;
  canCashOutRef.current = canCashOut;
  cashingOutRef.current = cashingOut;
  roundIdRef.current = roundId;
  onCashOutRef.current = onCashOut;

  useEffect(() => {
    let prevMultiplier = useRocketStore.getState().multiplier;

    const unsubscribe = useRocketStore.subscribe(state => {
      const multiplier = state.multiplier;
      // Skip if multiplier didn't change (state has other fields that may update)
      if (multiplier === prevMultiplier) return;
      prevMultiplier = multiplier;

      if (state.state?.status !== 'RUNNING') return;
      if (!autoEnabledRef.current) return;
      if (!canCashOutRef.current) return;
      if (cashingOutRef.current) return;

      const rid = roundIdRef.current;
      if (rid && autoFiredFor.current === rid) return;

      const target = parseFloat(autoTargetRef.current);
      if (!Number.isFinite(target) || target < 1.01) return;

      if (multiplier >= target) {
        autoFiredFor.current = rid ?? null;
        onCashOutRef.current();
      }
    });

    return unsubscribe;
  }, []); // subscribe once — refs keep all props fresh

  return null;
});
