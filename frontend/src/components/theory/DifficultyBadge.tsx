import React from 'react';

const colors = {
  easy: 'bg-green-500/20 text-green-600',
  medium: 'bg-amber-500/20 text-amber-600',
  hard: 'bg-red-500/20 text-red-600',
};

const labels = {
  easy: 'Базовый',
  medium: 'Средний',
  hard: 'Сложный',
};

export const DifficultyBadge: React.FC<{ difficulty: 'easy' | 'medium' | 'hard' }> = ({
  difficulty,
}) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty]}`}>
    {labels[difficulty]}
  </span>
);
