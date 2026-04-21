import type { PocketColor } from '@/core/types/roulette';

/**
 * European roulette wheel — 37 pockets in the canonical single-zero order.
 *
 * The pocket indexing convention used throughout the engine:
 *   pocket at index `i` occupies world angle `i * pocketAngle` measured from
 *   the "twelve o'clock" reference, clockwise. At zero wheel rotation, pocket 0
 *   sits directly under the pointer.
 */
export class Wheel {
  static readonly EUROPEAN_ORDER: readonly number[] = Object.freeze([
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30,
    8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
    28, 12, 35, 3, 26,
  ]);

  private static readonly RED_SET: ReadonlySet<number> = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  readonly order: readonly number[];
  readonly pocketCount: number;
  readonly pocketAngle: number;

  constructor(order: readonly number[] = Wheel.EUROPEAN_ORDER) {
    if (order.length === 0) {
      throw new Error('Wheel requires at least one pocket');
    }
    this.order = order;
    this.pocketCount = order.length;
    this.pocketAngle = 360 / order.length;
  }

  getColor(pocketValue: number): PocketColor {
    if (pocketValue === 0) return 'green';
    return Wheel.RED_SET.has(pocketValue) ? 'red' : 'black';
  }

  isRed(pocketValue: number): boolean {
    return Wheel.RED_SET.has(pocketValue);
  }

  pocketAtIndex(index: number): number {
    const i = ((index % this.pocketCount) + this.pocketCount) % this.pocketCount;
    return this.order[i] ?? 0;
  }

  indexOfPocket(value: number): number {
    const idx = this.order.indexOf(value);
    if (idx < 0) throw new Error(`Pocket value ${value} not found on wheel`);
    return idx;
  }

  /** Returns the angle (degrees) at which the given pocket index sits at rest. */
  angleForIndex(index: number): number {
    return index * this.pocketAngle;
  }
}
