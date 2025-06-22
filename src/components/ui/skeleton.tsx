/**
 * Skeleton Loader Components
 * Provides various skeleton loading states for better UX
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Base skeleton component
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => {
  const prefersReducedMotion = useReducedMotion();
  const baseClasses = "bg-gray-200 rounded relative overflow-hidden";
  
  if (animate && !prefersReducedMotion) {
    return (
      <div className={cn(baseClasses, className)}>
        {/* Hardware-accelerated shimmer effect using transform */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          style={{
            // Hardware acceleration hints
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, "animate-pulse", className)} />
  );
};

// Text skeleton for different sizes
interface TextSkeletonProps {
  lines?: number;
  className?: string;
  animate?: boolean;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({ 
  lines = 1, 
  className,
  animate = true 
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        animate={animate}
      />
    ))}
  </div>
);

// Avatar skeleton
export const AvatarSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <Skeleton 
    className={cn("w-10 h-10 rounded-full", className)} 
    animate={animate}
  />
);

// Card skeleton
interface CardSkeletonProps {
  showImage?: boolean;
  showAvatar?: boolean;
  textLines?: number;
  className?: string;
  animate?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showImage = false,
  showAvatar = false,
  textLines = 3,
  className,
  animate = true
}) => (
  <div className={cn("p-4 border border-gray-200 rounded-lg", className)}>
    {showImage && (
      <Skeleton className="w-full h-48 mb-4" animate={animate} />
    )}
    
    <div className="space-y-4">
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <AvatarSkeleton animate={animate} />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/3 mb-2" animate={animate} />
            <Skeleton className="h-3 w-1/2" animate={animate} />
          </div>
        </div>
      )}
      
      <TextSkeleton lines={textLines} animate={animate} />
    </div>
  </div>
);

// Table skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  animate?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className,
  animate = true
}) => (
  <div className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-4 w-3/4" animate={animate} />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={`row-${rowIndex}`}
        className="grid gap-4" 
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            className="h-4" 
            animate={animate}
          />
        ))}
      </div>
    ))}
  </div>
);

// Form skeleton
interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
  className?: string;
  animate?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  showButtons = true,
  className,
  animate = true
}) => (
  <div className={cn("space-y-6", className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={`field-${i}`} className="space-y-2">
        <Skeleton className="h-4 w-1/4" animate={animate} />
        <Skeleton className="h-12 w-full rounded-md" animate={animate} />
      </div>
    ))}
    
    {showButtons && (
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-32 rounded-md" animate={animate} />
        <Skeleton className="h-12 w-24 rounded-md" animate={animate} />
      </div>
    )}
  </div>
);

// Dashboard card skeleton
export const DashboardCardSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("p-6 bg-white rounded-xl border border-gray-200", className)}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-1/3" animate={animate} />
      <Skeleton className="h-8 w-8 rounded-full" animate={animate} />
    </div>
    <Skeleton className="h-8 w-1/2 mb-2" animate={animate} />
    <Skeleton className="h-4 w-2/3" animate={animate} />
  </div>
);

// Delivery item skeleton
export const DeliveryItemSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("p-4 border border-gray-200 rounded-lg", className)}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" animate={animate} />
        <Skeleton className="h-4 w-1/2" animate={animate} />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" animate={animate} />
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" animate={animate} />
        <Skeleton className="h-4 w-2/3" animate={animate} />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" animate={animate} />
        <Skeleton className="h-4 w-1/2" animate={animate} />
      </div>
    </div>
    
    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
      <Skeleton className="h-4 w-1/4" animate={animate} />
      <Skeleton className="h-8 w-24 rounded-md" animate={animate} />
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("p-6 bg-white rounded-xl border border-gray-200", className)}>
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton className="w-20 h-20 rounded-full" animate={animate} />
      <div className="flex-1">
        <Skeleton className="h-6 w-1/3 mb-2" animate={animate} />
        <Skeleton className="h-4 w-1/2 mb-1" animate={animate} />
        <Skeleton className="h-4 w-2/3" animate={animate} />
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-1/3 mb-2" animate={animate} />
          <Skeleton className="h-5 w-full" animate={animate} />
        </div>
        <div>
          <Skeleton className="h-4 w-1/3 mb-2" animate={animate} />
          <Skeleton className="h-5 w-full" animate={animate} />
        </div>
      </div>
      
      <div>
        <Skeleton className="h-4 w-1/4 mb-2" animate={animate} />
        <Skeleton className="h-5 w-3/4" animate={animate} />
      </div>
    </div>
  </div>
);

// Map skeleton
export const MapSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("relative bg-gray-100 rounded-lg overflow-hidden", className)}>
    <Skeleton className="w-full h-full" animate={animate} />
    
    {/* Simulate map markers */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-6 h-6 bg-primary/30 rounded-full"
        animate={animate ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
    
    {/* Simulate controls */}
    <div className="absolute top-4 left-4 space-y-2">
      <Skeleton className="w-10 h-10 rounded" animate={animate} />
      <Skeleton className="w-10 h-10 rounded" animate={animate} />
    </div>
    
    <div className="absolute bottom-4 left-4 right-4">
      <Skeleton className="h-12 w-full rounded-lg" animate={animate} />
    </div>
  </div>
);

// Navigation skeleton
export const NavigationSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={`nav-${i}`} className="flex items-center space-x-3 p-2">
        <Skeleton className="w-5 h-5" animate={animate} />
        <Skeleton className="h-4 w-24" animate={animate} />
      </div>
    ))}
  </div>
);

// Statistics skeleton
export const StatisticsSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
    {Array.from({ length: 3 }).map((_, i) => (
      <DashboardCardSkeleton key={`stat-${i}`} animate={animate} />
    ))}
  </div>
);

// Activity feed skeleton
export const ActivityFeedSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={`activity-${i}`} className="flex items-start space-x-3">
        <Skeleton className="w-8 h-8 rounded-full mt-1" animate={animate} />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-1" animate={animate} />
          <Skeleton className="h-3 w-1/2" animate={animate} />
        </div>
        <Skeleton className="h-3 w-16" animate={animate} />
      </div>
    ))}
  </div>
);

// Chat skeleton
export const ChatSkeleton: React.FC<SkeletonProps> = ({ 
  className, 
  animate = true 
}) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div 
        key={`message-${i}`} 
        className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
      >
        <div className={`max-w-xs ${i % 2 === 0 ? 'order-2' : 'order-1'}`}>
          <Skeleton 
            className={`h-4 mb-2 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`} 
            animate={animate} 
          />
          <Skeleton 
            className={`h-4 ${i % 2 === 0 ? 'w-1/2' : 'w-3/4'}`} 
            animate={animate} 
          />
        </div>
        {i % 2 === 0 && (
          <AvatarSkeleton className="order-1 mr-3" animate={animate} />
        )}
      </div>
    ))}
  </div>
);

export default Skeleton;