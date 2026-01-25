/**
 * Task Navigation Component
 * Компонент быстрой навигации по заданиям
 */

import React, { useCallback } from 'react';

type TaskStatus = 'current' | 'answered' | 'unanswered' | 'flagged';

interface TaskNavigationProps {
  tasks: Array<{ number: number }>;
  currentTaskNumber: number;
  getTaskStatus: (taskNumber: number) => TaskStatus;
  onTaskSelect: (taskNumber: number) => void;
  columns?: number;
}

export const TaskNavigation: React.FC<TaskNavigationProps> = ({
  tasks,
  currentTaskNumber,
  getTaskStatus,
  onTaskSelect,
  columns = 10,
}) => {
  const getButtonStyles = useCallback((status: TaskStatus, number: number): string => {
    const isCurrent = number === currentTaskNumber;

    if (isCurrent) {
      return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white scale-110 shadow-lg shadow-cyan-500/30';
    }

    switch (status) {
      case 'answered':
        return 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30';
      case 'flagged':
        return 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30';
      case 'unanswered':
      default:
        return 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-white';
    }
  }, [currentTaskNumber]);

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-sans text-gray-400">Навигация по заданиям</h3>
        <Legend />
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(columns, tasks.length)}, minmax(0, 1fr))`,
        }}
      >
        {tasks.map((task) => {
          const status = getTaskStatus(task.number);
          const styles = getButtonStyles(status, task.number);

          return (
            <button
              key={task.number}
              onClick={() => onTaskSelect(task.number)}
              className={`
                aspect-square rounded-lg
                font-display font-semibold text-sm
                transition-all duration-200
                ${styles}
              `}
              title={`Задание ${task.number}`}
            >
              {task.number}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Компонент легенды
 */
const Legend: React.FC = () => (
  <div className="flex items-center gap-4 text-xs font-sans">
    <LegendItem color="bg-cyan-500" label="Текущее" />
    <LegendItem color="bg-cyan-500/20 border border-cyan-500/30" label="Отвечено" />
    <LegendItem color="bg-yellow-500/20 border border-yellow-500/30" label="Помечено" />
    <LegendItem color="bg-gray-800/50 border border-gray-700" label="Не отвечено" />
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-3 h-3 rounded ${color}`} />
    <span className="text-gray-500">{label}</span>
  </div>
);
