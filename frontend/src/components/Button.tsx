/**
 * Button Component - Modern, accessible design with animations
 * Supports multiple variants and states
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-lg',
      secondary:
        'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 shadow-md hover:shadow-lg',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-md hover:shadow-lg',
      outline:
        'border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 focus:ring-indigo-500',
      ghost:
        'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
      gradient:
        'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:ring-purple-500 shadow-lg hover:shadow-xl',
    };

    const sizeClasses = {
      sm: 'text-sm px-3 py-2 gap-1.5',
      md: 'text-base px-5 py-2.5 gap-2',
      lg: 'text-lg px-6 py-3 gap-2.5',
      xl: 'text-xl px-8 py-4 gap-3',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const roundedClass = rounded ? 'rounded-full' : 'rounded-xl';

    const MotionButton = motion.button;

    return (
      <MotionButton
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${roundedClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Загрузка...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'children'> & { icon: ReactNode }
>(({ icon, variant = 'ghost', size = 'md', className = '', ...props }, ref) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
    xl: 'w-14 h-14 p-3',
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`!p-0 ${sizeClasses[size]} ${className}`}
      rounded
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';
