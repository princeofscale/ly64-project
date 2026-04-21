import type { IRouletteRandom } from '@/core/interfaces/IRouletteRandom';

const CRYPTO: Crypto | undefined =
  typeof globalThis !== 'undefined' && 'crypto' in globalThis
    ? (globalThis as typeof globalThis & { crypto?: Crypto }).crypto
    : undefined;

/**
 * Random generator backed by `window.crypto.getRandomValues` when available.
 * Falls back to `Math.random` on legacy environments.
 */
export class CryptoRandomGenerator implements IRouletteRandom {
  nextFloat(): number {
    if (CRYPTO?.getRandomValues) {
      const buf = new Uint32Array(1);
      CRYPTO.getRandomValues(buf);
      const v = buf[0] ?? 0;
      return v / 0x1_0000_0000;
    }
    return Math.random();
  }

  nextInt(min: number, max: number): number {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
      throw new Error(`Invalid range [${min}, ${max}]`);
    }
    const range = max - min + 1;
    return Math.floor(this.nextFloat() * range) + min;
  }
}
