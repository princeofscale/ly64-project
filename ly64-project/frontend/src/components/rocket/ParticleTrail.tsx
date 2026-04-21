import { memo, useEffect, useRef } from 'react';

interface ParticleTrailProps {
  /**
   * Shared ref from GameCanvas — updated by the store subscribe callback
   * every 100ms (10Hz tick). The RAF loop reads posRef.current directly,
   * so ParticleTrail never re-renders from position updates.
   */
  posRef: React.MutableRefObject<{ x: number; y: number }>;
  /** Current rocket rotation in degrees (CSS clockwise). Exhaust exits at rotation + 180°. */
  rotation: number;
}

interface Particle {
  x: number; // canvas px
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  decay: number; // life lost per normalized frame (at 60fps)
  radius: number;
}

function spawnParticle(
  cx: number,
  cy: number,
  exhaustSin: number,
  exhaustCos: number,
  w: number,
  h: number,
): Particle {
  const speed = (0.25 + Math.random() * 0.35) * Math.min(w, h) * 0.01;
  const spread = (Math.random() - 0.5) * 0.6;
  return {
    x: cx,
    y: cy,
    vx: exhaustSin * speed + spread,
    vy: -exhaustCos * speed + spread,
    life: 1,
    decay: 0.028 + Math.random() * 0.02,
    radius: 1.2 + Math.random() * 2.5,
  };
}

export const ParticleTrail = memo(function ParticleTrail({ posRef, rotation }: ParticleTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep rotation readable in RAF loop without re-running the effect
  const rotationRef = useRef(rotation);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  rotationRef.current = rotation;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    const ctx = canvas.getContext('2d')!;
    resize();

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);

    let lastTime = performance.now();
    let spawnAccum = 0;

    const loop = (now: number) => {
      const rawDt = now - lastTime;
      lastTime = now;
      // Normalize to 60fps frames; clamp to avoid big jumps on tab switch
      const dt = Math.min(rawDt / 16.67, 4);

      // Use CSS dimensions (dpr-independent) for coordinate math
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Read latest rocket position directly from shared ref — zero React re-renders
      const p = posRef.current;
      const exhaustRad = ((rotationRef.current + 180) * Math.PI) / 180;
      const exhaustSin = Math.sin(exhaustRad);
      const exhaustCos = Math.cos(exhaustRad);

      // ~40px from rocket center to engine nozzle (rocket SVG is ~80px tall)
      const nozzleX = (p.x / 100) * w + exhaustSin * 40;
      const nozzleY = (p.y / 100) * h - exhaustCos * 40;

      // ~120 particles/sec regardless of framerate (2 per 60fps frame × dt)
      spawnAccum += dt * 2;
      while (spawnAccum >= 1) {
        particlesRef.current.push(spawnParticle(nozzleX, nozzleY, exhaustSin, exhaustCos, w, h));
        spawnAccum -= 1;
      }

      // Update & draw — filter dead particles in-place to avoid GC pressure
      let writeIdx = 0;
      const arr = particlesRef.current;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i]!;
        p.life -= p.decay * dt;
        if (p.life <= 0) continue;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Color gradient: white-yellow (new) → orange → dark red (dying)
        const t = 1 - p.life;
        const g = Math.round(Math.max(0, 220 - t * 200));
        const b = Math.round(Math.max(0, 180 - t * 250));

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, p.radius * p.life), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${g},${b},${p.life.toFixed(2)})`;
        ctx.fill();

        arr[writeIdx++] = p;
      }
      arr.length = writeIdx;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      particlesRef.current = [];
    };
  }, []); // no deps — posRef and rotationRef are always fresh

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
});
