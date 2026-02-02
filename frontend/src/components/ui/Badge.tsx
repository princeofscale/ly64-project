/**
 * Badge Component - For tags, status, achievements
 * Modern glassmorphic design
 */

import { motion } from 'framer-motion';
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  glow?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  glow = false,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all';

  const variantClasses = {
    primary:
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    secondary:
      'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    success:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    error:
      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded-lg';
  const glowClass = glow ? 'shadow-lg' : '';

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClass} ${glowClass} ${className}`}
    >
      {children}
    </motion.span>
  );
};

// Achievement Badge with animation
export const AchievementBadge: React.FC<{
  icon: string;
  title: string;
  color?: string;
  unlocked?: boolean;
}> = ({ icon, title, color = '#6366F1', unlocked = true }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: unlocked ? [0, -10, 10, -10, 0] : 0 }}
      transition={{ duration: 0.5 }}
      className={`relative group ${!unlocked ? 'opacity-40 grayscale' : ''}`}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-2 bg-white dark:bg-slate-800"
        style={{
          borderColor: unlocked ? color : '#94A3B8',
          boxShadow: unlocked ? `0 4px 20px ${color}40` : 'none',
        }}
      >
        {icon}
      </div>

      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none">
        {title}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
      </div>

      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white text-lg">
            🔒
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Level Badge
export const LevelBadge: React.FC<{
  level: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ level, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-white shadow-xl border-4 border-white dark:border-slate-900`}
    >
      {level}
    </motion.div>
  );
};
