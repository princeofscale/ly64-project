/**
 * Timeline Component - For activity feeds
 * Clean, modern timeline design
 */

import { motion } from 'framer-motion';
import React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  iconColor?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const typeColors = {
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

      {/* Timeline items */}
      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-12"
          >
            {/* Icon */}
            <div
              className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                item.iconColor || typeColors[item.type || 'info']
              }`}
            >
              {item.icon || <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-900" />}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>

                <time className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {item.timestamp}
                </time>
              </div>

              {item.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
