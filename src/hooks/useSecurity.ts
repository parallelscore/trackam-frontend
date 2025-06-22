/**
 * Security Hook
 * React hook for accessing security monitoring information
 */

import { useState, useEffect, useCallback } from 'react';
import { SecurityManager, SecurityStats, SecurityReport } from '@/services/securityManager';

export interface SecurityHookResult {
  // Status
  isInitialized: boolean;
  isLoading: boolean;
  
  // Data
  stats: SecurityStats | null;
  report: SecurityReport | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Actions
  refreshStats: () => void;
  reportThreat: (type: string, details: Record<string, unknown>, confidence?: number) => void;
  setLearningEnabled: (enabled: boolean) => void;
  resetBehaviorProfile: () => void;
  
  // Error handling
  error: string | null;
}

/**
 * Hook for accessing security monitoring information
 */
export function useSecurity(): SecurityHookResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const securityManager = SecurityManager.getInstance();

  // Refresh security stats and report
  const refreshStats = useCallback(() => {
    try {
      setError(null);
      
      const status = securityManager.getStatus();
      setIsInitialized(status.isInitialized);
      
      if (status.isInitialized) {
        const currentStats = securityManager.getSecurityStats();
        const currentReport = securityManager.generateSecurityReport();
        
        setStats(currentStats);
        setReport(currentReport);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh security stats');
      console.error('useSecurity: Failed to refresh stats', err);
    } finally {
      setIsLoading(false);
    }
  }, [securityManager]);

  // Report external threat
  const reportThreat = useCallback((
    type: string,
    details: Record<string, unknown>,
    confidence: number = 80
  ) => {
    try {
      securityManager.reportThreat(type, details, confidence);
      // Refresh stats after reporting
      setTimeout(refreshStats, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report threat');
      console.error('useSecurity: Failed to report threat', err);
    }
  }, [securityManager, refreshStats]);

  // Enable/disable learning
  const setLearningEnabled = useCallback((enabled: boolean) => {
    try {
      securityManager.setLearningEnabled(enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set learning mode');
      console.error('useSecurity: Failed to set learning mode', err);
    }
  }, [securityManager]);

  // Reset behavior profile
  const resetBehaviorProfile = useCallback(() => {
    try {
      securityManager.resetBehaviorProfile();
      // Refresh stats after reset
      setTimeout(refreshStats, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset behavior profile');
      console.error('useSecurity: Failed to reset behavior profile', err);
    }
  }, [securityManager, refreshStats]);

  // Initialize and set up periodic refresh
  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Wait for security manager to initialize
        await securityManager.initialize();
        
        if (mounted) {
          refreshStats();
          
          // Set up periodic refresh (every 30 seconds)
          intervalId = setInterval(() => {
            if (mounted) {
              refreshStats();
            }
          }, 30 * 1000);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize security monitoring');
          setIsLoading(false);
        }
        console.error('useSecurity: Failed to initialize', err);
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [securityManager, refreshStats]);

  const riskLevel = report?.riskLevel || 'low';

  return {
    isInitialized,
    isLoading,
    stats,
    report,
    riskLevel,
    refreshStats,
    reportThreat,
    setLearningEnabled,
    resetBehaviorProfile,
    error,
  };
}

/**
 * Hook for security event monitoring
 */
export function useSecurityEvents(callback: (event: any) => void) {
  const securityManager = SecurityManager.getInstance();

  useEffect(() => {
    securityManager.addEventListener(callback);
    
    return () => {
      securityManager.removeEventListener(callback);
    };
  }, [securityManager, callback]);
}

/**
 * Hook for reporting security threats easily
 */
export function useSecurityReporting() {
  const { reportThreat } = useSecurity();

  const reportSuspiciousActivity = useCallback((details: Record<string, unknown>) => {
    reportThreat('suspicious_activity', details, 70);
  }, [reportThreat]);

  const reportAutomationDetected = useCallback((details: Record<string, unknown>) => {
    reportThreat('automation_detected', details, 75);
  }, [reportThreat]);

  const reportXSSAttempt = useCallback((details: Record<string, unknown>) => {
    reportThreat('xss_attempt', details, 90);
  }, [reportThreat]);

  const reportCSRFAttempt = useCallback((details: Record<string, unknown>) => {
    reportThreat('csrf_attack', details, 85);
  }, [reportThreat]);

  return {
    reportThreat,
    reportSuspiciousActivity,
    reportAutomationDetected,
    reportXSSAttempt,
    reportCSRFAttempt,
  };
}