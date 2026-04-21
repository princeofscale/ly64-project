export interface BankrollPersistence {
  load(): number | null;
  save(balance: number): void;
}

export class Bankroll {
  private _balance: number;

  constructor(
    initial: number,
    private readonly persistence?: BankrollPersistence,
  ) {
    const loaded = persistence?.load();
    this._balance = loaded != null && Number.isFinite(loaded) && loaded >= 0 ? loaded : initial;
    persistence?.save(this._balance);
  }

  get balance(): number {
    return this._balance;
  }

  canAfford(amount: number): boolean {
    return amount >= 0 && this._balance >= amount;
  }

  debit(amount: number): boolean {
    if (!this.canAfford(amount)) return false;
    this._balance -= amount;
    this.persistence?.save(this._balance);
    return true;
  }

  credit(amount: number): void {
    if (amount <= 0) return;
    this._balance += amount;
    this.persistence?.save(this._balance);
  }

  reset(to: number): void {
    this._balance = Math.max(0, to);
    this.persistence?.save(this._balance);
  }
}
