// Service Worker Registration and Management
// Handles registration, updates, and offline detection

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private isUpdateAvailable = false;
  private waitingWorker: ServiceWorker | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config;
    this.initializeEventListeners();
  }

  async register(): Promise<void> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.warn('Service worker registration skipped - not in browser environment');
      return;
    }

    // Skip service worker registration in development to prevent reload loops
    if (process.env.NODE_ENV === 'development') {
      console.log('Service worker registration skipped in development mode');
      return;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        this.registration = registration;
        console.log('SW registered: ', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            this.handleNewWorker(newWorker);
          }
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          this.waitingWorker = registration.waiting;
          this.isUpdateAvailable = true;
          this.config.onUpdate?.(registration);
        }

        // Success callback
        this.config.onSuccess?.(registration);
      } catch (error) {
        console.error('SW registration failed: ', error);
      }
    }
  }

  private handleNewWorker(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New worker is waiting to take over
          this.waitingWorker = worker;
          this.isUpdateAvailable = true;
          this.config.onUpdate?.(this.registration!);
        } else {
          // First time install
          this.config.onSuccess?.(this.registration!);
        }
      }
    });
  }

  private initializeEventListeners(): void {
    // Only initialize in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Online/offline detection
    if (window.addEventListener) {
      window.addEventListener('online', () => {
        console.log('App is online');
        this.config.onOnline?.();
      });

      window.addEventListener('offline', () => {
        console.log('App is offline');
        this.config.onOffline?.();
      });
    }

    // Listen for controlling service worker changes (only in production)
    if (navigator.serviceWorker && navigator.serviceWorker.addEventListener && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed - reloading page');
        if (window.location && window.location.reload) {
          window.location.reload();
        }
      });
    }
  }

  activateWaitingWorker(): void {
    if (this.waitingWorker) {
      this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      this.waitingWorker = null;
      this.isUpdateAvailable = false;
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  hasUpdateAvailable(): boolean {
    return this.isUpdateAvailable;
  }

  async unregister(): Promise<boolean> {
    if ('serviceWorker' in navigator && this.registration) {
      return await this.registration.unregister();
    }
    return false;
  }

  // Cache management methods
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  async getCacheSize(): Promise<{ name: string; size: number }[]> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cacheSizes = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, size: keys.length };
        })
      );
      return cacheSizes;
    }
    return [];
  }

  // Background sync registration
  async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log(`Background sync registered: ${tag}`);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Push notification methods
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            // Add your VAPID public key here
            'YOUR_VAPID_PUBLIC_KEY'
          )
        });
        return subscription;
      } catch (error) {
        console.error('Push subscription failed:', error);
        return null;
      }
    }
    return null;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Offline Storage Management
export class OfflineStorageManager {
  private dbName = 'TrackAmOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('deliveries')) {
          db.createObjectStore('deliveries', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('offlineActions')) {
          const store = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async storeDelivery(delivery: any): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['deliveries'], 'readwrite');
    const store = transaction.objectStore('deliveries');
    await store.put(delivery);
  }

  async getDelivery(id: string): Promise<any> {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(['deliveries'], 'readonly');
    const store = transaction.objectStore('deliveries');
    return await store.get(id);
  }

  async storeOfflineAction(action: { type: string; data: any; timestamp: number }): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.add(action);
  }

  async getOfflineActions(): Promise<any[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    return await store.getAll();
  }

  async clearOfflineActions(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.clear();
  }
}

// Export singleton instances
export const swManager = new ServiceWorkerManager();
export const offlineStorage = new OfflineStorageManager();

// Main registration function
export const registerSW = (config: ServiceWorkerConfig = {}) => {
  const manager = new ServiceWorkerManager(config);
  return manager.register();
};

// Utility functions
export const isOnline = (): boolean => navigator.onLine;
export const isOffline = (): boolean => !navigator.onLine;

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
};

export default swManager;