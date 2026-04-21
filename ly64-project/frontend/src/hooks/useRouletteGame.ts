import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  BALL_INNER_RADIUS,
  BALL_OUTER_RADIUS,
  SPIN_DURATION_MS,
  STARTING_BALANCE,
  type ChipValue,
} from '@/components/roulette/constants';
import { RouletteBetFactory } from '@/core/factories/RouletteBetFactory';
import { Bankroll, Wheel } from '@/core/models/roulette';
import {
  BallTrajectory,
  CryptoRandomGenerator,
  RouletteBalanceStorage,
  RouletteEngine,
  RouletteHistoryStorage,
} from '@/core/services/roulette';
import type {
  BetKey,
  PlacedBetSnapshot,
  SpinOutcome,
} from '@/core/types/roulette';

interface BallState {
  angleDeg: number;
  radius: number;
  visible: boolean;
}

export interface UseRouletteGameResult {
  wheel: Wheel;
  balance: number;
  stake: number;
  bets: readonly PlacedBetSnapshot[];
  betAmountFor: (key: BetKey) => number;
  chipValue: ChipValue;
  setChipValue: (v: ChipValue) => void;
  history: readonly number[];
  spinning: boolean;
  rotation: number;
  ball: BallState;
  lastResult: SpinOutcome | null;
  showResult: boolean;
  placeBet: (key: BetKey) => void;
  removeBet: (key: BetKey) => void;
  clearBets: () => void;
  spin: () => void;
  reset: () => void;
}

interface EngineBundle {
  wheel: Wheel;
  engine: RouletteEngine;
  historyStorage: RouletteHistoryStorage;
}

function createEngine(): EngineBundle {
  const wheel = new Wheel();
  const bankroll = new Bankroll(STARTING_BALANCE, new RouletteBalanceStorage());
  const factory = new RouletteBetFactory(wheel);
  const engine = new RouletteEngine(wheel, bankroll, new CryptoRandomGenerator(), factory);
  const historyStorage = new RouletteHistoryStorage(30);
  return { wheel, engine, historyStorage };
}

export function useRouletteGame(): UseRouletteGameResult {
  const bundleRef = useRef<EngineBundle | null>(null);
  if (bundleRef.current === null) {
    bundleRef.current = createEngine();
  }
  const { wheel, engine, historyStorage } = bundleRef.current;

  const [balance, setBalance] = useState(() => engine.balance);
  const [stake, setStake] = useState(0);
  const [bets, setBets] = useState<PlacedBetSnapshot[]>([]);
  const [chipValue, setChipValue] = useState<ChipValue>(5);
  const [history, setHistory] = useState<number[]>(() => historyStorage.load());
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [ball, setBall] = useState<BallState>({
    angleDeg: 0,
    radius: BALL_OUTER_RADIUS,
    visible: false,
  });
  const [lastResult, setLastResult] = useState<SpinOutcome | null>(null);
  const [showResult, setShowResult] = useState(false);

  const rafRef = useRef<number | null>(null);
  const spinTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (spinTimeoutRef.current !== null) window.clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  const syncBets = useCallback(() => {
    setBets(engine.snapshotBets());
    setStake(engine.stake);
    setBalance(engine.balance);
  }, [engine]);

  const betAmountFor = useCallback((key: BetKey) => engine.betAmount(key), [engine]);

  const placeBet = useCallback(
    (key: BetKey) => {
      if (spinning) return;
      if (!engine.placeBet(key, chipValue)) {
        toast.error('Недостаточно фишек');
        return;
      }
      syncBets();
    },
    [chipValue, engine, spinning, syncBets],
  );

  const removeBet = useCallback(
    (key: BetKey) => {
      if (spinning) return;
      if (engine.removeBet(key) > 0) syncBets();
    },
    [engine, spinning, syncBets],
  );

  const clearBets = useCallback(() => {
    if (spinning) return;
    if (engine.clearAllBets() > 0) syncBets();
  }, [engine, spinning, syncBets]);

  const reset = useCallback(() => {
    if (spinning) return;
    engine.resetBalance(STARTING_BALANCE);
    historyStorage.save([]);
    setHistory([]);
    setLastResult(null);
    setShowResult(false);
    setBall((b) => ({ ...b, visible: false }));
    syncBets();
    toast.success('Баланс восстановлен');
  }, [engine, historyStorage, spinning, syncBets]);

  const spin = useCallback(() => {
    if (spinning || engine.activeCount === 0) {
      if (engine.activeCount === 0) toast.error('Сначала сделайте ставку');
      return;
    }

    const outcome = engine.spin();
    setSpinning(true);
    setShowResult(false);
    setLastResult(null);

    const targetPocketIdx = outcome.pocketIndex;
    const targetWheelAngle = wheel.angleForIndex(targetPocketIdx);
    const currentBase = rotation % 360;
    const extraSpins = 6 + Math.floor(Math.random() * 3);
    const finalRotation = rotation - currentBase + extraSpins * 360 - targetWheelAngle;
    setRotation(finalRotation);

    // Slight random offset within the pocket so the ball doesn't always centre.
    const jitter = (Math.random() - 0.5) * wheel.pocketAngle * 0.35;
    const trajectory = new BallTrajectory({
      durationMs: SPIN_DURATION_MS,
      outerRadius: BALL_OUTER_RADIUS,
      innerRadius: BALL_INNER_RADIUS,
      targetAngleDeg: jitter,
      laps: 9,
      dropStartRatio: 0.55,
      settleRatio: 0.92,
      bounceCount: 4,
    });

    setBall({ angleDeg: 0, radius: BALL_OUTER_RADIUS, visible: true });

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const sample = trajectory.sample(elapsed);
      setBall({ angleDeg: sample.angleDeg, radius: sample.radius, visible: true });
      if (elapsed < SPIN_DURATION_MS) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    spinTimeoutRef.current = window.setTimeout(() => {
      spinTimeoutRef.current = null;
      setBalance(engine.balance);
      setStake(0);
      setBets([]);
      setLastResult(outcome);
      setShowResult(true);
      setHistory((prev) => {
        const next = [outcome.winningNumber, ...prev].slice(0, 30);
        historyStorage.save(next);
        return next;
      });
      setSpinning(false);
    }, SPIN_DURATION_MS);
  }, [engine, historyStorage, rotation, spinning, wheel]);

  return useMemo<UseRouletteGameResult>(
    () => ({
      wheel,
      balance,
      stake,
      bets,
      betAmountFor,
      chipValue,
      setChipValue,
      history,
      spinning,
      rotation,
      ball,
      lastResult,
      showResult,
      placeBet,
      removeBet,
      clearBets,
      spin,
      reset,
    }),
    [
      wheel,
      balance,
      stake,
      bets,
      betAmountFor,
      chipValue,
      history,
      spinning,
      rotation,
      ball,
      lastResult,
      showResult,
      placeBet,
      removeBet,
      clearBets,
      spin,
      reset,
    ],
  );
}
