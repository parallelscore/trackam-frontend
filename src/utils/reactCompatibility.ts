// React 19 Compatibility Layer
// Ensures compatibility with third-party libraries that may not be React 19 ready

import React from 'react';

// Polyfill for React hooks that might be missing in some environments
export const ensureReactCompatibility = (): void => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  try {
    // Ensure useLayoutEffect exists (fallback to useEffect)
    if (!React.useLayoutEffect) {
      console.warn('useLayoutEffect not available, using useEffect fallback');
      (React as any).useLayoutEffect = React.useEffect;
    }

    // Ensure useDeferredValue exists (fallback to identity function)
    if (!React.useDeferredValue) {
      console.warn('useDeferredValue not available, using identity fallback');
      (React as any).useDeferredValue = (value: any) => value;
    }

    // Ensure useTransition exists (fallback to no-op)
    if (!React.useTransition) {
      console.warn('useTransition not available, using no-op fallback');
      (React as any).useTransition = () => [false, (fn: () => void) => fn()];
    }

    // Ensure useId exists (fallback to random ID)
    if (!React.useId) {
      console.warn('useId not available, using random ID fallback');
      let idCounter = 0;
      (React as any).useId = () => `react-id-${++idCounter}`;
    }

    // Ensure useSyncExternalStore exists (fallback using useEffect)
    if (!React.useSyncExternalStore) {
      console.warn('useSyncExternalStore not available, using useEffect fallback');
      (React as any).useSyncExternalStore = (
        subscribe: (callback: () => void) => () => void,
        getSnapshot: () => any,
        getServerSnapshot?: () => any
      ) => {
        const [state, setState] = React.useState(getSnapshot);

        React.useEffect(() => {
          const unsubscribe = subscribe(() => {
            setState(getSnapshot());
          });
          return unsubscribe;
        }, [subscribe, getSnapshot]);

        return state;
      };
    }

    // Ensure useInsertionEffect exists (fallback to useLayoutEffect)
    if (!React.useInsertionEffect) {
      console.warn('useInsertionEffect not available, using useLayoutEffect fallback');
      (React as any).useInsertionEffect = React.useLayoutEffect || React.useEffect;
    }

  } catch (error) {
    console.error('Error setting up React compatibility:', error);
  }
};

// Safe React import wrapper
export const getSafeReact = () => {
  try {
    return React;
  } catch (error) {
    console.error('Error importing React:', error);
    // Return a minimal React-like object to prevent crashes
    return {
      useEffect: () => {},
      useState: () => [null, () => {}],
      useCallback: (fn: any) => fn,
      useMemo: (fn: any) => fn(),
      useRef: () => ({ current: null }),
      createElement: () => null,
      Fragment: 'div'
    };
  }
};

// Vendor library compatibility checks
export const checkVendorCompatibility = (): void => {
  if (typeof window === 'undefined') return;

  // Check for common library compatibility issues
  const checks = [
    {
      name: 'Framer Motion',
      check: () => typeof window !== 'undefined' && 'requestAnimationFrame' in window,
      fix: () => {
        if (!window.requestAnimationFrame) {
          (window as any).requestAnimationFrame = (callback: FrameRequestCallback) => 
            setTimeout(callback, 16);
        }
      }
    },
    {
      name: 'React Router',
      check: () => typeof window !== 'undefined' && 'history' in window,
      fix: () => {
        // React Router compatibility is usually handled internally
      }
    },
    {
      name: 'Socket.IO',
      check: () => typeof window !== 'undefined' && 'WebSocket' in window,
      fix: () => {
        // WebSocket fallbacks are handled by Socket.IO
      }
    }
  ];

  checks.forEach(({ name, check, fix }) => {
    if (!check()) {
      console.warn(`${name} compatibility issue detected, applying fix`);
      try {
        fix();
      } catch (error) {
        console.error(`Failed to fix ${name} compatibility:`, error);
      }
    }
  });
};

// Error boundary for vendor library errors
export const VendorErrorBoundary: React.FC<{ 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check if error is from vendor libraries
      if (event.filename && (
        event.filename.includes('node_modules') ||
        event.filename.includes('vendors-') ||
        event.message.includes('useLayoutEffect')
      )) {
        console.warn('Vendor library error caught:', event.error);
        setHasError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return React.createElement(React.Fragment, null, fallback || 'Loading...');
  }

  return React.createElement(React.Fragment, null, children);
};

// Initialize all compatibility layers
export const initializeCompatibility = (): void => {
  ensureReactCompatibility();
  checkVendorCompatibility();
};

export default {
  ensureReactCompatibility,
  getSafeReact,
  checkVendorCompatibility,
  VendorErrorBoundary,
  initializeCompatibility
};