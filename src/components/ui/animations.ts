// src/components/ui/animations.ts
import { Variants } from 'framer-motion';

// Common easing curves
export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  spring: [0.6, -0.05, 0.01, 0.99],
  bounce: [0.68, -0.55, 0.265, 1.55],
  gentle: [0.25, 0.1, 0.25, 1],
} as const;

// Base animation variants
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: easings.smooth,
      type: "spring",
      stiffness: 100
    }
  }
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -40, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: easings.smooth,
      type: "spring",
      stiffness: 100
    }
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: easings.gentle }
  }
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -60, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: easings.smooth,
      type: "spring",
      stiffness: 80
    }
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: easings.smooth,
      type: "spring",
      stiffness: 80
    }
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easings.spring
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easings.gentle
    }
  }
};

// Loading animations
export const loadingVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Hover animations
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.95 }
};

export const hoverLift = {
  whileHover: { 
    y: -4,
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  whileTap: { y: 0, scale: 0.98 }
};

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 10px 40px rgba(16, 185, 129, 0.2)",
    transition: { duration: 0.3 }
  }
};

// Special effect animations
export const glowEffect = {
  initial: { boxShadow: "0 0 0 rgba(255, 149, 0, 0)" },
  animate: {
    boxShadow: [
      "0 0 20px rgba(255, 149, 0, 0.3)",
      "0 0 40px rgba(255, 149, 0, 0.1)",
      "0 0 20px rgba(255, 149, 0, 0.3)"
    ],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};

export const pulseEffect = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const floatEffect = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Tab transition animations
export const tabContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easings.smooth
    }
  },
  exit: { 
    opacity: 0, 
    y: -30, 
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
};

// Background animations
export const backgroundFloat = {
  animate: {
    x: [0, 120, 0],
    y: [0, -60, 0],
    scale: [1, 1.3, 1],
    opacity: [0.15, 0.35, 0.15],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const backgroundRotate = {
  animate: {
    rotate: [0, 360],
    scale: [1, 1.3, 1],
    opacity: [0.08, 0.2, 0.08],
    transition: {
      duration: 25,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Button animations
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    y: -2,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 }
};

// Modal animations
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50 
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.spring
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.3,
      ease: easings.gentle
    }
  }
};

// Card animations
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easings.smooth
    }
  }
};

export const cardHover = {
  whileHover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: { duration: 0.3, ease: easings.gentle }
  }
};

// List animations
export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easings.gentle
    }
  }
};

// Navigation animations
export const navVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easings.gentle
    }
  }
};

// Page transition animations
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 50,
    scale: 0.96 
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: easings.smooth
    }
  },
  out: {
    opacity: 0,
    y: -50,
    scale: 1.04,
    transition: {
      duration: 0.4,
      ease: easings.gentle
    }
  }
};

// Utility functions for creating dynamic animations
export const createStaggered = (
  children: number, 
  staggerDelay: number = 0.1,
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

export const createSlideIn = (
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 40,
  duration: number = 0.6
): Variants => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -distance, y: 0 };
      case 'right': return { x: distance, y: 0 };
      case 'up': return { x: 0, y: -distance };
      case 'down': return { x: 0, y: distance };
    }
  };

  const initial = getInitialPosition();

  return {
    hidden: { 
      opacity: 0, 
      ...initial,
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: easings.smooth
      }
    }
  };
};

export const createFadeIn = (duration: number = 0.6, delay: number = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration,
      delay,
      ease: easings.gentle
    }
  }
});