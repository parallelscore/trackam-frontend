// Optimized animations with hardware acceleration and reduced motion support
import { Variants, Target, Transition } from 'framer-motion';

// Hardware acceleration style helpers
export const hardwareAcceleration = {
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000
};

// Common easing curves - optimized
export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  spring: [0.6, -0.05, 0.01, 0.99],
  bounce: [0.68, -0.55, 0.265, 1.55],
  gentle: [0.25, 0.1, 0.25, 1],
} as const;

// Optimized transition presets
export const transitions = {
  fast: {
    duration: 0.2,
    ease: easings.smooth
  },
  medium: {
    duration: 0.3,
    ease: easings.smooth
  },
  slow: {
    duration: 0.5,
    ease: easings.smooth
  },
  spring: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 120
  },
  springBouncy: {
    type: 'spring' as const,
    damping: 15,
    stiffness: 100
  }
};

// Reduced motion utility
export const getReducedMotionTransition = (normalTransition: Transition): Transition => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { duration: 0.01 };
  }
  return normalTransition;
};

// Optimized base animation variants using transform only
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateY(40px) scale(0.95)'
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.6,
      ease: easings.smooth
    })
  }
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateY(-40px) scale(0.95)'
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.6,
      ease: easings.smooth
    })
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: getReducedMotionTransition({
      duration: 0.4,
      ease: easings.gentle
    })
  }
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateX(-60px) scale(0.95)'
  },
  visible: {
    opacity: 1,
    transform: 'translateX(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.6,
      ease: easings.smooth
    })
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateX(60px) scale(0.95)'
  },
  visible: {
    opacity: 1,
    transform: 'translateX(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.6,
      ease: easings.smooth
    })
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'scale(0.8)'
  },
  visible: {
    opacity: 1,
    transform: 'scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.4,
      ease: easings.spring
    })
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateY(20px)'
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: getReducedMotionTransition({
      duration: 0.4,
      ease: easings.gentle
    })
  }
};

// Hardware-accelerated loading animations
export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: getReducedMotionTransition({
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    })
  }
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: getReducedMotionTransition({
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    })
  }
};

// Optimized hover animations using transform only
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: getReducedMotionTransition(transitions.fast)
  },
  whileTap: { scale: 0.95 }
};

export const hoverLift = {
  whileHover: { 
    transform: 'translateY(-4px) scale(1.02)',
    transition: getReducedMotionTransition(transitions.fast)
  },
  whileTap: { 
    transform: 'translateY(0px) scale(0.98)'
  }
};

// Performance-optimized background animations
export const backgroundFloat = {
  animate: {
    transform: [
      'translate(0px, 0px) scale(1)',
      'translate(40px, -20px) scale(1.1)',
      'translate(0px, 0px) scale(1)'
    ],
    opacity: [0.15, 0.25, 0.15],
    transition: getReducedMotionTransition({
      duration: 15,
      repeat: Infinity,
      ease: "easeInOut"
    })
  }
};

export const backgroundRotate = {
  animate: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    opacity: [0.08, 0.15, 0.08],
    transition: getReducedMotionTransition({
      duration: 25,
      repeat: Infinity,
      ease: "linear"
    })
  }
};

// Optimized tab transitions
export const tabContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateY(30px) scale(0.95)'
  },
  visible: { 
    opacity: 1, 
    transform: 'translateY(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.4,
      ease: easings.smooth
    })
  },
  exit: { 
    opacity: 0, 
    transform: 'translateY(-30px) scale(0.95)',
    transition: getReducedMotionTransition({
      duration: 0.3,
      ease: easings.smooth
    })
  }
};

// Button animations
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    y: -2,
    transition: getReducedMotionTransition(transitions.fast)
  },
  tap: { scale: 0.95 }
};

// Modal animations
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateY(50px) scale(0.8)'
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.4,
      ease: easings.spring
    })
  },
  exit: {
    opacity: 0,
    transform: 'translateY(50px) scale(0.8)',
    transition: getReducedMotionTransition({
      duration: 0.3,
      ease: easings.gentle
    })
  }
};

// Card animations
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateY(40px) scale(0.95)'
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.5,
      ease: easings.smooth
    })
  }
};

export const cardHover = {
  whileHover: {
    transform: 'translateY(-8px) scale(1.02)',
    transition: getReducedMotionTransition({
      duration: 0.3,
      ease: easings.gentle
    })
  }
};

// List animations
export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateX(-20px) scale(0.95)'
  },
  visible: {
    opacity: 1,
    transform: 'translateX(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.4,
      ease: easings.gentle
    })
  }
};

// Page transition animations
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    transform: 'translateY(50px) scale(0.96)'
  },
  in: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: getReducedMotionTransition({
      duration: 0.6,
      ease: easings.smooth
    })
  },
  out: {
    opacity: 0,
    transform: 'translateY(-50px) scale(1.04)',
    transition: getReducedMotionTransition({
      duration: 0.4,
      ease: easings.gentle
    })
  }
};

// Utility functions for creating optimized animations
export const createOptimizedStagger = (
  staggerDelay: number = 0.08,
  childDelay: number = 0
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: childDelay
    }
  }
});

export const createOptimizedSlideIn = (
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 40,
  duration: number = 0.5
): Variants => {
  const getTransform = (isHidden: boolean) => {
    if (!isHidden) return 'translate(0px, 0px) scale(1)';
    
    switch (direction) {
      case 'left': return `translateX(-${distance}px) scale(0.95)`;
      case 'right': return `translateX(${distance}px) scale(0.95)`;
      case 'up': return `translateY(-${distance}px) scale(0.95)`;
      case 'down': return `translateY(${distance}px) scale(0.95)`;
    }
  };

  return {
    hidden: { 
      opacity: 0, 
      transform: getTransform(true)
    },
    visible: {
      opacity: 1,
      transform: getTransform(false),
      transition: getReducedMotionTransition({
        duration,
        ease: easings.smooth
      })
    }
  };
};

export const createOptimizedFadeIn = (
  duration: number = 0.5, 
  delay: number = 0
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: getReducedMotionTransition({
      duration,
      delay,
      ease: easings.gentle
    })
  }
});

// Progress bar optimized animation
export const createProgressAnimation = (progress: number): Target => ({
  scaleX: progress / 100,
  transition: getReducedMotionTransition({
    duration: 0.3,
    ease: easings.smooth
  })
});

// Skeleton shimmer animation (hardware accelerated)
export const shimmerVariants: Variants = {
  animate: {
    transform: ['translateX(-100%)', 'translateX(100%)'],
    transition: getReducedMotionTransition({
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    })
  }
};

// Loading dots animation
export const loadingDotsVariants = (index: number): Variants => ({
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: getReducedMotionTransition({
      duration: 0.6,
      repeat: Infinity,
      delay: index * 0.1,
      ease: 'easeInOut'
    })
  }
});

// Performance monitoring for animations
export const withPerformanceMonitoring = (
  variants: Variants,
  animationName: string
): Variants => {
  if (process.env.NODE_ENV === 'development') {
    const originalVisible = variants.visible;
    
    return {
      ...variants,
      visible: {
        ...originalVisible,
        transitionEnd: {
          // Log performance after animation completes
          onComplete: () => {
            console.log(`🎬 Animation "${animationName}" completed`);
          }
        }
      }
    };
  }
  
  return variants;
};

// Animation budget management
let activeAnimationCount = 0;
const MAX_CONCURRENT_ANIMATIONS = 6;

export const shouldAnimate = (animationId: string): boolean => {
  if (activeAnimationCount >= MAX_CONCURRENT_ANIMATIONS) {
    console.warn(`⚠️ Animation budget exceeded. Skipping: ${animationId}`);
    return false;
  }
  activeAnimationCount++;
  
  // Auto-cleanup after typical animation duration
  setTimeout(() => {
    activeAnimationCount = Math.max(0, activeAnimationCount - 1);
  }, 1000);
  
  return true;
};