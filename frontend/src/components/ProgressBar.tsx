interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

/**
 * ProgressBar компонент
 * Отображает прогресс-бар с текущим шагом и общим количеством шагов
 */
export function ProgressBar({
  current,
  total,
  showLabel = true,
  className = '',
}: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-2 text-center">
          Шаг {current} из {total}
        </p>
      )}
    </div>
  );
}
