import React from 'react';

import { ALL_SUBJECTS } from '../../data/theory';
import type { SubjectKey } from '../../data/theory/types';

interface SubjectTabsProps {
  activeSubject: SubjectKey;
  onChange: (subject: SubjectKey) => void;
}

export const SubjectTabs: React.FC<SubjectTabsProps> = ({ activeSubject, onChange }) => (
  <div className="flex flex-wrap gap-2 mb-6">
    {ALL_SUBJECTS.map(s => (
      <button
        key={s.subject}
        onClick={() => onChange(s.subject)}
        className={`
          px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${
            activeSubject === s.subject
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
          }
        `}
      >
        <span className="mr-1.5">{s.icon}</span>
        {s.label}
      </button>
    ))}
  </div>
);
