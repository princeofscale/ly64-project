import type { LucideIcon } from 'lucide-react';

interface SubjectCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'pink';
  onClick: () => void;
  className?: string;
}

export function SubjectCard({
  name,
  description,
  icon: Icon,
  color,
  onClick,
  className = '',
}: SubjectCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      icon: 'text-blue-600',
      text: 'text-blue-900',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-300',
      icon: 'text-emerald-600',
      text: 'text-emerald-900',
    },
    violet: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      hoverBorder: 'hover:border-violet-300',
      icon: 'text-violet-600',
      text: 'text-violet-900',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-300',
      icon: 'text-amber-600',
      text: 'text-amber-900',
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      hoverBorder: 'hover:border-rose-300',
      icon: 'text-rose-600',
      text: 'text-rose-900',
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-300',
      icon: 'text-cyan-600',
      text: 'text-cyan-900',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-300',
      icon: 'text-indigo-600',
      text: 'text-indigo-900',
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      hoverBorder: 'hover:border-pink-300',
      icon: 'text-pink-600',
      text: 'text-pink-900',
    },
  };

  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`
        w-full bg-white border-2 ${colors.border} ${colors.hoverBorder}
        rounded-2xl p-6
        shadow-lg hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        text-left
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`${colors.bg} ${colors.icon} p-3 rounded-xl flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${colors.text} mb-1`}>
            {name}
          </h3>
          <p className="text-sm text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
