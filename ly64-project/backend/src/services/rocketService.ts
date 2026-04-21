import crypto from 'crypto';

import prisma from '../config/database';
import { logger } from '../utils/logger';

import { wsService } from './websocketService';

type RoundStatus = 'BETTING' | 'RUNNING' | 'CRASHED';

interface ActiveBet {
  userId: string;
  username: string;
  name: string;
  amount: number;
  cashOutMultiplier?: number;
  winAmount?: number;
  status: 'ACTIVE' | 'CASHED_OUT' | 'LOST';
}

interface PublicRoundState {
  roundId: string;
  status: RoundStatus;
  multiplier: number;
  bettingEndsAt?: number;
  startedAt?: number;
  crashedAt?: number;
  crashMultiplier?: number;
  clientSeedHash: string;
  bets: Array<{
    userId: string;
    username: string;
    name: string;
    amount: number;
    cashOutMultiplier?: number;
    winAmount?: number;
    status: ActiveBet['status'];
  }>;
  history: Array<{ id: string; crashMultiplier: number; endedAt: string }>;
  onlineCount: number;
}

const BETTING_WINDOW_MS = 10000;
const CRASH_INTERVAL_MS = 4500;
const TICK_MS = 100;
const GROWTH_PER_SEC = 0.12;
const MIN_BET = 0.1;
const HOUSE_EDGE = 0.02;
const MAX_BETS_PER_DAY = 20;
const HISTORY_LIMIT = 10;

const round2 = (n: number): number => Math.round(n * 100) / 100;

class RocketService {
  private static instance: RocketService;
  private roundId: string = '';
  private serverSeed: string = '';
  private clientSeedHash: string = '';
  private crashMultiplier: number = 1;
  private status: RoundStatus = 'BETTING';
  private startedAt: number = 0;
  private bettingEndsAt: number = 0;
  private crashedAt: number = 0;
  private bets: Map<string, ActiveBet> = new Map();
  private history: Array<{ id: string; crashMultiplier: number; endedAt: string }> = [];
  private tickTimer: NodeJS.Timeout | null = null;
  private phaseTimer: NodeJS.Timeout | null = null;
  private started: boolean = false;

  public static getInstance(): RocketService {
    if (!RocketService.instance) {
      RocketService.instance = new RocketService();
    }
    return RocketService.instance;
  }

  public async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    await this.loadHistory();
    void this.startBettingPhase();
    logger.info('[Rocket] Engine started');
  }

  public shutdown(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    this.started = false;
  }

  private async loadHistory(): Promise<void> {
    const rounds = await prisma.rocketRound.findMany({
      where: { status: 'CRASHED', endedAt: { not: null } },
      orderBy: { endedAt: 'desc' },
      take: HISTORY_LIMIT,
      select: { id: true, crashMultiplier: true, endedAt: true },
    });
    this.history = rounds.map(r => ({
      id: r.id,
      crashMultiplier: round2(r.crashMultiplier),
      endedAt: r.endedAt!.toISOString(),
    }));
  }

  private generateCrashPoint(serverSeed: string, clientSeedHash: string): number {
    const hash = crypto
      .createHash('sha256')
      .update(`${serverSeed}:${clientSeedHash}`)
      .digest('hex');
    const slice = hash.slice(0, 13);
    const intVal = parseInt(slice, 16);
    const max = Math.pow(16, 13);

    if (Math.floor(intVal / (max / 33)) === 0) return 1.0;

    const r = intVal / max;
    const crash = (1 - HOUSE_EDGE) / (1 - r);
    return Math.max(1.0, Math.min(crash, 1000));
  }

  private async startBettingPhase(): Promise<void> {
    this.serverSeed = crypto.randomBytes(32).toString('hex');
    const clientSeed = crypto.randomBytes(16).toString('hex');
    this.clientSeedHash = crypto.createHash('sha256').update(clientSeed).digest('hex');
    this.crashMultiplier = this.generateCrashPoint(this.serverSeed, this.clientSeedHash);
    this.status = 'BETTING';
    this.bets.clear();
    this.bettingEndsAt = Date.now() + BETTING_WINDOW_MS;

    const round = await prisma.rocketRound.create({
      data: {
        crashMultiplier: this.crashMultiplier,
        serverSeed: this.serverSeed,
        clientSeedHash: this.clientSeedHash,
        status: 'BETTING',
      },
    });
    this.roundId = round.id;

    this.broadcastState();
    this.phaseTimer = setTimeout(() => void this.startRunningPhase(), BETTING_WINDOW_MS);
  }

  private async startRunningPhase(): Promise<void> {
    this.status = 'RUNNING';
    this.startedAt = Date.now();

    await prisma.rocketRound.update({
      where: { id: this.roundId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    this.broadcastState();

    this.tickTimer = setInterval(() => {
      const elapsed = (Date.now() - this.startedAt) / 1000;
      const currentMultiplier = Math.pow(Math.E, GROWTH_PER_SEC * elapsed);

      if (currentMultiplier >= this.crashMultiplier) {
        void this.crash();
        return;
      }
      this.broadcastTick(currentMultiplier);
    }, TICK_MS);
  }

  private async crash(): Promise<void> {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.status = 'CRASHED';
    this.crashedAt = Date.now();

    const betsToUpdate: Array<{ id: string; userId: string; amount: number }> = [];
    for (const [userId, bet] of this.bets.entries()) {
      if (bet.status === 'ACTIVE') {
        bet.status = 'LOST';
        const dbBet = await prisma.rocketBet.findUnique({
          where: { userId_roundId: { userId, roundId: this.roundId } },
          select: { id: true, amount: true, userId: true },
        });
        if (dbBet) betsToUpdate.push(dbBet);
      }
    }

    if (betsToUpdate.length > 0) {
      await prisma.rocketBet.updateMany({
        where: { id: { in: betsToUpdate.map(b => b.id) } },
        data: { status: 'LOST', winAmount: 0 },
      });
    }

    await prisma.rocketRound.update({
      where: { id: this.roundId },
      data: { status: 'CRASHED', endedAt: new Date() },
    });

    this.history.unshift({
      id: this.roundId,
      crashMultiplier: round2(this.crashMultiplier),
      endedAt: new Date().toISOString(),
    });
    if (this.history.length > HISTORY_LIMIT) this.history.pop();

    this.broadcastState();

    this.phaseTimer = setTimeout(() => void this.startBettingPhase(), CRASH_INTERVAL_MS);
  }

  public getCurrentMultiplier(): number {
    if (this.status !== 'RUNNING') return 1.0;
    const elapsed = (Date.now() - this.startedAt) / 1000;
    return Math.pow(Math.E, GROWTH_PER_SEC * elapsed);
  }

  public async placeBet(
    userId: string,
    amount: number
  ): Promise<{ success: boolean; message?: string; balance?: number }> {
    if (this.status !== 'BETTING') {
      return { success: false, message: 'Ставки закрыты, дождитесь нового раунда' };
    }
    if (amount < MIN_BET) {
      return { success: false, message: `Минимальная ставка ${MIN_BET} рутения` };
    }
    if (this.bets.has(userId)) {
      return { success: false, message: 'Вы уже сделали ставку в этом раунде' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, rutheniumBalance: true },
    });
    if (!user) return { success: false, message: 'Пользователь не найден' };
    if (user.rutheniumBalance < amount) {
      return { success: false, message: 'Недостаточно рутениев' };
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayCount = await prisma.rocketBet.count({
      where: { userId, createdAt: { gte: since } },
    });
    if (todayCount >= MAX_BETS_PER_DAY) {
      return { success: false, message: 'Лимит 20 ставок в сутки достигнут. Отдохни!' };
    }

    const roundedAmount = round2(amount);

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { rutheniumBalance: { decrement: roundedAmount } },
        select: { rutheniumBalance: true },
      }),
      prisma.rocketBet.create({
        data: {
          userId,
          roundId: this.roundId,
          amount: roundedAmount,
          status: 'ACTIVE',
        },
      }),
    ]);

    this.bets.set(userId, {
      userId,
      username: user.username,
      name: user.name,
      amount: roundedAmount,
      status: 'ACTIVE',
    });

    this.broadcastState();
    wsService.sendToUser(userId, 'rocket_balance', {
      balance: round2(updated.rutheniumBalance),
    });

    return { success: true, balance: round2(updated.rutheniumBalance) };
  }

  public async cashOut(
    userId: string
  ): Promise<{
    success: boolean;
    message?: string;
    multiplier?: number;
    winAmount?: number;
    balance?: number;
  }> {
    if (this.status !== 'RUNNING') {
      return { success: false, message: 'Раунд не запущен' };
    }
    const bet = this.bets.get(userId);
    if (!bet || bet.status !== 'ACTIVE') {
      return { success: false, message: 'У вас нет активной ставки' };
    }

    const multiplier = this.getCurrentMultiplier();
    if (multiplier >= this.crashMultiplier) {
      return { success: false, message: 'Слишком поздно — ракета уже упала' };
    }

    const cashOutMultiplier = round2(multiplier);
    const winAmount = round2(bet.amount * cashOutMultiplier);

    bet.cashOutMultiplier = cashOutMultiplier;
    bet.winAmount = winAmount;
    bet.status = 'CASHED_OUT';

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { rutheniumBalance: { increment: winAmount } },
        select: { rutheniumBalance: true },
      }),
      prisma.rocketBet.update({
        where: { userId_roundId: { userId, roundId: this.roundId } },
        data: { cashOutMultiplier, winAmount, status: 'CASHED_OUT' },
      }),
    ]);

    this.broadcastState();
    wsService.sendToUser(userId, 'rocket_balance', {
      balance: round2(updated.rutheniumBalance),
    });

    return {
      success: true,
      multiplier: cashOutMultiplier,
      winAmount,
      balance: round2(updated.rutheniumBalance),
    };
  }

  public getPublicState(): PublicRoundState {
    return {
      roundId: this.roundId,
      status: this.status,
      multiplier: round2(this.getCurrentMultiplier()),
      bettingEndsAt: this.status === 'BETTING' ? this.bettingEndsAt : undefined,
      startedAt: this.startedAt || undefined,
      crashedAt: this.status === 'CRASHED' ? this.crashedAt : undefined,
      crashMultiplier:
        this.status === 'CRASHED' ? round2(this.crashMultiplier) : undefined,
      clientSeedHash: this.clientSeedHash,
      bets: Array.from(this.bets.values()).map(b => ({
        userId: b.userId,
        username: b.username,
        name: b.name,
        amount: b.amount,
        cashOutMultiplier: b.cashOutMultiplier,
        winAmount: b.winAmount,
        status: b.status,
      })),
      history: this.history,
      onlineCount: wsService.getChannelSize('rocket'),
    };
  }

  private broadcastState(): void {
    wsService.broadcast('rocket', {
      type: 'state',
      state: this.getPublicState(),
    });
  }

  private broadcastTick(multiplier: number): void {
    wsService.broadcast('rocket', {
      type: 'tick',
      multiplier: round2(multiplier),
      roundId: this.roundId,
    });
  }
}

export const rocketService = RocketService.getInstance();
export default rocketService;
