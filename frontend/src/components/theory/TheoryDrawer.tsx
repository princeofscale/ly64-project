import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import type { TheoryTopic } from '../../data/theory/types';

import { DifficultyBadge } from './DifficultyBadge';
import { SectionContent } from './SectionContent';

interface TheoryDrawerProps {
  topic: TheoryTopic | null;
  subject?: string;
  onClose: () => void;
}

export const TheoryDrawer: React.FC<TheoryDrawerProps> = ({ topic, subject, onClose }) => {
  const isOpen = topic !== null;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && topic && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-3xl flex-shrink-0">{topic.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900">{topic.title}</h2>
                    <DifficultyBadge difficulty={topic.difficulty} />
                  </div>
                  <p className="text-slate-500 text-sm mt-1">{topic.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0 ml-2"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {topic.sections.map(section => (
                <SectionContent key={section.id} section={section} />
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <Link
                to={`/theory${subject ? `?subject=${subject}` : ''}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors text-sm"
              >
                Открыть справочник
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
