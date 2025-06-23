import React from 'react';
import { cn } from '@/lib/utils';

interface CenteredContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl'
};

const paddingClasses = {
  sm: 'px-3 py-8',
  md: 'px-4 py-12',
  lg: 'px-6 py-16'
};

export const CenteredContainer: React.FC<CenteredContainerProps> = ({
  children,
  className,
  maxWidth = 'md',
  padding = 'md'
}) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center relative',
      paddingClasses[padding],
      className
    )}>
      <div className={cn(
        'w-full relative z-10',
        maxWidthClasses[maxWidth]
      )}>
        {children}
      </div>
    </div>
  );
};