import {
  BlackBet,
  EvenBet,
  FirstDozenBet,
  HighBet,
  LowBet,
  OddBet,
  RedBet,
  SecondDozenBet,
  StraightBet,
  ThirdDozenBet,
  Wheel,
} from '@/core/models/roulette';
import type { Bet } from '@/core/models/roulette';
import type { BetKey } from '@/core/types/roulette';

export class RouletteBetFactory {
  constructor(private readonly wheel: Wheel) {}

  fromKey(key: BetKey): Bet {
    if (key.startsWith('straight:')) {
      const raw = key.slice('straight:'.length);
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 0 || n > this.wheel.pocketCount - 1) {
        throw new Error(`Invalid straight bet number: ${raw}`);
      }
      return new StraightBet(n);
    }
    switch (key as Exclude<BetKey, `straight:${number}`>) {
      case 'red': return new RedBet(this.wheel);
      case 'black': return new BlackBet(this.wheel);
      case 'even': return new EvenBet();
      case 'odd': return new OddBet();
      case 'low': return new LowBet();
      case 'high': return new HighBet();
      case 'dozen1': return new FirstDozenBet();
      case 'dozen2': return new SecondDozenBet();
      case 'dozen3': return new ThirdDozenBet();
      default:
        throw new Error(`Unknown bet key: ${String(key)}`);
    }
  }
}
