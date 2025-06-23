// Offline-Aware API Client
// Extends the existing API client with offline capabilities and caching

import { ApiClient, ApiResponse } from '../services/apiClient';
import { offlineStorage, isOnline, waitForOnline, swManager } from './swRegistration';

interface OfflineAction {
  id?: number;
  type: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

interface CachedResponse {
  data: any;
  timestamp: number;
  expires: number;
}

class OfflineApiClient extends ApiClient {
  private cachePrefix = 'trackam-api-';
  private offlineActions: OfflineAction[] = [];

  constructor() {
    super();
    this.setupOfflineInterceptors();
    this.loadOfflineActions();
  }

  private setupOfflineInterceptors(): void {
    // Request interceptor - handle offline requests
    this.axios.interceptors.request.use(
      async (config) => {
        if (!isOnline()) {
          // Try to get cached response for GET requests
          if (config.method?.toUpperCase() === 'GET') {
            const cachedResponse = await this.getCachedResponse(config.url!);
            if (cachedResponse) {
              console.log('Serving cached response for:', config.url);
              return Promise.reject({
                config,
                response: {
                  data: cachedResponse.data,
                  status: 200,
                  statusText: 'OK (Cached)',
                  headers: { 'x-cached': 'true' },
                  config
                },
                isCached: true
              });
            }
          }

          // Queue non-GET requests for later
          if (config.method?.toUpperCase() !== 'GET') {
            await this.queueOfflineAction({
              type: 'api_request',
              method: config.method?.toUpperCase() as any,
              url: config.url!,
              data: config.data,
              headers: config.headers as Record<string, string>,
              timestamp: Date.now(),
              priority: this.getRequestPriority(config.url!)
            });

            throw new Error('Request queued for offline sync');
          }

          throw new Error('No internet connection and no cached data available');
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - cache successful responses
    this.axios.interceptors.response.use(
      async (response) => {
        // Cache GET responses
        if (response.config.method?.toUpperCase() === 'GET' && response.status === 200) {
          await this.cacheResponse(response.config.url!, response.data);
        }
        return response;
      },
      async (error) => {
        // Handle cached responses
        if (error.isCached) {
          return error.response;
        }

        // If offline and request failed, try cache
        if (!isOnline() && error.config?.method?.toUpperCase() === 'GET') {
          const cachedResponse = await this.getCachedResponse(error.config.url);
          if (cachedResponse) {
            console.log('Fallback to cached response for:', error.config.url);
            return {
              data: cachedResponse.data,
              status: 200,
              statusText: 'OK (Cached)',
              headers: { 'x-cached': 'true' },
              config: error.config
            };
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async getCachedResponse(url: string): Promise<CachedResponse | null> {
    try {
      const key = this.cachePrefix + url;
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsedCache: CachedResponse = JSON.parse(cached);
        if (parsedCache.expires > Date.now()) {
          return parsedCache;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error getting cached response:', error);
    }
    return null;
  }

  private async cacheResponse(url: string, data: any): Promise<void> {
    try {
      const key = this.cachePrefix + url;
      const cacheData: CachedResponse = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + this.getCacheExpiry(url)
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      
      // Store in IndexedDB for more important data
      if (this.isImportantEndpoint(url)) {
        await offlineStorage.storeDelivery({ url, data, timestamp: Date.now() });
      }
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  private getCacheExpiry(url: string): number {
    // Different cache expiry times based on endpoint
    if (url.includes('/delivery/track')) return 5 * 60 * 1000; // 5 minutes
    if (url.includes('/rider/location')) return 1 * 60 * 1000; // 1 minute
    if (url.includes('/auth/user')) return 30 * 60 * 1000; // 30 minutes
    if (url.includes('/delivery/analytics')) return 60 * 60 * 1000; // 1 hour
    return 15 * 60 * 1000; // Default 15 minutes
  }

  private isImportantEndpoint(url: string): boolean {
    return url.includes('/delivery/') || url.includes('/auth/user') || url.includes('/rider/');
  }

  private getRequestPriority(url: string): 'high' | 'medium' | 'low' {
    if (url.includes('/emergency') || url.includes('/location')) return 'high';
    if (url.includes('/delivery/status') || url.includes('/auth/')) return 'medium';
    return 'low';
  }

  private async queueOfflineAction(action: OfflineAction): Promise<void> {
    try {
      await offlineStorage.storeOfflineAction(action);
      this.offlineActions.push(action);
      
      // Register background sync
      await swManager.registerBackgroundSync('api-sync');
      
      console.log('Queued offline action:', action.type, action.url);
    } catch (error) {
      console.error('Error queueing offline action:', error);
    }
  }

  private async loadOfflineActions(): Promise<void> {
    try {
      this.offlineActions = await offlineStorage.getOfflineActions();
    } catch (error) {
      console.error('Error loading offline actions:', error);
    }
  }

  // Public method to sync offline actions when online
  async syncOfflineActions(): Promise<void> {
    if (!isOnline()) {
      console.log('Cannot sync offline actions - still offline');
      return;
    }

    const actions = await offlineStorage.getOfflineActions();
    console.log(`Syncing ${actions.length} offline actions`);

    // Sort by priority and timestamp
    const sortedActions = actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    const syncResults = [];
    for (const action of sortedActions) {
      try {
        const result = await this.executeSyncAction(action);
        syncResults.push({ action, success: true, result });
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        syncResults.push({ action, success: false, error });
      }
    }

    // Clear successfully synced actions
    const successfulActions = syncResults.filter(r => r.success);
    if (successfulActions.length > 0) {
      await offlineStorage.clearOfflineActions();
      console.log(`Successfully synced ${successfulActions.length} actions`);
    }

    return syncResults;
  }

  private async executeSyncAction(action: OfflineAction): Promise<any> {
    const { method, url, data, headers } = action;
    
    switch (method) {
      case 'POST':
        return await this.post(url, data, { headers });
      case 'PUT':
        return await this.put(url, data, { headers });
      case 'PATCH':
        return await this.patch(url, data, { headers });
      case 'DELETE':
        return await this.delete(url, { headers });
      default:
        throw new Error(`Unsupported method for sync: ${method}`);
    }
  }

  // Enhanced methods with offline support
  async getWithOfflineSupport<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      return await this.get<T>(url, config);
    } catch (error: any) {
      if (error.response?.headers?.['x-cached']) {
        return {
          success: true,
          data: error.response.data,
          message: 'Loaded from cache (offline)',
          cached: true
        };
      }
      throw error;
    }
  }

  async postWithOfflineSupport<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    if (!isOnline()) {
      await this.queueOfflineAction({
        type: 'api_request',
        method: 'POST',
        url,
        data,
        headers: config?.headers,
        timestamp: Date.now(),
        priority: this.getRequestPriority(url)
      });

      return {
        success: true,
        data: null as T,
        message: 'Request queued for offline sync',
        queued: true
      };
    }

    return await this.post<T>(url, data, config);
  }

  // Clean up old cached data
  async cleanupCache(): Promise<void> {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    for (const key of keys) {
      if (key.startsWith(this.cachePrefix)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key)!);
          if (cached.expires < now) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove corrupted cache entries
          localStorage.removeItem(key);
        }
      }
    }
  }

  // Get cache statistics
  getCacheStats(): { count: number; size: number } {
    const keys = Object.keys(localStorage);
    let count = 0;
    let size = 0;

    for (const key of keys) {
      if (key.startsWith(this.cachePrefix)) {
        count++;
        size += localStorage.getItem(key)?.length || 0;
      }
    }

    return { count, size };
  }
}

// Create and export the offline-aware API client
export const offlineApiClient = new OfflineApiClient();

// Auto-sync when coming back online
window.addEventListener('online', () => {
  console.log('Device came online - syncing offline actions');
  offlineApiClient.syncOfflineActions().catch(console.error);
});

// Periodic cleanup of expired cache
setInterval(() => {
  offlineApiClient.cleanupCache();
}, 60 * 60 * 1000); // Every hour

export default offlineApiClient;