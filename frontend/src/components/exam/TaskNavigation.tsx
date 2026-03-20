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
  const getButtonStyles = useCallback(
    (status: TaskStatus, number: number): string => {
      const isCurrent = number === currentTaskNumber;

      if (isCurrent) {
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30';
      }

      switch (status) {
        case 'answered':
          return 'bg-blue-100 border border-blue-200 text-blue-600 hover:bg-blue-200';
        case 'flagged':
          return 'bg-amber-100 border border-amber-200 text-amber-600 hover:bg-amber-200';
        case 'unanswered':
        default:
          return 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-slate-900';
      }
    },
    [currentTaskNumber]
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-sans text-slate-500">Навигация по заданиям</h3>
        <Legend />
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(columns, tasks.length)}, minmax(0, 1fr))`,
        }}
      >
        {tasks.map(task => {
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

const Legend: React.FC = () => (
  <div className="flex items-center gap-4 text-xs font-sans">
    <LegendItem color="bg-blue-500" label="Текущее" />
    <LegendItem color="bg-blue-100 border border-blue-200" label="Отвечено" />
    <LegendItem color="bg-amber-100 border border-amber-200" label="Помечено" />
    <LegendItem color="bg-slate-50 border border-slate-200" label="Не отвечено" />
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-3 h-3 rounded ${color}`} />
    <span className="text-slate-500">{label}</span>
  </div>
);
