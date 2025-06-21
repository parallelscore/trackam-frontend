/**
 * Security Configuration
 * Centralized configuration for all security features
 */

interface SecurityConfig {
  // General settings
  enableSecurityFeatures: boolean;
  isDevelopment: boolean;
  
  // Authentication features
  tokenRefresh: {
    enabled: boolean;
    autoRefresh: boolean;
    refreshBeforeExpiry: number; // minutes
  };
  
  // Session management
  sessionManagement: {
    enabled: boolean;
    inactivityTimeout: number; // minutes
    maxSessionTime: number; // hours
    crossTabSync: boolean;
  };
  
  // Security monitoring
  monitoring: {
    enabled: boolean;
    devtoolsDetection: boolean;
    storageMonitoring: boolean;
    csrfProtection: boolean;
    rateLimiting: boolean;
  };
  
  // Authentication state persistence
  statePersistence: {
    enabled: boolean;
    deviceFingerprinting: boolean;
    crossTabSync: boolean;
    stateRecovery: boolean;
  };
}

const isDev = process.env.NODE_ENV === 'development';

export const SECURITY_CONFIG: SecurityConfig = {
  enableSecurityFeatures: true,
  isDevelopment: isDev,
  
  tokenRefresh: {
    enabled: true,
    autoRefresh: true,
    refreshBeforeExpiry: 5, // 5 minutes before expiry
  },
  
  sessionManagement: {
    enabled: true,
    inactivityTimeout: isDev ? 60 : 30, // 60 min in dev, 30 min in prod
    maxSessionTime: isDev ? 12 : 8, // 12 hours in dev, 8 hours in prod
    crossTabSync: true,
  },
  
  monitoring: {
    enabled: true,
    devtoolsDetection: !isDev, // Disable in development
    storageMonitoring: !isDev, // Disable aggressive monitoring in development
    csrfProtection: true,
    rateLimiting: true,
  },
  
  statePersistence: {
    enabled: true,
    deviceFingerprinting: !isDev, // Disable in development
    crossTabSync: true,
    stateRecovery: true,
  },
};

/**
 * Get security configuration for a specific feature
 */
export function getSecurityConfig(): SecurityConfig {
  return SECURITY_CONFIG;
}

/**
 * Check if a security feature is enabled
 */
export function isSecurityFeatureEnabled(feature: keyof SecurityConfig['monitoring']): boolean {
  return SECURITY_CONFIG.enableSecurityFeatures && SECURITY_CONFIG.monitoring[feature];
}

/**
 * Development-friendly initialization delays
 */
export const INIT_DELAYS = {
  securityHeaders: isDev ? 100 : 50,
  sessionManager: isDev ? 500 : 100,
  authPersistence: isDev ? 750 : 150,
  securityMonitoring: isDev ? 1000 : 200,
  tokenRefresh: isDev ? 1500 : 500,
} as const;