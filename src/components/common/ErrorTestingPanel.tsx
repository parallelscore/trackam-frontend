import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bug, Zap } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { ErrorFallback } from './ErrorFallback';
import { AppError, ErrorType } from '@/utils/errorHandling';
import { ERROR_TESTING } from '@/utils/errorTestingUtils';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Only show in development
const isDevelopment = process.env.NODE_ENV === 'development';

export const ErrorTestingPanel: React.FC = () => {
  const [currentError, setCurrentError] = useState<AppError | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const { handleError } = useErrorHandler();

  if (!isDevelopment) {
    return null;
  }

  const testScenarios = [
    {
      label: 'Network Error',
      type: ErrorType.NETWORK_ERROR,
      action: () => setCurrentError(ERROR_TESTING.simulateNetworkError()),
      color: 'orange'
    },
    {
      label: 'Auth Error',
      type: ErrorType.AUTHENTICATION_ERROR,
      action: () => setCurrentError(ERROR_TESTING.simulateAuthError()),
      color: 'red'
    },
    {
      label: 'Validation Error',
      type: ErrorType.VALIDATION_ERROR,
      action: () => setCurrentError(ERROR_TESTING.simulateValidationError()),
      color: 'yellow'
    },
    {
      label: 'Server Error',
      type: ErrorType.SERVER_ERROR,
      action: () => setCurrentError(ERROR_TESTING.simulateServerError()),
      color: 'red'
    },
    {
      label: 'Location Error',
      type: ErrorType.LOCATION_ERROR,
      action: () => setCurrentError(ERROR_TESTING.simulateLocationError()),
      color: 'blue'
    },
    {
      label: 'WebSocket Error',
      type: ErrorType.WEBSOCKET_ERROR,
      action: () => setCurrentError(ERROR_TESTING.simulateWebSocketError()),
      color: 'purple'
    }
  ];

  const testToastErrors = () => {
    Object.values(ErrorType).forEach((errorType, index) => {
      setTimeout(() => {
        ERROR_TESTING.testErrorToast(errorType);
      }, index * 1000);
    });
  };

  const testErrorBoundary = () => {
    try {
      ERROR_TESTING.triggerErrorBoundary();
    } catch (error) {
      handleError(error, 'ErrorTestingPanel');
    }
  };

  const testApiErrors = () => {
    const statusCodes = [400, 401, 403, 404, 422, 500, 502, 503];
    statusCodes.forEach((status, index) => {
      setTimeout(() => {
        const mockError = ERROR_TESTING.mockApiErrorResponse(status);
        handleError(mockError, `API-${status}`);
      }, index * 800);
    });
  };

  return (
    <Card className="m-4 border-dashed border-2 border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Bug className="w-5 h-5" />
          Error Testing Panel
          <Badge variant="outline" className="text-xs">DEV ONLY</Badge>
        </CardTitle>
        <CardDescription className="text-orange-600">
          Test different error scenarios and UI components
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Error Message Component Testing */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-orange-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Error Message Component
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {testScenarios.map((scenario) => (
              <Button
                key={scenario.label}
                variant="outline"
                size="sm"
                onClick={scenario.action}
                className="text-xs"
              >
                {scenario.label}
              </Button>
            ))}
          </div>

          {currentError && (
            <ErrorMessage
              error={currentError}
              onRetry={() => console.log('Retry clicked')}
              onDismiss={() => setCurrentError(null)}
              showActions={true}
            />
          )}
        </div>

        {/* Error Fallback Component Testing */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-orange-700">Error Fallback Component</h4>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFallback(!showFallback)}
            >
              {showFallback ? 'Hide' : 'Show'} Fallback
            </Button>
          </div>

          {showFallback && currentError && (
            <ErrorFallback
              error={currentError}
              onRetry={() => console.log('Fallback retry clicked')}
              onGoBack={() => console.log('Go back clicked')}
              onGoHome={() => console.log('Go home clicked')}
              size="md"
            />
          )}
        </div>

        {/* Toast & System Error Testing */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-orange-700 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            System Error Testing
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testToastErrors}
              className="text-xs"
            >
              Test All Toast Errors
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testErrorBoundary}
              className="text-xs"
            >
              Test Error Boundary
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testApiErrors}
              className="text-xs"
            >
              Test API Errors
            </Button>
          </div>
        </div>

        {/* Console Commands */}
        <div className="space-y-2 p-3 bg-gray-100 rounded-md">
          <h5 className="font-medium text-xs text-gray-700">Browser Console Commands:</h5>
          <div className="text-xs text-gray-600 font-mono space-y-1">
            <div>• <code>testErrors.simulateNetworkError()</code></div>
            <div>• <code>testErrors.testErrorToast('AUTHENTICATION_ERROR')</code></div>
            <div>• <code>testErrors.mockApiErrorResponse(500)</code></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};