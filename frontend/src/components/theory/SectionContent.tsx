import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

import type { TheorySection } from '../../data/theory/types';

export const SectionContent: React.FC<{ section: TheorySection }> = ({ section }) => {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="bg-slate-50 rounded-xl p-5 mb-4">
      <h4 className="text-lg font-semibold text-slate-900 mb-3">{section.title}</h4>

      {}
      <div className="text-slate-700 whitespace-pre-line mb-4 leading-relaxed">
        {section.content}
      </div>

      {}
      {section.formulas && section.formulas.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
          <h5 className="text-sm font-medium text-blue-400 mb-2">Формулы:</h5>
          <div className="space-y-1">
            {section.formulas.map((formula, idx) => (
              <div
                key={idx}
                className="text-slate-800 font-mono text-sm bg-white border border-slate-200 px-3 py-1 rounded"
              >
                {formula}
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {section.tips && section.tips.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
          <h5 className="text-sm font-medium text-amber-500 mb-2">Советы:</h5>
          <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
            {section.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {}
      {section.examples && section.examples.length > 0 && (
        <div>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-blue-400 text-sm font-medium flex items-center gap-1 hover:text-blue-300"
          >
            {showExamples ? '▼' : '▶'} Примеры ({section.examples.length})
          </button>

          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-3"
              >
                {section.examples.map((example, idx) => (
                  <div key={idx} className="bg-slate-100 rounded-lg p-4">
                    <div className="text-slate-900 font-medium mb-2">Задача: {example.problem}</div>
                    <div className="text-slate-500 text-sm mb-2">
                      <span className="text-slate-400">Решение:</span> {example.solution}
                    </div>
                    <div className="text-green-400 font-medium">Ответ: {example.answer}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
