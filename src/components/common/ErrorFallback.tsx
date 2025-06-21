import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  Shield, 
  Server, 
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppError, ErrorType } from '@/utils/errorHandling';

interface ErrorFallbackProps {
  error: AppError;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showActions?: boolean;
}

const errorConfigs = {
  [ErrorType.NETWORK_ERROR]: {
    icon: WifiOff,
    title: 'Connection Problem',
    description: 'Unable to connect to our servers.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    icon: Shield,
    title: 'Authentication Required',
    description: 'Please log in to continue.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  [ErrorType.PERMISSION_ERROR]: {
    icon: Shield,
    title: 'Access Denied',
    description: 'You don\'t have permission for this action.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  [ErrorType.NOT_FOUND_ERROR]: {
    icon: AlertTriangle,
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  [ErrorType.SERVER_ERROR]: {
    icon: Server,
    title: 'Server Error',
    description: 'Something went wrong on our end.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  [ErrorType.WEBSOCKET_ERROR]: {
    icon: Wifi,
    title: 'Connection Lost',
    description: 'Real-time connection interrupted.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  [ErrorType.LOCATION_ERROR]: {
    icon: MapPin,
    title: 'Location Access',
    description: 'Unable to access your location.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  [ErrorType.VALIDATION_ERROR]: {
    icon: AlertTriangle,
    title: 'Invalid Data',
    description: 'Please check your input and try again.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  [ErrorType.UNKNOWN_ERROR]: {
    icon: AlertTriangle,
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred.',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
};

const sizeConfigs = {
  sm: {
    container: 'max-w-sm',
    icon: 'w-8 h-8',
    iconContainer: 'w-12 h-12',
    title: 'text-lg',
    spacing: 'space-y-2',
  },
  md: {
    container: 'max-w-md',
    icon: 'w-10 h-10',
    iconContainer: 'w-16 h-16',
    title: 'text-xl',
    spacing: 'space-y-3',
  },
  lg: {
    container: 'max-w-lg',
    icon: 'w-12 h-12',
    iconContainer: 'w-20 h-20',
    title: 'text-2xl',
    spacing: 'space-y-4',
  },
  full: {
    container: 'max-w-2xl',
    icon: 'w-16 h-16',
    iconContainer: 'w-24 h-24',
    title: 'text-3xl',
    spacing: 'space-y-6',
  },
};

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onGoBack,
  onGoHome,
  size = 'md',
  showActions = true,
}) => {
  const config = errorConfigs[error.type] || errorConfigs[ErrorType.UNKNOWN_ERROR];
  const sizeConfig = sizeConfigs[size];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center p-4"
    >
      <Card className={`w-full ${sizeConfig.container}`}>
        <CardHeader className="text-center">
          <div className={`mx-auto ${sizeConfig.iconContainer} ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`${sizeConfig.icon} ${config.color}`} />
          </div>
          <CardTitle className={sizeConfig.title}>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        
        <CardContent className={sizeConfig.spacing}>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md text-center">
            {error.userMessage}
          </div>
          
          {error.details?.timestamp && (
            <div className="text-xs text-muted-foreground text-center">
              Error occurred at {new Date(error.details.timestamp).toLocaleTimeString()}
            </div>
          )}

          {showActions && (
            <div className="flex flex-col gap-2">
              {error.retryable && onRetry && (
                <Button onClick={onRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <div className="flex gap-2">
                {onGoBack && (
                  <Button variant="outline" onClick={onGoBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                )}
                {onGoHome && (
                  <Button variant="outline" onClick={onGoHome} className="flex-1">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const NetworkErrorFallback: React.FC<Omit<ErrorFallbackProps, 'error'>> = (props) => {
  const networkError = new AppError(
    ErrorType.NETWORK_ERROR,
    'Network connection failed',
    'Please check your internet connection and try again.',
    { retryable: true }
  );
  
  return <ErrorFallback error={networkError} {...props} />;
};

export const LoadingErrorFallback: React.FC<Omit<ErrorFallbackProps, 'error'>> = (props) => {
  const loadingError = new AppError(
    ErrorType.UNKNOWN_ERROR,
    'Failed to load content',
    'Content could not be loaded at this time.',
    { retryable: true }
  );
  
  return <ErrorFallback error={loadingError} {...props} />;
};

export const PermissionErrorFallback: React.FC<Omit<ErrorFallbackProps, 'error'>> = (props) => {
  const permissionError = new AppError(
    ErrorType.PERMISSION_ERROR,
    'Permission denied',
    'You do not have permission to access this resource.',
    { recoverable: false }
  );
  
  return <ErrorFallback error={permissionError} {...props} />;
};