/**
 * EmptyState Component - For no data states
 * Clean, friendly design for empty screens
 */

import { motion } from 'framer-motion';
import React from 'react';

import { Button } from '../Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'default' | 'search' | 'achievement' | 'test';
}

const illustrations = {
  default: '📭',
  search: '🔍',
  achievement: '🏆',
  test: '📝',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  illustration = 'default',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        {icon || <div className="text-8xl opacity-50">{illustrations[illustration]}</div>}
      </motion.div>

      {/* Content */}
      <div className="text-center max-w-md">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>

        {description && <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>}

        {action && (
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
