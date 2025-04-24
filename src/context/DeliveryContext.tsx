// src/context/DeliveryContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import deliveryService from '../services/deliveryService';
import { mockDeliveryService } from '../services/mockDeliveryService';
import { Delivery, OtpVerificationFormData } from '@/types';

// Toggle between mock service (for development) and real service
// Set to false when ready to use real API
const USE_MOCK_SERVICE = false;
const service = USE_MOCK_SERVICE ? mockDeliveryService : deliveryService;

// Cache TTL in ms (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

interface DeliveryContextProps {
    deliveries: Delivery[];
    currentDelivery: Delivery | null;
    totalDeliveries: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
    fetchDeliveries: (filters?: { status?: string; search?: string; page?: number; limit?: number }) => Promise<void>;
    getDeliveryById: (id: string) => Promise<Delivery | null>;
    getDeliveryByTrackingId: (trackingId: string) => Promise<Delivery | null>;
    createDelivery: (deliveryData: any) => Promise<Delivery | null>;
    verifyOTP: (data: OtpVerificationFormData) => Promise<{ success: boolean; message?: string }>;
    startTracking: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
    updateRiderLocation: (trackingId: string, location: any) => Promise<{ success: boolean; message?: string }>;
    completeDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
    cancelDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
    getDashboardStats: (period?: 'day' | 'week' | 'month' | 'all') => Promise<any>;
    getDeliveryAnalytics: (timeRange?: 'week' | 'month' | 'year') => Promise<any>;
    getTopRiders: (limit?: number) => Promise<any>;
}

const DeliveryContext = createContext<DeliveryContextProps | undefined>(undefined);

export const useDelivery = (): DeliveryContextProps => {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error('useDelivery must be used within a DeliveryProvider');
    }
    return context;
};

interface DeliveryProviderProps {
    children: ReactNode;
}

export const DeliveryProvider: React.FC<DeliveryProviderProps> = ({ children }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
    const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Track mounted state
    const isMounted = useRef<boolean>(true);

    // Cache system
    const statsCache = useRef<Record<string, CacheItem<any>>>({});
    const analyticsCache = useRef<Record<string, CacheItem<any>>>({});
    const ridersCache = useRef<Record<string, CacheItem<any>>>({});
    const deliveriesCache = useRef<Record<string, CacheItem<any>>>({});

    // Request tracking to prevent duplicate calls
    const pendingRequests = useRef<Record<string, Promise<any>>>({});
    const initialLoadComplete = useRef<boolean>(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
            // Pending requests will naturally resolve or reject
            // but the state won't be updated since the component is unmounted
        };
    }, []);

    // Reset error state before API calls
    const resetError = useCallback(() => {
        if (error) setError(null);
    }, [error]);

    // Utility for caching and retrieving cached data
    const getFromCache = useCallback(<T,>(
        cache: Record<string, CacheItem<T>>,
        key: string
    ): T | null => {
        const cachedItem = cache[key];
        if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL) {
            return cachedItem.data;
        }
        return null;
    }, []);

    const saveToCache = useCallback(<T,>(
        cache: React.MutableRefObject<Record<string, CacheItem<T>>>,
        key: string,
        data: T
    ): void => {
        cache.current[key] = {
            data,
            timestamp: Date.now()
        };
    }, []);

    // Cache invalidation function
    const invalidateCache = useCallback((
        cache: React.MutableRefObject<Record<string, CacheItem<any>>>,
        predicate?: (key: string) => boolean
    ) => {
        if (predicate) {
            // Selective invalidation based on predicate
            Object.keys(cache.current).forEach(key => {
                if (predicate(key)) {
                    delete cache.current[key];
                }
            });
        } else {
            // Full invalidation
            cache.current = {};
        }
    }, []);

                // Pagination
                const page = filters?.page || 1;
                const limit = filters?.limit || 10;
                const totalItems = filteredDeliveries.length;
                const totalPages = Math.ceil(totalItems / limit);

                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

                // Update state
                setDeliveries(paginatedDeliveries);
                setTotalDeliveries(totalItems);
                setCurrentPage(page);
                setTotalPages(totalPages);
            } else {
                // Using real API service
                const result = await deliveryService.getDeliveries(filters || {});

                } else {
                    // Using real API service
                    const result = await service.getDeliveries(filters || {});

                    if (result.success) {
                        // Cache the results
                        saveToCache(deliveriesCache, cacheKey, result.data);

                        // Update state only if component is still mounted
                        if (isMounted.current) {
                            setDeliveries(result.data.items);
                            setTotalDeliveries(result.data.total);
                            setCurrentPage(result.data.page);
                            setTotalPages(result.data.pages);
                        }

                        return result.data;
                    } else {
                        if (isMounted.current) {
                            toast.error(result.error || 'Failed to fetch deliveries');
                            setError(result.error || 'Failed to fetch deliveries');
                        }
                        throw new Error(result.error || 'Failed to fetch deliveries');
                    }
                }
            };

            pendingRequests.current[cacheKey] = fetchPromise();
            await pendingRequests.current[cacheKey];

            // Initial load is now complete
            initialLoadComplete.current = true;

        } catch (error) {
            console.error('Error fetching deliveries:', error);
            if (isMounted.current) {
                setError('Failed to fetch deliveries. Please try again.');
            }
        } finally {
            if (isMounted.current) setIsLoading(false);
            delete pendingRequests.current[cacheKey];
        }
    }, [resetError, getFromCache, saveToCache]);

    // Create a new delivery
    const createDelivery = useCallback(async (deliveryData: any): Promise<Delivery | null> => {
        if (!isMounted.current) return null;

        resetError();
        setIsLoading(true);

        try {
            if (USE_MOCK_SERVICE) {
                const delivery = await service.createDelivery(deliveryData);

                if (isMounted.current) {
                    toast.success('Delivery created successfully!');
                }

                // Invalidate only the deliveries cache (stats and analytics are still valid)
                invalidateCache(deliveriesCache);

                return delivery;
            } else {
                const result = await deliveryService.createDelivery(deliveryData);

                if (result.success) {
                    if (isMounted.current) {
                        toast.success('Delivery created successfully!');
                    }

                    // Invalidate only the deliveries cache (stats and analytics are still valid)
                    invalidateCache(deliveriesCache);

                    return result.data;
                } else {
                    if (isMounted.current) {
                        toast.error(result.error || 'Failed to create delivery');
                        setError(result.error || 'Failed to create delivery');
                    }
                    return null;
                }
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            if (isMounted.current) {
                toast.error('Failed to create delivery. Please try again.');
                setError('Failed to create delivery. Please try again.');
            }
            return null;
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [resetError, invalidateCache]);

    // Get delivery by ID
    const getDeliveryById = useCallback(async (id: string): Promise<Delivery | null> => {
        if (!isMounted.current) return null;

        resetError();

        // Check cache first
        const cacheKey = `delivery_id_${id}`;

        // Check if this exact request is already in progress
        if (pendingRequests.current[cacheKey]) {
            return pendingRequests.current[cacheKey];
        }

        // Could check deliveriesCache for this ID, but direct API call is usually more reliable for a specific item

        setIsLoading(true);

        try {
            const fetchPromise = async () => {
                if (USE_MOCK_SERVICE) {
                    // For mock service, we'll find it in the existing deliveries
                    const deliveries = await service.getAllDeliveries();
                    const delivery = deliveries.find(d => d.id === id) || null;

                    if (!delivery) {
                        if (isMounted.current) {
                            setError('Delivery not found');
                        }
                        return null;
                    }

                    return delivery;
                } else {
                    const result = await service.getDeliveryById(id);

                    if (result.success) {
                        return result.data;
                    } else {
                        if (isMounted.current) {
                            toast.error(result.error || 'Failed to fetch delivery');
                            setError(result.error || 'Failed to fetch delivery');
                        }
                        return null;
                    }
                }
            };

                return delivery;
            } else {
                const result = await deliveryService.getDeliveryById(id);

        } catch (error) {
            console.error('Error fetching delivery:', error);
            if (isMounted.current) {
                setError('Failed to fetch delivery. Please try again.');
            }
            return null;
        } finally {
            if (isMounted.current) setIsLoading(false);
            delete pendingRequests.current[cacheKey];
        }
    }, [resetError]);

    // Get delivery by tracking ID
    const getDeliveryByTrackingId = useCallback(async (trackingId: string): Promise<Delivery | null> => {
        if (!isMounted.current) return null;

        resetError();

        // Check for cached delivery first
        const cacheKey = `delivery_tracking_${trackingId}`;
        if (pendingRequests.current[cacheKey]) {
            return pendingRequests.current[cacheKey];
        }

        if (isMounted.current) setIsLoading(true);

        try {
            const fetchPromise = async () => {
                let delivery;

            if (USE_MOCK_SERVICE) {
                delivery = await service.getDeliveryByTrackingId(trackingId);
            } else {
                const result = await deliveryService.getDeliveryByTracking(trackingId);

                if (delivery) {
                    if (isMounted.current) {
                        setCurrentDelivery(delivery);
                    }
                    return delivery;
                } else {
                    if (isMounted.current) {
                        setError('Delivery not found');
                    }
                    return null;
                }
            };

            pendingRequests.current[cacheKey] = fetchPromise();
            const result = await pendingRequests.current[cacheKey];
            return result;

        } catch (error) {
            console.error('Error fetching delivery:', error);
            if (isMounted.current) {
                setError('Failed to fetch delivery. Please try again.');
            }
            return null;
        } finally {
            if (isMounted.current) setIsLoading(false);
            delete pendingRequests.current[cacheKey];
        }
    }, [resetError]);

    // Verify OTP
    const verifyOTP = useCallback(async (data: OtpVerificationFormData): Promise<{ success: boolean; message?: string }> => {
        if (!isMounted.current) return { success: false, message: 'Component unmounted' };

        resetError();
        setIsLoading(true);

        try {
            const result = await service.verifyOTP(data);

            if (result.success) {
                if (isMounted.current) {
                    toast.success('OTP verified successfully!');
                }
            } else {
                if (isMounted.current) {
                    toast.error(result.message || 'Failed to verify OTP');
                    setError(result.message || 'Failed to verify OTP');
                }
            }

            return result;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            const errorMessage = 'Failed to verify OTP. Please try again.';
            if (isMounted.current) {
                toast.error(errorMessage);
                setError(errorMessage);
            }
            return { success: false, message: errorMessage };
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [resetError]);

    // Start tracking a delivery
    const startTracking = useCallback(async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        if (!isMounted.current) return { success: false, message: 'Component unmounted' };

        resetError();
        setIsLoading(true);

        try {
            const result = await service.startTracking(trackingId);

            if (result.success) {
                if (isMounted.current) {
                    toast.success('Tracking started successfully!');
                    if (result.delivery) {
                        setCurrentDelivery(result.delivery);

                        // Invalidate specific delivery in cache
                        invalidateCache(deliveriesCache, (key) => key.includes(trackingId));
                    }
                }
            } else {
                if (isMounted.current) {
                    toast.error(result.message || 'Failed to start tracking');
                    setError(result.message || 'Failed to start tracking');
                }
            }

            return result;
        } catch (error) {
            console.error('Error starting tracking:', error);
            const errorMessage = 'Failed to start tracking. Please try again.';
            if (isMounted.current) {
                toast.error(errorMessage);
                setError(errorMessage);
            }
            return { success: false, message: errorMessage };
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [resetError, invalidateCache]);

    // Update rider location
    const updateRiderLocation = useCallback(async (trackingId: string, location: any): Promise<{ success: boolean; message?: string }> => {
        if (!isMounted.current) return { success: false, message: 'Component unmounted' };

        try {
            const result = await service.updateRiderLocation(trackingId, location);

            if (result.success && result.delivery && isMounted.current) {
                setCurrentDelivery(result.delivery);

                // We don't need to invalidate caches here as only location is changing
                // and we don't cache location separately
            }

            return result;
        } catch (error) {
            console.error('Error updating rider location:', error);
            return { success: false, message: 'Failed to update location' };
        }
    }, []);

    // Complete a delivery
    const completeDelivery = useCallback(async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        if (!isMounted.current) return { success: false, message: 'Component unmounted' };

        resetError();
        setIsLoading(true);

        try {
            const result = await service.completeDelivery(trackingId);

            if (result.success) {
                if (isMounted.current) {
                    toast.success('Delivery completed successfully!');
                    if (result.delivery) {
                        setCurrentDelivery(result.delivery);
                    }
                }

                // Invalidate relevant caches
                invalidateCache(deliveriesCache);
                invalidateCache(statsCache);
                invalidateCache(analyticsCache);
            } else {
                if (isMounted.current) {
                    toast.error(result.message || 'Failed to complete delivery');
                    setError(result.message || 'Failed to complete delivery');
                }
            }

            return result;
        } catch (error) {
            console.error('Error completing delivery:', error);
            const errorMessage = 'Failed to complete delivery. Please try again.';
            if (isMounted.current) {
                toast.error(errorMessage);
                setError(errorMessage);
            }
            return { success: false, message: errorMessage };
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [resetError, invalidateCache]);

    // Cancel a delivery
    const cancelDelivery = useCallback(async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        if (!isMounted.current) return { success: false, message: 'Component unmounted' };

        resetError();
        setIsLoading(true);

        try {
            let result;

            if (USE_MOCK_SERVICE) {
                result = await service.cancelDelivery(trackingId);
            } else {
                result = await deliveryService.cancelDelivery(trackingId);
            }

            if (result.success) {
                if (isMounted.current) {
                    toast.success('Delivery cancelled successfully!');
                    if (result.delivery) {
                        setCurrentDelivery(result.delivery);
                    }
                }

                // Invalidate relevant caches
                invalidateCache(deliveriesCache);
                invalidateCache(statsCache);
                invalidateCache(analyticsCache);
            } else {
                if (isMounted.current) {
                    toast.error(result.message || 'Failed to cancel delivery');
                    setError(result.message || 'Failed to cancel delivery');
                }
            }

            return result;
        } catch (error) {
            console.error('Error cancelling delivery:', error);
            const errorMessage = 'Failed to cancel delivery. Please try again.';
            if (isMounted.current) {
                toast.error(errorMessage);
                setError(errorMessage);
            }
            return { success: false, message: errorMessage };
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [resetError, invalidateCache]);

    // Get dashboard statistics
    const getDashboardStats = useCallback(async (period: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<any> => {
        if (!isMounted.current) return null;

        resetError();

        // Generate cache key
        const cacheKey = `stats_${period}`;

        // Check for pending request
        if (pendingRequests.current[cacheKey]) {
            return pendingRequests.current[cacheKey];
        }

        // Check cache first
        const cachedData = getFromCache(statsCache.current, cacheKey);
        if (cachedData) {
            return cachedData;
        }

        if (isMounted.current) setIsLoading(true);

        try {
            const fetchPromise = async () => {
                if (USE_MOCK_SERVICE) {
                    // Mock implementation
                    // Calculate stats from existing deliveries
                    const allDeliveries = await service.getAllDeliveries();

                    const now = new Date();
                    let filteredDeliveries = [...allDeliveries];

                    // Apply time period filter
                    if (period === 'day') {
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                        filteredDeliveries = allDeliveries.filter(d => {
                            const deliveryDate = new Date(d.createdAt).getTime();
                            return deliveryDate >= today;
                        });
                    } else if (period === 'week') {
                        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
                        filteredDeliveries = allDeliveries.filter(d => {
                            const deliveryDate = new Date(d.createdAt).getTime();
                            return deliveryDate >= oneWeekAgo;
                        });
                    } else if (period === 'month') {
                        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
                        filteredDeliveries = allDeliveries.filter(d => {
                            const deliveryDate = new Date(d.createdAt).getTime();
                            return deliveryDate >= oneMonthAgo;
                        });
                    }

                    // Calculate stats
                    const total = filteredDeliveries.length;
                    const inProgress = filteredDeliveries.filter(d => d.status === 'in_progress').length;
                    const completed = filteredDeliveries.filter(d => d.status === 'completed').length;
                    const cancelled = filteredDeliveries.filter(d => d.status === 'cancelled').length;

                    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

                    // Calculate average delivery time
                    let totalMinutes = 0;
                    let deliveriesWithTime = 0;

                    filteredDeliveries
                        .filter(d => d.status === 'completed')
                        .forEach(d => {
                            const startTime = new Date(d.createdAt).getTime();
                            const endTime = new Date(d.updatedAt).getTime();
                            const diffMinutes = Math.round((endTime - startTime) / (60 * 1000));

                            if (diffMinutes > 0) {
                                totalMinutes += diffMinutes;
                                deliveriesWithTime++;
                            }
                        });

                    const avgDeliveryTime = deliveriesWithTime > 0
                        ? Math.round(totalMinutes / deliveriesWithTime)
                        : 0;

                    const result = {
                        total_deliveries: total,
                        in_progress: inProgress,
                        completed: completed,
                        cancelled: cancelled,
                        completion_rate: completionRate,
                        avg_delivery_time: avgDeliveryTime,
                        cancel_rate: cancelRate
                    };

                    // Cache the result
                    saveToCache(statsCache, cacheKey, result);

                    return result;
                } else {
                    // Using real API
                    const result = await deliveryService.getDashboardStats(period);

                    if (result.success) {
                        // Cache the result
                        saveToCache(statsCache, cacheKey, result.data);
                        return result.data;
                    } else {
                        throw new Error(result.error || 'Failed to fetch dashboard statistics');
                    }
                }
            };

            pendingRequests.current[cacheKey] = fetchPromise();
            const result = await pendingRequests.current[cacheKey];
            return result;

        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            if (isMounted.current) {
                setError('Failed to fetch dashboard statistics. Please try again.');
            }
            throw error;
        } finally {
            if (isMounted.current) setIsLoading(false);
            delete pendingRequests.current[cacheKey];
        }
    }, [resetError, getFromCache, saveToCache]);

    // Get delivery analytics for charts
    const getDeliveryAnalytics = useCallback(async (timeRange: 'week' | 'month' | 'year' = 'week'): Promise<any> => {
        if (!isMounted.current) return [];

        resetError();

        // Generate cache key
        const cacheKey = `analytics_${timeRange}`;

        // Check for pending request
        if (pendingRequests.current[cacheKey]) {
            return pendingRequests.current[cacheKey];
        }

        // Check cache first
        const cachedData = getFromCache(analyticsCache.current, cacheKey);
        if (cachedData) {
            return cachedData;
        }

        if (isMounted.current) setIsLoading(true);

        try {
            const fetchPromise = async () => {
                if (USE_MOCK_SERVICE) {
                    // Mock implementation
                    const allDeliveries = await service.getAllDeliveries();
                    const now = new Date();
                    let data = [];

                    if (timeRange === 'week') {
                        // Get data for last 7 days
                        for (let i = 6; i >= 0; i--) {
                            const date = new Date(now);
                            date.setDate(date.getDate() - i);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
                            const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();

                            // Count deliveries for this day
                            const dayDeliveries = allDeliveries.filter(d => {
                                const deliveryDate = new Date(d.createdAt).getTime();
                                return deliveryDate >= dayStart && deliveryDate <= dayEnd;
                            });

                            const completed = dayDeliveries.filter(d => d.status === 'completed').length;
                            const inProgress = dayDeliveries.filter(d => d.status === 'in_progress').length;
                            const cancelled = dayDeliveries.filter(d => d.status === 'cancelled').length;

                            data.push({
                                name: dayName,
                                completed,
                                inProgress,
                                cancelled
                            });
                        }
                    } else if (timeRange === 'month') {
                        // Get data for last 4 weeks
                        for (let i = 3; i >= 0; i--) {
                            const weekStart = new Date(now);
                            weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
                            const weekEnd = new Date(now);
                            weekEnd.setDate(weekEnd.getDate() - (i * 7));

                            const weekName = `Week ${4-i}`;

                            // Count deliveries for this week
                            const weekDeliveries = allDeliveries.filter(d => {
                                const deliveryDate = new Date(d.createdAt).getTime();
                                return deliveryDate >= weekStart.getTime() && deliveryDate <= weekEnd.getTime();
                            });

                            const completed = weekDeliveries.filter(d => d.status === 'completed').length;
                            const inProgress = weekDeliveries.filter(d => d.status === 'in_progress').length;
                            const cancelled = weekDeliveries.filter(d => d.status === 'cancelled').length;

                            data.push({
                                name: weekName,
                                completed,
                                inProgress,
                                cancelled
                            });
                        }
                    } else if (timeRange === 'year') {
                        // Get data for last 12 months
                        for (let i = 11; i >= 0; i--) {
                            const date = new Date(now);
                            date.setMonth(date.getMonth() - i);
                            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
                            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

                            // Count deliveries for this month
                            const monthDeliveries = allDeliveries.filter(d => {
                                const deliveryDate = new Date(d.createdAt).getTime();
                                return deliveryDate >= monthStart && deliveryDate <= monthEnd;
                            });

                            const completed = monthDeliveries.filter(d => d.status === 'completed').length;
                            const inProgress = monthDeliveries.filter(d => d.status === 'in_progress').length;
                            const cancelled = monthDeliveries.filter(d => d.status === 'cancelled').length;

                            data.push({
                                name: monthName,
                                completed,
                                inProgress,
                                cancelled
                            });
                        }
                    }

                    // Cache the result
                    saveToCache(analyticsCache, cacheKey, data);
                    return data;

                } else {
                    // Using real API
                    const result = await deliveryService.getDeliveryAnalytics(timeRange);

                    if (result.success) {
                        // Cache the result
                        saveToCache(analyticsCache, cacheKey, result.data);
                        return result.data;
                    } else {
                        throw new Error(result.error || 'Failed to fetch delivery analytics');
                    }
                }
            };

            pendingRequests.current[cacheKey] = fetchPromise();
            const result = await pendingRequests.current[cacheKey];
            return result;

        } catch (error) {
            console.error('Error getting delivery analytics:', error);
            if (isMounted.current) {
                setError('Failed to fetch delivery analytics. Please try again.');
            }
            throw error;
        } finally {
            if (isMounted.current) setIsLoading(false);
            delete pendingRequests.current[cacheKey];
        }
    }, [resetError, getFromCache, saveToCache]);

    // Get top riders
    const getTopRiders = useCallback(async (limit: number = 5): Promise<any> => {
        if (!isMounted.current) return [];

        resetError();

        // Generate cache key
        const cacheKey = `top_riders_${limit}`;

        // Check for pending request
        if (pendingRequests.current[cacheKey]) {
            return pendingRequests.current[cacheKey];
        }

        // Check cache first
        const cachedData = getFromCache(ridersCache.current, cacheKey);
        if (cachedData) {
            return cachedData;
        }

        if (isMounted.current) setIsLoading(true);

        try {
            const fetchPromise = async () => {
                if (USE_MOCK_SERVICE) {
                    // Mock implementation
                    const allDeliveries = await service.getAllDeliveries();

                    // Group deliveries by rider
                    const riderMap = new Map();

                    allDeliveries.forEach(delivery => {
                        // Skip if no rider assigned
                        if (!delivery.rider || !delivery.rider.id) return;

                        const riderId = delivery.rider.id;

                        // Initialize rider stats if not exists
                        if (!riderMap.has(riderId)) {
                            riderMap.set(riderId, {
                                id: riderId,
                                name: delivery.rider.name,
                                phoneNumber: delivery.rider.phoneNumber,
                                totalDeliveries: 0,
                                completedDeliveries: 0,
                                completionRate: 0,
                                avgDeliveryTimeMinutes: 0,
                                deliveryTimes: []
                            });
                        }

                        const riderStats = riderMap.get(riderId);
                        riderStats.totalDeliveries++;

                        // Count completed deliveries
                        if (delivery.status === 'completed') {
                            riderStats.completedDeliveries++;

                            // Calculate delivery time for completed deliveries
                            const startTime = new Date(delivery.createdAt).getTime();
                            const endTime = new Date(delivery.updatedAt).getTime();
                            const diffMinutes = Math.round((endTime - startTime) / (60 * 1000));

                            if (diffMinutes > 0) {
                                riderStats.deliveryTimes.push(diffMinutes);
                            }
                        }

                        // Calculate completion rate
                        riderStats.completionRate = (riderStats.completedDeliveries / riderStats.totalDeliveries) * 100;
                    });

                    // Calculate average delivery time
                    riderMap.forEach(rider => {
                        if (rider.deliveryTimes.length > 0) {
                            const totalTime = rider.deliveryTimes.reduce((acc, time) => acc + time, 0);
                            rider.avgDeliveryTimeMinutes = Math.round(totalTime / rider.deliveryTimes.length);
                        }

                        // Remove the intermediate array
                        delete rider.deliveryTimes;
                    });

                    // Convert to array and sort
                    let topRiders = Array.from(riderMap.values())
                        .filter(rider => rider.totalDeliveries >= 2) // Filter out riders with too few deliveries
                        .sort((a, b) => {
                            // Sort by completion rate first
                            if (b.completionRate !== a.completionRate) {
                                return b.completionRate - a.completionRate;
                            }
                            // Then by total deliveries
                            return b.totalDeliveries - a.totalDeliveries;
                        })
                        .slice(0, limit); // Get top N

                    // Cache the result
                    saveToCache(ridersCache, cacheKey, topRiders);
                    return topRiders;
                } else {
                    // Using real API
                    const result = await deliveryService.getTopRiders(limit);

                    if (result.success) {
                        // Cache the result
                        saveToCache(ridersCache, cacheKey, result.data);
                        return result.data;
                    } else {
                        throw new Error(result.error || 'Failed to fetch top riders');
                    }
                }
            };

            pendingRequests.current[cacheKey] = fetchPromise();
            const result = await pendingRequests.current[cacheKey];
            return result;

        } catch (error) {
            console.error('Error getting top riders:', error);
            if (isMounted.current) {
                setError('Failed to fetch top riders. Please try again.');
            }
            throw error;
        } finally {
            if (isMounted.current) setIsLoading(false);
            delete pendingRequests.current[cacheKey];
        }
    }, [resetError, getFromCache, saveToCache]);

    // Load initial deliveries once only
    useEffect(() => {
        if (!initialLoadComplete.current) {
            fetchDeliveries()
                .then(() => {
                    // Only mark as complete on success
                    if (isMounted.current) {
                        initialLoadComplete.current = true;
                    }
                })
                .catch(error => {
                    console.error('Error during initial load:', error);
                    // Will retry on next render
                });
        }

        // Return cleanup function
        return () => {
            isMounted.current = false;
        };
    }, [fetchDeliveries]);

    const value = {
        deliveries,
        currentDelivery,
        totalDeliveries,
        currentPage,
        totalPages,
        isLoading,
        error,
        fetchDeliveries,
        getDeliveryById,
        getDeliveryByTrackingId,
        createDelivery,
        verifyOTP,
        startTracking,
        updateRiderLocation,
        completeDelivery,
        cancelDelivery,
        getDashboardStats,
        getDeliveryAnalytics,
        getTopRiders
    };

    return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
};
