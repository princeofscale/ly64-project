import api from './api';

import type {
  RocketRoundState,
  RocketBetHistoryItem,
  RocketStats,
  RocketLeaderboardEntry,
} from '@lyceum64/shared';

interface BalanceResponse {
  balance: number;
  dailyBonus: {
    canClaim: boolean;
    nextAvailableAt: string | null;
  };
}

interface PlaceBetResponse {
  success: boolean;
  message?: string;
  balance?: number;
}

interface CashOutResponse {
  success: boolean;
  message?: string;
  multiplier?: number;
  winAmount?: number;
  balance?: number;
}

interface DailyBonusResponse {
  success: boolean;
  message?: string;
  bonus?: number;
  balance?: number;
  nextAvailableAt?: string;
}

export const rocketApi = {
  async getState(): Promise<RocketRoundState> {
    const { data } = await api.get('/rocket/state');
    return data.data;
  },

  async getBalance(): Promise<BalanceResponse> {
    const { data } = await api.get('/rocket/balance');
    return data.data;
  },

  async placeBet(amount: number): Promise<PlaceBetResponse> {
    const { data } = await api.post('/rocket/bet', { amount });
    return data;
  },

  async cashOut(): Promise<CashOutResponse> {
    const { data } = await api.post('/rocket/cashout');
    return data;
  },

  async getHistory(limit = 20): Promise<RocketBetHistoryItem[]> {
    const { data } = await api.get(`/rocket/history?limit=${limit}`);
    return data.data;
  },

  async getStats(): Promise<RocketStats> {
    const { data } = await api.get('/rocket/stats');
    return data.data;
  },

  async getLeaderboard(
    period: 'day' | 'week' | 'all' = 'all',
    limit = 20
  ): Promise<RocketLeaderboardEntry[]> {
    const { data } = await api.get(`/rocket/leaderboard?period=${period}&limit=${limit}`);
    return data.data;
  },

  async claimDailyBonus(): Promise<DailyBonusResponse> {
    try {
      const { data } = await api.post('/rocket/daily-bonus');
      return data;
    } catch (error: unknown) {
      const e = error as { response?: { data?: DailyBonusResponse } };
      if (e.response?.data) return e.response.data;
      throw error;
    }
  },
};
