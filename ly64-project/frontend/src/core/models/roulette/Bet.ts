import type { BetKey, BetKind, PlacedBetSnapshot } from '@/core/types/roulette';

import { Wheel } from './Wheel';

export abstract class Bet {
  abstract readonly key: BetKey;
  abstract readonly kind: BetKind;
  abstract readonly label: string;
  abstract readonly payout: number;

  abstract matches(winningNumber: number): boolean;

  snapshot(amount: number): PlacedBetSnapshot {
    return {
      key: this.key,
      kind: this.kind,
      label: this.label,
      amount,
      payout: this.payout,
    };
  }
}

export class StraightBet extends Bet {
  readonly key: BetKey;
  readonly kind: BetKind = 'straight';
  readonly payout = 35;

  constructor(readonly number: number) {
    super();
    this.key = `straight:${number}`;
  }

  get label(): string {
    return `№${this.number}`;
  }

  matches(winningNumber: number): boolean {
    return winningNumber === this.number;
  }
}

abstract class EvenMoneyBet extends Bet {
  readonly payout = 1;

  matchesNonZero(n: number): boolean {
    return n !== 0 && this._matches(n);
  }

  matches(winningNumber: number): boolean {
    return this.matchesNonZero(winningNumber);
  }

  protected abstract _matches(n: number): boolean;
}

export class RedBet extends EvenMoneyBet {
  readonly key: BetKey = 'red';
  readonly kind: BetKind = 'red';
  readonly label = 'Красное';

  constructor(private readonly wheel: Wheel) {
    super();
  }

  protected _matches(n: number): boolean {
    return this.wheel.isRed(n);
  }
}

export class BlackBet extends EvenMoneyBet {
  readonly key: BetKey = 'black';
  readonly kind: BetKind = 'black';
  readonly label = 'Чёрное';

  constructor(private readonly wheel: Wheel) {
    super();
  }

  protected _matches(n: number): boolean {
    return !this.wheel.isRed(n);
  }
}

export class EvenBet extends EvenMoneyBet {
  readonly key: BetKey = 'even';
  readonly kind: BetKind = 'even';
  readonly label = 'Чётное';

  protected _matches(n: number): boolean {
    return n % 2 === 0;
  }
}

export class OddBet extends EvenMoneyBet {
  readonly key: BetKey = 'odd';
  readonly kind: BetKind = 'odd';
  readonly label = 'Нечётное';

  protected _matches(n: number): boolean {
    return n % 2 === 1;
  }
}

export class LowBet extends EvenMoneyBet {
  readonly key: BetKey = 'low';
  readonly kind: BetKind = 'low';
  readonly label = '1–18';

  protected _matches(n: number): boolean {
    return n >= 1 && n <= 18;
  }
}

export class HighBet extends EvenMoneyBet {
  readonly key: BetKey = 'high';
  readonly kind: BetKind = 'high';
  readonly label = '19–36';

  protected _matches(n: number): boolean {
    return n >= 19 && n <= 36;
  }
}

export abstract class DozenBet extends Bet {
  readonly payout = 2;

  matches(n: number): boolean {
    return n !== 0 && this._matches(n);
  }

  protected abstract _matches(n: number): boolean;
}

export class FirstDozenBet extends DozenBet {
  readonly key: BetKey = 'dozen1';
  readonly kind: BetKind = 'dozen1';
  readonly label = '1-я дюжина';

  protected _matches(n: number): boolean {
    return n >= 1 && n <= 12;
  }
}

export class SecondDozenBet extends DozenBet {
  readonly key: BetKey = 'dozen2';
  readonly kind: BetKind = 'dozen2';
  readonly label = '2-я дюжина';

  protected _matches(n: number): boolean {
    return n >= 13 && n <= 24;
  }
}

export class ThirdDozenBet extends DozenBet {
  readonly key: BetKey = 'dozen3';
  readonly kind: BetKind = 'dozen3';
  readonly label = '3-я дюжина';

  protected _matches(n: number): boolean {
    return n >= 25 && n <= 36;
  }
}
