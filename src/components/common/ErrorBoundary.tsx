import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppError, ErrorType, logError } from '@/utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
  showRetry?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: AppError | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = new AppError(
      ErrorType.UNKNOWN_ERROR,
      error.message,
      'Something went wrong while loading this section.',
      {
        details: {
          stack: error.stack,
          name: error.name,
        },
        recoverable: true,
        retryable: true,
      }
    );

    return {
      hasError: true,
      error: appError,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { error: appError } = this.state;

    if (appError) {
      appError.details = {
        ...appError.details,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
      };

      logError(appError, 'ErrorBoundary');
      onError?.(appError);
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorId: null,
      });
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, showRetry = true, level = 'component' } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      return this.renderErrorUI(error, level, showRetry);
    }

    return children;
  }

  private renderErrorUI(error: AppError, level: string, showRetry: boolean) {
    const canRetry = showRetry && this.retryCount < this.maxRetries && error.retryable;

    if (level === 'critical') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Application Error</CardTitle>
              <CardDescription>
                The application encountered a critical error and cannot continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {error.userMessage}
              </div>
              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (level === 'page') {
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Page Error</CardTitle>
              <CardDescription>
                This page encountered an error and couldn't load properly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm bg-muted p-3 rounded-md">
                {error.userMessage}
              </div>
              <div className="flex gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Component level error
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 m-2">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-destructive">
              Component Error
            </div>
            <div className="text-sm text-muted-foreground">
              {error.userMessage}
            </div>
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="h-8"
              >
                <RefreshCw className="w-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};