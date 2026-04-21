export type PocketColor = 'red' | 'black' | 'green';

export type BetKind =
  | 'straight'
  | 'red'
  | 'black'
  | 'even'
  | 'odd'
  | 'low'
  | 'high'
  | 'dozen1'
  | 'dozen2'
  | 'dozen3';

export type BetKey = `straight:${number}` | Exclude<BetKind, 'straight'>;

export interface PlacedBetSnapshot {
  readonly key: BetKey;
  readonly kind: BetKind;
  readonly label: string;
  readonly amount: number;
  readonly payout: number;
}

export interface SpinOutcome {
  readonly winningNumber: number;
  readonly pocketIndex: number;
  readonly color: PocketColor;
  readonly totalStake: number;
  readonly grossReturn: number;
  readonly netProfit: number;
  readonly winners: readonly PlacedBetSnapshot[];
  readonly losers: readonly PlacedBetSnapshot[];
}
