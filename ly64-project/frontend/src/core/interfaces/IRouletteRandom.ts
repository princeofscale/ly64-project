export interface IRouletteRandom {
  /** Uniform float in [0, 1). */
  nextFloat(): number;
  /** Uniform integer in [min, max] inclusive. */
  nextInt(min: number, max: number): number;
}
