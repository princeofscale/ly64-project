import { motion } from 'framer-motion';
import { memo } from 'react';

interface RocketSvgProps {
  running: boolean;
  crashed: boolean;
}

export const RocketSvg = memo(function RocketSvg({ running, crashed }: RocketSvgProps) {
  return (
    <svg
      width="68"
      height="84"
      viewBox="0 0 68 84"
      fill="none"
      style={{ filter: running ? 'drop-shadow(0 0 10px rgba(168,85,247,0.6))' : undefined }}
    >
      <defs>
        <linearGradient id="rbody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="rwindow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="rflame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="rfin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      {/* nose cone */}
      <path
        d="M34 4 C46 18 50 36 50 54 L18 54 C18 36 22 18 34 4 Z"
        fill="url(#rbody)"
        stroke="#94a3b8"
        strokeWidth="0.8"
      />
      <path d="M34 4 C40 14 42 28 42 40 L34 40 Z" fill="rgba(255,255,255,0.2)" />

      {/* window */}
      <circle cx="34" cy="28" r="7" fill="url(#rwindow)" stroke="#0c4a6e" strokeWidth="1.5" />
      <circle cx="31" cy="25" r="2" fill="rgba(255,255,255,0.6)" />

      {/* fins */}
      <path d="M18 46 L6 64 L20 58 Z" fill="url(#rfin)" />
      <path d="M50 46 L62 64 L48 58 Z" fill="url(#rfin)" />
      <path d="M30 52 L34 64 L38 52 Z" fill="#4f46e5" />

      {/* thrusters */}
      <rect x="24" y="54" width="20" height="4" rx="1" fill="#1e293b" />

      {/* flame */}
      {running && !crashed && (
        <>
          <motion.path
            d="M26 58 L34 80 L42 58 Z"
            fill="url(#rflame)"
            animate={{ scaleY: [0.9, 1.25, 1.0, 1.3, 0.95] }}
            transition={{ repeat: Infinity, duration: 0.35 }}
            style={{ transformOrigin: '34px 58px' }}
          />
          <motion.path
            d="M28.5 58 L34 72 L39.5 58 Z"
            fill="#fef9c3"
            animate={{ scaleY: [0.8, 1.15, 0.9, 1.2] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
            style={{ transformOrigin: '34px 58px' }}
          />
          <motion.circle
            cx="34"
            cy="70"
            r="3.5"
            fill="#fefce8"
            animate={{ opacity: [0.5, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 0.25 }}
          />
        </>
      )}

      {/* crash smoke */}
      {crashed && (
        <g opacity="0.6">
          <circle cx="30" cy="56" r="5" fill="#475569" />
          <circle cx="38" cy="54" r="4" fill="#334155" />
          <circle cx="34" cy="60" r="3" fill="#1e293b" />
        </g>
      )}
    </svg>
  );
});
