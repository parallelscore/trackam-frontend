// src/context/DeliveryContext.tsx - Updated to use public endpoints for tracking
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import deliveryService from '../services/deliveryService';
import { mockDeliveryService } from '../services/mockDeliveryService';
import { Delivery } from '@/types';
import { USE_MOCK_SERVICE } from '../config/serviceConfig';

interface DashboardStats {
    total_deliveries: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    completion_rate: number;
    avg_delivery_time: number;
    cancel_rate: number;
}

interface DeliveryAnalyticsItem {
    name: string;
    completed: number;
    inProgress: number;
    cancelled: number;
}

interface RiderStats {
    id: string;
    name: string;
    phoneNumber: string;
    totalDeliveries: number;
    completedDeliveries: number;
    completionRate: number;
    averageDeliveryTimeMinutes: number;
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
    getPublicDeliveryByTrackingId: (trackingId: string) => Promise<Delivery | null>;
    createDelivery: (deliveryData: Delivery) => Promise<Delivery | null>;
    completeDelivery: (trackingId: string) => Promise<{success: boolean; data?: Delivery; error?: string}>;
    getDashboardStats: (period?: 'day' | 'week' | 'month' | 'all') => Promise<DashboardStats>;
    getDeliveryAnalytics: (timeRange?: 'week' | 'month' | 'year') => Promise<DeliveryAnalyticsItem[]>;
    getTopRiders: (limit?: number) => Promise<RiderStats[]>;
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

    // Fetch deliveries with optional filtering (REQUIRES AUTH - vendor only)
    const fetchDeliveries = useCallback(async (filters?: { status?: string; search?: string; page?: number; limit?: number }) => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Using mock service
                const result = await mockDeliveryService.getAllDeliveries();

                // Apply filters
                let filteredDeliveries = [...result];

                if (filters?.status && filters.status !== 'all') {
                    filteredDeliveries = filteredDeliveries.filter(d => d.status === filters.status);
                }

                if (filters?.search) {
                    const searchLower = filters.search.toLowerCase();
                    filteredDeliveries = filteredDeliveries.filter(d =>
                        d.tracking_id.toLowerCase().includes(searchLower) ||
                        d.customer.name.toLowerCase().includes(searchLower) ||
                        d.rider?.name?.toLowerCase().includes(searchLower)
                    );
                }

                // Pagination
                const page = filters?.page ?? 1;
                const limit = filters?.limit ?? 10;
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
                // Using real API service (requires authentication)
                const result = await deliveryService.getDeliveries(filters ?? {});

                if (result.success) {
                    setDeliveries(result.data.items);
                    setTotalDeliveries(result.data.total);
                    setCurrentPage(result.data.page);
                    setTotalPages(result.data.pages);
                } else {
                    toast.error(result.error ?? 'Failed to fetch deliveries');
                    setError(result.error ?? 'Failed to fetch deliveries');
                }
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            setError('Failed to fetch deliveries. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create a new delivery (REQUIRES AUTH - vendor only)
    const createDelivery = useCallback(async (deliveryData: Delivery): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                const delivery = await mockDeliveryService.createDelivery(deliveryData);
                toast.success('Delivery created successfully!');
                return delivery;
            } else {
                const result = await deliveryService.createDelivery(deliveryData);

                if (result?.success) {
                    toast.success('Delivery created successfully!');
                    return result.data;
                } else {
                    toast.error(result?.error ?? 'Failed to create delivery');
                    setError(result?.error ?? 'Failed to create delivery');
                    return null;
                }
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            toast.error('Failed to create delivery. Please try again.');
            setError('Failed to create delivery. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get delivery by ID (REQUIRES AUTH - vendor only)
    const getDeliveryById = useCallback(async (id: string): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // For mock service, we'll find it in the existing deliveries
                const deliveries = await mockDeliveryService.getAllDeliveries();
                const delivery = deliveries.find(d => d.id === id) || null;

                if (!delivery) {
                    setError('Delivery not found');
                    return null;
                }

                return delivery;
            } else {
                const result = await deliveryService.getDeliveryById(id);

                if (result?.success) {
                    return result.data;
                } else {
                    toast.error(result?.error ?? 'Failed to fetch delivery');
                    setError(result?.error ?? 'Failed to fetch delivery');
                    return null;
                }
            }
        } catch (error) {
            console.error('Error fetching delivery:', error);
            setError('Failed to fetch delivery. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get delivery by tracking ID (REQUIRES AUTH - vendor only)
    const getDeliveryByTrackingId = useCallback(async (trackingId: string): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            let delivery;

            if (USE_MOCK_SERVICE) {
                delivery = await mockDeliveryService.getDeliveryByTrackingId(trackingId);
            } else {
                const result = await deliveryService.getDeliveryByTracking(trackingId);

                if (result?.success) {
                    delivery = result.data;
                } else {
                    const errorMsg = result?.error ?? 'Failed to fetch delivery';
                    toast.error(errorMsg);
                    setError(errorMsg);
                    return null;
                }
            }

            if (delivery) {
                // Only update if it's different from the current delivery
                if (!currentDelivery || currentDelivery.tracking_id !== delivery.tracking_id) {
                    setCurrentDelivery(delivery);
                }
                return delivery;
            } else {
                setError('Delivery not found');
                return null;
            }
        } catch (error) {
            console.error('Error fetching delivery:', error);
            setError('Failed to fetch delivery. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentDelivery]);

    // Get delivery by tracking ID - PUBLIC (NO AUTH - for riders/customers)
    const getPublicDeliveryByTrackingId = useCallback(async (trackingId: string): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            let delivery;

            if (USE_MOCK_SERVICE) {
                // Use the same mock service method
                delivery = await mockDeliveryService.getDeliveryByTrackingId(trackingId);
            } else {
                // Use the public API endpoint (no authentication required)
                const result = await deliveryService.getPublicDeliveryByTracking(trackingId);

                if (result?.success) {
                    delivery = result.data;
                } else {
                    const errorMsg = result?.error ?? 'Failed to fetch delivery';
                    // Don't show toast for public tracking errors - just set error state
                    setError(errorMsg);
                    return null;
                }
            }

            if (delivery) {
                // Only update if it's different from the current delivery
                if (!currentDelivery || currentDelivery.tracking_id !== delivery.tracking_id) {
                    setCurrentDelivery(delivery);
                }
                return delivery;
            } else {
                setError('Delivery not found');
                return null;
            }
        } catch (error) {
            console.error('Error fetching public delivery:', error);
            setError('Failed to fetch delivery. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentDelivery]);

    // Get dashboard statistics (REQUIRES AUTH - vendor only)
    const getDashboardStats = useCallback(async (period: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<DashboardStats> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Mock implementation
                // Calculate stats from existing deliveries
                const allDeliveries = await mockDeliveryService.getAllDeliveries();

                const now = new Date();
                let filteredDeliveries = [...allDeliveries];

                // Apply time period filter
                if (period === 'day') {
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    filteredDeliveries = allDeliveries.filter(d => {
                        const deliveryDate = new Date(d.created_at).getTime();
                        return deliveryDate >= today;
                    });
                } else if (period === 'week') {
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
                    filteredDeliveries = allDeliveries.filter(d => {
                        const deliveryDate = new Date(d.created_at).getTime();
                        return deliveryDate >= oneWeekAgo;
                    });
                } else if (period === 'month') {
                    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
                    filteredDeliveries = allDeliveries.filter(d => {
                        const deliveryDate = new Date(d.created_at).getTime();
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
                        const startTime = new Date(d.created_at).getTime();
                        const endTime = new Date(d.updated_at).getTime();
                        const diffMinutes = Math.round((endTime - startTime) / (60 * 1000));

                        if (diffMinutes > 0) {
                            totalMinutes += diffMinutes;
                            deliveriesWithTime++;
                        }
                    });

                const avgDeliveryTime = deliveriesWithTime > 0
                    ? Math.round(totalMinutes / deliveriesWithTime)
                    : 0;

                return {
                    total_deliveries: total,
                    in_progress: inProgress,
                    completed: completed,
                    cancelled: cancelled,
                    completion_rate: completionRate,
                    avg_delivery_time: avgDeliveryTime,
                    cancel_rate: cancelRate
                };
            } else {
                // Using real API
                const result = await deliveryService.getDashboardStats(period);

                if (result?.success) {
                    return result.data;
                } else {
                    throw new Error(result?.error ?? 'Failed to fetch dashboard statistics');
                }
            }
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            setError('Failed to fetch dashboard statistics. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get delivery analytics for charts (REQUIRES AUTH - vendor only)
    const getDeliveryAnalytics = async (timeRange: 'week' | 'month' | 'year' = 'week'): Promise<DeliveryAnalyticsItem[]> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Mock implementation
                const allDeliveries = await mockDeliveryService.getAllDeliveries();
                const now = new Date();
                const data = [];

                if (timeRange === 'week') {
                    // Get data for the last 7 days
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date(now);
                        date.setDate(date.getDate() - i);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
                        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();

                        // Count deliveries for this day
                        const dayDeliveries = allDeliveries.filter(d => {
                            const deliveryDate = new Date(d.created_at).getTime();
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
                            const deliveryDate = new Date(d.created_at).getTime();
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
                            const deliveryDate = new Date(d.created_at).getTime();
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

                return data;
            } else {
                // Using real API
                const result = await deliveryService.getDeliveryAnalytics(timeRange);

                if (result?.success) {
                    return result.data;
                } else {
                    throw new Error(result?.error ?? 'Failed to fetch delivery analytics');
                }
            }
        } catch (error) {
            console.error('Error getting delivery analytics:', error);
            setError('Failed to fetch delivery analytics. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get top riders (REQUIRES AUTH - vendor only)
    const getTopRiders = async (limit: number = 5): Promise<RiderStats[]> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Mock implementation
                const allDeliveries = await mockDeliveryService.getAllDeliveries();

                // Group deliveries by rider
                const riderMap = new Map();

                allDeliveries.forEach(delivery => {
                    // Skip if no rider assigned
                    if (!delivery.rider?.id) return;

                    const riderId = delivery.rider.id;

                    // Initialize rider stats if not exists
                    if (!riderMap.has(riderId)) {
                        riderMap.set(riderId, {
                            id: riderId,
                            name: delivery.rider.name,
                            phoneNumber: delivery.rider.phone_number,
                            totalDeliveries: 0,
                            completedDeliveries: 0,
                            completionRate: 0,
                            averageDeliveryTimeMinutes: 0,
                            deliveryTimes: []
                        });
                    }

                    const riderStats = riderMap.get(riderId);
                    riderStats.totalDeliveries++;

                    // Count completed deliveries
                    if (delivery.status === 'completed') {
                        riderStats.completedDeliveries++;

                        // Calculate delivery time for completed deliveries
                        const startTime = new Date(delivery.created_at).getTime();
                        const endTime = new Date(delivery.updated_at).getTime();
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
                        const totalTime = rider.deliveryTimes.reduce((acc: number, time: number) => acc + time, 0);
                        rider.averageDeliveryTimeMinutes = Math.round(totalTime / rider.deliveryTimes.length);
                    }

                    // Remove the intermediate array
                    delete rider.deliveryTimes;
                });

                // Convert to array and sort
                const topRiders = Array.from(riderMap.values())
                    .filter(rider => rider.totalDeliveries >= 2) // Filter out riders with too few deliveries
                    .sort((a, b) => {
                        // Sort by completion rate first
                        if (b.completionRate !== a.completionRate) {
                            return b.completionRate - a.completionRate;
                        }
                        // Then by total deliveries
                        return b.totalDeliveries - a.totalDeliveries;
                    })
                    .slice(0, limit); // Get to top N

                return topRiders;
            } else {
                // Using real API
                const result = await deliveryService.getTopRiders(limit);

                if (result?.success) {
                    return result.data;
                } else {
                    throw new Error(result?.error ?? 'Failed to fetch top riders');
                }
            }
        } catch (error) {
            console.error('Error getting top riders:', error);
            setError('Failed to fetch top riders. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Complete delivery functionality (PUBLIC - NO AUTH - used by customers)
    const completeDelivery = async (trackingId: string): Promise<{success: boolean; data?: Delivery; error?: string}> => {
        if (!trackingId) {
            return { success: false, error: 'Invalid tracking ID' };
        }

        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Mock implementation
                const delivery = await mockDeliveryService.completeDelivery(trackingId);
                setCurrentDelivery(delivery);
                toast.success('Delivery marked as completed successfully!');
                return { success: true, data: delivery };
            } else {
                const result = await deliveryService.completeDelivery(trackingId);

                if (result?.success) {
                    setCurrentDelivery(result.data);
                    toast.success('Delivery marked as completed successfully!');
                    return result;
                } else {
                    toast.error(result?.error ?? 'Failed to complete delivery');
                    setError(result?.error ?? 'Failed to complete delivery');
                    return { success: false, error: result?.error ?? 'Failed to complete delivery' };
                }
            }
        } catch (error) {
            const errorMessage = 'Failed to complete delivery. Please try again.';
            console.error('Error completing delivery:', error);
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial deliveries (only if authenticated)
    useEffect(() => {
        // Only fetch deliveries if user is authenticated (has a token)
        const token = localStorage.getItem('token');
        if (token || USE_MOCK_SERVICE) {
            fetchDeliveries();
        }
    }, []);

    const value = useMemo(() => ({
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
        getPublicDeliveryByTrackingId, // New public method
        createDelivery,
        completeDelivery,
        getDashboardStats,
        getDeliveryAnalytics,
        getTopRiders,
    }), [
        deliveries,
        currentDelivery,
        totalDeliveries,
        currentPage,
        totalPages,
        isLoading,
        error
    ]);

    return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
};