import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  withDecorations?: boolean;
  maxWidth?: 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
}

export function PageContainer({
  children,
  withDecorations = false,
  maxWidth = '4xl',
  className = '',
}: PageContainerProps) {
  const maxWidthClasses = {
    lg: 'max-w-7xl',
    xl: 'max-w-8xl',
    '2xl': 'max-w-screen-2xl',
    '4xl': 'max-w-screen-4xl',
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Decorative blur circles */}
      {withDecorations && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-100/50 rounded-full blur-[80px] -z-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </>
      )}

      {/* Content */}
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {children}
      </div>
    </div>
  );
}
