/**
 * Session Manager
 * Handles session lifecycle, security events, and automatic logout
 */

import { SecureStorage } from '@/utils/secureStorage';
import { TokenRefreshService } from './tokenRefreshService';
import { AppError, ErrorType, logError } from '@/utils/errorHandling';
import { INIT_DELAYS } from '@/config/securityConfig';

interface SessionConfig {
  maxInactivityTime: number; // in milliseconds
  maxSessionTime: number; // in milliseconds
  warningTime: number; // warn user before logout
  checkInterval: number; // how often to check session validity
  enableInactivityTimer: boolean;
  enableMaxSessionTimer: boolean;
  enableTabSync: boolean;
}

interface SessionEvent {
  type: 'activity' | 'warning' | 'logout' | 'refresh' | 'security';
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * Default session configuration
 */
const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxInactivityTime: 30 * 60 * 1000, // 30 minutes
  maxSessionTime: 8 * 60 * 60 * 1000, // 8 hours
  warningTime: 5 * 60 * 1000, // 5 minutes before logout
  checkInterval: 60 * 1000, // 1 minute
  enableInactivityTimer: true,
  enableMaxSessionTimer: true,
  enableTabSync: true,
};

/**
 * Session Manager class
 */
export class SessionManager {
  private static instance: SessionManager | null = null;
  private config: SessionConfig;
  private lastActivity: number = Date.now();
  private sessionStart: number = Date.now();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private checkTimer: NodeJS.Timeout | null = null;
  private warningShown: boolean = false;
  private isActive: boolean = true;
  private tabId: string;
  private eventListeners: Array<(event: SessionEvent) => void> = [];

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<SessionConfig>): SessionManager {
    if (!this.instance) {
      this.instance = new SessionManager(config);
    }
    return this.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config?: Partial<SessionConfig>) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.tabId = this.generateTabId();
    this.initializeSession();
  }

  /**
   * Initialize session management
   */
  private initializeSession(): void {
    if (typeof window === 'undefined') return;

    console.log('SessionManager: Initializing session management');
    
    // Set up activity tracking
    this.setupActivityTracking();
    
    // Set up timers
    this.setupTimers();
    
    // Set up cross-tab synchronization
    if (this.config.enableTabSync) {
      this.setupTabSync();
    }
    
    // Set up visibility change handling
    this.setupVisibilityHandling();
    
    // Register session start
    this.registerSessionStart();
  }

  /**
   * Setup activity tracking
   */
  private setupActivityTracking(): void {
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'click', 'focus'
    ];

    const handleActivity = () => {
      this.updateLastActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
  }

  /**
   * Setup session timers
   */
  private setupTimers(): void {
    // Clear existing timers
    this.clearTimers();

    // Setup periodic session check
    this.checkTimer = setInterval(() => {
      this.checkSessionValidity();
    }, this.config.checkInterval);

    // Update timers based on current activity
    this.updateTimers();
  }

  /**
   * Update session timers
   */
  private updateTimers(): void {
    this.clearInactivityTimer();
    this.clearSessionTimer();

    if (!this.isAuthenticated()) return;

    // Setup inactivity timer
    if (this.config.enableInactivityTimer) {
      const timeUntilInactive = this.config.maxInactivityTime - (Date.now() - this.lastActivity);
      
      if (timeUntilInactive > 0) {
        this.inactivityTimer = setTimeout(() => {
          this.handleInactivityTimeout();
        }, timeUntilInactive);
      } else {
        this.handleInactivityTimeout();
      }
    }

    // Setup max session timer
    if (this.config.enableMaxSessionTimer) {
      const timeUntilMaxSession = this.config.maxSessionTime - (Date.now() - this.sessionStart);
      
      if (timeUntilMaxSession > 0) {
        this.sessionTimer = setTimeout(() => {
          this.handleMaxSessionTimeout();
        }, timeUntilMaxSession);
      } else {
        this.handleMaxSessionTimeout();
      }
    }
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupTabSync(): void {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'trackam_session_sync') {
        const syncData = event.newValue ? JSON.parse(event.newValue) : null;
        if (syncData) {
          this.handleTabSyncEvent(syncData);
        }
      }
    });

    // Listen for auth events
    window.addEventListener('auth:logout', () => {
      this.handleLogout('auth_event');
    });

    window.addEventListener('auth:token-refreshed', () => {
      this.handleTokenRefresh();
    });
  }

  /**
   * Setup page visibility handling
   */
  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.handlePageUnload();
    });
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    const now = Date.now();
    this.lastActivity = now;
    this.warningShown = false;
    
    // Update timers
    this.updateTimers();
    
    // Sync with other tabs
    if (this.config.enableTabSync) {
      this.syncWithOtherTabs('activity', { timestamp: now });
    }

    // Emit activity event
    this.emitEvent({
      type: 'activity',
      timestamp: now,
    });
  }

  /**
   * Check session validity
   */
  private checkSessionValidity(): void {
    if (!this.isAuthenticated()) {
      this.handleLogout('invalid_session');
      return;
    }

    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    const timeSinceStart = now - this.sessionStart;

    // Check for inactivity warning
    if (this.config.enableInactivityTimer && !this.warningShown) {
      const timeUntilInactive = this.config.maxInactivityTime - timeSinceActivity;
      
      if (timeUntilInactive <= this.config.warningTime && timeUntilInactive > 0) {
        this.showInactivityWarning(Math.ceil(timeUntilInactive / 1000));
      }
    }

    // Check for max session warning
    if (this.config.enableMaxSessionTimer && !this.warningShown) {
      const timeUntilMaxSession = this.config.maxSessionTime - timeSinceStart;
      
      if (timeUntilMaxSession <= this.config.warningTime && timeUntilMaxSession > 0) {
        this.showSessionWarning(Math.ceil(timeUntilMaxSession / 1000));
      }
    }

    // Attempt token refresh if needed
    if (SecureStorage.needsTokenRefresh()) {
      TokenRefreshService.checkAndRefreshToken().catch(error => {
        console.error('SessionManager: Failed to refresh token', error);
        this.handleLogout('refresh_failed');
      });
    }
  }

  /**
   * Handle inactivity timeout
   */
  private handleInactivityTimeout(): void {
    console.log('SessionManager: Inactivity timeout reached');
    this.handleLogout('inactivity_timeout');
  }

  /**
   * Handle max session timeout
   */
  private handleMaxSessionTimeout(): void {
    console.log('SessionManager: Max session time reached');
    this.handleLogout('max_session_timeout');
  }

  /**
   * Handle logout scenarios
   */
  private handleLogout(reason: string): void {
    console.log(`SessionManager: Logout triggered - ${reason}`);
    
    // Clear timers
    this.clearTimers();
    
    // Clear session data
    SecureStorage.clearTokenData();
    
    // Sync logout with other tabs
    if (this.config.enableTabSync) {
      this.syncWithOtherTabs('logout', { reason, timestamp: Date.now() });
    }
    
    // Emit logout event
    this.emitEvent({
      type: 'logout',
      timestamp: Date.now(),
      details: { reason },
    });

    // Log security event
    const logoutError = new AppError(
      ErrorType.AUTHENTICATION_ERROR,
      `Session logout: ${reason}`,
      'Your session has ended. Please log in again.',
      { code: 'SESSION_LOGOUT', details: { reason } }
    );
    logError(logoutError, 'SessionManager');
  }

  /**
   * Handle token refresh
   */
  private handleTokenRefresh(): void {
    console.log('SessionManager: Token refreshed, updating session');
    
    // Reset session warnings
    this.warningShown = false;
    
    // Update timers
    this.updateTimers();
    
    // Emit refresh event
    this.emitEvent({
      type: 'refresh',
      timestamp: Date.now(),
    });
  }

  /**
   * Show inactivity warning
   */
  private showInactivityWarning(secondsRemaining: number): void {
    this.warningShown = true;
    
    this.emitEvent({
      type: 'warning',
      timestamp: Date.now(),
      details: {
        type: 'inactivity',
        secondsRemaining,
        message: `You will be logged out due to inactivity in ${secondsRemaining} seconds.`,
      },
    });
  }

  /**
   * Show session warning
   */
  private showSessionWarning(secondsRemaining: number): void {
    this.warningShown = true;
    
    this.emitEvent({
      type: 'warning',
      timestamp: Date.now(),
      details: {
        type: 'max_session',
        secondsRemaining,
        message: `Your session will expire in ${secondsRemaining} seconds.`,
      },
    });
  }

  /**
   * Sync data with other tabs
   */
  private syncWithOtherTabs(type: string, data: Record<string, unknown>): void {
    try {
      const syncData = {
        type,
        data,
        tabId: this.tabId,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('trackam_session_sync', JSON.stringify(syncData));
      
      // Remove after a short delay to trigger storage event
      setTimeout(() => {
        localStorage.removeItem('trackam_session_sync');
      }, 100);
    } catch (error) {
      console.error('SessionManager: Failed to sync with other tabs', error);
    }
  }

  /**
   * Handle tab sync events
   */
  private handleTabSyncEvent(syncData: { type: string; data: Record<string, unknown>; tabId: string }): void {
    // Ignore events from this tab
    if (syncData.tabId === this.tabId) return;

    switch (syncData.type) {
      case 'activity':
        if (typeof syncData.data.timestamp === 'number' && syncData.data.timestamp > this.lastActivity) {
          this.lastActivity = syncData.data.timestamp;
          this.updateTimers();
        }
        break;
        
      case 'logout':
        this.handleLogout(`tab_sync_${syncData.data.reason || 'unknown'}`);
        break;
    }
  }

  /**
   * Handle page hidden
   */
  private handlePageHidden(): void {
    this.isActive = false;
    console.log('SessionManager: Page hidden');
  }

  /**
   * Handle page visible
   */
  private handlePageVisible(): void {
    this.isActive = true;
    this.updateLastActivity();
    console.log('SessionManager: Page visible');
  }

  /**
   * Handle page unload
   */
  private handlePageUnload(): void {
    this.clearTimers();
  }

  /**
   * Register session start
   */
  private registerSessionStart(): void {
    const sessionData = SecureStorage.getTokenData();
    if (sessionData) {
      this.sessionStart = sessionData.issuedAt || Date.now();
    }
  }

  /**
   * Check if user is authenticated
   */
  private isAuthenticated(): boolean {
    return SecureStorage.isAuthenticated();
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearInactivityTimer();
    this.clearSessionTimer();
    
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * Clear inactivity timer
   */
  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Clear session timer
   */
  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Generate unique tab ID
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Emit session event
   */
  private emitEvent(event: SessionEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('SessionManager: Error in event listener', error);
      }
    });
  }

  /**
   * Public methods
   */

  /**
   * Extend session (manual activity)
   */
  extendSession(): void {
    this.updateLastActivity();
  }

  /**
   * Force logout
   */
  logout(reason: string = 'manual'): void {
    this.handleLogout(reason);
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    isAuthenticated: boolean;
    lastActivity: number;
    sessionStart: number;
    timeUntilInactivity: number;
    timeUntilMaxSession: number;
    isActive: boolean;
    tabId: string;
  } {
    const now = Date.now();
    
    return {
      isAuthenticated: this.isAuthenticated(),
      lastActivity: this.lastActivity,
      sessionStart: this.sessionStart,
      timeUntilInactivity: Math.max(0, this.config.maxInactivityTime - (now - this.lastActivity)),
      timeUntilMaxSession: Math.max(0, this.config.maxSessionTime - (now - this.sessionStart)),
      isActive: this.isActive,
      tabId: this.tabId,
    };
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: SessionEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: SessionEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Update session configuration
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupTimers();
  }

  /**
   * Destroy session manager
   */
  destroy(): void {
    this.clearTimers();
    this.eventListeners = [];
    SessionManager.instance = null;
  }
}

// Initialize session manager for browser environment (lazy initialization)
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking app startup
  setTimeout(() => {
    try {
      const sessionManager = SessionManager.getInstance();
      
      // Add to window for debugging in development
      if (process.env.NODE_ENV === 'development') {
        (window as Record<string, unknown>).SessionManager = SessionManager;
        (window as Record<string, unknown>).sessionManager = sessionManager;
        console.log('🎯 SessionManager: Debug utilities available at window.SessionManager');
      }
    } catch (error) {
      console.error('SessionManager: Failed to initialize', error);
    }
  }, INIT_DELAYS.sessionManager); // Configurable delay
}