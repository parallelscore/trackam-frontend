/**
 * Smart Security Monitor
 * Intelligent threat detection with adaptive thresholds and behavioral analysis
 */

import { SecureStorage } from '@/utils/secureStorage';
import { SessionManager } from './sessionManager';
import { SecurityLogger } from '@/utils/securityHeaders';
import { AppError, ErrorType, logError } from '@/utils/errorHandling';
import { getSecurityConfig, INIT_DELAYS } from '@/config/securityConfig';

interface SecurityThreat {
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100 confidence score
  timestamp: number;
  details: Record<string, unknown>;
  source: string;
  context: ThreatContext;
}

interface ThreatContext {
  userAgent: string;
  sessionDuration: number;
  recentActivity: string[];
  browserFingerprint: string;
  locationConsistency: boolean;
  timeOfDay: number;
}

type ThreatType = 
  | 'token_tampering'
  | 'csrf_attack'
  | 'session_hijacking'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'invalid_origin'
  | 'xss_attempt'
  | 'storage_manipulation'
  | 'devtools_detected'
  | 'behavioral_anomaly'
  | 'injection_attempt'
  | 'automation_detected';

interface BehaviorProfile {
  avgSessionDuration: number;
  commonUserAgents: string[];
  typicalActivityPatterns: string[];
  lastSeenLocations: string[];
  deviceFingerprints: string[];
  timeZonePreference: string;
  interactionSpeed: number;
  created: number;
  updated: number;
}

interface ThreatRule {
  type: ThreatType;
  baseThreshold: number;
  maxThreshold: number;
  learningRate: number;
  requiresLogout: boolean;
  adaptiveScoring: boolean;
}

/**
 * Smart threat detection rules with adaptive thresholds
 */
const SMART_THREAT_RULES: ThreatRule[] = [
  {
    type: 'token_tampering',
    baseThreshold: 90,
    maxThreshold: 95,
    learningRate: 0.1,
    requiresLogout: true,
    adaptiveScoring: false,
  },
  {
    type: 'csrf_attack',
    baseThreshold: 85,
    maxThreshold: 90,
    learningRate: 0.2,
    requiresLogout: true,
    adaptiveScoring: true,
  },
  {
    type: 'session_hijacking',
    baseThreshold: 88,
    maxThreshold: 95,
    learningRate: 0.15,
    requiresLogout: true,
    adaptiveScoring: true,
  },
  {
    type: 'suspicious_activity',
    baseThreshold: 70,
    maxThreshold: 85,
    learningRate: 0.3,
    requiresLogout: false,
    adaptiveScoring: true,
  },
  {
    type: 'rate_limit_exceeded',
    baseThreshold: 75,
    maxThreshold: 90,
    learningRate: 0.25,
    requiresLogout: false,
    adaptiveScoring: true,
  },
  {
    type: 'invalid_origin',
    baseThreshold: 95,
    maxThreshold: 100,
    learningRate: 0.05,
    requiresLogout: true,
    adaptiveScoring: false,
  },
  {
    type: 'xss_attempt',
    baseThreshold: 92,
    maxThreshold: 98,
    learningRate: 0.1,
    requiresLogout: true,
    adaptiveScoring: false,
  },
  {
    type: 'storage_manipulation',
    baseThreshold: 80,
    maxThreshold: 90,
    learningRate: 0.2,
    requiresLogout: true,
    adaptiveScoring: true,
  },
  {
    type: 'devtools_detected',
    baseThreshold: 30,
    maxThreshold: 60,
    learningRate: 0.4,
    requiresLogout: false,
    adaptiveScoring: true,
  },
  {
    type: 'behavioral_anomaly',
    baseThreshold: 65,
    maxThreshold: 80,
    learningRate: 0.35,
    requiresLogout: false,
    adaptiveScoring: true,
  },
];

/**
 * Smart Security Monitor class with behavioral analysis
 */
export class SmartSecurityMonitor {
  private static instance: SmartSecurityMonitor | null = null;
  private threats: SecurityThreat[] = [];
  private behaviorProfile: BehaviorProfile | null = null;
  private isMonitoring = false;
  private adaptiveThresholds: Map<ThreatType, number> = new Map();
  private eventListeners: Array<(threat: SecurityThreat) => void> = [];
  private learningEnabled = true;
  
  // Activity tracking
  private sessionStartTime = Date.now();
  private activityLog: string[] = [];
  private lastActivity = Date.now();
  private interactionSpeeds: number[] = [];
  
  // Detection state
  private allowedOrigins: string[] = [];
  private trustedFingerprint: string | null = null;
  private suspiciousPatterns: Map<string, number> = new Map();

  /**
   * Get singleton instance
   */
  static getInstance(): SmartSecurityMonitor {
    if (!this.instance) {
      this.instance = new SmartSecurityMonitor();
    }
    return this.instance;
  }

  /**
   * Initialize smart security monitoring
   */
  async initialize(): Promise<void> {
    const securityConfig = getSecurityConfig();
    if (!securityConfig.monitoring.enabled || this.isMonitoring) {
      return;
    }

    console.log('SmartSecurityMonitor: Initializing intelligent security monitoring');
    this.isMonitoring = true;

    // Set up allowed origins
    this.setupAllowedOrigins();
    
    // Load or create behavior profile
    await this.loadBehaviorProfile();
    
    // Initialize adaptive thresholds
    this.initializeAdaptiveThresholds();
    
    // Set up monitoring mechanisms
    this.setupBehavioralMonitoring();
    this.setupStorageMonitoring();
    this.setupOriginValidation();
    this.setupCSRFProtection();
    this.setupXSSDetection();
    this.setupAutomationDetection();
    
    // Start learning process
    this.startLearningProcess();
    
    // Set up cleanup
    this.setupCleanup();
  }

  /**
   * Set up allowed origins
   */
  private setupAllowedOrigins(): void {
    this.allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:4173',
      'https://trackam.xyz',
      'https://www.trackam.xyz'
    ];
  }

  /**
   * Load or create user behavior profile
   */
  private async loadBehaviorProfile(): Promise<void> {
    try {
      const stored = localStorage.getItem('trackam_behavior_profile');
      if (stored) {
        this.behaviorProfile = JSON.parse(stored);
        console.log('SmartSecurityMonitor: Loaded existing behavior profile');
      } else {
        this.behaviorProfile = this.createDefaultBehaviorProfile();
        console.log('SmartSecurityMonitor: Created new behavior profile');
      }
    } catch (error) {
      console.warn('SmartSecurityMonitor: Failed to load behavior profile, creating new one');
      this.behaviorProfile = this.createDefaultBehaviorProfile();
    }
  }

  /**
   * Create default behavior profile
   */
  private createDefaultBehaviorProfile(): BehaviorProfile {
    return {
      avgSessionDuration: 30 * 60 * 1000, // 30 minutes
      commonUserAgents: [navigator.userAgent],
      typicalActivityPatterns: [],
      lastSeenLocations: [window.location.origin],
      deviceFingerprints: [this.generateDeviceFingerprint()],
      timeZonePreference: Intl.DateTimeFormat().resolvedOptions().timeZone,
      interactionSpeed: 500, // Average ms between interactions
      created: Date.now(),
      updated: Date.now(),
    };
  }

  /**
   * Initialize adaptive thresholds
   */
  private initializeAdaptiveThresholds(): void {
    SMART_THREAT_RULES.forEach(rule => {
      this.adaptiveThresholds.set(rule.type, rule.baseThreshold);
    });
  }

  /**
   * Set up behavioral monitoring
   */
  private setupBehavioralMonitoring(): void {
    // Track user interactions
    const interactionEvents = ['click', 'keydown', 'scroll', 'mousemove'];
    let lastInteraction = Date.now();

    interactionEvents.forEach(event => {
      document.addEventListener(event, () => {
        const now = Date.now();
        const speed = now - lastInteraction;
        
        this.logActivity(event);
        this.trackInteractionSpeed(speed);
        
        lastInteraction = now;
        this.lastActivity = now;
      }, { passive: true });
    });

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.logActivity(document.hidden ? 'page_hidden' : 'page_visible');
    });
  }

  /**
   * Set up intelligent storage monitoring
   */
  private setupStorageMonitoring(): void {
    // Monitor storage events with context awareness
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('trackam_')) {
        this.analyzeStorageChange(event);
      }
    });

    // Smart storage access monitoring with reduced false positives
    this.setupSmartStorageAccessMonitoring();
  }

  /**
   * Smart storage access monitoring
   */
  private setupSmartStorageAccessMonitoring(): void {
    // Allow legitimate app operations during startup
    setTimeout(() => {
      const originalSetItem = localStorage.setItem;
      const originalRemoveItem = localStorage.removeItem;
      const originalClear = localStorage.clear;

      localStorage.setItem = function(key: string, value: string) {
        if (key.startsWith('trackam_') && SmartSecurityMonitor.getInstance().isMonitoring) {
          SmartSecurityMonitor.getInstance().analyzeStorageAccess('setItem', key, value);
        }
        return originalSetItem.call(this, key, value);
      };

      localStorage.removeItem = function(key: string) {
        if (key.startsWith('trackam_') && SmartSecurityMonitor.getInstance().isMonitoring) {
          SmartSecurityMonitor.getInstance().analyzeStorageAccess('removeItem', key);
        }
        return originalRemoveItem.call(this, key);
      };

      localStorage.clear = function() {
        if (SmartSecurityMonitor.getInstance().isMonitoring) {
          SmartSecurityMonitor.getInstance().analyzeStorageAccess('clear');
        }
        return originalClear.call(this);
      };
    }, 5000); // Increased delay to allow app initialization
  }

  /**
   * Analyze storage changes with context
   */
  private analyzeStorageChange(event: StorageEvent): void {
    const context = this.buildThreatContext();
    
    // Smart analysis based on context
    if (event.key === 'trackam_access_token') {
      if (event.newValue === null) {
        // Token removed - check if legitimate logout
        const recentLogout = this.activityLog.slice(-5).includes('logout_triggered');
        if (!recentLogout) {
          this.reportThreat('token_tampering', {
            action: 'token_removed_unexpectedly',
            key: event.key,
            context: 'storage_event'
          }, context, 85);
        }
      } else if (event.oldValue && event.newValue && event.oldValue !== event.newValue) {
        // Token modified - check if legitimate refresh
        const recentRefresh = this.activityLog.slice(-3).includes('token_refresh');
        if (!recentRefresh) {
          this.reportThreat('token_tampering', {
            action: 'token_modified_unexpectedly',
            key: event.key,
            context: 'storage_event'
          }, context, 90);
        }
      }
    }
  }

  /**
   * Analyze storage access patterns
   */
  private analyzeStorageAccess(action: string, key?: string, value?: string): void {
    const context = this.buildThreatContext();
    
    // Check for suspicious patterns
    if (action === 'clear' && !this.activityLog.slice(-3).includes('logout_triggered')) {
      this.reportThreat('storage_manipulation', {
        action: 'unexpected_clear',
        suspicious: true,
        context: 'localStorage_override'
      }, context, 75);
    }
    
    // Track access patterns for learning
    const pattern = `${action}:${key || 'all'}`;
    const count = this.suspiciousPatterns.get(pattern) || 0;
    this.suspiciousPatterns.set(pattern, count + 1);
  }

  /**
   * Set up enhanced origin validation
   */
  private setupOriginValidation(): void {
    if (typeof window === 'undefined') return;

    const currentOrigin = window.location.origin;
    
    // Only report if clearly not allowed (production safety)
    if (process.env.NODE_ENV === 'production' && !this.allowedOrigins.includes(currentOrigin)) {
      const context = this.buildThreatContext();
      this.reportThreat('invalid_origin', {
        origin: currentOrigin,
        allowed: this.allowedOrigins,
        environment: process.env.NODE_ENV
      }, context, 95);
    }
  }

  /**
   * Set up smart CSRF protection
   */
  private setupCSRFProtection(): void {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input.toString();
      
      if (init?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method.toUpperCase())) {
        const isAuthEndpoint = /\/(register|login|request-otp|verify-otp)\//.test(url);
        const isApiCall = url.includes('/api/');
        
        if (isApiCall && !isAuthEndpoint) {
          const headers = new Headers(init.headers);
          if (!headers.has('X-CSRF-Token') && !headers.has('Authorization')) {
            const context = SmartSecurityMonitor.getInstance().buildThreatContext();
            SmartSecurityMonitor.getInstance().reportThreat('csrf_attack', {
              url,
              method: init.method,
              missingCSRF: true,
              hasAuth: headers.has('Authorization')
            }, context, 80);
          }
        }
      }

      return originalFetch.call(this, input, init);
    };
  }

  /**
   * Set up XSS detection
   */
  private setupXSSDetection(): void {
    // Monitor for suspicious script injections
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-trackam-safe')) {
                const context = this.buildThreatContext();
                this.reportThreat('xss_attempt', {
                  type: 'script_injection',
                  src: element.getAttribute('src'),
                  content: element.textContent?.substring(0, 100)
                }, context, 90);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Set up automation detection
   */
  private setupAutomationDetection(): void {
    let consecutiveEvents = 0;
    let lastEventTime = Date.now();

    document.addEventListener('click', (event) => {
      const now = Date.now();
      const timeDiff = now - lastEventTime;

      // Detect suspiciously fast or regular clicking patterns
      if (timeDiff < 50) { // Less than 50ms between clicks
        consecutiveEvents++;
        if (consecutiveEvents > 5) {
          const context = this.buildThreatContext();
          this.reportThreat('automation_detected', {
            type: 'rapid_clicking',
            timeDiff,
            consecutiveEvents
          }, context, 70);
        }
      } else {
        consecutiveEvents = 0;
      }

      lastEventTime = now;
    });
  }

  /**
   * Build threat context for analysis
   */
  private buildThreatContext(): ThreatContext {
    return {
      userAgent: navigator.userAgent,
      sessionDuration: Date.now() - this.sessionStartTime,
      recentActivity: this.activityLog.slice(-10),
      browserFingerprint: this.generateDeviceFingerprint(),
      locationConsistency: this.checkLocationConsistency(),
      timeOfDay: new Date().getHours(),
    };
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('TrackAm fingerprint', 2, 2);
    
    return btoa(
      navigator.userAgent +
      navigator.language +
      screen.width + 'x' + screen.height +
      new Date().getTimezoneOffset() +
      canvas.toDataURL()
    ).substring(0, 32);
  }

  /**
   * Check location consistency
   */
  private checkLocationConsistency(): boolean {
    if (!this.behaviorProfile) return true;
    
    const currentOrigin = window.location.origin;
    return this.behaviorProfile.lastSeenLocations.includes(currentOrigin);
  }

  /**
   * Log activity for behavioral analysis
   */
  private logActivity(activity: string): void {
    this.activityLog.push(activity);
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(-30);
    }
  }

  /**
   * Track interaction speed for behavioral profiling
   */
  private trackInteractionSpeed(speed: number): void {
    this.interactionSpeeds.push(speed);
    if (this.interactionSpeeds.length > 20) {
      this.interactionSpeeds = this.interactionSpeeds.slice(-15);
    }
  }

  /**
   * Report a security threat with intelligent scoring
   */
  private reportThreat(
    type: ThreatType,
    details: Record<string, unknown>,
    context: ThreatContext,
    baseConfidence: number
  ): void {
    // Calculate adaptive confidence score
    const confidence = this.calculateAdaptiveConfidence(type, baseConfidence, context);
    const threshold = this.adaptiveThresholds.get(type) || 70;
    
    if (confidence < threshold) {
      console.log(`SmartSecurityMonitor: Low confidence threat ignored - ${type} (${confidence}% < ${threshold}%)`);
      return;
    }

    const threat: SecurityThreat = {
      type,
      severity: this.calculateSeverity(confidence),
      confidence,
      timestamp: Date.now(),
      details,
      source: 'SmartSecurityMonitor',
      context,
    };

    this.threats.push(threat);
    this.trimThreats();

    SecurityLogger.logEvent(type, { ...details, confidence, context });
    this.emitThreat(threat);

    console.warn(`SmartSecurityMonitor: ${type} detected (${confidence}% confidence)`, details);

    // Decide on response based on confidence and rule settings
    const rule = SMART_THREAT_RULES.find(r => r.type === type);
    if (rule?.requiresLogout && confidence >= 85) {
      this.triggerSecurityResponse(threat);
    }

    // Learn from this threat
    if (this.learningEnabled) {
      this.learnFromThreat(threat);
    }
  }

  /**
   * Calculate adaptive confidence based on context and learning
   */
  private calculateAdaptiveConfidence(
    type: ThreatType,
    baseConfidence: number,
    context: ThreatContext
  ): number {
    let adjustedConfidence = baseConfidence;

    // Adjust based on behavioral profile
    if (this.behaviorProfile) {
      // User agent consistency
      if (!this.behaviorProfile.commonUserAgents.includes(context.userAgent)) {
        adjustedConfidence += 10;
      }

      // Session duration patterns
      const expectedDuration = this.behaviorProfile.avgSessionDuration;
      const durationRatio = context.sessionDuration / expectedDuration;
      if (durationRatio > 3 || durationRatio < 0.1) {
        adjustedConfidence += 5;
      }

      // Time of day patterns
      const currentHour = context.timeOfDay;
      if (currentHour < 6 || currentHour > 23) { // Unusual hours
        adjustedConfidence += 5;
      }

      // Device fingerprint consistency
      if (!this.behaviorProfile.deviceFingerprints.includes(context.browserFingerprint)) {
        adjustedConfidence += 15;
      }
    }

    // Reduce confidence for known safe patterns
    if (type === 'devtools_detected' && process.env.NODE_ENV === 'development') {
      adjustedConfidence -= 20;
    }

    return Math.max(0, Math.min(100, adjustedConfidence));
  }

  /**
   * Calculate threat severity
   */
  private calculateSeverity(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 95) return 'critical';
    if (confidence >= 85) return 'high';
    if (confidence >= 70) return 'medium';
    return 'low';
  }

  /**
   * Trigger security response
   */
  private triggerSecurityResponse(threat: SecurityThreat): void {
    console.error(`SmartSecurityMonitor: Triggering security response for ${threat.type}`);

    this.logActivity('security_response_triggered');

    const securityError = new AppError(
      ErrorType.SECURITY_ERROR,
      `Smart security response: ${threat.type}`,
      'Security threat detected. You have been logged out for your protection.',
      { 
        code: 'SMART_SECURITY_RESPONSE',
        details: {
          threatType: threat.type,
          confidence: threat.confidence,
          severity: threat.severity,
          timestamp: threat.timestamp,
        }
      }
    );
    logError(securityError, 'SmartSecurityMonitor');

    // Use SessionManager for controlled logout
    const sessionManager = SessionManager.getInstance();
    sessionManager.logout(`smart_security_${threat.type}`);
  }

  /**
   * Learn from threat patterns
   */
  private learnFromThreat(threat: SecurityThreat): void {
    const rule = SMART_THREAT_RULES.find(r => r.type === threat.type);
    if (!rule?.adaptiveScoring) return;

    // Adjust threshold based on false positive detection
    const currentThreshold = this.adaptiveThresholds.get(threat.type) || rule.baseThreshold;
    
    // If low confidence threats are frequently reported, increase threshold
    if (threat.confidence < currentThreshold + 10) {
      const newThreshold = Math.min(
        rule.maxThreshold,
        currentThreshold + (rule.learningRate * 5)
      );
      this.adaptiveThresholds.set(threat.type, newThreshold);
      console.log(`SmartSecurityMonitor: Adjusted ${threat.type} threshold to ${newThreshold}%`);
    }

    // Update behavior profile
    this.updateBehaviorProfile(threat);
  }

  /**
   * Update behavior profile based on interactions
   */
  private updateBehaviorProfile(threat: SecurityThreat): void {
    if (!this.behaviorProfile) return;

    const context = threat.context;
    
    // Update user agents
    if (!this.behaviorProfile.commonUserAgents.includes(context.userAgent)) {
      this.behaviorProfile.commonUserAgents.push(context.userAgent);
      if (this.behaviorProfile.commonUserAgents.length > 3) {
        this.behaviorProfile.commonUserAgents = this.behaviorProfile.commonUserAgents.slice(-3);
      }
    }

    // Update device fingerprints
    if (!this.behaviorProfile.deviceFingerprints.includes(context.browserFingerprint)) {
      this.behaviorProfile.deviceFingerprints.push(context.browserFingerprint);
      if (this.behaviorProfile.deviceFingerprints.length > 3) {
        this.behaviorProfile.deviceFingerprints = this.behaviorProfile.deviceFingerprints.slice(-3);
      }
    }

    // Update session duration average
    this.behaviorProfile.avgSessionDuration = 
      (this.behaviorProfile.avgSessionDuration * 0.8) + (context.sessionDuration * 0.2);

    // Update interaction speed
    if (this.interactionSpeeds.length > 0) {
      const avgSpeed = this.interactionSpeeds.reduce((a, b) => a + b, 0) / this.interactionSpeeds.length;
      this.behaviorProfile.interactionSpeed = 
        (this.behaviorProfile.interactionSpeed * 0.8) + (avgSpeed * 0.2);
    }

    this.behaviorProfile.updated = Date.now();
    this.saveBehaviorProfile();
  }

  /**
   * Save behavior profile
   */
  private saveBehaviorProfile(): void {
    if (!this.behaviorProfile) return;
    
    try {
      localStorage.setItem('trackam_behavior_profile', JSON.stringify(this.behaviorProfile));
    } catch (error) {
      console.warn('SmartSecurityMonitor: Failed to save behavior profile', error);
    }
  }

  /**
   * Start learning process
   */
  private startLearningProcess(): void {
    // Periodic learning updates
    setInterval(() => {
      this.performPeriodicLearning();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Perform periodic learning
   */
  private performPeriodicLearning(): void {
    // Analyze recent patterns
    const recentThreats = this.threats.filter(t => 
      Date.now() - t.timestamp < 30 * 60 * 1000 // Last 30 minutes
    );

    // Adjust thresholds based on threat frequency
    const threatCounts = new Map<ThreatType, number>();
    recentThreats.forEach(threat => {
      threatCounts.set(threat.type, (threatCounts.get(threat.type) || 0) + 1);
    });

    threatCounts.forEach((count, type) => {
      if (count > 3) { // Many recent threats of same type
        const rule = SMART_THREAT_RULES.find(r => r.type === type);
        if (rule?.adaptiveScoring) {
          const currentThreshold = this.adaptiveThresholds.get(type) || rule.baseThreshold;
          const newThreshold = Math.min(
            rule.maxThreshold,
            currentThreshold + (rule.learningRate * 10)
          );
          this.adaptiveThresholds.set(type, newThreshold);
          console.log(`SmartSecurityMonitor: Increased ${type} threshold due to frequency`);
        }
      }
    });
  }

  /**
   * Set up cleanup
   */
  private setupCleanup(): void {
    setInterval(() => {
      this.cleanupOldThreats();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Clean up old threats
   */
  private cleanupOldThreats(): void {
    const retentionTime = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    
    this.threats = this.threats.filter(threat => 
      (now - threat.timestamp) <= retentionTime
    );
  }

  /**
   * Trim threats to max limit
   */
  private trimThreats(): void {
    const maxThreats = 500;
    if (this.threats.length > maxThreats) {
      this.threats = this.threats.slice(-maxThreats);
    }
  }

  /**
   * Emit threat to listeners
   */
  private emitThreat(threat: SecurityThreat): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(threat);
      } catch (error) {
        console.error('SmartSecurityMonitor: Error in threat listener', error);
      }
    });
  }

  /**
   * Public API methods
   */

  /**
   * Add threat listener
   */
  addEventListener(listener: (threat: SecurityThreat) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove threat listener
   */
  removeEventListener(listener: (threat: SecurityThreat) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalThreats: number;
    threatsByType: Record<ThreatType, number>;
    threatsBySeverity: Record<string, number>;
    adaptiveThresholds: Record<ThreatType, number>;
    behaviorProfile: BehaviorProfile | null;
    recentThreats: SecurityThreat[];
  } {
    const threatsByType = {} as Record<ThreatType, number>;
    const threatsBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };

    this.threats.forEach(threat => {
      threatsByType[threat.type] = (threatsByType[threat.type] || 0) + 1;
      threatsBySeverity[threat.severity]++;
    });

    const adaptiveThresholds = {} as Record<ThreatType, number>;
    this.adaptiveThresholds.forEach((threshold, type) => {
      adaptiveThresholds[type] = threshold;
    });

    return {
      totalThreats: this.threats.length,
      threatsByType,
      threatsBySeverity,
      adaptiveThresholds,
      behaviorProfile: this.behaviorProfile,
      recentThreats: this.threats.slice(-10),
    };
  }

  /**
   * Manual threat reporting for external systems
   */
  reportExternalThreat(
    type: ThreatType,
    details: Record<string, unknown>,
    confidence: number = 80
  ): void {
    const context = this.buildThreatContext();
    this.reportThreat(type, details, context, confidence);
  }

  /**
   * Enable/disable learning
   */
  setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
    console.log(`SmartSecurityMonitor: Learning ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Reset behavior profile
   */
  resetBehaviorProfile(): void {
    this.behaviorProfile = this.createDefaultBehaviorProfile();
    this.saveBehaviorProfile();
    console.log('SmartSecurityMonitor: Behavior profile reset');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.eventListeners = [];
    console.log('SmartSecurityMonitor: Monitoring stopped');
  }

  /**
   * Destroy the monitor
   */
  destroy(): void {
    this.stopMonitoring();
    this.threats = [];
    this.behaviorProfile = null;
    SmartSecurityMonitor.instance = null;
  }
}

// Initialize smart security monitoring for browser environment
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      const smartMonitor = SmartSecurityMonitor.getInstance();
      await smartMonitor.initialize();
      
      if (process.env.NODE_ENV === 'development') {
        (window as any).SmartSecurityMonitor = SmartSecurityMonitor;
        (window as any).smartSecurityMonitor = smartMonitor;
        console.log('🧠 SmartSecurityMonitor: Debug utilities available');
      }
    } catch (error) {
      console.error('SmartSecurityMonitor: Failed to initialize', error);
    }
  }, INIT_DELAYS.securityMonitoring + 1000); // Start after basic security monitor
}