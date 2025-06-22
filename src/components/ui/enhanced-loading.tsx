import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Enhanced loading spinner with various styles
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'circle' | 'wave' | 'bounce';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'gray';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary', 
  accent: 'text-accent',
  white: 'text-white',
  gray: 'text-gray-500'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default', 
  color = 'primary',
  className
}) => {
  const prefersReducedMotion = useReducedMotion();
  const baseClasses = cn(sizeClasses[size], colorClasses[color], className);

  if (variant === 'default') {
    return (
      <motion.div
        className={cn(baseClasses, 'border-2 border-current border-t-transparent rounded-full')}
        style={{
          // Hardware acceleration hints
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
        animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={
          prefersReducedMotion 
            ? { duration: 0.01 }
            : { duration: 1, repeat: Infinity, ease: 'linear' }
        }
      />
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={cn('w-2 h-2 rounded-full bg-current', colorClasses[color])}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn(baseClasses, 'rounded-full bg-current')}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-end space-x-1', className)}>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={cn('w-1 bg-current rounded-full', colorClasses[color])}
            style={{ height: size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '20px' : '24px' }}
            animate={{ 
              scaleY: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={cn(baseClasses, 'relative', className)}>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-current"
          style={{
            borderTopColor: 'transparent',
            borderRightColor: 'transparent'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-current"
          style={{
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent'
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={cn('w-1 h-8 bg-current rounded-full', colorClasses[color])}
            animate={{ 
              scaleY: [0.4, 1, 0.4],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bounce') {
    return (
      <div className={cn('flex space-x-2', className)}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={cn('w-3 h-3 rounded-full bg-current', colorClasses[color])}
            animate={{ 
              y: [0, -12, 0]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

// Enhanced loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'default' | 'blur' | 'dark' | 'gradient';
  spinnerVariant?: LoadingSpinnerProps['variant'];
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  variant = 'default',
  spinnerVariant = 'default',
  className
}) => {
  const overlayVariants = {
    default: 'bg-white/80',
    blur: 'bg-white/60 backdrop-blur-sm',
    dark: 'bg-black/60',
    gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            overlayVariants[variant],
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-xl"
          >
            <LoadingSpinner 
              size="lg" 
              variant={spinnerVariant}
              color="primary"
            />
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-gray-700 font-medium"
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading state wrapper component
interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  overlay?: boolean;
  overlayMessage?: string;
  overlayVariant?: LoadingOverlayProps['variant'];
  spinnerVariant?: LoadingSpinnerProps['variant'];
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  fallback,
  overlay = false,
  overlayMessage,
  overlayVariant = 'blur',
  spinnerVariant = 'default',
  className
}) => {
  if (overlay) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <LoadingOverlay 
          isVisible={isLoading}
          message={overlayMessage}
          variant={overlayVariant}
          spinnerVariant={spinnerVariant}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {fallback || (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner 
                  size="lg" 
                  variant={spinnerVariant}
                  color="primary"
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced page transition loading
interface PageTransitionProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  isLoading,
  progress = 0,
  message = 'Loading page...'
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm"
        >
          {/* Progress bar */}
          <motion.div
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Content */}
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              {/* Logo animation */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              
              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="text-xl font-semibold text-secondary">TrackAm</h3>
                <p className="text-gray-600">{message}</p>
              </motion.div>
              
              {/* Loading indicator */}
              <LoadingSpinner 
                size="lg" 
                variant="dots"
                color="primary"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Global loading state hook
export const useGlobalLoading = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('Loading...');

  const showLoading = React.useCallback((loadingMessage?: string) => {
    if (loadingMessage) setMessage(loadingMessage);
    setIsLoading(true);
  }, []);

  const hideLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    message,
    showLoading,
    hideLoading
  };
};