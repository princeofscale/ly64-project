import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  BetPanel,
  DailyBonusCard,
  FairnessNote,
  GameCanvas,
  HistoryStrip,
  LiveBetsList,
  MyBetsList,
  Nebula,
  PageHeader,
  StatsCard,
  formatRuth,
  RUTH_SYMBOL,
} from '../components/rocket';
import { rocketApi } from '../services/rocketService';
import { useAuthStore } from '../store/authStore';
import {
  connectRocketSocket,
  disconnectRocketSocket,
  useRocketStore,
} from '../store/rocketStore';
import { soundManager } from '../utils/soundManager';

import type {
  RocketBetHistoryItem,
  RocketStats,
} from '@lyceum64/shared';

export default function RocketPage() {
  const { state, multiplier, connected } = useRocketStore();
  const { user, isAuthenticated, setRutheniumBalance } = useAuthStore();
  const balance = user?.rutheniumBalance ?? 0;
  const onlineCount = state?.onlineCount ?? 0;

  const [betAmount, setBetAmount] = useState<string>('1.0');
  const [autoTarget, setAutoTarget] = useState<string>('2.0');
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [cashingOut, setCashingOut] = useState(false);
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [nextBonusAt, setNextBonusAt] = useState<string | null>(null);
  const [myHistory, setMyHistory] = useState<RocketBetHistoryItem[]>([]);
  const [stats, setStats] = useState<RocketStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    connectRocketSocket();
    rocketApi.getState().then(s => useRocketStore.getState().setState(s)).catch(() => {});
    return () => disconnectRocketSocket();
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await rocketApi.getBalance();
      setRutheniumBalance(res.balance);
      setBonusAvailable(res.dailyBonus.canClaim);
      setNextBonusAt(res.dailyBonus.nextAvailableAt);
    } catch {
      // ignore
    }
  }, [isAuthenticated, setRutheniumBalance]);

  const refreshMyHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [h, s] = await Promise.all([rocketApi.getHistory(10), rocketApi.getStats()]);
      setMyHistory(h);
      setStats(s);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshBalance();
    refreshMyHistory();
  }, [refreshBalance, refreshMyHistory]);

  const lastCrashedRoundId = useRef<string | null>(null);
  const lastStatus = useRef<string | null>(null);
  useEffect(() => {
    // Звуки при смене статуса
    if (state?.status !== lastStatus.current) {
      if (state?.status === 'RUNNING') {
        soundManager.play('launch');
      } else if (state?.status === 'CRASHED') {
        soundManager.play('crash');
      }
      lastStatus.current = state?.status ?? null;
    }

    if (
      state?.status === 'CRASHED' &&
      state.roundId &&
      state.roundId !== lastCrashedRoundId.current
    ) {
      lastCrashedRoundId.current = state.roundId;
      refreshMyHistory();
    }
  }, [state?.status, state?.roundId, refreshMyHistory]);

  const [bettingSecondsLeft, setBettingSecondsLeft] = useState(0);
  useEffect(() => {
    if (state?.status !== 'BETTING' || !state.bettingEndsAt) {
      setBettingSecondsLeft(0);
      return;
    }
    const update = () => {
      const left = Math.max(0, (state.bettingEndsAt! - Date.now()) / 1000);
      setBettingSecondsLeft(left);
    };
    update();
    const t = setInterval(update, 100);
    return () => clearInterval(t);
  }, [state?.status, state?.bettingEndsAt]);

  const myBet = useMemo(
    () => state?.bets.find(b => b.userId === user?.id),
    [state?.bets, user?.id]
  );

  const handlePlaceBet = async () => {
    const amount = parseFloat(betAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Введите корректную сумму');
      return;
    }
    setPlacing(true);
    try {
      const res = await rocketApi.placeBet(amount);
      if (res.success) {
        toast.success(`Ставка ${formatRuth(amount)} ${RUTH_SYMBOL} принята`);
        if (typeof res.balance === 'number') setRutheniumBalance(res.balance);
      } else {
        toast.error(res.message || 'Не удалось поставить');
      }
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Ошибка при ставке');
    } finally {
      setPlacing(false);
    }
  };

  const handleCashOut = useCallback(async () => {
    setCashingOut(true);
    try {
      const res = await rocketApi.cashOut();
      if (res.success && res.multiplier && res.winAmount) {
        soundManager.play('cashout');
        toast.success(`Выведено ${formatRuth(res.winAmount)} ${RUTH_SYMBOL} @ ${res.multiplier.toFixed(2)}x`);
        if (typeof res.balance === 'number') setRutheniumBalance(res.balance);
        refreshMyHistory();
      } else {
        toast.error(res.message || 'Не удалось вывести');
      }
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Ошибка при выводе');
    } finally {
      setCashingOut(false);
    }
  }, [refreshMyHistory, setRutheniumBalance]);

  // Автовывод: при достижении целевого множителя один раз дёргает cashOut.
  // Сбрасываем "выстреляно" на старт нового раунда.
  const autoFiredFor = useRef<string | null>(null);
  useEffect(() => {
    if (state?.status !== 'RUNNING') return;
    if (!autoEnabled) return;
    if (!canCashOut) return;
    if (cashingOut) return;
    if (state.roundId && autoFiredFor.current === state.roundId) return;
    const target = parseFloat(autoTarget);
    if (!Number.isFinite(target) || target < 1.01) return;
    if (multiplier >= target) {
      autoFiredFor.current = state.roundId ?? null;
      handleCashOut();
    }
  }, [
    autoEnabled,
    autoTarget,
    canCashOut,
    cashingOut,
    handleCashOut,
    multiplier,
    state?.roundId,
    state?.status,
  ]);

  const handleClaimBonus = async () => {
    try {
      const res = await rocketApi.claimDailyBonus();
      if (res.success && res.bonus) {
        toast.success(`+${formatRuth(res.bonus)} ${RUTH_SYMBOL}`);
        if (typeof res.balance === 'number') setRutheniumBalance(res.balance);
        setBonusAvailable(false);
        if (res.nextAvailableAt) setNextBonusAt(res.nextAvailableAt);
      } else if (res.nextAvailableAt) {
        setBonusAvailable(false);
        setNextBonusAt(res.nextAvailableAt);
        toast(res.message || 'Бонус будет доступен позже');
      }
    } catch {
      toast.error('Не удалось получить бонус');
    }
  };

  const canBet = state?.status === 'BETTING' && !myBet && isAuthenticated;
  const canCashOut =
    state?.status === 'RUNNING' && myBet?.status === 'ACTIVE' && isAuthenticated;

  const potentialWin = useMemo(() => {
    if (!myBet || !canCashOut) return 0;
    return myBet.amount * multiplier;
  }, [myBet, multiplier, canCashOut]);

  return (
    <div className="min-h-screen bg-[#050816] text-white relative overflow-hidden">
      <Nebula />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10">
        <PageHeader balance={balance} connected={connected} onlineCount={onlineCount} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-6">
          <div className="space-y-6">
            <GameCanvas
              status={state?.status ?? 'BETTING'}
              multiplier={multiplier}
              crashMultiplier={state?.crashMultiplier}
              bettingSecondsLeft={bettingSecondsLeft}
            />

            <HistoryStrip history={state?.history ?? []} />

            <LiveBetsList bets={state?.bets ?? []} currentUserId={user?.id} />
          </div>

          <div className="space-y-4">
            <BetPanel
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              autoTarget={autoTarget}
              setAutoTarget={setAutoTarget}
              autoEnabled={autoEnabled}
              setAutoEnabled={setAutoEnabled}
              canBet={canBet}
              canCashOut={canCashOut}
              placing={placing}
              cashingOut={cashingOut}
              myBet={myBet}
              potentialWin={potentialWin}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              balance={balance}
              status={state?.status ?? 'BETTING'}
              bettingSecondsLeft={bettingSecondsLeft}
            />

            <DailyBonusCard
              available={bonusAvailable}
              nextAvailableAt={nextBonusAt}
              onClaim={handleClaimBonus}
            />

            <StatsCard
              stats={stats}
              expanded={showStats}
              onToggle={() => setShowStats(v => !v)}
            />

            <MyBetsList items={myHistory} />
          </div>
        </div>

        <FairnessNote clientSeedHash={state?.clientSeedHash ?? ''} />
      </div>
    </div>
  );
}
