import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-200',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-200',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`
        bg-white border border-slate-200 rounded-2xl p-6
        shadow-lg hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className="text-xs text-slate-500 mt-2">{trend}</p>
          )}
        </div>
        <div className={`${colors.bg} ${colors.text} p-4 rounded-xl`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
