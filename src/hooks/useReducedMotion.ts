import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference
 * Respects system-level accessibility settings
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Handle changes to the preference
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook to get optimized animation configuration based on reduced motion preference
 */
export const useOptimizedAnimation = () => {
  const prefersReducedMotion = useReducedMotion();

  const getAnimationProps = (
    normalProps: any,
    reducedProps?: any
  ) => {
    if (prefersReducedMotion) {
      return {
        ...normalProps,
        ...reducedProps,
        // Minimal animation for accessibility
        transition: { duration: 0.01 },
        // Keep essential animations but make them instant
        animate: reducedProps?.animate || { opacity: 1 }
      };
    }
    
    return normalProps;
  };

  const getTransition = (normalTransition: any) => {
    if (prefersReducedMotion) {
      return { duration: 0.01 };
    }
    
    return normalTransition;
  };

  return {
    prefersReducedMotion,
    getAnimationProps,
    getTransition
  };
};