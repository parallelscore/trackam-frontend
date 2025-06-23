// Production Error Handlers
// Defensive coding patterns to prevent common production errors

import React from 'react';

// Safe DOM manipulation utilities
export const safeGetElement = (id: string): HTMLElement | null => {
  try {
    return document.getElementById(id);
  } catch (error) {
    console.warn('Error getting element:', id, error);
    return null;
  }
};

export const safeQuerySelector = (selector: string): Element | null => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn('Error querying selector:', selector, error);
    return null;
  }
};

// Safe style manipulation
export const safeSetStyle = (
  element: HTMLElement | null,
  property: string,
  value: string
): boolean => {
  try {
    if (!element || !element.style) {
      console.warn('Invalid element for style setting:', element);
      return false;
    }
    element.style.setProperty(property, value);
    return true;
  } catch (error) {
    console.warn('Error setting style:', property, value, error);
    return false;
  }
};

// Safe React hooks wrapper - simplified for production
export const safeUseLayoutEffect = React.useLayoutEffect || React.useEffect || (() => {});

// Safe async operation wrapper
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = 'Async operation failed'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn(errorMessage, error);
    return fallback;
  }
};

// Safe JSON operations
export const safeJSONParse = <T>(
  jsonString: string,
  fallback: T
): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return fallback;
  }
};

export const safeJSONStringify = (
  object: any,
  fallback = '{}'
): string => {
  try {
    return JSON.stringify(object);
  } catch (error) {
    console.warn('JSON stringify error:', error);
    return fallback;
  }
};

// Safe local storage operations
export const safeLocalStorageGet = (
  key: string,
  fallback: string | null = null
): string | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('LocalStorage get error:', error);
    return fallback;
  }
};

export const safeLocalStorageSet = (
  key: string,
  value: string
): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('LocalStorage set error:', error);
    return false;
  }
};

// Safe event listener management
export const safeAddEventListener = (
  element: EventTarget | null,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): boolean => {
  try {
    if (!element || typeof element.addEventListener !== 'function') {
      console.warn('Invalid element for event listener:', element);
      return false;
    }
    element.addEventListener(event, handler, options);
    return true;
  } catch (error) {
    console.warn('Error adding event listener:', error);
    return false;
  }
};

export const safeRemoveEventListener = (
  element: EventTarget | null,
  event: string,
  handler: EventListener,
  options?: boolean | EventListenerOptions
): boolean => {
  try {
    if (!element || typeof element.removeEventListener !== 'function') {
      return false;
    }
    element.removeEventListener(event, handler, options);
    return true;
  } catch (error) {
    console.warn('Error removing event listener:', error);
    return false;
  }
};

// Global error handler setup
export const setupProductionErrorHandlers = (): void => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent the default browser error handling
    event.preventDefault();
  };

  // Handle runtime errors
  const handleError = (event: ErrorEvent) => {
    console.error('Runtime error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  };

  // Add global error handlers
  safeAddEventListener(window, 'unhandledrejection', handleUnhandledRejection);
  safeAddEventListener(window, 'error', handleError);

  // React error boundary fallback
  if (typeof window !== 'undefined') {
    (window as any).__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = undefined;
  }
};

// Safe component rendering wrapper
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{ error?: Error }>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.error('Component rendering error:', error);
      if (fallbackComponent) {
        return React.createElement(fallbackComponent, { error: error as Error });
      }
      return React.createElement('div', null, 'Something went wrong');
    }
  };

  return WrappedComponent;
};

// Environment detection
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Browser feature detection
export const getBrowserCapabilities = () => {
  if (typeof window === 'undefined') {
    return {
      serviceWorker: false,
      indexedDB: false,
      localStorage: false,
      sessionStorage: false,
      webGL: false,
      geolocation: false
    };
  }

  return {
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    localStorage: 'localStorage' in window && window.localStorage !== null,
    sessionStorage: 'sessionStorage' in window && window.sessionStorage !== null,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    })(),
    geolocation: 'geolocation' in navigator
  };
};

// Performance monitoring helpers
export const performanceLogger = {
  mark: (name: string): void => {
    try {
      if (performance && performance.mark) {
        performance.mark(name);
      }
    } catch (error) {
      // Silently fail if performance API is not available
    }
  },

  measure: (name: string, startMark: string, endMark: string): void => {
    try {
      if (performance && performance.measure) {
        performance.measure(name, startMark, endMark);
      }
    } catch (error) {
      // Silently fail if performance API is not available
    }
  }
};

export default {
  safeGetElement,
  safeQuerySelector,
  safeSetStyle,
  safeUseLayoutEffect,
  safeAsync,
  safeJSONParse,
  safeJSONStringify,
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeAddEventListener,
  safeRemoveEventListener,
  setupProductionErrorHandlers,
  withErrorBoundary,
  isProduction,
  isDevelopment,
  getBrowserCapabilities,
  performanceLogger
};