import type { RouletteBetFactory } from '@/core/factories/RouletteBetFactory';
import type { IRouletteRandom } from '@/core/interfaces/IRouletteRandom';
import type { Bet, Bankroll, Wheel } from '@/core/models/roulette';
import type { BetKey, PlacedBetSnapshot, SpinOutcome } from '@/core/types/roulette';

interface ActiveBet {
  readonly bet: Bet;
  amount: number;
}

export class RouletteEngine {
  private readonly active = new Map<BetKey, ActiveBet>();

  constructor(
    readonly wheel: Wheel,
    private readonly bankroll: Bankroll,
    private readonly rng: IRouletteRandom,
    private readonly factory: RouletteBetFactory,
  ) {}

  get balance(): number {
    return this.bankroll.balance;
  }

  get stake(): number {
    let total = 0;
    for (const { amount } of this.active.values()) total += amount;
    return total;
  }

  get activeCount(): number {
    return this.active.size;
  }

  snapshotBets(): PlacedBetSnapshot[] {
    const out: PlacedBetSnapshot[] = [];
    for (const { bet, amount } of this.active.values()) {
      out.push(bet.snapshot(amount));
    }
    return out;
  }

  betAmount(key: BetKey): number {
    return this.active.get(key)?.amount ?? 0;
  }

  placeBet(key: BetKey, amount: number): boolean {
    if (amount <= 0 || !Number.isFinite(amount)) return false;
    if (!this.bankroll.debit(amount)) return false;
    const existing = this.active.get(key);
    if (existing) {
      existing.amount += amount;
    } else {
      this.active.set(key, { bet: this.factory.fromKey(key), amount });
    }
    return true;
  }

  removeBet(key: BetKey): number {
    const existing = this.active.get(key);
    if (!existing) return 0;
    this.active.delete(key);
    this.bankroll.credit(existing.amount);
    return existing.amount;
  }

  clearAllBets(): number {
    const refunded = this.stake;
    this.bankroll.credit(refunded);
    this.active.clear();
    return refunded;
  }

  resetBalance(to: number): void {
    this.active.clear();
    this.bankroll.reset(to);
  }

  /** Pick a winning pocket index and resolve every active bet. */
  spin(): SpinOutcome {
    const pocketIndex = this.rng.nextInt(0, this.wheel.pocketCount - 1);
    const winningNumber = this.wheel.pocketAtIndex(pocketIndex);
    const color = this.wheel.getColor(winningNumber);

    const winners: PlacedBetSnapshot[] = [];
    const losers: PlacedBetSnapshot[] = [];
    let grossReturn = 0;
    const totalStake = this.stake;

    for (const { bet, amount } of this.active.values()) {
      const snap = bet.snapshot(amount);
      if (bet.matches(winningNumber)) {
        winners.push(snap);
        grossReturn += amount + amount * bet.payout;
      } else {
        losers.push(snap);
      }
    }

    if (grossReturn > 0) this.bankroll.credit(grossReturn);
    this.active.clear();

    return {
      winningNumber,
      pocketIndex,
      color,
      totalStake,
      grossReturn,
      netProfit: grossReturn - totalStake,
      winners,
      losers,
    };
  }
}
