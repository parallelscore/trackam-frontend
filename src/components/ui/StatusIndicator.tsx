import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface StatusIndicatorProps {
  type: StatusType;
  message: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    textColor: 'text-green-700'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-700'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-700'
  },
  loading: {
    icon: Loader2,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-600',
    textColor: 'text-gray-700'
  }
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-1',
    icon: 'w-3 h-3',
    text: 'text-xs'
  },
  md: {
    container: 'px-3 py-2',
    icon: 'w-4 h-4',
    text: 'text-sm'
  },
  lg: {
    container: 'px-4 py-3',
    icon: 'w-5 h-5',
    text: 'text-base'
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  message,
  size = 'md',
  className
}) => {
  const config = statusConfig[type];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 rounded-lg border font-medium',
      config.bgColor,
      config.borderColor,
      sizeStyles.container,
      className
    )}>
      <Icon 
        className={cn(
          sizeStyles.icon,
          config.iconColor,
          type === 'loading' && 'animate-spin'
        )} 
      />
      <span className={cn(sizeStyles.text, config.textColor)}>
        {message}
      </span>
    </div>
  );
};