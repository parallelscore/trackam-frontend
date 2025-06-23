import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size: number;
  color: string;
  showValue: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, size }) => (
  <div className="relative inline-flex items-center justify-center">
    <svg width={size} height={size} className="animate-spin">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size - 4) / 2}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeOpacity="0.2"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size - 4) / 2}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray={`${Math.PI * (size - 4)} ${Math.PI * (size - 4)}`}
        strokeDashoffset={Math.PI * (size - 4) * (1 - value / 100)}
        strokeLinecap="round"
      />
    </svg>
  </div>
);

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  isLoading?: boolean;
  loadingText?: string;
  progress?: number;
  progressStep?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'h-10 text-sm px-4',
  md: 'h-12 text-base px-6',
  lg: 'h-14 text-lg px-8'
};

const variantClasses = {
  primary: 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90',
  secondary: 'bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90',
  accent: 'bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90'
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  icon: Icon,
  isLoading = false,
  loadingText = 'Loading...',
  progress = 0,
  progressStep,
  size = 'lg',
  variant = 'primary',
  fullWidth = true,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        'font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group',
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Hover background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <CircularProgress value={progress} size={20} color="white" showValue={false} />
            {progressStep || loadingText}
          </>
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5" />}
            {children}
          </>
        )}
      </span>
    </Button>
  );
};