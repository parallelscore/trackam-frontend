// src/utils/performanceAnimations.ts
import { Variants, Transition } from 'framer-motion';

// Optimized animation variants with reduced complexity
export const optimizedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export const optimizedSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] // Cubic bezier for better performance
    }
  }
};

export const optimizedSlideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const optimizedScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Optimized stagger container with reduced children animation delay
export const optimizedStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Reduced from 0.1
      delayChildren: 0.1 // Reduced from 0.2
    }
  }
};

// Simple item variant for stagger
export const optimizedStaggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Performance-first hover animations
export const optimizedHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" }
};

export const optimizedTap = {
  scale: 0.98,
  transition: { duration: 0.1, ease: "easeOut" }
};

// Reduced motion variants for accessibility
export const reducedMotionFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1 }
  }
};

// Page transition optimizations
export const optimizedPageTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1]
};

export const optimizedPageVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

// Utility function to check if user prefers reduced motion
export const useReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get appropriate variants based on user preference
export const getMotionVariants = (normalVariants: Variants, reducedVariants: Variants) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion ? reducedVariants : normalVariants;
};

// Performance optimized spring configs
export const fastSpring = {
  type: "spring" as const,
  damping: 30,
  stiffness: 300
};

export const smoothSpring = {
  type: "spring" as const,
  damping: 25,
  stiffness: 200
};

export const slowSpring = {
  type: "spring" as const,
  damping: 20,
  stiffness: 100
};