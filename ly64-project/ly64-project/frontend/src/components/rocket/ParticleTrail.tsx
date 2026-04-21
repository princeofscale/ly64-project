import { memo } from 'react';

interface ParticleTrailProps {
  pos: { x: number; y: number };
}

const PARTICLES = [0, 1, 2, 3] as const;

export const ParticleTrail = memo(function ParticleTrail({ pos }: ParticleTrailProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {PARTICLES.map(i => (
        <span
          key={i}
          className="trail-particle absolute w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 shadow-[0_0_10px_rgba(251,113,133,0.8)]"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y + 2}%`,
            animationDelay: `${i * 0.22}s`,
          }}
        />
      ))}
    </div>
  );
});
