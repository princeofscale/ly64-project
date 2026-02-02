/**
 * Card Component - Modern, glassmorphic design
 * Inspired by 2026 design trends
 */

import { motion } from 'framer-motion';
import React from 'react';

import type { HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  glow = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';

  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md',
    glass:
      'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg',
    gradient:
      'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg',
    elevated:
      'bg-white dark:bg-slate-800 border-0 shadow-xl dark:shadow-2xl dark:shadow-slate-950/50',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? 'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer'
    : '';

  const glowClasses = glow ? 'hover:shadow-primary-500/20 dark:hover:shadow-primary-500/40' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Specialized card variants
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'accent';
}> = ({ label, value, icon, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-indigo-500 to-purple-500',
    secondary: 'from-emerald-500 to-teal-500',
    accent: 'from-orange-500 to-pink-500',
  };

  return (
    <Card variant="glass" padding="md" hover glow>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{value}</p>

          {trend && trendValue && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-slate-500">vs last week</span>
            </div>
          )}
        </div>

        {icon && (
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} p-3 shadow-lg`}
          >
            <div className="text-white">{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const ProgressCard: React.FC<{
  title: string;
  current: number;
  total: number;
  color?: string;
  subtitle?: string;
}> = ({ title, current, total, color = '#6366F1', subtitle }) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {current}/{total}
          </span>
          <span className="text-lg font-semibold" style={{ color }}>
            {percentage}%
          </span>
        </div>

        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            }}
          />
        </div>
      </div>
    </Card>
  );
};
