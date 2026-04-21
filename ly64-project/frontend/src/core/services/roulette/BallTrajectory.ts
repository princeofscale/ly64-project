/**
 * Physics-based ball trajectory for a roulette spin.
 *
 * Models three phases of a real roulette ball:
 *   1. Orbit   — ball circles the outer ball-track, angular velocity decays
 *                with exponential friction.
 *   2. Fall    — centripetal force drops below the critical threshold, ball
 *                spirals inward across the deflectors.
 *   3. Settle  — ball skips across frets (damped radial oscillation) and comes
 *                to rest in the target pocket.
 *
 * The trajectory is fully deterministic given its config, so the engine can
 * decide the winning pocket first and the renderer animates toward it.
 */
export interface BallTrajectoryConfig {
  /** Total spin duration in milliseconds. */
  readonly durationMs: number;
  /** Ball radius on the outer track (SVG units). */
  readonly outerRadius: number;
  /** Ball radius when settled in a pocket (SVG units). */
  readonly innerRadius: number;
  /**
   * Final world-space angle (degrees, top = 0°, clockwise positive). The
   * trajectory lands the ball exactly at this angle at elapsed == duration.
   */
  readonly targetAngleDeg: number;
  /** Full laps the ball completes before settling (counter-wheel direction). */
  readonly laps: number;
  /** When the ball leaves the outer track (0..1 of duration). */
  readonly dropStartRatio: number;
  /** When the ball enters the bouncing-in-pocket phase (0..1 of duration). */
  readonly settleRatio: number;
  /** How many fret bounces occur during the settle phase. */
  readonly bounceCount: number;
}

export interface BallSample {
  /** Angle in world space (degrees, top = 0°, clockwise positive). */
  readonly angleDeg: number;
  /** Distance from wheel center (SVG units). */
  readonly radius: number;
}

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

const easeOutQuart = (t: number): number => 1 - (1 - t) ** 4;
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export class BallTrajectory {
  private readonly totalSweep: number;

  constructor(private readonly config: BallTrajectoryConfig) {
    if (config.durationMs <= 0) throw new Error('durationMs must be > 0');
    if (config.dropStartRatio <= 0 || config.dropStartRatio >= 1) {
      throw new Error('dropStartRatio must be in (0, 1)');
    }
    if (config.settleRatio <= config.dropStartRatio || config.settleRatio >= 1) {
      throw new Error('settleRatio must satisfy dropStart < settle < 1');
    }
    // Ball spins counter to the wheel, so angular displacement is negative.
    this.totalSweep = -config.laps * 360 + config.targetAngleDeg;
  }

  sample(elapsedMs: number): BallSample {
    const t = clamp(elapsedMs / this.config.durationMs, 0, 1);
    return {
      angleDeg: this.computeAngle(t),
      radius: this.computeRadius(t),
    };
  }

  private computeAngle(t: number): number {
    // easeOutQuart gives a fast-start / slow-end curve that reads as angular
    // friction without needing an ODE solver at runtime.
    return this.totalSweep * easeOutQuart(t);
  }

  private computeRadius(t: number): number {
    const { outerRadius, innerRadius, dropStartRatio, settleRatio, bounceCount } =
      this.config;

    if (t < dropStartRatio) {
      // Orbit phase — microscopic wobble so the ball doesn't look glued.
      const wobble = Math.sin(t * 72) * 0.25;
      return outerRadius + wobble;
    }

    if (t < settleRatio) {
      // Fall phase — smooth spiral from outer track to pocket rim.
      const local = (t - dropStartRatio) / (settleRatio - dropStartRatio);
      const k = easeInOutCubic(local);
      return outerRadius - (outerRadius - innerRadius) * k;
    }

    // Settle phase — exponential-damped bounce across pocket frets.
    const local = (t - settleRatio) / (1 - settleRatio);
    const damping = (1 - local) ** 2;
    const amplitude = (outerRadius - innerRadius) * 0.055 * damping;
    const phase = Math.sin(local * Math.PI * bounceCount * 2);
    return innerRadius + amplitude * Math.abs(phase);
  }
}
