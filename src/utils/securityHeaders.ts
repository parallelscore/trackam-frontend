/**
 * Security Headers and CSRF Protection Utilities
 * Provides client-side security measures and CSRF token management
 */

import { SecureStorage } from './secureStorage';

/**
 * Security configuration
 */
const SECURITY_CONFIG = {
  CSRF_TOKEN_HEADER: 'X-CSRF-Token',
  CSRF_TOKEN_META: 'csrf-token',
  CSRF_TOKEN_COOKIE: '_csrf',
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4173',
    // Add production domains here
  ],
  TRUSTED_SCHEMES: ['http:', 'https:'],
  MAX_CSRF_AGE: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * CSRF Token Manager
 */
export class CSRFProtection {
  private static tokenCache: string | null = null;
  private static tokenExpiry: number = 0;

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = new Uint8Array(16);
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randomBytes);
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < randomBytes.length; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }
    
    const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('');
    return `${timestamp}_${randomString}`;
  }

  /**
   * Get current CSRF token (from cache, storage, or generate new)
   */
  static getToken(): string {
    const now = Date.now();
    
    // Check cache first
    if (this.tokenCache && this.tokenExpiry > now) {
      return this.tokenCache;
    }

    // Check secure storage
    const storedToken = SecureStorage.getCsrfToken();
    if (storedToken && this.isValidToken(storedToken)) {
      this.tokenCache = storedToken;
      this.tokenExpiry = now + SECURITY_CONFIG.MAX_CSRF_AGE;
      return storedToken;
    }

    // Check meta tag (set by server)
    const metaToken = this.getTokenFromMeta();
    if (metaToken && this.isValidToken(metaToken)) {
      this.setToken(metaToken);
      return metaToken;
    }

    // Check cookie (set by server)
    const cookieToken = this.getTokenFromCookie();
    if (cookieToken && this.isValidToken(cookieToken)) {
      this.setToken(cookieToken);
      return cookieToken;
    }

    // Generate new token as last resort
    const newToken = this.generateToken();
    this.setToken(newToken);
    return newToken;
  }

  /**
   * Set CSRF token in storage and cache
   */
  static setToken(token: string): void {
    if (!token || !this.isValidToken(token)) {
      console.warn('CSRFProtection: Invalid token provided');
      return;
    }

    this.tokenCache = token;
    this.tokenExpiry = Date.now() + SECURITY_CONFIG.MAX_CSRF_AGE;
    SecureStorage.setCsrfToken(token);
  }

  /**
   * Clear CSRF token
   */
  static clearToken(): void {
    this.tokenCache = null;
    this.tokenExpiry = 0;
    SecureStorage.setCsrfToken('');
  }

  /**
   * Validate CSRF token format
   */
  static isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Check basic format (timestamp_randomstring)
    const parts = token.split('_');
    if (parts.length < 2) return false;
    
    // Check if timestamp is reasonable (not too old)
    const timestamp = parseInt(parts[0], 36);
    if (isNaN(timestamp)) return false;
    
    const age = Date.now() - timestamp;
    return age >= 0 && age <= SECURITY_CONFIG.MAX_CSRF_AGE;
  }

  /**
   * Get CSRF token from meta tag
   */
  private static getTokenFromMeta(): string | null {
    if (typeof document === 'undefined') return null;
    
    const metaTag = document.querySelector(`meta[name="${SECURITY_CONFIG.CSRF_TOKEN_META}"]`);
    return metaTag ? metaTag.getAttribute('content') : null;
  }

  /**
   * Get CSRF token from cookie
   */
  private static getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === SECURITY_CONFIG.CSRF_TOKEN_COOKIE) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Verify request is from allowed origin
   */
  static isValidOrigin(origin: string): boolean {
    if (!origin) return false;
    
    try {
      const url = new URL(origin);
      
      // Check scheme
      if (!SECURITY_CONFIG.TRUSTED_SCHEMES.includes(url.protocol)) {
        return false;
      }
      
      // For development, allow localhost
      if (process.env.NODE_ENV === 'development') {
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          return true;
        }
      }
      
      // Check against allowed origins
      return SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin);
    } catch {
      return false;
    }
  }

  /**
   * Get CSRF headers for requests
   */
  static getHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      [SECURITY_CONFIG.CSRF_TOKEN_HEADER]: token,
    };
  }
}

/**
 * Content Security Policy utilities
 */
export class CSPManager {
  /**
   * Set CSP meta tag (for inline scripts/styles)
   */
  static setMetaCSP(policy: string): void {
    if (typeof document === 'undefined') return;
    
    let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.httpEquiv = 'Content-Security-Policy';
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = policy;
  }

  /**
   * Generate nonce for inline scripts
   */
  static generateNonce(): string {
    const randomBytes = new Uint8Array(16);
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < randomBytes.length; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }
    
    return btoa(String.fromCharCode(...randomBytes));
  }

  /**
   * Default CSP policy for TrackAm application
   */
  static getDefaultPolicy(): string {
    const nonce = this.generateNonce();
    
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' http://localhost:* https:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      `script-src-attr 'nonce-${nonce}'`,
    ].join('; ');
  }
}

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize for use in JavaScript context
   */
  static sanitizeJS(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeURL(input: string): string | null {
    if (typeof input !== 'string') return null;
    
    try {
      const url = new URL(input);
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(url.protocol)) {
        return null;
      }
      
      return url.toString();
    } catch {
      return null;
    }
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhoneNumber(input: string): string {
    if (typeof input !== 'string') return '';
    
    // Remove all non-digit characters except +
    return input.replace(/[^\d+]/g, '');
  }

  /**
   * Sanitize tracking ID input
   */
  static sanitizeTrackingId(input: string): string {
    if (typeof input !== 'string') return '';
    
    // Allow only alphanumeric characters and common separators
    return input.replace(/[^a-zA-Z0-9\-_]/g, '').toUpperCase();
  }
}

/**
 * Rate limiting utilities (client-side)
 */
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();

  /**
   * Check if request is within rate limit
   */
  static checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    // Check if we're at the limit
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  static getRemainingRequests(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    return Math.max(0, maxRequests - validRequests.length);
  }

  /**
   * Clear rate limit for a key
   */
  static clearLimit(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Cleanup old entries
   */
  static cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

/**
 * Security event logger
 */
export class SecurityLogger {
  /**
   * Log security event
   */
  static logEvent(eventType: string, details: Record<string, unknown>): void {
    const event = {
      type: 'security_event',
      eventType,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      details,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event);
    }

    // TODO: Send to security monitoring service in production
    // securityService.logEvent(event);
  }

  /**
   * Log authentication event
   */
  static logAuthEvent(action: string, success: boolean, details?: Record<string, unknown>): void {
    this.logEvent('authentication', {
      action,
      success,
      ...details,
    });
  }

  /**
   * Log CSRF event
   */
  static logCSRFEvent(action: string, token: string, valid: boolean): void {
    this.logEvent('csrf', {
      action,
      tokenHash: this.hashToken(token),
      valid,
    });
  }

  /**
   * Hash token for logging (privacy)
   */
  private static hashToken(token: string): string {
    // Simple hash for logging purposes (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}

// Initialize security measures (lazy initialization)
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking app startup
  setTimeout(() => {
    try {
      // Set up periodic cleanup
      setInterval(() => {
        RateLimiter.cleanup();
      }, 60 * 60 * 1000); // Every hour

      // Set CSP policy
      CSPManager.setMetaCSP(CSPManager.getDefaultPolicy());

      // Initialize CSRF token
      CSRFProtection.getToken();

      // Add to window for debugging in development
      if (process.env.NODE_ENV === 'development') {
        (window as Record<string, unknown>).CSRFProtection = CSRFProtection;
        (window as Record<string, unknown>).SecurityLogger = SecurityLogger;
        (window as Record<string, unknown>).RateLimiter = RateLimiter;
        console.log('🔒 Security utilities loaded for development debugging');
      }
    } catch (error) {
      console.error('SecurityHeaders: Failed to initialize', error);
    }
  }, 50); // Small delay for security headers initialization
}