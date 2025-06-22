/**
 * Secure Storage Utility for Authentication Tokens
 * Provides secure token storage with fallbacks and encryption
 */

// Interface for token storage
interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  issuedAt: number;
  userId?: string;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'trackam_access_token',
  REFRESH_TOKEN: 'trackam_refresh_token',
  TOKEN_EXPIRY: 'trackam_token_expiry',
  USER_ID: 'trackam_user_id',
  SESSION_ID: 'trackam_session_id',
  CSRF_TOKEN: 'trackam_csrf_token',
} as const;

// Security configuration
const SECURITY_CONFIG = {
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes buffer before expiry
  MAX_STORAGE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days maximum token age
  ENCRYPTION_ENABLED: false, // Set to true when encryption key is available
  SECURE_ONLY: window.location.protocol === 'https:',
} as const;

/**
 * Simple XOR encryption for localStorage (not cryptographically secure)
 * This is a basic obfuscation to prevent casual token exposure
 * In production, use proper encryption or HTTP-only cookies
 */
class SimpleEncryption {
  private static key = 'TrackAmSecure2024'; // In production, use environment variable

  static encrypt(text: string): string {
    if (!SECURITY_CONFIG.ENCRYPTION_ENABLED) return text;
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
      );
    }
    return btoa(result);
  }

  static decrypt(encoded: string): string {
    if (!SECURITY_CONFIG.ENCRYPTION_ENABLED) return encoded;
    
    try {
      const text = atob(encoded);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
        );
      }
      return result;
    } catch {
      return '';
    }
  }
}

/**
 * Token validation utilities
 */
export class TokenValidator {
  /**
   * Validate JWT token structure and expiry
   */
  static isValidJWT(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Validate header
      JSON.parse(atob(parts[0]));
      // Validate payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Check required fields (exp is required, iat is optional)
      if (!payload.exp) return false;
      
      // Check if token is expired (with buffer)
      const now = Date.now();
      const expiryTime = payload.exp * 1000;
      
      return expiryTime > (now + SECURITY_CONFIG.TOKEN_EXPIRY_BUFFER);
    } catch {
      return false;
    }
  }

  /**
   * Extract payload from JWT token
   */
  static getTokenPayload(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(token: string): number | null {
    const payload = this.getTokenPayload(token);
    return payload?.exp ? payload.exp * 1000 : null;
  }

  /**
   * Check if token needs refresh (within buffer time)
   */
  static needsRefresh(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return true;
    
    const now = Date.now();
    const bufferTime = SECURITY_CONFIG.TOKEN_EXPIRY_BUFFER * 2; // Double buffer for refresh
    
    return expiry <= (now + bufferTime);
  }
}

/**
 * Secure storage class for authentication tokens
 */
export class SecureStorage {
  // Circuit breaker to prevent infinite logout loops
  private static logoutInProgress = false;
  private static logoutTimeoutId: NodeJS.Timeout | null = null;
  /**
   * Check if storage is available and secure
   */
  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Store token data securely
   */
  static setTokenData(tokenData: TokenData): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('SecureStorage: localStorage not available');
      return false;
    }

    try {
      // Validate token before storing
      if (!TokenValidator.isValidJWT(tokenData.accessToken)) {
        console.warn('SecureStorage: Invalid JWT token');
        return false;
      }

      // Store access token
      const encryptedToken = SimpleEncryption.encrypt(tokenData.accessToken);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, encryptedToken);

      // Store refresh token if provided
      if (tokenData.refreshToken) {
        const encryptedRefreshToken = SimpleEncryption.encrypt(tokenData.refreshToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, encryptedRefreshToken);
      }

      // Store expiry and metadata
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, tokenData.expiresAt.toString());
      localStorage.setItem(STORAGE_KEYS.USER_ID, tokenData.userId || '');
      
      // Generate session ID for this session
      const sessionId = this.generateSessionId();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);

      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to store token data', error);
      return false;
    }
  }

  /**
   * Retrieve access token
   */
  static getAccessToken(): string | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const encryptedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!encryptedToken) return null;

      const token = SimpleEncryption.decrypt(encryptedToken);
      
      // Validate token on retrieval
      if (!TokenValidator.isValidJWT(token)) {
        this.clearTokenData();
        return null;
      }

      return token;
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve access token', error);
      this.clearTokenData();
      return null;
    }
  }

  /**
   * Retrieve refresh token
   */
  static getRefreshToken(): string | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const encryptedToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!encryptedToken) return null;

      return SimpleEncryption.decrypt(encryptedToken);
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve refresh token', error);
      return null;
    }
  }

  /**
   * Get complete token data
   */
  static getTokenData(): TokenData | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;

    const refreshToken = this.getRefreshToken();
    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt: expiryStr ? parseInt(expiryStr, 10) : 0,
      issuedAt: Date.now(),
      userId: userId || undefined,
    };
  }

  /**
   * Check if user is authenticated with valid token
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && TokenValidator.isValidJWT(token);
  }

  /**
   * Check if token needs refresh
   */
  static needsTokenRefresh(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    return TokenValidator.needsRefresh(token);
  }

  /**
   * Clear all token data
   */
  static clearTokenData(): void {
    if (!this.isStorageAvailable()) return;

    // Circuit breaker: prevent multiple simultaneous logout operations
    if (this.logoutInProgress) {
      console.warn('SecureStorage: Logout already in progress, skipping');
      return;
    }

    this.logoutInProgress = true;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear legacy keys for backward compatibility
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      
      // Dispatch custom event for logout
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'token_cleared' }
      }));
    } catch (error) {
      console.error('SecureStorage: Failed to clear token data', error);
    } finally {
      // Reset the circuit breaker after a delay to allow for proper cleanup
      if (this.logoutTimeoutId) {
        clearTimeout(this.logoutTimeoutId);
      }
      this.logoutTimeoutId = setTimeout(() => {
        this.logoutInProgress = false;
      }, 1000); // 1 second delay before allowing another logout
    }
  }

  /**
   * Update access token (for refresh scenarios)
   */
  static updateAccessToken(newToken: string): boolean {
    if (!TokenValidator.isValidJWT(newToken)) {
      console.warn('SecureStorage: Attempted to store invalid token');
      return false;
    }

    try {
      const encryptedToken = SimpleEncryption.encrypt(newToken);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, encryptedToken);
      
      // Update expiry
      const expiry = TokenValidator.getTokenExpiry(newToken);
      if (expiry) {
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
      }

      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to update access token', error);
      return false;
    }
  }

  /**
   * Generate secure session ID
   */
  private static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `${timestamp}_${randomPart}`;
  }

  /**
   * Get current session ID
   */
  static getSessionId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  }

  /**
   * Store CSRF token
   */
  static setCsrfToken(token: string): void {
    if (this.isStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, token);
    }
  }

  /**
   * Get CSRF token
   */
  static getCsrfToken(): string | null {
    return this.isStorageAvailable() ? localStorage.getItem(STORAGE_KEYS.CSRF_TOKEN) : null;
  }

  /**
   * Cleanup expired or invalid tokens
   */
  static cleanup(): void {
    if (!this.isStorageAvailable()) return;

    const tokenData = this.getTokenData();
    if (!tokenData) return;

    // Check if token is too old
    const tokenAge = Date.now() - tokenData.issuedAt;
    if (tokenAge > SECURITY_CONFIG.MAX_STORAGE_AGE) {
      console.log('SecureStorage: Clearing expired token data');
      this.clearTokenData();
      return;
    }

    // Validate current token
    if (!TokenValidator.isValidJWT(tokenData.accessToken)) {
      console.log('SecureStorage: Clearing invalid token data');
      this.clearTokenData();
    }
  }

  /**
   * Get storage debugging info (for development)
   */
  static getStorageInfo(): Record<string, unknown> | null {
    if (process.env.NODE_ENV !== 'development') return null;

    const tokenData = this.getTokenData();
    if (!tokenData) return { authenticated: false };

    const payload = TokenValidator.getTokenPayload(tokenData.accessToken);
    
    return {
      authenticated: true,
      hasRefreshToken: !!tokenData.refreshToken,
      expiresAt: new Date(tokenData.expiresAt),
      issuedAt: new Date(payload?.iat * 1000),
      userId: tokenData.userId,
      sessionId: this.getSessionId(),
      needsRefresh: this.needsTokenRefresh(),
      timeUntilExpiry: tokenData.expiresAt - Date.now(),
    };
  }
}

// Initialize storage cleanup on load
if (typeof window !== 'undefined') {
  // Run cleanup on page load
  setTimeout(() => SecureStorage.cleanup(), 100);
  
  // Run cleanup periodically (every 5 minutes)
  setInterval(() => SecureStorage.cleanup(), 5 * 60 * 1000);
  
  // Add storage debugging to window in development
  if (process.env.NODE_ENV === 'development') {
    (window as Record<string, unknown>).SecureStorage = SecureStorage;
    console.log('🔐 SecureStorage: Debug utilities available at window.SecureStorage');
  }
}