import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wifi, RefreshCw, Shield, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppError, ErrorType, getErrorRecoveryActions } from '@/utils/errorHandling';

interface ErrorMessageProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showActions?: boolean;
}

const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case ErrorType.NETWORK_ERROR:
      return Wifi;
    case ErrorType.AUTHENTICATION_ERROR:
      return Shield;
    case ErrorType.LOCATION_ERROR:
      return MapPin;
    case ErrorType.WEBSOCKET_ERROR:
      return Zap;
    default:
      return AlertTriangle;
  }
};

const getErrorVariant = (type: ErrorType): 'default' | 'destructive' => {
  switch (type) {
    case ErrorType.AUTHENTICATION_ERROR:
    case ErrorType.PERMISSION_ERROR:
    case ErrorType.SERVER_ERROR:
      return 'destructive';
    default:
      return 'default';
  }
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  showActions = true,
}) => {
  if (!error) return null;

  const Icon = getErrorIcon(error.type);
  const variant = getErrorVariant(error.type);
  const recoveryActions = getErrorRecoveryActions(error);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Alert variant={variant} className="relative">
          <Icon className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <div className="font-medium">{error.userMessage}</div>
            
            {showActions && recoveryActions.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <div className="font-medium mb-1">What you can do:</div>
                <ul className="space-y-1">
                  {recoveryActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showActions && (error.retryable || onDismiss) && (
              <div className="flex gap-2 mt-2">
                {error.retryable && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-8"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="h-8"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};