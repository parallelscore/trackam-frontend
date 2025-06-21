/**
 * Security Event Monitor
 * Monitors for security threats and triggers automatic logout when necessary
 */

import { SecureStorage } from '@/utils/secureStorage';
import { SessionManager } from './sessionManager';
import { SecurityLogger } from '@/utils/securityHeaders';
import { AppError, ErrorType, logError } from '@/utils/errorHandling';
import { getSecurityConfig, INIT_DELAYS } from '@/config/securityConfig';

interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: Record<string, unknown>;
  source: string;
}

type SecurityEventType = 
  | 'token_tampering'
  | 'csrf_attack'
  | 'session_hijacking'
  | 'multiple_tabs_logout'
  | 'token_replay'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'invalid_origin'
  | 'xss_attempt'
  | 'storage_manipulation'
  | 'devtools_detected'
  | 'tab_focus_anomaly';

interface SecurityRule {
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoLogout: boolean;
  threshold?: number;
  timeWindow?: number;
}

/**
 * Security configuration
 */
const SECURITY_RULES: SecurityRule[] = [
  {
    eventType: 'token_tampering',
    severity: 'critical',
    autoLogout: true,
  },
  {
    eventType: 'csrf_attack',
    severity: 'high',
    autoLogout: true,
  },
  {
    eventType: 'session_hijacking',
    severity: 'critical',
    autoLogout: true,
  },
  {
    eventType: 'multiple_tabs_logout',
    severity: 'high',
    autoLogout: true,
  },
  {
    eventType: 'token_replay',
    severity: 'high',
    autoLogout: true,
  },
  {
    eventType: 'suspicious_activity',
    severity: 'medium',
    autoLogout: false,
    threshold: 3,
    timeWindow: 5 * 60 * 1000, // 5 minutes
  },
  {
    eventType: 'rate_limit_exceeded',
    severity: 'medium',
    autoLogout: false,
    threshold: 5,
    timeWindow: 10 * 60 * 1000, // 10 minutes
  },
  {
    eventType: 'invalid_origin',
    severity: 'high',
    autoLogout: true,
  },
  {
    eventType: 'xss_attempt',
    severity: 'critical',
    autoLogout: true,
  },
  {
    eventType: 'storage_manipulation',
    severity: 'high',
    autoLogout: true,
  },
  {
    eventType: 'devtools_detected',
    severity: 'low',
    autoLogout: false,
  },
  {
    eventType: 'tab_focus_anomaly',
    severity: 'low',
    autoLogout: false,
    threshold: 10,
    timeWindow: 60 * 1000, // 1 minute
  },
];

const getMonitoringConfig = () => {
  const config = getSecurityConfig();
  return {
    MONITORING_ENABLED: config.monitoring.enabled,
    AUTO_LOGOUT_ENABLED: config.enableSecurityFeatures,
    STORAGE_MONITORING: config.monitoring.storageMonitoring,
    DEVTOOLS_DETECTION: config.monitoring.devtoolsDetection,
    EVENT_RETENTION_TIME: 24 * 60 * 60 * 1000, // 24 hours
    MAX_EVENTS_STORED: 1000,
  };
};

/**
 * Security Event Monitor class
 */
export class SecurityEventMonitor {
  private static instance: SecurityEventMonitor | null = null;
  private events: SecurityEvent[] = [];
  private isMonitoring = false;
  private storageObserver: MutationObserver | null = null;
  private originalStorageToken: string | null = null;
  private devToolsInterval: NodeJS.Timeout | null = null;
  private eventListeners: Array<(event: SecurityEvent) => void> = [];

  /**
   * Get singleton instance
   */
  static getInstance(): SecurityEventMonitor {
    if (!this.instance) {
      this.instance = new SecurityEventMonitor();
    }
    return this.instance;
  }

  /**
   * Initialize security monitoring
   */
  initialize(): void {
    const SECURITY_CONFIG = getMonitoringConfig();
    if (!SECURITY_CONFIG.MONITORING_ENABLED || this.isMonitoring) {
      return;
    }

    console.log('SecurityEventMonitor: Initializing security monitoring');
    this.isMonitoring = true;

    // Set up various monitoring mechanisms
    this.setupStorageMonitoring();
    this.setupDevToolsDetection();
    this.setupOriginValidation();
    this.setupCSRFProtection();
    this.setupTokenValidation();
    this.setupTabFocusMonitoring();
    this.setupEventCleanup();

    // Store initial token state
    this.originalStorageToken = SecureStorage.getAccessToken();
  }

  /**
   * Report a security event
   */
  reportEvent(
    type: SecurityEventType,
    details: Record<string, unknown>,
    source: string = 'SecurityEventMonitor'
  ): void {
    const rule = SECURITY_RULES.find(r => r.eventType === type);
    if (!rule) return;

    const event: SecurityEvent = {
      type,
      severity: rule.severity,
      timestamp: Date.now(),
      details,
      source,
    };

    // Add to events list
    this.events.push(event);
    this.trimEvents();

    // Log security event
    SecurityLogger.logEvent(type, details);
    
    // Emit event to listeners
    this.emitEvent(event);

    console.warn(`SecurityEventMonitor: ${type} detected`, details);

    // Check if automatic logout is required
    if (this.shouldTriggerAutoLogout(event, rule)) {
      this.triggerSecurityLogout(event);
    }
  }

  /**
   * Check if automatic logout should be triggered
   */
  private shouldTriggerAutoLogout(event: SecurityEvent, rule: SecurityRule): boolean {
    const SECURITY_CONFIG = getMonitoringConfig();
    if (!SECURITY_CONFIG.AUTO_LOGOUT_ENABLED) return false;

    // Critical and high severity events with autoLogout enabled
    if (rule.autoLogout && (event.severity === 'critical' || event.severity === 'high')) {
      return true;
    }

    // Threshold-based events
    if (rule.threshold && rule.timeWindow) {
      const recentEvents = this.getRecentEvents(event.type, rule.timeWindow);
      return recentEvents.length >= rule.threshold;
    }

    return false;
  }

  /**
   * Trigger security logout
   */
  private triggerSecurityLogout(event: SecurityEvent): void {
    console.error(`SecurityEventMonitor: Triggering security logout due to ${event.type}`);

    // Log critical security event
    const securityError = new AppError(
      ErrorType.SECURITY_ERROR,
      `Security logout triggered: ${event.type}`,
      'Security threat detected. You have been logged out for your protection.',
      { 
        code: 'SECURITY_LOGOUT',
        details: {
          eventType: event.type,
          severity: event.severity,
          timestamp: event.timestamp,
          source: event.source,
        }
      }
    );
    logError(securityError, 'SecurityEventMonitor');

    // Get session manager and trigger logout
    const sessionManager = SessionManager.getInstance();
    sessionManager.logout(`security_${event.type}`);

    // Emit security logout event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:security-logout', {
        detail: {
          eventType: event.type,
          severity: event.severity,
          timestamp: event.timestamp,
        }
      }));
    }
  }

  /**
   * Setup storage monitoring
   */
  private setupStorageMonitoring(): void {
    const SECURITY_CONFIG = getMonitoringConfig();
    if (!SECURITY_CONFIG.STORAGE_MONITORING || typeof window === 'undefined') return;

    // Monitor storage events
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('trackam_')) {
        this.handleStorageChange(event);
      }
    });

    // Monitor direct localStorage access
    this.setupStorageAccessMonitoring();
  }

  /**
   * Setup storage access monitoring
   */
  private setupStorageAccessMonitoring(): void {
    // Delay storage monitoring to avoid interfering with app initialization
    setTimeout(() => {
      try {
        // Override localStorage methods to detect tampering
        const originalSetItem = localStorage.setItem;
        const originalRemoveItem = localStorage.removeItem;
        const originalClear = localStorage.clear;

        localStorage.setItem = function(key: string, value: string) {
          // Only monitor external changes, not our own
          if (key.startsWith('trackam_') && SecurityEventMonitor.getInstance().isMonitoring) {
            SecurityEventMonitor.getInstance().reportEvent(
              'storage_manipulation',
              { key, action: 'setItem', external: true },
              'localStorage.setItem'
            );
          }
          return originalSetItem.call(this, key, value);
        };

        localStorage.removeItem = function(key: string) {
          if (key.startsWith('trackam_') && SecurityEventMonitor.getInstance().isMonitoring) {
            SecurityEventMonitor.getInstance().reportEvent(
              'storage_manipulation',
              { key, action: 'removeItem', external: true },
              'localStorage.removeItem'
            );
          }
          return originalRemoveItem.call(this, key);
        };

        localStorage.clear = function() {
          if (SecurityEventMonitor.getInstance().isMonitoring) {
            SecurityEventMonitor.getInstance().reportEvent(
              'storage_manipulation',
              { action: 'clear', external: true },
              'localStorage.clear'
            );
          }
          return originalClear.call(this);
        };
      } catch (error) {
        console.error('SecurityEventMonitor: Failed to setup storage monitoring', error);
      }
    }, 1000); // Delay storage override
  }

  /**
   * Handle storage change events
   */
  private handleStorageChange(event: StorageEvent): void {
    if (!event.key || !event.key.startsWith('trackam_')) return;

    // Check for token tampering
    if (event.key === 'trackam_access_token' && event.oldValue !== event.newValue) {
      if (event.newValue === null) {
        this.reportEvent(
          'token_tampering',
          { action: 'token_removed', key: event.key },
          'storage_event'
        );
      } else if (event.oldValue && event.newValue && event.oldValue !== event.newValue) {
        this.reportEvent(
          'token_tampering',
          { action: 'token_modified', key: event.key },
          'storage_event'
        );
      }
    }

    // Check for session hijacking indicators
    if (event.key === 'trackam_session_id' && event.oldValue && event.newValue && event.oldValue !== event.newValue) {
      this.reportEvent(
        'session_hijacking',
        { action: 'session_id_changed', key: event.key },
        'storage_event'
      );
    }
  }

  /**
   * Setup DevTools detection
   */
  private setupDevToolsDetection(): void {
    const SECURITY_CONFIG = getMonitoringConfig();
    if (!SECURITY_CONFIG.DEVTOOLS_DETECTION || typeof window === 'undefined') return;

    // Method 1: Console detection (with delay to avoid blocking startup)
    setTimeout(() => {
      let devtools = false;
      const threshold = 160;

      const checkDevTools = () => {
        try {
          if (window.outerHeight - window.innerHeight > threshold || 
              window.outerWidth - window.innerWidth > threshold) {
            if (!devtools) {
              devtools = true;
              this.reportEvent(
                'devtools_detected',
                { method: 'window_size', timestamp: Date.now() },
                'devtools_detector'
              );
            }
          }
        } catch {
          // Silently handle any errors in devtools detection
        }
      };

      this.devToolsInterval = setInterval(checkDevTools, 1000); // Slower interval

      // Method 2: Console warning (delayed)
      setTimeout(() => {
        console.warn('⚠️ Security Warning: Unauthorized access to browser developer tools may be monitored for security purposes.');
      }, 1000);
    }, 2000); // Delay devtools detection
  }

  /**
   * Setup origin validation
   */
  private setupOriginValidation(): void {
    if (typeof window === 'undefined') return;

    // Check current origin
    const currentOrigin = window.location.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4173',
      // Add production domains
    ];

    if (process.env.NODE_ENV === 'production' && !allowedOrigins.includes(currentOrigin)) {
      this.reportEvent(
        'invalid_origin',
        { origin: currentOrigin, allowed: allowedOrigins },
        'origin_validator'
      );
    }
  }

  /**
   * Setup CSRF protection monitoring
   */
  private setupCSRFProtection(): void {
    if (typeof window === 'undefined') return;

    // Monitor for potential CSRF attacks
    const originalFetch = window.fetch;
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Check for state-changing requests without CSRF token (skip auth endpoints)
      if (init?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method.toUpperCase())) {
        const isAuthEndpoint = url.includes('/register/') || 
                              url.includes('/login/') ||
                              url.includes('/request-otp') ||
                              url.includes('/verify-otp');
        
        if (!isAuthEndpoint) {
          const headers = new Headers(init.headers);
          if (!headers.has('X-CSRF-Token')) {
            SecurityEventMonitor.getInstance().reportEvent(
              'csrf_attack',
              { url, method: init.method, missingCSRF: true },
              'fetch_interceptor'
            );
          }
        }
      }

      return originalFetch.call(this, input, init);
    };
  }

  /**
   * Setup token validation monitoring
   */
  private setupTokenValidation(): void {
    // Periodically validate token integrity
    setInterval(() => {
      const currentToken = SecureStorage.getAccessToken();
      
      if (this.originalStorageToken && currentToken !== this.originalStorageToken) {
        // Token has changed - check if it's valid
        if (currentToken && !currentToken.startsWith('ey')) {
          this.reportEvent(
            'token_tampering',
            { reason: 'invalid_token_format', token_preview: currentToken?.substring(0, 10) },
            'token_validator'
          );
        }
        
        this.originalStorageToken = currentToken;
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Setup tab focus monitoring
   */
  private setupTabFocusMonitoring(): void {
    if (typeof document === 'undefined') return;

    let focusAnomalyCount = 0;
    let lastFocusTime = Date.now();

    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime;
      
      if (document.hidden) {
        // Tab lost focus
        lastFocusTime = now;
      } else {
        // Tab gained focus
        if (timeSinceLastFocus < 100) { // Very quick focus changes
          focusAnomalyCount++;
          if (focusAnomalyCount > 5) {
            this.reportEvent(
              'tab_focus_anomaly',
              { anomalyCount: focusAnomalyCount, timeSinceLastFocus },
              'tab_focus_monitor'
            );
          }
        }
        lastFocusTime = now;
      }
    });
  }

  /**
   * Setup event cleanup
   */
  private setupEventCleanup(): void {
    // Clean up old events periodically
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Get recent events of a specific type
   */
  private getRecentEvents(eventType: SecurityEventType, timeWindow: number): SecurityEvent[] {
    const now = Date.now();
    return this.events.filter(event => 
      event.type === eventType && 
      (now - event.timestamp) <= timeWindow
    );
  }

  /**
   * Trim events to max limit
   */
  private trimEvents(): void {
    const SECURITY_CONFIG = getMonitoringConfig();
    if (this.events.length > SECURITY_CONFIG.MAX_EVENTS_STORED) {
      this.events = this.events.slice(-SECURITY_CONFIG.MAX_EVENTS_STORED);
    }
  }

  /**
   * Clean up old events
   */
  private cleanupOldEvents(): void {
    const SECURITY_CONFIG = getMonitoringConfig();
    const now = Date.now();
    this.events = this.events.filter(event => 
      (now - event.timestamp) <= SECURITY_CONFIG.EVENT_RETENTION_TIME
    );
  }

  /**
   * Emit security event to listeners
   */
  private emitEvent(event: SecurityEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('SecurityEventMonitor: Error in event listener', error);
      }
    });
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: SecurityEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: SecurityEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: SecurityEvent[];
  } {
    const eventsByType = {} as Record<SecurityEventType, number>;
    const eventsBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };

    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity]++;
    });

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents: this.events.slice(-10), // Last 10 events
    };
  }

  /**
   * Clear all events (for testing)
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.devToolsInterval) {
      clearInterval(this.devToolsInterval);
      this.devToolsInterval = null;
    }
    
    if (this.storageObserver) {
      this.storageObserver.disconnect();
      this.storageObserver = null;
    }
    
    this.eventListeners = [];
    console.log('SecurityEventMonitor: Monitoring stopped');
  }

  /**
   * Destroy the monitor
   */
  destroy(): void {
    this.stopMonitoring();
    this.events = [];
    SecurityEventMonitor.instance = null;
  }
}

// Initialize security monitoring for browser environment (lazy initialization)
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking app startup
  setTimeout(() => {
    try {
      const securityMonitor = SecurityEventMonitor.getInstance();
      securityMonitor.initialize();
      
      // Add to window for debugging in development
      if (process.env.NODE_ENV === 'development') {
        (window as Record<string, unknown>).SecurityEventMonitor = SecurityEventMonitor;
        (window as Record<string, unknown>).securityMonitor = securityMonitor;
        console.log('🛡️ SecurityEventMonitor: Debug utilities available at window.SecurityEventMonitor');
      }
    } catch (error) {
      console.error('SecurityEventMonitor: Failed to initialize', error);
    }
  }, INIT_DELAYS.securityMonitoring); // Configurable delay
}