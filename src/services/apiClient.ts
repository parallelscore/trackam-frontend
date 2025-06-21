// src/services/apiClient.ts
import axios, { 
    AxiosInstance, 
    AxiosRequestConfig, 
    AxiosResponse, 
    AxiosError,
    InternalAxiosRequestConfig 
} from 'axios';
import { createErrorFromApiError, logError } from '@/utils/errorHandling';
import { SecureStorage } from '@/utils/secureStorage';
import { TokenRefreshService } from './tokenRefreshService';
import { SecurityEventMonitor } from './securityEventMonitor';

// API Configuration
interface ApiConfig {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    enableLogging: boolean;
}

// Response wrapper interface
interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    statusCode?: number;
}

// Request retry configuration
interface RetryConfig {
    retries: number;
    retryDelay: number;
    retryCondition?: (error: AxiosError) => boolean;
}

// Logger utility
class ApiLogger {
    private static isDevelopment = import.meta.env.DEV;

    static logRequest(config: InternalAxiosRequestConfig): void {
        if (!this.isDevelopment) return;

        console.group(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Request Config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data,
            params: config.params,
        });
        console.groupEnd();
    }

    static logResponse(response: AxiosResponse): void {
        if (!this.isDevelopment) return;

        console.group(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log('Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
        });
        console.groupEnd();
    }

    static logError(error: AxiosError): void {
        if (!this.isDevelopment) return;

        const { config, response } = error;
        console.group(`❌ ${response?.status || 'Network Error'} ${config?.method?.toUpperCase()} ${config?.url}`);
        console.error('Error Details:', {
            message: error.message,
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
            config: {
                url: config?.url,
                method: config?.method,
                data: config?.data,
                headers: config?.headers,
            },
        });
        console.groupEnd();
    }

    static logRetry(error: AxiosError, retryCount: number, maxRetries: number): void {
        if (!this.isDevelopment) return;

        console.warn(`🔄 Retry ${retryCount}/${maxRetries} for ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    }
}

// API Error class
export class ApiError extends Error {
    public statusCode?: number;
    public data?: unknown;

    constructor(message: string, statusCode?: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.data = data;
    }
}

// Centralized API Client
export class ApiClient {
    private client: AxiosInstance;
    private config: ApiConfig;

    constructor(config: Partial<ApiConfig> = {}) {
        this.config = {
            baseURL: this.determineApiUrl(),
            timeout: 30000, // 30 seconds
            retryAttempts: 3,
            retryDelay: 1000, // 1 second
            enableLogging: import.meta.env.DEV,
            ...config,
        };

        this.client = this.createAxiosInstance();
        this.setupInterceptors();
    }

    private determineApiUrl(): string {
        // Use environment variable if available
        if (import.meta.env.VITE_API_URL) {
            return import.meta.env.VITE_API_URL;
        }

        // Dynamic URL determination for local development
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `http://${hostname}:8000/api/v1`;
        }
        return 'http://localhost:8000/api/v1';
    }

    private createAxiosInstance(): AxiosInstance {
        return axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    private setupInterceptors(): void {
        // Request interceptors
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                // Skip security enhancements for OTP and authentication endpoints
                const isAuthEndpoint = config.url?.includes('/register/') || 
                                      config.url?.includes('/login/') ||
                                      config.url?.includes('/request-otp') ||
                                      config.url?.includes('/verify-otp');

                // Check and refresh token if needed (but skip for auth endpoints)
                if (!isAuthEndpoint) {
                    try {
                        await TokenRefreshService.checkAndRefreshToken();
                    } catch (error) {
                        console.warn('ApiClient: Token refresh check failed', error);
                    }
                }

                // Add authentication token using secure storage (but skip for auth endpoints)
                if (!isAuthEndpoint) {
                    const token = SecureStorage.getAccessToken();
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }

                // Add CSRF token for state-changing requests (but skip for auth endpoints)
                if (!isAuthEndpoint) {
                    const csrfToken = SecureStorage.getCsrfToken();
                    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
                        config.headers['X-CSRF-Token'] = csrfToken;
                    }
                }

                // Add session ID for tracking (but skip for auth endpoints)
                if (!isAuthEndpoint) {
                    const sessionId = SecureStorage.getSessionId();
                    if (sessionId && config.headers) {
                        config.headers['X-Session-ID'] = sessionId;
                    }
                }

                // Add request ID for tracking
                config.metadata = { 
                    ...config.metadata, 
                    requestId: this.generateRequestId(),
                    startTime: Date.now(),
                };

                // Log request in development
                if (this.config.enableLogging) {
                    ApiLogger.logRequest(config);
                }

                return config;
            },
            (error: AxiosError) => {
                if (this.config.enableLogging) {
                    ApiLogger.logError(error);
                }
                return Promise.reject(error);
            }
        );

        // Response interceptors
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                // Calculate request duration
                const startTime = response.config.metadata?.startTime;
                if (startTime) {
                    const duration = Date.now() - startTime;
                    response.config.metadata = { 
                        ...response.config.metadata, 
                        duration 
                    };
                }

                // Log response in development
                if (this.config.enableLogging) {
                    ApiLogger.logResponse(response);
                }

                return response;
            },
            async (error: AxiosError) => {
                // Log error in development
                if (this.config.enableLogging) {
                    ApiLogger.logError(error);
                }

                // Report security events based on response status
                this.reportSecurityEvents(error);

                // Handle token expiration
                if (error.response?.status === 401) {
                    this.handleTokenExpiration();
                }

                // Implement retry logic
                return this.handleRetry(error);
            }
        );
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    private reportSecurityEvents(error: AxiosError): void {
        const securityMonitor = SecurityEventMonitor.getInstance();
        const { config, response } = error;

        // Report rate limiting events
        if (response?.status === 429) {
            securityMonitor.reportEvent(
                'rate_limit_exceeded',
                {
                    url: config?.url,
                    method: config?.method,
                    status: response.status,
                    headers: response.headers,
                },
                'ApiClient'
            );
        }

        // Report forbidden access (potential authorization issues)
        if (response?.status === 403) {
            securityMonitor.reportEvent(
                'suspicious_activity',
                {
                    url: config?.url,
                    method: config?.method,
                    status: response.status,
                    reason: 'forbidden_access',
                },
                'ApiClient'
            );
        }

        // Report potential CSRF attacks
        if (response?.status === 403 && response.data?.error?.includes('CSRF')) {
            securityMonitor.reportEvent(
                'csrf_attack',
                {
                    url: config?.url,
                    method: config?.method,
                    error: response.data?.error,
                },
                'ApiClient'
            );
        }

        // Report potential token replay attacks (multiple 401s in short time)
        if (response?.status === 401) {
            const recentEvents = securityMonitor.getSecurityStats().recentEvents.filter(
                event => event.type === 'token_replay' && Date.now() - event.timestamp < 60000
            );
            
            if (recentEvents.length >= 2) {
                securityMonitor.reportEvent(
                    'token_replay',
                    {
                        url: config?.url,
                        consecutiveAttempts: recentEvents.length + 1,
                    },
                    'ApiClient'
                );
            }
        }
    }

    private handleTokenExpiration(): void {
        console.log('ApiClient: Handling 401 - attempting token refresh before logout');
        
        // Try to refresh token first
        TokenRefreshService.refreshToken().then(success => {
            if (!success) {
                // Token refresh failed, clear all authentication data
                SecureStorage.clearTokenData();
                
                // Also clear legacy storage for backward compatibility
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');

                // Emit token expiration event
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:token-expired', {
                        detail: { reason: 'refresh_failed_401' }
                    }));
                }
            }
        }).catch(error => {
            console.error('ApiClient: Token refresh failed on 401', error);
            
            // Clear all authentication data
            SecureStorage.clearTokenData();
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');

            // Emit token expiration event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:token-expired', {
                    detail: { reason: 'refresh_error_401', error: error.message }
                }));
            }
        });
    }

    private async handleRetry(error: AxiosError): Promise<unknown> {
        const config = error.config as InternalAxiosRequestConfig & { 
            __retryCount?: number;
            __retryDelay?: number;
        };

        // Don't retry if no config or retry is disabled
        if (!config || config.__retryCount === undefined) {
            config.__retryCount = 0;
        }

        const shouldRetry = this.shouldRetry(error, config.__retryCount);

        if (shouldRetry && config.__retryCount < this.config.retryAttempts) {
            config.__retryCount += 1;
            
            // Log retry attempt
            if (this.config.enableLogging) {
                ApiLogger.logRetry(error, config.__retryCount, this.config.retryAttempts);
            }

            // Calculate delay with exponential backoff
            const delay = this.calculateRetryDelay(config.__retryCount);
            
            // Wait before retry
            await this.delay(delay);

            // Retry the request
            return this.client(config);
        }

        return Promise.reject(error);
    }

    private shouldRetry(error: AxiosError, retryCount: number): boolean {
        // Don't retry if we've exceeded max attempts
        if (retryCount >= this.config.retryAttempts) {
            return false;
        }

        // Don't retry for certain status codes
        const nonRetryableStatuses = [400, 401, 403, 404, 422];
        if (error.response && nonRetryableStatuses.includes(error.response.status)) {
            return false;
        }

        // Retry for network errors and 5xx server errors
        return (
            !error.response || // Network error
            error.response.status >= 500 || // Server error
            error.code === 'ECONNABORTED' || // Timeout
            error.code === 'ERR_NETWORK' // Network error
        );
    }

    private calculateRetryDelay(retryCount: number): number {
        // Exponential backoff with jitter
        const exponentialDelay = this.config.retryDelay * Math.pow(2, retryCount - 1);
        const jitter = Math.random() * 1000; // Add up to 1 second of jitter
        return Math.min(exponentialDelay + jitter, 10000); // Cap at 10 seconds
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Wrapper methods with standardized error handling
    async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.get<T>(url, config);
            return {
                success: true,
                data: response.data,
                statusCode: response.status,
            };
        } catch (error) {
            return this.handleError(error as AxiosError);
        }
    }

    async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.post<T>(url, data, config);
            return {
                success: true,
                data: response.data,
                statusCode: response.status,
            };
        } catch (error) {
            return this.handleError(error as AxiosError);
        }
    }

    async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.put<T>(url, data, config);
            return {
                success: true,
                data: response.data,
                statusCode: response.status,
            };
        } catch (error) {
            return this.handleError(error as AxiosError);
        }
    }

    async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.patch<T>(url, data, config);
            return {
                success: true,
                data: response.data,
                statusCode: response.status,
            };
        } catch (error) {
            return this.handleError(error as AxiosError);
        }
    }

    async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.delete<T>(url, config);
            return {
                success: true,
                data: response.data,
                statusCode: response.status,
            };
        } catch (error) {
            return this.handleError(error as AxiosError);
        }
    }

    private handleError(error: AxiosError): ApiResponse {
        const appError = createErrorFromApiError(error);
        logError(appError, 'ApiClient');

        return {
            success: false,
            error: appError.userMessage,
            message: appError.message,
            statusCode: error.response?.status,
            data: error.response?.data,
        };
    }

    // Utility methods
    setAuthToken(token: string): void {
        try {
            // Extract expiry and user info from JWT token
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresAt = payload.exp ? payload.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000);
            const userId = payload.sub || payload.user_id || payload.id;

            // Store token using SecureStorage for consistency with request interceptor
            const tokenData = {
                accessToken: token,
                expiresAt,
                issuedAt: payload.iat ? payload.iat * 1000 : Date.now(), // Use current time if iat not present
                userId,
            };
            SecureStorage.setTokenData(tokenData);
            
            // Also keep legacy localStorage for backward compatibility during transition
            localStorage.setItem('token', token);
        } catch (error) {
            console.warn('ApiClient: Failed to parse JWT token, using fallback storage', error);
            // Fallback to simple storage if JWT parsing fails
            const tokenData = {
                accessToken: token,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours default
                issuedAt: Date.now(),
            };
            SecureStorage.setTokenData(tokenData);
            localStorage.setItem('token', token);
        }
    }

    clearAuthToken(): void {
        // Clear from both SecureStorage and legacy localStorage
        SecureStorage.clearTokenData();
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
    }

    getBaseURL(): string {
        return this.config.baseURL;
    }

    // Get raw axios instance for advanced use cases
    getRawClient(): AxiosInstance {
        return this.client;
    }
}

// Create default client instances
export const apiClient = new ApiClient();

// Create public client (no auth token)
export const publicApiClient = new ApiClient();

// Override the request interceptor for public client to not add auth token
publicApiClient.getRawClient().interceptors.request.clear();
publicApiClient.getRawClient().interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add request tracking metadata
        config.metadata = { 
            ...config.metadata, 
            requestId: Math.random().toString(36).substring(2, 15),
            startTime: Date.now(),
        };

        // Log request in development
        if (import.meta.env.DEV) {
            ApiLogger.logRequest(config);
        }

        return config;
    },
    (error: AxiosError) => {
        if (import.meta.env.DEV) {
            ApiLogger.logError(error);
        }
        return Promise.reject(error);
    }
);

// Export types for use in services
export type { ApiResponse, ApiConfig, RetryConfig };