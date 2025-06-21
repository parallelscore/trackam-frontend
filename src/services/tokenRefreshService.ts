/**
 * Token Refresh Service
 * Handles automatic token refresh and manages refresh token rotation
 */

import { SecureStorage } from '@/utils/secureStorage';
import { AppError, ErrorType, logError } from '@/utils/errorHandling';
import { INIT_DELAYS } from '@/config/securityConfig';

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface RefreshTokenRequest {
  refresh_token: string;
  grant_type: 'refresh_token';
  client_id?: string;
}

/**
 * Token refresh service configuration
 */
const REFRESH_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  REFRESH_ENDPOINT: '/auth/refresh',
  CONCURRENT_REFRESH_PROTECTION: true,
  AUTO_REFRESH_ENABLED: true,
} as const;

/**
 * Token refresh service class
 */
export class TokenRefreshService {
  private static refreshPromise: Promise<boolean> | null = null;
  private static isRefreshing = false;
  private static failedRefreshCount = 0;
  private static lastRefreshAttempt = 0;

  /**
   * Attempt to refresh the access token using refresh token
   */
  static async refreshToken(): Promise<boolean> {
    // Prevent concurrent refresh attempts
    if (REFRESH_CONFIG.CONCURRENT_REFRESH_PROTECTION && this.refreshPromise) {
      console.log('TokenRefreshService: Concurrent refresh detected, waiting for existing refresh');
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      this.refreshPromise = null;
      return result;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Internal method to perform token refresh
   */
  private static async performTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('TokenRefreshService: Already refreshing, skipping');
      return false;
    }

    this.isRefreshing = true;
    this.lastRefreshAttempt = Date.now();

    try {
      // Get current refresh token
      const refreshToken = SecureStorage.getRefreshToken();
      if (!refreshToken) {
        console.log('TokenRefreshService: No refresh token available');
        this.handleRefreshFailure('No refresh token available');
        return false;
      }

      // Check rate limiting
      if (this.failedRefreshCount >= REFRESH_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.log('TokenRefreshService: Maximum refresh attempts exceeded');
        this.handleRefreshFailure('Maximum refresh attempts exceeded');
        return false;
      }

      console.log('TokenRefreshService: Attempting token refresh');

      // Prepare refresh request
      const refreshData: RefreshTokenRequest = {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };

      // Make refresh request
      const response = await this.makeRefreshRequest(refreshData);
      
      if (response.access_token) {
        // Store new tokens
        const expiresAt = Date.now() + (response.expires_in * 1000);
        const tokenData = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token || refreshToken, // Use new refresh token or keep existing
          expiresAt,
          issuedAt: Date.now(),
          userId: SecureStorage.getTokenData()?.userId,
        };

        const stored = SecureStorage.setTokenData(tokenData);
        if (stored) {
          console.log('TokenRefreshService: Token refresh successful');
          this.resetFailureCount();
          
          // Dispatch refresh success event
          window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
            detail: { newToken: response.access_token }
          }));
          
          return true;
        } else {
          console.error('TokenRefreshService: Failed to store refreshed token');
          return false;
        }
      } else {
        console.error('TokenRefreshService: Invalid refresh response');
        this.handleRefreshFailure('Invalid refresh response');
        return false;
      }

    } catch (error) {
      console.error('TokenRefreshService: Refresh failed', error);
      this.handleRefreshFailure(error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Make the actual refresh request to the server
   */
  private static async makeRefreshRequest(refreshData: RefreshTokenRequest): Promise<RefreshResponse> {
    const apiUrl = this.getApiUrl();
    const refreshUrl = `${apiUrl}${REFRESH_CONFIG.REFRESH_ENDPOINT}`;

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(refreshData),
      credentials: 'include', // Include cookies for CSRF protection
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Ignore JSON parsing errors
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.access_token || !data.expires_in) {
      throw new Error('Invalid refresh response structure');
    }

    return data;
  }

  /**
   * Handle refresh failure scenarios
   */
  private static handleRefreshFailure(reason: string): void {
    this.failedRefreshCount++;
    
    const appError = new AppError(
      ErrorType.AUTHENTICATION_ERROR,
      `Token refresh failed: ${reason}`,
      'Your session has expired. Please log in again.',
      { 
        code: 'REFRESH_FAILED',
        details: { 
          reason, 
          attemptCount: this.failedRefreshCount,
          lastAttempt: this.lastRefreshAttempt 
        }
      }
    );

    logError(appError, 'TokenRefreshService');

    // Clear tokens if max attempts exceeded
    if (this.failedRefreshCount >= REFRESH_CONFIG.MAX_RETRY_ATTEMPTS) {
      console.log('TokenRefreshService: Clearing tokens due to failed refresh attempts');
      SecureStorage.clearTokenData();
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:refresh-failed', {
        detail: { reason, attemptCount: this.failedRefreshCount }
      }));
    }
  }

  /**
   * Reset failure count on successful refresh
   */
  private static resetFailureCount(): void {
    this.failedRefreshCount = 0;
  }

  /**
   * Check if token needs refresh and attempt automatic refresh
   */
  static async checkAndRefreshToken(): Promise<boolean> {
    if (!REFRESH_CONFIG.AUTO_REFRESH_ENABLED) {
      return true;
    }

    // Check if we have a valid token
    if (!SecureStorage.isAuthenticated()) {
      return false;
    }

    // Check if token needs refresh
    if (SecureStorage.needsTokenRefresh()) {
      console.log('TokenRefreshService: Token needs refresh, attempting automatic refresh');
      return await this.refreshToken();
    }

    return true;
  }

  /**
   * Get API URL for refresh requests
   */
  private static getApiUrl(): string {
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

  /**
   * Schedule automatic token refresh before expiry
   */
  static scheduleTokenRefresh(): void {
    if (!REFRESH_CONFIG.AUTO_REFRESH_ENABLED) {
      return;
    }

    const tokenData = SecureStorage.getTokenData();
    if (!tokenData) return;

    const timeUntilRefresh = tokenData.expiresAt - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry
    
    if (timeUntilRefresh > 0) {
      console.log(`TokenRefreshService: Scheduling token refresh in ${Math.round(timeUntilRefresh / 1000)} seconds`);
      
      setTimeout(async () => {
        try {
          await this.checkAndRefreshToken();
          // Schedule next refresh
          this.scheduleTokenRefresh();
        } catch (error) {
          console.error('TokenRefreshService: Scheduled refresh failed', error);
        }
      }, timeUntilRefresh);
    } else {
      // Token is already expired or about to expire, refresh immediately
      this.checkAndRefreshToken().then(() => {
        this.scheduleTokenRefresh();
      });
    }
  }

  /**
   * Manual token refresh (for user-initiated refresh)
   */
  static async forceRefresh(): Promise<boolean> {
    console.log('TokenRefreshService: Force refresh requested');
    return await this.refreshToken();
  }

  /**
   * Get refresh service status
   */
  static getRefreshStatus(): {
    isRefreshing: boolean;
    failedAttempts: number;
    lastAttempt: number;
    needsRefresh: boolean;
    autoRefreshEnabled: boolean;
  } {
    return {
      isRefreshing: this.isRefreshing,
      failedAttempts: this.failedRefreshCount,
      lastAttempt: this.lastRefreshAttempt,
      needsRefresh: SecureStorage.needsTokenRefresh(),
      autoRefreshEnabled: REFRESH_CONFIG.AUTO_REFRESH_ENABLED,
    };
  }

  /**
   * Enable or disable automatic refresh
   */
  static setAutoRefresh(enabled: boolean): void {
    (REFRESH_CONFIG as { AUTO_REFRESH_ENABLED: boolean }).AUTO_REFRESH_ENABLED = enabled;
    
    if (enabled) {
      this.scheduleTokenRefresh();
    }
  }

  /**
   * Reset refresh service state (for testing)
   */
  static reset(): void {
    this.refreshPromise = null;
    this.isRefreshing = false;
    this.failedRefreshCount = 0;
    this.lastRefreshAttempt = 0;
  }
}

// Initialize token refresh service (lazy initialization)
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking app startup
  setTimeout(() => {
    try {
      // Schedule initial token refresh check
      TokenRefreshService.scheduleTokenRefresh();
      
      // Add to window for debugging in development
      if (process.env.NODE_ENV === 'development') {
        (window as Record<string, unknown>).TokenRefreshService = TokenRefreshService;
        console.log('🔄 TokenRefreshService: Debug utilities available at window.TokenRefreshService');
      }
    } catch (error) {
      console.error('TokenRefreshService: Failed to initialize', error);
    }
  }, INIT_DELAYS.tokenRefresh); // Configurable delay
}