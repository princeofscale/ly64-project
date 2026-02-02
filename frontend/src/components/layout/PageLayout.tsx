/**
 * Page Layout - Unified layout for all pages
 * Ensures consistent design across the app
 */

import { motion } from 'framer-motion';
import React from 'react';

import { Header } from '../Header';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noPadding?: boolean;
  background?: 'default' | 'gradient' | 'pattern';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
  maxWidth = 'xl',
  noPadding = false,
  background = 'default',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const backgroundClasses = {
    default: 'bg-slate-50 dark:bg-slate-950',
    gradient:
      'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30',
    pattern:
      'bg-slate-50 dark:bg-slate-950 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem]',
  };

  return (
    <div className={`min-h-screen ${backgroundClasses[background]}`}>
      <Header />

      <main className="relative">
        {/* Page Header */}
        {(title || subtitle || action) && (
          <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className={`mx-auto ${maxWidthClasses[maxWidth]} px-4 sm:px-6 lg:px-8 py-6`}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  {title && (
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {title}
                    </h1>
                  )}
                  {subtitle && <p className="text-slate-600 dark:text-slate-400">{subtitle}</p>}
                </div>

                {action && <div className="flex-shrink-0">{action}</div>}
              </motion.div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div
          className={`mx-auto ${maxWidthClasses[maxWidth]} ${noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-8'}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Content Section - For grouping content within pages
export const ContentSection: React.FC<{
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, action, children, className = '' }) => {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || description || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
            )}
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </section>
  );
};

// Grid Layout - For card layouts
export const GridLayout: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}> = ({ children, cols = 3, gap = 'md' }) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]}`}>{children}</div>;
};
