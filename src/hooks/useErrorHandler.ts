import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  AppError, 
  ErrorType, 
  createErrorFromApiError, 
  createLocationError, 
  createWebSocketError,
  shouldRetryError,
  getRetryDelay,
  logError 
} from '@/utils/errorHandling';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logErrors?: boolean;
  onError?: (error: AppError) => void;
  maxRetries?: number;
}

interface ErrorHandlerReturn {
  error: AppError | null;
  isRetrying: boolean;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => AppError;
  handleApiError: (error: unknown, context?: string) => AppError;
  handleLocationError: (error: GeolocationPositionError, context?: string) => AppError;
  handleWebSocketError: (error: Event | Error, context?: string) => AppError;
  retryWithBackoff: (fn: () => Promise<void>, error: AppError) => Promise<void>;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}): ErrorHandlerReturn => {
  const {
    showToast = true,
    logErrors = true,
    onError,
    maxRetries = 3
  } = options;

  const [error, setError] = useState<AppError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processError = useCallback((appError: AppError, context?: string) => {
    if (logErrors) {
      logError(appError, context);
    }

    if (showToast) {
      toast.error(appError.userMessage, {
        id: `error-${appError.type}-${Date.now()}`,
        duration: appError.type === ErrorType.NETWORK_ERROR ? 8000 : 5000,
      });
    }

    setError(appError);
    onError?.(appError);

    return appError;
  }, [showToast, logErrors, onError]);

  const handleError = useCallback((error: unknown, context?: string): AppError => {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error && typeof error === 'object' && 'response' in error) {
      appError = createErrorFromApiError(error);
    } else if (error instanceof Error) {
      appError = new AppError(
        ErrorType.UNKNOWN_ERROR,
        error.message,
        'An unexpected error occurred. Please try again.',
        { retryable: true }
      );
    } else {
      appError = new AppError(
        ErrorType.UNKNOWN_ERROR,
        String(error),
        'An unexpected error occurred. Please try again.',
        { retryable: true }
      );
    }

    return processError(appError, context);
  }, [processError]);

  const handleApiError = useCallback((error: unknown, context?: string): AppError => {
    const appError = createErrorFromApiError(error);
    return processError(appError, context);
  }, [processError]);

  const handleLocationError = useCallback((error: GeolocationPositionError, context?: string): AppError => {
    const appError = createLocationError(error);
    return processError(appError, context);
  }, [processError]);

  const handleWebSocketError = useCallback((error: Event | Error, context?: string): AppError => {
    const appError = createWebSocketError(error);
    return processError(appError, context);
  }, [processError]);

  const retryWithBackoff = useCallback(async (fn: () => Promise<void>, error: AppError) => {
    let retryCount = 0;
    
    const executeWithRetry = async (): Promise<void> => {
      if (!shouldRetryError(error, retryCount) || retryCount >= maxRetries) {
        throw error;
      }

      setIsRetrying(true);
      
      try {
        const delay = getRetryDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        await fn();
        clearError();
      } catch (retryError) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          setIsRetrying(false);
          throw retryError;
        }
        
        return executeWithRetry();
      } finally {
        setIsRetrying(false);
      }
    };

    return executeWithRetry();
  }, [maxRetries, clearError]);

  return {
    error,
    isRetrying,
    clearError,
    handleError,
    handleApiError,
    handleLocationError,
    handleWebSocketError,
    retryWithBackoff,
  };
};

export const useFormErrorHandler = () => {
  const { handleError, error, clearError } = useErrorHandler({
    showToast: false, // Don't show toast for form errors, display inline instead
  });

  const handleFormError = useCallback((formError: unknown, field?: string) => {
    const appError = handleError(formError, `FormError-${field || 'unknown'}`);
    
    if (appError.type === ErrorType.VALIDATION_ERROR && appError.details) {
      return appError.details;
    }
    
    return { [field || 'form']: appError.userMessage };
  }, [handleError]);

  return {
    error,
    clearError,
    handleFormError,
  };
};

export const useAsyncErrorHandler = () => {
  const { handleError, error, clearError, isRetrying, retryWithBackoff } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      context?: string;
      showToast?: boolean;
      enableRetry?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { context, enableRetry = false } = options;
    
    setIsLoading(true);
    clearError();

    try {
      const result = await asyncFn();
      setIsLoading(false);
      return result;
    } catch (error) {
      const appError = handleError(error, context);
      
      if (enableRetry && appError.retryable) {
        try {
          await retryWithBackoff(async () => {
            await asyncFn();
          }, appError);
          
          const retryResult = await asyncFn();
          setIsLoading(false);
          return retryResult;
        } catch {
          setIsLoading(false);
          return null;
        }
      }
      
      setIsLoading(false);
      return null;
    }
  }, [handleError, clearError, retryWithBackoff]);

  return {
    executeAsync,
    error,
    isLoading,
    isRetrying,
    clearError,
  };
};