/**
 * Skeleton Loading Components
 * Компоненты скелетонной загрузки
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className = '', animate = true, style }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-800 rounded ${className}`}
      style={style}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  );
}

/**
 * Text skeleton (single line)
 */
export function SkeletonText({ width = '100%', className = '' }: { width?: string | number; className?: string }) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  return (
    <Skeleton
      className={`h-4 ${className}`}
      style={{ width: widthStyle }}
    />
  );
}

/**
 * Paragraph skeleton (multiple lines)
 */
export function SkeletonParagraph({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton className={`rounded-full ${sizeClasses[size]} ${className}`} />;
}

/**
 * Card skeleton
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-900 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonParagraph lines={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Test card skeleton
 */
export function SkeletonTestCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-900 rounded-xl p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/**
 * Profile skeleton
 */
export function SkeletonProfile({ className = '' }: { className?: string }) {
  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <SkeletonAvatar size="xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

/**
 * Table skeleton
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
  className = '',
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex gap-4 py-3 border-b border-gray-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-4 border-b border-gray-800/50">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 flex-1"
              style={{ width: colIndex === 0 ? '40%' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Leaderboard skeleton
 */
export function SkeletonLeaderboard({ rows = 10, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-gray-900 rounded-xl p-4"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <SkeletonAvatar size="md" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * Question skeleton
 */
export function SkeletonQuestion({ className = '' }: { className?: string }) {
  return (
    <div className={`${className}`}>
      <Skeleton className="h-6 w-24 mb-4" />
      <SkeletonParagraph lines={2} className="mb-6" />

      {/* Answer options */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-gray-900 rounded-lg p-4"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard skeleton
 */
export function SkeletonDashboard({ className = '' }: { className?: string }) {
  return (
    <div className={`${className}`}>
      {/* Welcome section */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6">
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Recent tests */}
      <div className="mb-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonTestCard />
          <SkeletonTestCard />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component that shows skeleton while loading
 */
interface SkeletonWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

export function SkeletonWrapper({ isLoading, skeleton, children }: SkeletonWrapperProps) {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  return <>{children}</>;
}

export default Skeleton;
