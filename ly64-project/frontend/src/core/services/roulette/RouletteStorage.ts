import type { BankrollPersistence } from '@/core/models/roulette';

const BALANCE_KEY = 'ly64:roulette:balance';
const HISTORY_KEY = 'ly64:roulette:history';

export class RouletteBalanceStorage implements BankrollPersistence {
  load(): number | null {
    try {
      const raw = window.localStorage.getItem(BALANCE_KEY);
      if (raw == null) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }

  save(balance: number): void {
    try {
      window.localStorage.setItem(BALANCE_KEY, String(balance));
    } catch {
      /* storage unavailable — ignore */
    }
  }
}

export class RouletteHistoryStorage {
  constructor(private readonly capacity = 30) {}

  load(): number[] {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw == null) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    } catch {
      return [];
    }
  }

  save(history: readonly number[]): void {
    try {
      const trimmed = history.slice(0, this.capacity);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
      /* ignore */
    }
  }
}
