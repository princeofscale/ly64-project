import { motion } from 'framer-motion';
import React from 'react';

import type { TheoryTopic } from '../../data/theory/types';

import { DifficultyBadge } from './DifficultyBadge';

export const TopicCard: React.FC<{ topic: TheoryTopic; onClick: () => void; isStudied?: boolean }> = ({
  topic,
  onClick,
  isStudied,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`bg-white border rounded-2xl shadow-lg hover:shadow-xl p-5 cursor-pointer transition-colors ${
      isStudied
        ? 'border-emerald-300 hover:border-emerald-400 bg-emerald-50/30'
        : 'border-slate-200 hover:border-blue-500/50'
    }`}
  >
    <div className="flex items-start gap-4">
      <div className="text-4xl">{topic.icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-slate-900">{topic.title}</h3>
          <DifficultyBadge difficulty={topic.difficulty} />
          {isStudied && (
            <span className="ml-auto text-xs font-medium text-emerald-600 flex items-center gap-1 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Изучено
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mb-3">{topic.description}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span>⏱</span> {topic.estimatedTime} мин
          </span>
          <span className="flex items-center gap-1">
            <span>📝</span> Задания: {topic.tasks.join(', ')}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);
