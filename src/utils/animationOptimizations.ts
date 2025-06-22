// Animation performance optimizations and utilities
import { Variants, MotionProps, Target, Transition } from 'framer-motion';

// Hardware-accelerated animation variants
export const optimizedAnimations = {
  // Optimized scale animations (replaces width/height animations)
  scaleXProgress: (progress: number): Target => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }),

  scaleYProgress: (progress: number): Target => ({
    scaleY: progress / 100,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }),

  // Optimized position animations (replaces left/top/right/bottom)
  translateXProgress: (progress: number): Target => ({
    x: `${progress}%`,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }),

  translateYProgress: (progress: number): Target => ({
    y: `${progress}%`,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }),

  // Hardware-accelerated loading animations
  optimizedSpinner: {
    animate: {
      rotate: 360,
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
      repeatType: 'loop' as const
    }
  },

  // Optimized pulse animation
  optimizedPulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  // Optimized shimmer effect for skeletons
  optimizedShimmer: {
    animate: {
      x: ['-100%', '100%']
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Performance-optimized variants
export const performanceVariants: Record<string, Variants> = {
  // Optimized fade animations
  optimizedFade: {
    hidden: {
      opacity: 0,
      // Use transform instead of y position for better performance
      transform: 'translateY(20px)'
    },
    visible: {
      opacity: 1,
      transform: 'translateY(0px)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  },

  // Optimized scale animations
  optimizedScale: {
    hidden: {
      opacity: 0,
      transform: 'scale(0.95)'
    },
    visible: {
      opacity: 1,
      transform: 'scale(1)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  },

  // Optimized slide animations
  optimizedSlideLeft: {
    hidden: {
      opacity: 0,
      transform: 'translateX(-20px)'
    },
    visible: {
      opacity: 1,
      transform: 'translateX(0px)',
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  },

  optimizedSlideRight: {
    hidden: {
      opacity: 0,
      transform: 'translateX(20px)'
    },
    visible: {
      opacity: 1,
      transform: 'translateX(0px)',
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  },

  // Optimized stagger container
  optimizedStagger: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
};

// Animation performance monitoring
export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isMonitoring = false;

  static getInstance(): AnimationPerformanceMonitor {
    if (!AnimationPerformanceMonitor.instance) {
      AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
    }
    return AnimationPerformanceMonitor.instance;
  }

  startMonitoring(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.measureFPS();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private measureFPS(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Log performance warnings
      if (this.fps < 30) {
        console.warn(`⚠️ Low animation FPS detected: ${this.fps}fps`);
      }
    }

    requestAnimationFrame(() => this.measureFPS());
  }

  getFPS(): number {
    return this.fps;
  }
}

// Animation budget manager
export class AnimationBudgetManager {
  private static instance: AnimationBudgetManager;
  private activeAnimations = new Set<string>();
  private maxConcurrentAnimations = 6; // Conservative limit for mobile

  static getInstance(): AnimationBudgetManager {
    if (!AnimationBudgetManager.instance) {
      AnimationBudgetManager.instance = new AnimationBudgetManager();
    }
    return AnimationBudgetManager.instance;
  }

  registerAnimation(id: string): boolean {
    if (this.activeAnimations.size >= this.maxConcurrentAnimations) {
      console.warn(`⚠️ Animation budget exceeded. Skipping animation: ${id}`);
      return false;
    }
    this.activeAnimations.add(id);
    return true;
  }

  unregisterAnimation(id: string): void {
    this.activeAnimations.delete(id);
  }

  getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }

  setMaxConcurrentAnimations(max: number): void {
    this.maxConcurrentAnimations = max;
  }
}

// Reduced motion support
export const getReducedMotionPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimized motion props for reduced motion
export const getOptimizedMotionProps = (
  defaultProps: MotionProps,
  reducedMotionProps?: Partial<MotionProps>
): MotionProps => {
  const prefersReducedMotion = getReducedMotionPreference();
  
  if (prefersReducedMotion) {
    return {
      ...defaultProps,
      ...reducedMotionProps,
      // Disable animations for reduced motion
      initial: false,
      animate: defaultProps.animate ? { opacity: 1 } : false,
      transition: { duration: 0 }
    };
  }
  
  return defaultProps;
};

// Hardware acceleration hints
export const hardwareAccelStyles = {
  willChange: 'transform',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
  // Force hardware acceleration
  transform: 'translateZ(0)'
};

// Optimized transition presets
export const optimizedTransitions = {
  fast: {
    duration: 0.2,
    ease: 'easeOut'
  },
  medium: {
    duration: 0.3,
    ease: 'easeOut'
  },
  slow: {
    duration: 0.5,
    ease: 'easeOut'
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

// Page visibility API for pausing animations
export class AnimationPauseManager {
  private static instance: AnimationPauseManager;
  private pausedAnimations = new Set<() => void>();
  private resumedAnimations = new Set<() => void>();

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  static getInstance(): AnimationPauseManager {
    if (!AnimationPauseManager.instance) {
      AnimationPauseManager.instance = new AnimationPauseManager();
    }
    return AnimationPauseManager.instance;
  }

  registerAnimation(pauseCallback: () => void, resumeCallback: () => void): void {
    this.pausedAnimations.add(pauseCallback);
    this.resumedAnimations.add(resumeCallback);
  }

  unregisterAnimation(pauseCallback: () => void, resumeCallback: () => void): void {
    this.pausedAnimations.delete(pauseCallback);
    this.resumedAnimations.delete(resumeCallback);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, pause animations
      this.pausedAnimations.forEach(callback => callback());
    } else {
      // Page is visible, resume animations
      this.resumedAnimations.forEach(callback => callback());
    }
  }
}

// Animation DevTools (development only)
export const AnimationDevTools = {
  logPerformance: (animationName: string, startTime: number): void => {
    if (process.env.NODE_ENV === 'development') {
      const duration = performance.now() - startTime;
      console.log(`🎬 Animation "${animationName}" took ${duration.toFixed(2)}ms`);
    }
  },

  warnExpensiveAnimation: (animationName: string, properties: string[]): void => {
    if (process.env.NODE_ENV === 'development') {
      const expensiveProps = properties.filter(prop => 
        ['width', 'height', 'left', 'top', 'right', 'bottom', 'margin', 'padding'].includes(prop)
      );
      
      if (expensiveProps.length > 0) {
        console.warn(
          `⚠️ Animation "${animationName}" uses expensive properties: ${expensiveProps.join(', ')}\n` +
          'Consider using transform properties instead for better performance.'
        );
      }
    }
  }
};