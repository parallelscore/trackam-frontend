/**
 * Security Manager
 * Unified interface for all security monitoring systems
 */

import { SecurityEventMonitor } from './securityEventMonitor';
import { SmartSecurityMonitor } from './smartSecurityMonitor';
import { getSecurityConfig } from '@/config/securityConfig';

export interface SecurityStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  activeMonitors: string[];
  lastUpdated: number;
}

export interface SecurityReport {
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  stats: SecurityStats;
}

/**
 * Unified Security Manager
 */
export class SecurityManager {
  private static instance: SecurityManager | null = null;
  private smartMonitor: SmartSecurityMonitor | null = null;
  private legacyMonitor: SecurityEventMonitor | null = null;
  private isInitialized = false;

  /**
   * Get singleton instance
   */
  static getInstance(): SecurityManager {
    if (!this.instance) {
      this.instance = new SecurityManager();
    }
    return this.instance;
  }

  /**
   * Initialize security management
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const config = getSecurityConfig();
    if (!config.monitoring.enabled) {
      console.log('SecurityManager: Security monitoring disabled');
      return;
    }

    console.log('SecurityManager: Initializing unified security management');

    try {
      // Initialize smart monitoring if enabled
      if (config.monitoring.smartMonitoring) {
        this.smartMonitor = SmartSecurityMonitor.getInstance();
        await this.smartMonitor.initialize();
        console.log('SecurityManager: Smart monitoring initialized');
      }

      // Initialize legacy monitoring if enabled
      if (config.monitoring.legacyMonitoring) {
        this.legacyMonitor = SecurityEventMonitor.getInstance();
        this.legacyMonitor.initialize();
        console.log('SecurityManager: Legacy monitoring initialized');
      }

      this.isInitialized = true;
      console.log('SecurityManager: Security management initialized successfully');

    } catch (error) {
      console.error('SecurityManager: Failed to initialize', error);
      throw error;
    }
  }

  /**
   * Get comprehensive security statistics
   */
  getSecurityStats(): SecurityStats {
    const stats: SecurityStats = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      activeMonitors: [],
      lastUpdated: Date.now(),
    };

    // Collect stats from smart monitor
    if (this.smartMonitor) {
      const smartStats = this.smartMonitor.getSecurityStats();
      stats.totalEvents += smartStats.totalThreats;
      stats.activeMonitors.push('smart');
      
      // Merge threat types
      Object.entries(smartStats.threatsByType).forEach(([type, count]) => {
        stats.eventsByType[type] = (stats.eventsByType[type] || 0) + count;
      });
      
      // Merge severity counts
      Object.entries(smartStats.threatsBySeverity).forEach(([severity, count]) => {
        stats.eventsBySeverity[severity] = (stats.eventsBySeverity[severity] || 0) + count;
      });
    }

    // Collect stats from legacy monitor
    if (this.legacyMonitor) {
      const legacyStats = this.legacyMonitor.getSecurityStats();
      stats.totalEvents += legacyStats.totalEvents;
      stats.activeMonitors.push('legacy');
      
      // Merge event types
      Object.entries(legacyStats.eventsByType).forEach(([type, count]) => {
        stats.eventsByType[type] = (stats.eventsByType[type] || 0) + count;
      });
      
      // Merge severity counts
      Object.entries(legacyStats.eventsBySeverity).forEach(([severity, count]) => {
        stats.eventsBySeverity[severity] = (stats.eventsBySeverity[severity] || 0) + count;
      });
    }

    return stats;
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): SecurityReport {
    const stats = this.getSecurityStats();
    const riskLevel = this.calculateRiskLevel(stats);
    const recommendations = this.generateRecommendations(stats, riskLevel);
    const summary = this.generateSummary(stats, riskLevel);

    return {
      summary,
      recommendations,
      riskLevel,
      stats,
    };
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(stats: SecurityStats): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = stats.eventsBySeverity.critical || 0;
    const highEvents = stats.eventsBySeverity.high || 0;
    const mediumEvents = stats.eventsBySeverity.medium || 0;

    if (criticalEvents > 0) return 'critical';
    if (highEvents > 5) return 'high';
    if (highEvents > 0 || mediumEvents > 10) return 'medium';
    return 'low';
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(stats: SecurityStats, riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('Immediate review required - critical security threats detected');
      recommendations.push('Consider temporary access restrictions');
    }

    if (riskLevel === 'high') {
      recommendations.push('Review recent security events and user activity');
      recommendations.push('Consider increasing monitoring sensitivity');
    }

    if (stats.eventsByType.devtools_detected && stats.eventsByType.devtools_detected > 5) {
      recommendations.push('High developer tools usage detected - normal in development environment');
    }

    if (stats.eventsByType.suspicious_activity && stats.eventsByType.suspicious_activity > 3) {
      recommendations.push('Monitor user behavior patterns for anomalies');
    }

    if (stats.activeMonitors.includes('smart')) {
      recommendations.push('Smart monitoring is active and learning from user behavior');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security monitoring is functioning normally');
      recommendations.push('Continue regular monitoring and review');
    }

    return recommendations;
  }

  /**
   * Generate security summary
   */
  private generateSummary(stats: SecurityStats, riskLevel: string): string {
    const monitorTypes = stats.activeMonitors.join(' + ');
    const eventCount = stats.totalEvents;
    
    let summary = `Security Status: ${riskLevel.toUpperCase()} risk level detected. `;
    summary += `${eventCount} security events recorded. `;
    summary += `Active monitoring: ${monitorTypes}. `;
    
    if (riskLevel === 'low') {
      summary += 'All systems operating normally with no significant threats detected.';
    } else if (riskLevel === 'medium') {
      summary += 'Some security events detected - monitoring and assessment recommended.';
    } else if (riskLevel === 'high') {
      summary += 'Elevated security activity detected - review and action may be required.';
    } else {
      summary += 'Critical security threats detected - immediate attention required.';
    }

    return summary;
  }

  /**
   * Report external threat to active monitors
   */
  reportThreat(
    type: string,
    details: Record<string, unknown>,
    confidence: number = 80
  ): void {
    if (this.smartMonitor) {
      this.smartMonitor.reportExternalThreat(type as any, details, confidence);
    }
    
    if (this.legacyMonitor) {
      this.legacyMonitor.reportEvent(type as any, details, 'external');
    }
  }

  /**
   * Enable/disable learning (smart monitor only)
   */
  setLearningEnabled(enabled: boolean): void {
    if (this.smartMonitor) {
      this.smartMonitor.setLearningEnabled(enabled);
      console.log(`SecurityManager: Learning ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Reset behavior profile (smart monitor only)
   */
  resetBehaviorProfile(): void {
    if (this.smartMonitor) {
      this.smartMonitor.resetBehaviorProfile();
      console.log('SecurityManager: Behavior profile reset');
    }
  }

  /**
   * Get monitor status
   */
  getStatus(): {
    isInitialized: boolean;
    smartMonitorActive: boolean;
    legacyMonitorActive: boolean;
    config: any;
  } {
    const config = getSecurityConfig();
    
    return {
      isInitialized: this.isInitialized,
      smartMonitorActive: !!this.smartMonitor,
      legacyMonitorActive: !!this.legacyMonitor,
      config: config.monitoring,
    };
  }

  /**
   * Add event listener to active monitors
   */
  addEventListener(listener: (event: any) => void): void {
    if (this.smartMonitor) {
      this.smartMonitor.addEventListener(listener);
    }
    
    if (this.legacyMonitor) {
      this.legacyMonitor.addEventListener(listener);
    }
  }

  /**
   * Remove event listener from active monitors
   */
  removeEventListener(listener: (event: any) => void): void {
    if (this.smartMonitor) {
      this.smartMonitor.removeEventListener(listener);
    }
    
    if (this.legacyMonitor) {
      this.legacyMonitor.removeEventListener(listener);
    }
  }

  /**
   * Stop all monitoring
   */
  stopMonitoring(): void {
    if (this.smartMonitor) {
      this.smartMonitor.stopMonitoring();
    }
    
    if (this.legacyMonitor) {
      this.legacyMonitor.stopMonitoring();
    }
    
    console.log('SecurityManager: All monitoring stopped');
  }

  /**
   * Destroy security manager
   */
  destroy(): void {
    if (this.smartMonitor) {
      this.smartMonitor.destroy();
      this.smartMonitor = null;
    }
    
    if (this.legacyMonitor) {
      this.legacyMonitor.destroy();
      this.legacyMonitor = null;
    }
    
    this.isInitialized = false;
    SecurityManager.instance = null;
    console.log('SecurityManager: Destroyed');
  }
}

// Auto-initialize security manager
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      const securityManager = SecurityManager.getInstance();
      await securityManager.initialize();
      
      // Add to window for debugging in development
      if (process.env.NODE_ENV === 'development') {
        (window as any).SecurityManager = SecurityManager;
        (window as any).securityManager = securityManager;
        console.log('🛡️ SecurityManager: Debug utilities available at window.SecurityManager');
        
        // Log initial status
        const status = securityManager.getStatus();
        console.log('🛡️ SecurityManager Status:', status);
        
        // Log initial report
        setTimeout(() => {
          const report = securityManager.generateSecurityReport();
          console.log('🛡️ Security Report:', report);
        }, 2000);
      }
    } catch (error) {
      console.error('SecurityManager: Failed to initialize', error);
    }
  }, 2000); // Allow other systems to initialize first
}