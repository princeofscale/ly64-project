import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3.5 py-2.5
          bg-slate-50
          border ${error ? 'border-red-500' : 'border-slate-200'}
          rounded-xl text-slate-900
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          transition-colors duration-200
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
