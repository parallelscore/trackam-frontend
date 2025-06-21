/**
 * Authentication State Persistence Service
 * Manages authentication state across browser sessions, tabs, and page reloads
 */

import { SecureStorage } from '@/utils/secureStorage';
import { SessionManager } from './sessionManager';
import { TokenRefreshService } from './tokenRefreshService';
import { SecurityEventMonitor } from './securityEventMonitor';
import { AppError, ErrorType, logError } from '@/utils/errorHandling';
import { INIT_DELAYS } from '@/config/securityConfig';

interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  sessionId?: string;
  lastActivity: number;
  sessionStart: number;
  rememberMe: boolean;
  deviceFingerprint?: string;
}

interface PersistenceConfig {
  enableCrossTabSync: boolean;
  enableStateRecovery: boolean;
  maxStateAge: number;
  syncInterval: number;
  fingerprintEnabled: boolean;
}

/**
 * Default persistence configuration
 */
const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  enableCrossTabSync: true,
  enableStateRecovery: true,
  maxStateAge: 24 * 60 * 60 * 1000, // 24 hours
  syncInterval: 5000, // 5 seconds
  fingerprintEnabled: true,
};

/**
 * Authentication State Persistence class
 */
export class AuthStatePersistence {
  private static instance: AuthStatePersistence | null = null;
  private config: PersistenceConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private currentState: AuthState | null = null;
  private deviceFingerprint: string | null = null;
  private stateListeners: Array<(state: AuthState) => void> = [];

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<PersistenceConfig>): AuthStatePersistence {
    if (!this.instance) {
      this.instance = new AuthStatePersistence(config);
    }
    return this.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config?: Partial<PersistenceConfig>) {
    this.config = { ...DEFAULT_PERSISTENCE_CONFIG, ...config };
    this.initialize();
  }

  /**
   * Initialize authentication state persistence
   */
  private initialize(): void {
    if (typeof window === 'undefined') return;

    console.log('AuthStatePersistence: Initializing authentication state persistence');

    // Generate device fingerprint
    if (this.config.fingerprintEnabled) {
      this.generateDeviceFingerprint();
    }

    // Restore authentication state
    if (this.config.enableStateRecovery) {
      this.restoreAuthenticationState();
    }

    // Setup cross-tab synchronization
    if (this.config.enableCrossTabSync) {
      this.setupCrossTabSync();
    }

    // Setup periodic state synchronization
    this.setupStateSynchronization();

    // Setup event listeners for authentication changes
    this.setupAuthEventListeners();

    // Setup page lifecycle listeners
    this.setupPageLifecycleListeners();
  }

  /**
   * Generate device fingerprint for security
   */
  private generateDeviceFingerprint(): void {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('TrackAm Security', 2, 2);
      }

      const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        canvas: canvas.toDataURL(),
        plugins: Array.from(navigator.plugins).map(p => p.name).sort().join(','),
        localStorage: typeof(Storage) !== 'undefined',
        sessionStorage: typeof(sessionStorage) !== 'undefined',
        indexedDB: !!window.indexedDB,
        webGL: !!document.createElement('canvas').getContext('webgl'),
      };

      // Create hash of fingerprint data
      this.deviceFingerprint = this.hashFingerprint(JSON.stringify(fingerprint));
    } catch (error) {
      console.warn('AuthStatePersistence: Failed to generate device fingerprint', error);
      this.deviceFingerprint = 'fallback_' + Date.now();
    }
  }

  /**
   * Create simple hash for fingerprint
   */
  private hashFingerprint(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Restore authentication state from storage
   */
  private restoreAuthenticationState(): void {
    try {
      const tokenData = SecureStorage.getTokenData();
      
      if (tokenData && SecureStorage.isAuthenticated()) {
        console.log('AuthStatePersistence: Restoring authentication state');
        
        this.currentState = {
          isAuthenticated: true,
          userId: tokenData.userId,
          sessionId: SecureStorage.getSessionId() || undefined,
          lastActivity: Date.now(),
          sessionStart: tokenData.issuedAt,
          rememberMe: this.getRememberMeState(),
          deviceFingerprint: this.deviceFingerprint || undefined,
        };

        // Validate restored state
        this.validateRestoredState();

        // Notify listeners
        this.notifyStateChange();

        // Initialize session manager with restored state
        const sessionManager = SessionManager.getInstance();
        sessionManager.extendSession();

        // Schedule token refresh if needed
        TokenRefreshService.scheduleTokenRefresh();
      } else {
        console.log('AuthStatePersistence: No valid authentication state to restore');
        this.currentState = this.createEmptyState();
      }
    } catch (error) {
      console.error('AuthStatePersistence: Failed to restore authentication state', error);
      this.currentState = this.createEmptyState();
      
      // Clear potentially corrupted data
      SecureStorage.clearTokenData();
    }
  }

  /**
   * Validate restored authentication state
   */
  private validateRestoredState(): void {
    if (!this.currentState) return;

    // Check if state is too old
    const stateAge = Date.now() - this.currentState.sessionStart;
    if (stateAge > this.config.maxStateAge) {
      console.log('AuthStatePersistence: State too old, clearing authentication');
      this.clearAuthenticationState('state_expired');
      return;
    }

    // Validate device fingerprint if enabled
    if (this.config.fingerprintEnabled && this.currentState.deviceFingerprint) {
      if (this.currentState.deviceFingerprint !== this.deviceFingerprint) {
        console.warn('AuthStatePersistence: Device fingerprint mismatch');
        
        // Report security event
        const securityMonitor = SecurityEventMonitor.getInstance();
        securityMonitor.reportEvent(
          'suspicious_activity',
          {
            reason: 'device_fingerprint_mismatch',
            storedFingerprint: this.currentState.deviceFingerprint,
            currentFingerprint: this.deviceFingerprint,
          },
          'AuthStatePersistence'
        );

        // Optionally clear state on fingerprint mismatch
        if (process.env.NODE_ENV === 'production') {
          this.clearAuthenticationState('device_mismatch');
          return;
        }
      }
    }

    // Validate session integrity
    const sessionId = SecureStorage.getSessionId();
    if (this.currentState.sessionId && sessionId !== this.currentState.sessionId) {
      console.warn('AuthStatePersistence: Session ID mismatch');
      this.clearAuthenticationState('session_mismatch');
    }
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'trackam_auth_state_sync') {
        this.handleCrossTabEvent(event);
      }
    });

    // Listen for authentication events
    window.addEventListener('auth:logout', () => {
      this.clearAuthenticationState('auth_logout');
    });

    window.addEventListener('auth:token-refreshed', () => {
      this.updateAuthenticationState();
    });

    window.addEventListener('auth:security-logout', () => {
      this.clearAuthenticationState('security_logout');
    });
  }

  /**
   * Handle cross-tab synchronization events
   */
  private handleCrossTabEvent(event: StorageEvent): void {
    if (!event.newValue) return;

    try {
      const syncData: { type: string; state?: AuthState; timestamp?: number } = JSON.parse(event.newValue);
      
      switch (syncData.type) {
        case 'logout':
          console.log('AuthStatePersistence: Cross-tab logout detected');
          this.clearAuthenticationState('cross_tab_logout');
          break;
          
        case 'state_update':
          console.log('AuthStatePersistence: Cross-tab state update detected');
          this.handleStateUpdate(syncData.state);
          break;
          
        case 'activity':
          if (this.currentState) {
            this.currentState.lastActivity = syncData.timestamp;
            this.notifyStateChange();
          }
          break;
      }
    } catch (error) {
      console.error('AuthStatePersistence: Failed to handle cross-tab event', error);
    }
  }

  /**
   * Handle state update from other tabs
   */
  private handleStateUpdate(newState: AuthState): void {
    if (!newState.isAuthenticated) {
      this.clearAuthenticationState('cross_tab_state_update');
      return;
    }

    // Validate the new state
    if (this.currentState && this.currentState.sessionId !== newState.sessionId) {
      console.warn('AuthStatePersistence: Session ID mismatch in cross-tab update');
      return;
    }

    // Update current state
    this.currentState = { ...newState };
    this.notifyStateChange();
  }

  /**
   * Setup periodic state synchronization
   */
  private setupStateSynchronization(): void {
    this.syncTimer = setInterval(() => {
      this.synchronizeState();
    }, this.config.syncInterval);
  }

  /**
   * Synchronize authentication state
   */
  private synchronizeState(): void {
    // Update state from secure storage
    const isAuthenticated = SecureStorage.isAuthenticated();
    
    if (!isAuthenticated && this.currentState?.isAuthenticated) {
      // Authentication lost
      this.clearAuthenticationState('token_invalid');
    } else if (isAuthenticated && !this.currentState?.isAuthenticated) {
      // Authentication gained
      this.restoreAuthenticationState();
    } else if (isAuthenticated && this.currentState?.isAuthenticated) {
      // Update existing state
      this.updateAuthenticationState();
    }
  }

  /**
   * Setup authentication event listeners
   */
  private setupAuthEventListeners(): void {
    // Listen for token expiration
    window.addEventListener('auth:token-expired', (event: CustomEvent) => {
      console.log('AuthStatePersistence: Token expired event received');
      this.clearAuthenticationState(`token_expired_${event.detail?.reason || 'unknown'}`);
    });

    // Listen for refresh failures
    window.addEventListener('auth:refresh-failed', () => {
      console.log('AuthStatePersistence: Token refresh failed event received');
      this.clearAuthenticationState('refresh_failed');
    });
  }

  /**
   * Setup page lifecycle listeners
   */
  private setupPageLifecycleListeners(): void {
    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      this.saveCurrentState();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.currentState?.isAuthenticated) {
        // Page became visible, update activity
        this.updateActivity();
      }
    });

    // Handle focus events
    window.addEventListener('focus', () => {
      if (this.currentState?.isAuthenticated) {
        this.updateActivity();
      }
    });
  }

  /**
   * Update authentication state
   */
  private updateAuthenticationState(): void {
    const tokenData = SecureStorage.getTokenData();
    
    if (tokenData && this.currentState) {
      this.currentState = {
        ...this.currentState,
        userId: tokenData.userId,
        sessionId: SecureStorage.getSessionId() || this.currentState.sessionId,
        lastActivity: Date.now(),
      };

      this.notifyStateChange();
      this.syncWithOtherTabs('state_update', { state: this.currentState });
    }
  }

  /**
   * Update user activity timestamp
   */
  private updateActivity(): void {
    if (this.currentState) {
      this.currentState.lastActivity = Date.now();
      this.notifyStateChange();
      this.syncWithOtherTabs('activity', { timestamp: Date.now() });
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuthenticationState(reason: string): void {
    console.log(`AuthStatePersistence: Clearing authentication state - ${reason}`);

    // Clear secure storage
    SecureStorage.clearTokenData();

    // Clear remember me state
    this.setRememberMeState(false);

    // Update current state
    this.currentState = this.createEmptyState();

    // Notify listeners
    this.notifyStateChange();

    // Sync with other tabs
    this.syncWithOtherTabs('logout', { reason, timestamp: Date.now() });

    // Log event
    const authError = new AppError(
      ErrorType.AUTHENTICATION_ERROR,
      `Authentication state cleared: ${reason}`,
      'Your session has ended. Please log in again.',
      { code: 'AUTH_STATE_CLEARED', details: { reason } }
    );
    logError(authError, 'AuthStatePersistence');
  }

  /**
   * Create empty authentication state
   */
  private createEmptyState(): AuthState {
    return {
      isAuthenticated: false,
      lastActivity: Date.now(),
      sessionStart: Date.now(),
      rememberMe: false,
      deviceFingerprint: this.deviceFingerprint || undefined,
    };
  }

  /**
   * Sync data with other tabs
   */
  private syncWithOtherTabs(type: string, data: Record<string, unknown>): void {
    if (!this.config.enableCrossTabSync) return;

    try {
      const syncData = {
        type,
        data,
        timestamp: Date.now(),
        tabId: this.getTabId(),
      };
      
      localStorage.setItem('trackam_auth_state_sync', JSON.stringify(syncData));
      
      // Remove after delay to trigger storage event
      setTimeout(() => {
        localStorage.removeItem('trackam_auth_state_sync');
      }, 100);
    } catch (error) {
      console.error('AuthStatePersistence: Failed to sync with other tabs', error);
    }
  }

  /**
   * Get unique tab identifier
   */
  private getTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Save current state to persistent storage
   */
  private saveCurrentState(): void {
    if (this.currentState?.isAuthenticated && this.currentState.rememberMe) {
      try {
        const stateToSave = {
          ...this.currentState,
          savedAt: Date.now(),
        };
        
        localStorage.setItem('trackam_auth_state_backup', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('AuthStatePersistence: Failed to save state', error);
      }
    }
  }

  /**
   * Get remember me state
   */
  private getRememberMeState(): boolean {
    try {
      return localStorage.getItem('trackam_remember_me') === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Set remember me state
   */
  private setRememberMeState(remember: boolean): void {
    try {
      if (remember) {
        localStorage.setItem('trackam_remember_me', 'true');
      } else {
        localStorage.removeItem('trackam_remember_me');
      }
    } catch (error) {
      console.error('AuthStatePersistence: Failed to set remember me state', error);
    }
  }

  /**
   * Notify state change listeners
   */
  private notifyStateChange(): void {
    this.stateListeners.forEach(listener => {
      try {
        listener(this.currentState!);
      } catch (error) {
        console.error('AuthStatePersistence: Error in state listener', error);
      }
    });
  }

  /**
   * Public methods
   */

  /**
   * Get current authentication state
   */
  getCurrentState(): AuthState | null {
    return this.currentState;
  }

  /**
   * Set authentication state (called after login)
   */
  setAuthenticationState(userId: string, rememberMe: boolean = false): void {
    const tokenData = SecureStorage.getTokenData();
    
    if (tokenData) {
      this.currentState = {
        isAuthenticated: true,
        userId,
        sessionId: SecureStorage.getSessionId() || undefined,
        lastActivity: Date.now(),
        sessionStart: tokenData.issuedAt,
        rememberMe,
        deviceFingerprint: this.deviceFingerprint || undefined,
      };

      // Save remember me preference
      this.setRememberMeState(rememberMe);

      // Notify listeners
      this.notifyStateChange();

      // Sync with other tabs
      this.syncWithOtherTabs('state_update', { state: this.currentState });

      console.log('AuthStatePersistence: Authentication state set successfully');
    }
  }

  /**
   * Force logout
   */
  logout(reason: string = 'manual'): void {
    this.clearAuthenticationState(reason);
  }

  /**
   * Add state change listener
   */
  addStateListener(listener: (state: AuthState) => void): void {
    this.stateListeners.push(listener);
  }

  /**
   * Remove state change listener
   */
  removeStateListener(listener: (state: AuthState) => void): void {
    const index = this.stateListeners.indexOf(listener);
    if (index > -1) {
      this.stateListeners.splice(index, 1);
    }
  }

  /**
   * Get device fingerprint
   */
  getDeviceFingerprint(): string | null {
    return this.deviceFingerprint;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart synchronization with new config
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.setupStateSynchronization();
    }
  }

  /**
   * Destroy the persistence service
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    this.stateListeners = [];
    this.currentState = null;
    AuthStatePersistence.instance = null;
  }
}

// Initialize authentication state persistence for browser environment (lazy initialization)
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking app startup
  setTimeout(() => {
    try {
      const authPersistence = AuthStatePersistence.getInstance();
      
      // Add to window for debugging in development
      if (process.env.NODE_ENV === 'development') {
        (window as Record<string, unknown>).AuthStatePersistence = AuthStatePersistence;
        (window as Record<string, unknown>).authPersistence = authPersistence;
        console.log('💾 AuthStatePersistence: Debug utilities available at window.AuthStatePersistence');
      }
    } catch (error) {
      console.error('AuthStatePersistence: Failed to initialize', error);
    }
  }, INIT_DELAYS.authPersistence); // Configurable delay
}