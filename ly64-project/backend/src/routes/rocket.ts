import { Router } from 'express';

import prisma from '../config/database';
import { authenticateToken } from '../middlewares/auth';
import { rocketService } from '../services/rocketService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

const round2 = (n: number): number => Math.round(n * 100) / 100;

const DAILY_BONUS_MIN = 1;
const DAILY_BONUS_MAX = 2;
const DAILY_BONUS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

router.get('/state', async (_req, res: Response) => {
  try {
    res.json({ success: true, data: rocketService.getPublicState() });
  } catch (error) {
    logger.error('[Rocket] Error getting state', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения состояния' });
  }
});

router.get('/balance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rutheniumBalance: true, lastDailyBonusAt: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const nextBonusAt = user.lastDailyBonusAt
      ? new Date(user.lastDailyBonusAt.getTime() + DAILY_BONUS_COOLDOWN_MS)
      : null;
    const canClaim = !nextBonusAt || nextBonusAt.getTime() <= Date.now();

    res.json({
      success: true,
      data: {
        balance: round2(user.rutheniumBalance),
        dailyBonus: {
          canClaim,
          nextAvailableAt: nextBonusAt?.toISOString() ?? null,
        },
      },
    });
  } catch (error) {
    logger.error('[Rocket] Error getting balance', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения баланса' });
  }
});

router.post('/bet', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    const betAmount = Number(amount);
    if (!Number.isFinite(betAmount) || betAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Неверная сумма ставки' });
    }

    const result = await rocketService.placeBet(userId, betAmount);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    logger.error('[Rocket] Error placing bet', { error });
    res.status(500).json({ success: false, message: 'Ошибка размещения ставки' });
  }
});

router.post('/cashout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await rocketService.cashOut(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    logger.error('[Rocket] Error cashing out', { error });
    res.status(500).json({ success: false, message: 'Ошибка вывода' });
  }
});

router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const bets = await prisma.rocketBet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        round: {
          select: { crashMultiplier: true, status: true, endedAt: true },
        },
      },
    });

    res.json({
      success: true,
      data: bets.map(b => ({
        id: b.id,
        roundId: b.roundId,
        amount: round2(b.amount),
        cashOutMultiplier: b.cashOutMultiplier ? round2(b.cashOutMultiplier) : null,
        winAmount: b.winAmount ? round2(b.winAmount) : 0,
        status: b.status,
        crashMultiplier: round2(b.round.crashMultiplier),
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error('[Rocket] Error getting history', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения истории' });
  }
});

router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [totalBets, aggregated, biggestWin] = await Promise.all([
      prisma.rocketBet.count({ where: { userId } }),
      prisma.rocketBet.aggregate({
        where: { userId },
        _sum: { amount: true, winAmount: true },
      }),
      prisma.rocketBet.findFirst({
        where: { userId, status: 'CASHED_OUT' },
        orderBy: { winAmount: 'desc' },
        select: { winAmount: true, cashOutMultiplier: true },
      }),
    ]);

    const wagered = aggregated._sum.amount ?? 0;
    const won = aggregated._sum.winAmount ?? 0;

    res.json({
      success: true,
      data: {
        totalBets,
        totalWagered: round2(wagered),
        totalWon: round2(won),
        netProfit: round2(won - wagered),
        biggestWin: biggestWin?.winAmount ? round2(biggestWin.winAmount) : 0,
        biggestMultiplier: biggestWin?.cashOutMultiplier
          ? round2(biggestWin.cashOutMultiplier)
          : 0,
      },
    });
  } catch (error) {
    logger.error('[Rocket] Error getting stats', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

router.get('/leaderboard', async (req, res: Response) => {
  try {
    const period = (req.query.period as string) || 'all';
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const where: { status: 'CASHED_OUT'; createdAt?: { gte: Date } } = {
      status: 'CASHED_OUT',
    };
    if (period === 'week') {
      where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'day') {
      where.createdAt = { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    }

    const grouped = await prisma.rocketBet.groupBy({
      by: ['userId'],
      where,
      _sum: { winAmount: true, amount: true },
      _count: { id: true },
      orderBy: { _sum: { winAmount: 'desc' } },
      take: limit,
    });

    const userIds = grouped.map(g => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, name: true, avatar: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const leaderboard = grouped.map((g, i) => {
      const u = userMap.get(g.userId);
      const totalWon = g._sum.winAmount ?? 0;
      const totalWagered = g._sum.amount ?? 0;
      return {
        rank: i + 1,
        userId: g.userId,
        username: u?.username ?? 'unknown',
        name: u?.name ?? 'Игрок',
        avatar: u?.avatar ?? null,
        totalWon: round2(totalWon),
        totalWagered: round2(totalWagered),
        netProfit: round2(totalWon - totalWagered),
        bets: g._count.id,
      };
    });

    res.json({ success: true, data: leaderboard, period });
  } catch (error) {
    logger.error('[Rocket] Error getting leaderboard', { error });
    res.status(500).json({ success: false, message: 'Ошибка лидерборда' });
  }
});

router.post('/daily-bonus', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastDailyBonusAt: true, rutheniumBalance: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    if (
      user.lastDailyBonusAt &&
      Date.now() - user.lastDailyBonusAt.getTime() < DAILY_BONUS_COOLDOWN_MS
    ) {
      const nextAt = new Date(user.lastDailyBonusAt.getTime() + DAILY_BONUS_COOLDOWN_MS);
      return res.status(429).json({
        success: false,
        message: 'Бонус уже получен',
        nextAvailableAt: nextAt.toISOString(),
      });
    }

    const bonus =
      round2(DAILY_BONUS_MIN + Math.random() * (DAILY_BONUS_MAX - DAILY_BONUS_MIN));

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        rutheniumBalance: { increment: bonus },
        lastDailyBonusAt: new Date(),
      },
      select: { rutheniumBalance: true },
    });

    res.json({
      success: true,
      data: {
        bonus,
        balance: round2(updated.rutheniumBalance),
      },
    });
  } catch (error) {
    logger.error('[Rocket] Error claiming daily bonus', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения бонуса' });
  }
});

export default router;
