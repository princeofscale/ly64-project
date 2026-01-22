import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-400 dark:text-gray-400 mb-2 font-sans">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3
          bg-gray-800/50 dark:bg-gray-800/50
          border ${error ? 'border-red-500/50' : 'border-gray-700'}
          rounded-xl text-white dark:text-white
          placeholder-gray-500 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
          transition-all duration-300
          font-sans
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400 font-sans">{error}</p>
      )}
    </div>
  );
}
