// Development-Safe Service Worker Registration
// Prevents reload loops and interference with hot module reload in development

import { swManager } from './swRegistration';

export class DevSafeServiceWorkerManager {
  private static instance: DevSafeServiceWorkerManager;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isRegistered = false;

  static getInstance(): DevSafeServiceWorkerManager {
    if (!DevSafeServiceWorkerManager.instance) {
      DevSafeServiceWorkerManager.instance = new DevSafeServiceWorkerManager();
    }
    return DevSafeServiceWorkerManager.instance;
  }

  async safeRegister(): Promise<void> {
    if (this.isDevelopment) {
      console.log('🔧 Development mode: Service worker registration disabled to prevent reload loops');
      console.log('📝 PWA features will be available in production build');
      return;
    }

    if (this.isRegistered) {
      console.log('Service worker already registered');
      return;
    }

    try {
      await swManager.register();
      this.isRegistered = true;
      console.log('✅ Service worker registered successfully');
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  }

  // For development testing only - manually register SW
  async forceRegisterInDev(): Promise<void> {
    if (!this.isDevelopment) {
      console.log('Force registration only available in development');
      return;
    }

    console.warn('⚠️ Force registering service worker in development - this may cause reload loops');
    
    try {
      // Temporarily override the development check
      const originalNodeEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      
      await swManager.register();
      this.isRegistered = true;
      
      // Restore original environment
      (process.env as any).NODE_ENV = originalNodeEnv;
      
      console.log('✅ Service worker force-registered in development');
    } catch (error) {
      console.error('❌ Force registration failed:', error);
    }
  }

  // Check if SW should be active
  shouldBeActive(): boolean {
    return !this.isDevelopment;
  }

  // Get registration status
  getStatus() {
    return {
      isDevelopment: this.isDevelopment,
      isRegistered: this.isRegistered,
      shouldBeActive: this.shouldBeActive(),
      reason: this.isDevelopment 
        ? 'Disabled in development to prevent reload loops'
        : this.isRegistered 
        ? 'Active and registered'
        : 'Not yet registered'
    };
  }

  // Safe unregister (for development testing)
  async safeUnregister(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('🗑️ Service worker unregistered');
      }
      this.isRegistered = false;
    } catch (error) {
      console.error('Error unregistering service worker:', error);
    }
  }
}

// Global instance
export const devSafeSW = DevSafeServiceWorkerManager.getInstance();

// Development helper functions
export const devHelpers = {
  // Get current service worker status
  getStatus: () => devSafeSW.getStatus(),
  
  // Force register in development (for testing)
  forceRegister: () => devSafeSW.forceRegisterInDev(),
  
  // Unregister all service workers
  unregisterAll: () => devSafeSW.safeUnregister(),
  
  // Log PWA status
  logPWAStatus: () => {
    const status = devSafeSW.getStatus();
    console.group('📱 PWA Status');
    console.log('Environment:', status.isDevelopment ? 'Development' : 'Production');
    console.log('Service Worker:', status.isRegistered ? 'Registered' : 'Not Registered');
    console.log('Status:', status.reason);
    console.log('Should be active:', status.shouldBeActive);
    
    if (status.isDevelopment) {
      console.log('');
      console.log('🔧 Development Commands:');
      console.log('- devHelpers.forceRegister() - Force register SW (may cause loops)');
      console.log('- devHelpers.unregisterAll() - Unregister all SWs');
      console.log('- devHelpers.getStatus() - Get current status');
    }
    console.groupEnd();
  }
};

// Make dev helpers globally available in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).devHelpers = devHelpers;
  (window as any).pwaStatus = () => devHelpers.logPWAStatus();
  
  // Auto-log status on load
  setTimeout(() => {
    devHelpers.logPWAStatus();
  }, 1000);
}

export default devSafeSW;