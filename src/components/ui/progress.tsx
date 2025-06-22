/**
 * Progress Indicator Components
 * Various progress indicators for loading states and operations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Basic progress bar
interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  showLabel = false,
  color = 'primary',
  size = 'md',
  animated = true
}) => {
  const prefersReducedMotion = useReducedMotion();
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className={cn(
        "w-full bg-gray-200 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        {/* Hardware-accelerated progress bar using transform instead of width */}
        <motion.div
          className={cn(
            "h-full rounded-full origin-left",
            colorClasses[color]
          )}
          style={{
            // Hardware acceleration hints
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: clampedValue / 100 }}
          transition={
            prefersReducedMotion 
              ? { duration: 0.01 }
              : animated 
                ? { duration: 0.5, ease: "easeOut" }
                : { duration: 0 }
          }
        />
      </div>
    </div>
  );
};

// Circular progress
interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 60,
  strokeWidth = 4,
  className,
  color = 'hsl(var(--primary))',
  showLabel = false,
  animated = true
}) => {
  const prefersReducedMotion = useReducedMotion();
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{
          // Hardware acceleration hints
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={
            prefersReducedMotion 
              ? { duration: 0.01 }
              : animated 
                ? { duration: 1, ease: "easeInOut" }
                : { duration: 0 }
          }
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Step progress indicator
interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed';
}

interface StepProgressProps {
  steps: Step[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showDescriptions?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  className,
  orientation = 'horizontal',
  showDescriptions = false
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step.status === 'completed' ? 'bg-primary text-white' :
                  step.status === 'current' ? 'bg-primary/20 text-primary border-2 border-primary' :
                  'bg-gray-200 text-gray-500'
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {step.status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <div className="w-px h-8 bg-gray-300 mt-2" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <motion.h3
                className={cn(
                  "text-sm font-medium",
                  step.status === 'completed' ? 'text-primary' :
                  step.status === 'current' ? 'text-gray-900' :
                  'text-gray-500'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                {step.title}
              </motion.h3>
              {showDescriptions && step.description && (
                <motion.p
                  className="text-xs text-gray-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {step.description}
                </motion.p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <motion.div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step.status === 'completed' ? 'bg-primary text-white' :
                step.status === 'current' ? 'bg-primary/20 text-primary border-2 border-primary' :
                'bg-gray-200 text-gray-500'
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {step.status === 'completed' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </motion.div>
            <motion.span
              className={cn(
                "text-xs mt-2 text-center",
                step.status === 'completed' ? 'text-primary' :
                step.status === 'current' ? 'text-gray-900' :
                'text-gray-500'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              {step.title}
            </motion.span>
            {showDescriptions && step.description && (
              <motion.p
                className="text-xs text-gray-500 mt-1 text-center max-w-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {step.description}
              </motion.p>
            )}
          </div>
          {index < steps.length - 1 && (
            <motion.div
              className={cn(
                "flex-1 h-px mx-4",
                steps[index + 1].status === 'completed' || step.status === 'completed' ? 
                'bg-primary' : 'bg-gray-300'
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Loading spinner with different variants
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'hsl(var(--primary))',
  className,
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const Spinner = () => (
    <motion.div
      className={cn("border-2 border-gray-200 rounded-full", sizeClasses[size])}
      style={{ borderTopColor: color }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  const Dots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  const Bars = () => {
    const prefersReducedMotion = useReducedMotion();
    
    return (
      <div className="flex space-x-1 items-end">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-current origin-bottom"
            style={{ 
              color,
              height: '20px',
              // Hardware acceleration hints
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
            animate={
              prefersReducedMotion 
                ? { scaleY: 1 }
                : { scaleY: [1, 2, 1] }
            }
            transition={
              prefersReducedMotion 
                ? { duration: 0.01 }
                : {
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15
                  }
            }
          />
        ))}
      </div>
    );
  };

  const Pulse = () => (
    <motion.div
      className={cn("rounded-full", sizeClasses[size])}
      style={{ backgroundColor: color }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.8, 0.4, 0.8]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const variants = {
    spinner: Spinner,
    dots: Dots,
    bars: Bars,
    pulse: Pulse
  };

  const Component = variants[variant];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Component />
    </div>
  );
};

// Upload progress component
interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  onCancel?: () => void;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress,
  status,
  onCancel,
  className
}) => {
  return (
    <div className={cn("p-4 bg-white border border-gray-200 rounded-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {status === 'uploading' && (
            <LoadingSpinner size="sm" variant="spinner" />
          )}
          {status === 'completed' && (
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 truncate">
            {fileName}
          </span>
        </div>
        
        {onCancel && status === 'uploading' && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      <ProgressBar
        value={progress}
        color={status === 'error' ? 'error' : status === 'completed' ? 'success' : 'primary'}
        size="sm"
        showLabel
      />
      
      <div className="mt-2 text-xs text-gray-500">
        {status === 'uploading' && `Uploading... ${progress}%`}
        {status === 'completed' && 'Upload completed'}
        {status === 'error' && 'Upload failed'}
      </div>
    </div>
  );
};

// Indeterminate progress
export const IndeterminateProgress: React.FC<{
  className?: string;
  color?: string;
}> = ({ className, color = 'hsl(var(--primary))' }) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={cn("w-full h-1 bg-gray-200 rounded-full overflow-hidden", className)}>
      <motion.div
        className="h-full rounded-full w-1/3"
        style={{ 
          backgroundColor: color,
          // Hardware acceleration hints
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
        animate={
          prefersReducedMotion 
            ? { x: '0%' }
            : { x: ['-100%', '300%'] }
        }
        transition={
          prefersReducedMotion 
            ? { duration: 0.01 }
            : {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
        }
      />
    </div>
  );
};

export { ProgressBar as default };