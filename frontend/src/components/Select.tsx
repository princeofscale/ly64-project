import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 mb-2 font-sans">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3
          bg-gray-800/50 dark:bg-gray-800/50
          border ${error ? 'border-red-500/50' : 'border-gray-700'}
          rounded-xl text-white dark:text-white
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
          transition-all duration-300
          font-sans
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-400 font-sans">{error}</p>}
    </div>
  );
}
