import { Variants } from 'framer-motion';

// Container variants for staggered animations
export const containerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: "easeIn"
    }
  }
};

// Item variants for individual elements
export const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: "easeOut" 
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3
    }
  }
};

// Slide variants for page transitions
export const slideVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3
    }
  }
};

// Scale variants for modal/popup animations
export const scaleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

// Fade variants for simple opacity animations
export const fadeVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Card variants for hoverable elements
export const cardVariants: Variants = {
  rest: { 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

// Button variants for interactive elements
export const buttonVariants: Variants = {
  rest: { 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

// Success/error animation variants
export const statusVariants: Variants = {
  success: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  },
  error: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

// Loading/shimmer variants
export const loadingVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: "easeIn"
    }
  }
};

// Utility function to get transition preset
export const getTransition = (
  type: 'spring' | 'tween' | 'bounce' = 'spring',
  duration = 0.3
) => {
  const transitions = {
    spring: {
      type: "spring",
      stiffness: 300,
      damping: 20
    },
    tween: {
      duration,
      ease: "easeOut"
    },
    bounce: {
      type: "spring",
      stiffness: 500,
      damping: 15,
      bounce: 0.4
    }
  };

  return transitions[type];
};