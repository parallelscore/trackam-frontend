/**
 * Optimistic UI Components
 * Components for optimistic updates and transitions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Optimistic state types
export type OptimisticState = 'pending' | 'success' | 'error' | 'idle';

interface OptimisticWrapperProps {
  state: OptimisticState;
  children: React.ReactNode;
  className?: string;
  pendingOverlay?: React.ReactNode;
  errorOverlay?: React.ReactNode;
  successMessage?: string;
  showSuccess?: boolean;
}

// Wrapper for optimistic updates
export const OptimisticWrapper: React.FC<OptimisticWrapperProps> = ({
  state,
  children,
  className,
  pendingOverlay,
  errorOverlay,
  successMessage,
  showSuccess = true
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      <AnimatePresence>
        {state === 'pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
          >
            {pendingOverlay || (
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-sm font-medium text-gray-700">Updating...</span>
              </div>
            )}
          </motion.div>
        )}
        
        {state === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-red-50/90 backdrop-blur-sm flex items-center justify-center z-10"
          >
            {errorOverlay || (
              <div className="flex items-center space-x-3 text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Update failed</span>
              </div>
            )}
          </motion.div>
        )}
        
        {state === 'success' && showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 bg-green-50/90 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="flex items-center space-x-3 text-green-600">
              <motion.svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </motion.svg>
              <span className="text-sm font-medium">
                {successMessage || 'Updated successfully'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Optimistic list item
interface OptimisticListItemProps {
  isOptimistic?: boolean;
  state?: OptimisticState;
  children: React.ReactNode;
  className?: string;
  onRetry?: () => void;
}

export const OptimisticListItem: React.FC<OptimisticListItemProps> = ({
  isOptimistic = false,
  state = 'idle',
  children,
  className,
  onRetry
}) => {
  return (
    <motion.div
      layout
      initial={isOptimistic ? { opacity: 0.7, scale: 0.98 } : false}
      animate={
        state === 'error' ? { opacity: 0.6, x: [0, -5, 5, 0] } :
        state === 'success' ? { opacity: 1, scale: 1 } :
        isOptimistic ? { opacity: 0.7, scale: 0.98 } :
        { opacity: 1, scale: 1 }
      }
      transition={{ 
        type: "spring", 
        damping: 20,
        x: { duration: 0.3 }
      }}
      className={cn(
        "relative transition-all duration-200",
        isOptimistic && "bg-blue-50/50 border-blue-200",
        state === 'error' && "bg-red-50/50 border-red-200",
        className
      )}
    >
      {children}
      
      {/* Optimistic indicator */}
      {isOptimistic && state === 'pending' && (
        <div className="absolute top-2 right-2">
          <motion.div
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      )}
      
      {/* Error indicator with retry */}
      {state === 'error' && (
        <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-red-600">Failed</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Optimistic button
interface OptimisticButtonProps {
  state: OptimisticState;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  successMessage?: string;
  pendingMessage?: string;
  errorMessage?: string;
}

export const OptimisticButton: React.FC<OptimisticButtonProps> = ({
  state,
  onClick,
  children,
  className,
  disabled = false,
  successMessage,
  pendingMessage,
  errorMessage
}) => {
  const getMessage = () => {
    switch (state) {
      case 'pending':
        return pendingMessage || 'Loading...';
      case 'success':
        return successMessage || 'Success!';
      case 'error':
        return errorMessage || 'Try again';
      default:
        return children;
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'pending':
        return (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );
      case 'success':
        return (
          <motion.svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </motion.svg>
        );
      case 'error':
        return (
          <motion.svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </motion.svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || state === 'pending'}
      className={cn(
        "inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200",
        state === 'success' && "bg-green-500 text-white",
        state === 'error' && "bg-red-500 text-white",
        state === 'pending' && "bg-gray-400 text-white cursor-not-allowed",
        state === 'idle' && "bg-primary text-white hover:bg-primary/90",
        className
      )}
      whileHover={state === 'idle' ? { scale: 1.02 } : {}}
      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center space-x-2"
        >
          {getIcon()}
          <span>{getMessage()}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

// Optimistic toast/notification
interface OptimisticToastProps {
  message: string;
  state: OptimisticState;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}

export const OptimisticToast: React.FC<OptimisticToastProps> = ({
  message,
  state,
  onClose,
  className,
  autoClose = true,
  duration = 3000
}) => {
  React.useEffect(() => {
    if (autoClose && (state === 'success' || state === 'error')) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [state, autoClose, duration, onClose]);

  const getColorClasses = () => {
    switch (state) {
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "flex items-center space-x-3 p-4 border rounded-lg shadow-lg",
        getColorClasses(),
        className
      )}
    >
      <div className="flex-shrink-0">
        {state === 'pending' && (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {state === 'success' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {state === 'error' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};

// Optimistic counter/badge
interface OptimisticCounterProps {
  count: number;
  optimisticCount?: number;
  state?: OptimisticState;
  className?: string;
}

export const OptimisticCounter: React.FC<OptimisticCounterProps> = ({
  count,
  optimisticCount,
  state = 'idle',
  className
}) => {
  const displayCount = optimisticCount !== undefined ? optimisticCount : count;
  const isOptimistic = optimisticCount !== undefined && optimisticCount !== count;

  return (
    <motion.span
      key={displayCount}
      initial={isOptimistic ? { scale: 1.2, opacity: 0.8 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full",
        isOptimistic && "bg-blue-100 text-blue-800 border border-blue-200",
        state === 'error' && "bg-red-100 text-red-800 border border-red-200",
        !isOptimistic && state === 'idle' && "bg-gray-100 text-gray-800",
        className
      )}
    >
      {displayCount}
      {isOptimistic && state === 'pending' && (
        <motion.div
          className="ml-1 w-2 h-2 bg-current rounded-full"
          animate={{ scale: [1, 0.8, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.span>
  );
};

export { OptimisticWrapper as default };