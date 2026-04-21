import { memo, useMemo } from 'react';

import { Wheel } from '@/core/models/roulette';
import type { PocketColor } from '@/core/types/roulette';

import { SPIN_DURATION_MS } from './constants';

interface RouletteWheelProps {
  wheel: Wheel;
  /** Current rotation of the wheel, degrees (clockwise positive). */
  rotation: number;
  /** Whether the CSS transition should be active. */
  spinning: boolean;
  /** Ball world-space angle, degrees (top=0, clockwise positive). */
  ballAngleDeg: number;
  ballRadius: number;
  ballVisible: boolean;
  lastResult: number | null;
  lastResultColor: PocketColor | null;
}

interface PocketGeometry {
  value: number;
  path: string;
  textX: number;
  textY: number;
  textAngle: number;
  separatorX: number;
  separatorY: number;
  color: PocketColor;
}

function buildPocketGeometry(wheel: Wheel): PocketGeometry[] {
  const pa = wheel.pocketAngle;
  const r = 92;
  const labelR = 77;
  const sepR = 86;
  return wheel.order.map((value, idx) => {
    const startAngle = idx * pa - 90 - pa / 2;
    const endAngle = startAngle + pa;
    const sRad = (startAngle * Math.PI) / 180;
    const eRad = (endAngle * Math.PI) / 180;
    const x1 = r * Math.cos(sRad);
    const y1 = r * Math.sin(sRad);
    const x2 = r * Math.cos(eRad);
    const y2 = r * Math.sin(eRad);
    const midAngle = startAngle + pa / 2;
    const tRad = (midAngle * Math.PI) / 180;
    return {
      value,
      path: `M 0 0 L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`,
      textX: labelR * Math.cos(tRad),
      textY: labelR * Math.sin(tRad),
      textAngle: midAngle + 90,
      separatorX: sepR * Math.cos(sRad),
      separatorY: sepR * Math.sin(sRad),
      color: wheel.getColor(value),
    };
  });
}

function pocketFill(color: PocketColor): string {
  return color === 'red' ? 'url(#redPocket)' : color === 'green' ? 'url(#greenPocket)' : 'url(#blackPocket)';
}

export const RouletteWheel = memo(function RouletteWheel({
  wheel,
  rotation,
  spinning,
  ballAngleDeg,
  ballRadius,
  ballVisible,
  lastResult,
  lastResultColor,
}: RouletteWheelProps) {
  const geometry = useMemo(() => buildPocketGeometry(wheel), [wheel]);

  const ballRad = ((ballAngleDeg - 90) * Math.PI) / 180;
  const bx = ballRadius * Math.cos(ballRad);
  const by = ballRadius * Math.sin(ballRad);

  return (
    <div className="relative aspect-square max-w-[380px] mx-auto" style={{ perspective: '600px' }}>
      <div
        className="absolute inset-0"
        style={{ transform: 'rotateX(18deg)', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-700 shadow-[0_0_60px_rgba(251,191,36,0.35),inset_0_0_20px_rgba(0,0,0,0.4)]" />
        <div className="absolute inset-[3%] rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]" />
        <div className="absolute inset-[6%] rounded-full bg-gradient-to-br from-amber-900 via-amber-950 to-black shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />

        <div className="absolute top-[1%] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '16px solid #fef3c7',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
            }}
          />
        </div>

        <div
          className="absolute inset-[8%] rounded-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_DURATION_MS / 1000}s cubic-bezier(0.18, 0.55, 0.29, 1)` : 'none',
            willChange: spinning ? 'transform' : 'auto',
          }}
        >
          <svg viewBox="-100 -100 200 200" className="w-full h-full">
            <defs>
              <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="80%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
              <radialGradient id="redPocket" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </radialGradient>
              <radialGradient id="blackPocket" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <radialGradient id="greenPocket" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#064e3b" />
              </radialGradient>
            </defs>

            {geometry.map((g) => (
              <g key={g.value}>
                <path d={g.path} fill={pocketFill(g.color)} stroke="#fbbf24" strokeWidth="0.3" />
                <circle cx={g.separatorX} cy={g.separatorY} r="1.6" fill="#fbbf24" opacity="0.7" />
                <text
                  x={g.textX}
                  y={g.textY}
                  fill={g.color === 'green' ? '#d1fae5' : '#fff'}
                  fontSize="6.5"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${g.textAngle}, ${g.textX}, ${g.textY})`}
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {g.value}
                </text>
              </g>
            ))}

            <circle r="25" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.6" />
            <circle r="23" fill="url(#hubGrad)" stroke="#fbbf24" strokeWidth="1.2" />
            <circle r="12" fill="#3b1a08" stroke="#fbbf24" strokeWidth="0.5" />
            <circle r="5" fill="#fbbf24" />
            <circle r="2.5" fill="#78350f" />

            {[0, 60, 120, 180, 240, 300].map((a) => {
              const rad = (a * Math.PI) / 180;
              return (
                <line
                  key={a}
                  x1={5 * Math.cos(rad)}
                  y1={5 * Math.sin(rad)}
                  x2={11 * Math.cos(rad)}
                  y2={11 * Math.sin(rad)}
                  stroke="#fbbf24"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
              );
            })}
          </svg>
        </div>

        <div className="absolute inset-[8%] rounded-full pointer-events-none" style={{ zIndex: 20 }}>
          <svg viewBox="-100 -100 200 200" className="w-full h-full">
            {ballVisible && (
              <g>
                <circle cx={bx + 1} cy={by + 1} r="4.5" fill="rgba(0,0,0,0.45)" />
                <circle
                  cx={bx}
                  cy={by}
                  r="4.5"
                  fill="white"
                  style={{
                    filter:
                      'drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 12px rgba(255,255,255,0.5))',
                  }}
                />
                <circle cx={bx - 1.2} cy={by - 1.5} r="1.5" fill="rgba(255,255,255,0.85)" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {lastResult !== null && lastResultColor !== null && !spinning && (
        <div
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base shadow-xl z-30 ring-2 ring-amber-400/60 ${
            lastResultColor === 'red'
              ? 'bg-gradient-to-br from-red-500 to-red-700'
              : lastResultColor === 'black'
                ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
          }`}
        >
          {lastResult}
        </div>
      )}
    </div>
  );
});
