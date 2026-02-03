import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-3.5 py-2.5
          bg-slate-50
          border ${error ? 'border-red-500' : 'border-slate-200'}
          rounded-xl text-slate-900
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          transition-colors duration-200
          resize-vertical
          ${className}
        `}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
