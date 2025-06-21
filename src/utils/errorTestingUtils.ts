// Development-only error testing utilities
// This file should only be used in development for testing error handling

import { AppError, ErrorType } from './errorHandling';
import { toast } from 'react-hot-toast';

export const ERROR_TESTING = {
  // Simulate different types of errors
  simulateNetworkError: () => {
    const error = new AppError(
      ErrorType.NETWORK_ERROR,
      'Simulated network failure',
      'Please check your internet connection and try again.',
      { retryable: true }
    );
    return error;
  },

  simulateAuthError: () => {
    const error = new AppError(
      ErrorType.AUTHENTICATION_ERROR,
      'Simulated authentication failure',
      'Your session has expired. Please log in again.',
      { recoverable: false }
    );
    return error;
  },

  simulateValidationError: () => {
    const error = new AppError(
      ErrorType.VALIDATION_ERROR,
      'Simulated validation failure',
      'Please check your input and try again.',
      { 
        details: {
          phone: 'Phone number is required',
          address: 'Address must be at least 10 characters'
        }
      }
    );
    return error;
  },

  simulateServerError: () => {
    const error = new AppError(
      ErrorType.SERVER_ERROR,
      'Simulated server error',
      'Something went wrong on our end. Please try again later.',
      { retryable: true }
    );
    return error;
  },

  simulateLocationError: () => {
    const error = new AppError(
      ErrorType.LOCATION_ERROR,
      'Simulated location error',
      'Please enable location access to use this feature.',
      { code: 'PERMISSION_DENIED', recoverable: true }
    );
    return error;
  },

  simulateWebSocketError: () => {
    const error = new AppError(
      ErrorType.WEBSOCKET_ERROR,
      'Simulated WebSocket error',
      'Connection lost. Attempting to reconnect...',
      { retryable: true, recoverable: true }
    );
    return error;
  },

  // Test different error UI components
  testErrorToast: (errorType: ErrorType = ErrorType.NETWORK_ERROR) => {
    const errors = {
      [ErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet.',
      [ErrorType.AUTHENTICATION_ERROR]: 'Your session has expired. Please log in again.',
      [ErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorType.SERVER_ERROR]: 'Server error occurred. Please try again later.',
      [ErrorType.LOCATION_ERROR]: 'Location access required for this feature.',
      [ErrorType.WEBSOCKET_ERROR]: 'Connection lost. Attempting to reconnect...',
      [ErrorType.PERMISSION_ERROR]: 'You do not have permission for this action.',
      [ErrorType.NOT_FOUND_ERROR]: 'The requested item could not be found.',
      [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred.'
    };

    toast.error(errors[errorType], {
      duration: 8000,
    });
  },

  // Simulate API response errors
  mockApiErrorResponse: (status: number) => {
    return {
      response: {
        status,
        data: {
          message: `Simulated ${status} error`,
          detail: `This is a test ${status} error response`
        }
      },
      message: `HTTP ${status} Error`,
      status
    };
  },

  // Test error boundary
  triggerErrorBoundary: () => {
    // This will throw an error that should be caught by ErrorBoundary
    throw new Error('Simulated component error for testing ErrorBoundary');
  },

  // Test form errors
  simulateFormErrors: () => {
    return {
      phone: 'Phone number is required',
      email: 'Please enter a valid email address',
      password: 'Password must be at least 8 characters',
      confirmPassword: 'Passwords do not match'
    };
  }
};

// Global testing functions for browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testErrors = ERROR_TESTING;
  
  console.log(`
🧪 Error Testing Utils Loaded!

Available in browser console:
- testErrors.simulateNetworkError()
- testErrors.simulateAuthError()
- testErrors.simulateValidationError()
- testErrors.simulateServerError()
- testErrors.simulateLocationError()
- testErrors.simulateWebSocketError()
- testErrors.testErrorToast('NETWORK_ERROR')
- testErrors.triggerErrorBoundary()
- testErrors.mockApiErrorResponse(500)

Example usage:
  testErrors.testErrorToast('AUTHENTICATION_ERROR')
  testErrors.simulateNetworkError()
  `);
}