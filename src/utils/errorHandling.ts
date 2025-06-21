export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  LOCATION_ERROR = 'LOCATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  userMessage: string;
  code?: string | number;
  details?: Record<string, unknown>;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
}

export class AppError implements ErrorDetails {
  type: ErrorType;
  message: string;
  userMessage: string;
  code?: string | number;
  details?: Record<string, unknown>;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    options: {
      code?: string | number;
      details?: Record<string, unknown>;
      recoverable?: boolean;
      retryable?: boolean;
    } = {}
  ) {
    this.type = type;
    this.message = message;
    this.userMessage = userMessage;
    this.code = options.code;
    this.details = options.details;
    this.timestamp = new Date();
    this.recoverable = options.recoverable ?? true;
    this.retryable = options.retryable ?? false;
  }
}

export const createErrorFromApiError = (error: unknown): AppError => {
  const errorObj = error as Record<string, unknown>;
  
  if (errorObj.name === 'NetworkError' || errorObj.code === 'NETWORK_ERROR') {
    return new AppError(
      ErrorType.NETWORK_ERROR,
      (errorObj.message as string) || 'Network connection failed',
      'Please check your internet connection and try again.',
      { code: errorObj.code, retryable: true }
    );
  }

  const status = errorObj.status as number;
  
  if (status === 401 || errorObj.code === 'AUTHENTICATION_ERROR') {
    return new AppError(
      ErrorType.AUTHENTICATION_ERROR,
      (errorObj.message as string) || 'Authentication failed',
      'Your session has expired. Please log in again.',
      { code: status || errorObj.code, recoverable: false }
    );
  }

  if (status === 403) {
    return new AppError(
      ErrorType.PERMISSION_ERROR,
      (errorObj.message as string) || 'Permission denied',
      'You do not have permission to perform this action.',
      { code: status, recoverable: false }
    );
  }

  if (status === 404) {
    return new AppError(
      ErrorType.NOT_FOUND_ERROR,
      (errorObj.message as string) || 'Resource not found',
      'The requested item could not be found.',
      { code: status, recoverable: false }
    );
  }

  if (status >= 500) {
    return new AppError(
      ErrorType.SERVER_ERROR,
      (errorObj.message as string) || 'Server error occurred',
      'Something went wrong on our end. Please try again later.',
      { code: status, retryable: true }
    );
  }

  if (status >= 400 && status < 500) {
    return new AppError(
      ErrorType.VALIDATION_ERROR,
      (errorObj.message as string) || 'Validation failed',
      (errorObj.userMessage as string) || 'Please check your input and try again.',
      { code: status, details: errorObj.details as Record<string, unknown> }
    );
  }

  return new AppError(
    ErrorType.UNKNOWN_ERROR,
    (errorObj.message as string) || 'An unexpected error occurred',
    'Something went wrong. Please try again.',
    { code: errorObj.code, retryable: true }
  );
};

export const createLocationError = (error: GeolocationPositionError): AppError => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new AppError(
        ErrorType.LOCATION_ERROR,
        'Location permission denied',
        'Please enable location access to use this feature.',
        { code: 'PERMISSION_DENIED', recoverable: true }
      );
    case error.POSITION_UNAVAILABLE:
      return new AppError(
        ErrorType.LOCATION_ERROR,
        'Location unavailable',
        'Your location could not be determined. Please try again.',
        { code: 'POSITION_UNAVAILABLE', retryable: true }
      );
    case error.TIMEOUT:
      return new AppError(
        ErrorType.LOCATION_ERROR,
        'Location timeout',
        'Location request timed out. Please try again.',
        { code: 'TIMEOUT', retryable: true }
      );
    default:
      return new AppError(
        ErrorType.LOCATION_ERROR,
        'Location error',
        'Unable to get your location. Please try again.',
        { code: error.code, retryable: true }
      );
  }
};

export const createWebSocketError = (error: Event | Error): AppError => {
  return new AppError(
    ErrorType.WEBSOCKET_ERROR,
    error instanceof Error ? error.message : 'WebSocket connection failed',
    'Connection lost. Attempting to reconnect...',
    { retryable: true, recoverable: true }
  );
};

export const getErrorRecoveryActions = (error: AppError): string[] => {
  const actions: string[] = [];

  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      actions.push('Check your internet connection');
      actions.push('Try again in a few moments');
      break;
    case ErrorType.AUTHENTICATION_ERROR:
      actions.push('Log in again');
      break;
    case ErrorType.PERMISSION_ERROR:
      actions.push('Contact support if you believe this is an error');
      break;
    case ErrorType.LOCATION_ERROR:
      if (error.code === 'PERMISSION_DENIED') {
        actions.push('Enable location access in your browser settings');
        actions.push('Reload the page after enabling location');
      } else {
        actions.push('Try again');
        actions.push('Check that location services are enabled');
      }
      break;
    case ErrorType.WEBSOCKET_ERROR:
      actions.push('Check your internet connection');
      actions.push('The connection will be restored automatically');
      break;
    case ErrorType.SERVER_ERROR:
      actions.push('Try again in a few minutes');
      actions.push('Contact support if the problem persists');
      break;
    default:
      actions.push('Try again');
      actions.push('Contact support if the problem continues');
  }

  return actions;
};

export const shouldRetryError = (error: AppError, retryCount: number = 0): boolean => {
  if (!error.retryable || retryCount >= 3) {
    return false;
  }

  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
    case ErrorType.SERVER_ERROR:
    case ErrorType.WEBSOCKET_ERROR:
      return retryCount < 3;
    case ErrorType.LOCATION_ERROR:
      return error.code !== 'PERMISSION_DENIED' && retryCount < 2;
    default:
      return false;
  }
};

export const getRetryDelay = (retryCount: number): number => {
  const baseDelay = 1000;
  const maxDelay = 10000;
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
};

export const logError = (error: AppError, context?: string): void => {
  const logData = {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    code: error.code,
    details: error.details,
    timestamp: error.timestamp,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('AppError:', logData);
  }

  // TODO: Implement error reporting service integration
  // errorReportingService.report(logData);
};