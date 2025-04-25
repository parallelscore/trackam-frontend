// src/context/DeliveryContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import deliveryService from '../services/deliveryService';
import { mockDeliveryService } from '../services/mockDeliveryService';
import { Delivery, OtpVerificationFormData } from '@/types';

// Toggle between mock service (for development) and real service
// Set to false when ready to use real API
const USE_MOCK_SERVICE = false;
const service = USE_MOCK_SERVICE ? mockDeliveryService : deliveryService;

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
    acceptDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
    declineDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
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

    // Fetch deliveries with optional filtering
    const fetchDeliveries = async (filters?: { status?: string; search?: string; page?: number; limit?: number }) => {
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
                        (d.rider?.name && d.rider.name.toLowerCase().includes(searchLower))
                    );
                }

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

                if (result.success) {
                    setDeliveries(result.data.items);
                    setTotalDeliveries(result.data.total);
                    setCurrentPage(result.data.page);
                    setTotalPages(result.data.pages);
                } else {
                    toast.error(result.error || 'Failed to fetch deliveries');
                    setError(result.error || 'Failed to fetch deliveries');
                }
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            setError('Failed to fetch deliveries. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new delivery
    const createDelivery = async (deliveryData: any): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                const delivery = await service.createDelivery(deliveryData);
                toast.success('Delivery created successfully!');
                return delivery;
            } else {
                const result = await deliveryService.createDelivery(deliveryData);

                if (result.success) {
                    toast.success('Delivery created successfully!');
                    return result.data;
                } else {
                    toast.error(result.error || 'Failed to create delivery');
                    setError(result.error || 'Failed to create delivery');
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
    };

    // Get delivery by ID
    const getDeliveryById = async (id: string): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // For mock service, we'll find it in the existing deliveries
                const deliveries = await service.getAllDeliveries();
                const delivery = deliveries.find(d => d.id === id) || null;

                if (!delivery) {
                    setError('Delivery not found');
                    return null;
                }

                return delivery;
            } else {
                const result = await deliveryService.getDeliveryById(id);

                if (result.success) {
                    return result.data;
                } else {
                    toast.error(result.error || 'Failed to fetch delivery');
                    setError(result.error || 'Failed to fetch delivery');
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
    };

    // Get delivery by tracking ID
    const getDeliveryByTrackingId = async (trackingId: string): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            let delivery;

            if (USE_MOCK_SERVICE) {
                delivery = await service.getDeliveryByTrackingId(trackingId);
            } else {
                const result = await deliveryService.getDeliveryByTracking(trackingId);

                if (result.success) {
                    delivery = result.data;
                } else {
                    toast.error(result.error || 'Failed to fetch delivery');
                    setError(result.error || 'Failed to fetch delivery');
                    return null;
                }
            }

            if (delivery) {
                setCurrentDelivery(delivery);
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
    };

    // Verify OTP
    const verifyOTP = async (data: OtpVerificationFormData): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await service.verifyOTP(data);

            if (result.success) {
                toast.success('OTP verified successfully!');
            } else {
                toast.error(result.message || 'Failed to verify OTP');
                setError(result.message || 'Failed to verify OTP');
            }

            return result;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            const errorMessage = 'Failed to verify OTP. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Start tracking a delivery
    const startTracking = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await service.startTracking(trackingId);

            if (result.success) {
                toast.success('Tracking started successfully!');
                if (result.delivery) {
                    setCurrentDelivery(result.delivery);
                }
            } else {
                toast.error(result.message || 'Failed to start tracking');
                setError(result.message || 'Failed to start tracking');
            }

            return result;
        } catch (error) {
            console.error('Error starting tracking:', error);
            const errorMessage = 'Failed to start tracking. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Update rider location
    const updateRiderLocation = async (trackingId: string, location: any): Promise<{ success: boolean; message?: string }> => {
        try {
            const result = await service.updateRiderLocation(trackingId, location);

            if (result.success && result.delivery) {
                setCurrentDelivery(result.delivery);
            }

            return result;
        } catch (error) {
            console.error('Error updating rider location:', error);
            return { success: false, message: 'Failed to update location' };
        }
    };

    // Complete a delivery
    const completeDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await service.completeDelivery(trackingId);

            if (result.success) {
                toast.success('Delivery completed successfully!');
                if (result.delivery) {
                    setCurrentDelivery(result.delivery);
                }
            } else {
                toast.error(result.message || 'Failed to complete delivery');
                setError(result.message || 'Failed to complete delivery');
            }

            return result;
        } catch (error) {
            console.error('Error completing delivery:', error);
            const errorMessage = 'Failed to complete delivery. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel a delivery
    const cancelDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            let result;

            if (USE_MOCK_SERVICE) {
                result = await service.cancelDelivery(trackingId);
            } else {
                result = await deliveryService.cancelDelivery(trackingId);
            }

            if (result.success) {
                toast.success('Delivery cancelled successfully!');

                if (result.delivery) {
                    setCurrentDelivery(result.delivery);
                }

                // Refresh the deliveries list to show the updated status
                await fetchDeliveries();
            } else {
                toast.error(result.message || 'Failed to cancel delivery');
                setError(result.message || 'Failed to cancel delivery');
            }

            return result;
        } catch (error) {
            console.error('Error cancelling delivery:', error);
            const errorMessage = 'Failed to cancel delivery. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Get dashboard statistics
    const getDashboardStats = async (period: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<any> => {
        setIsLoading(true);
        setError(null);

        try {
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

                if (result.success) {
                    return result.data;
                } else {
                    throw new Error(result.error || 'Failed to fetch dashboard statistics');
                }
            }
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            setError('Failed to fetch dashboard statistics. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get delivery analytics for charts
    const getDeliveryAnalytics = async (timeRange: 'week' | 'month' | 'year' = 'week'): Promise<any> => {
        setIsLoading(true);
        setError(null);

        try {
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

                return data;
            } else {
                // Using real API
                const result = await deliveryService.getDeliveryAnalytics(timeRange);

                if (result.success) {
                    return result.data;
                } else {
                    throw new Error(result.error || 'Failed to fetch delivery analytics');
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

    // Get top riders
    const getTopRiders = async (limit: number = 5): Promise<any> => {
        setIsLoading(true);
        setError(null);

        try {
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
                        rider.averageDeliveryTimeMinutes = Math.round(totalTime / rider.deliveryTimes.length);
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

                return topRiders;
            } else {
                // Using real API
                const result = await deliveryService.getTopRiders(limit);

                if (result.success) {
                    return result.data;
                } else {
                    throw new Error(result.error || 'Failed to fetch top riders');
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

    // Accept a delivery assignment
    const acceptDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Mock implementation - simulate accepting the delivery
                const delivery = await getDeliveryByTrackingId(trackingId);

                if (!delivery) {
                    return { success: false, message: 'Delivery not found' };
                }

                // Update the delivery status
                const updatedDelivery = {
                    ...delivery,
                    status: 'assigned',
                    updatedAt: new Date().toISOString()
                };

                setCurrentDelivery(updatedDelivery);

                return {
                    success: true,
                    message: 'Delivery assignment accepted'
                };
            } else {
                // Real API call
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/rider/accept/${trackingId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    // Update current delivery if response includes it
                    if (result.delivery) {
                        setCurrentDelivery(result.delivery);
                    } else {
                        // Otherwise refresh the delivery data
                        await getDeliveryByTrackingId(trackingId);
                    }

                    toast.success('Delivery assignment accepted');
                    return { success: true, message: 'Delivery assignment accepted' };
                } else {
                    const errorMessage = result.detail || 'Failed to accept delivery';
                    toast.error(errorMessage);
                    setError(errorMessage);
                    return { success: false, message: errorMessage };
                }
            }
        } catch (error) {
            console.error('Error accepting delivery:', error);
            const errorMessage = 'Failed to accept delivery. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Decline a delivery
    const declineDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                const result = await service.declineDelivery(trackingId);

                if (result.success) {
                    toast.success('Delivery declined successfully');
                    return { success: true };
                } else {
                    toast.error(result.message || 'Failed to decline delivery');
                    setError(result.message || 'Failed to decline delivery');
                    return { success: false, message: result.message };
                }
            } else {
                // Use actual API service when implemented
                return { success: false, message: 'API not implemented yet' };
            }
        } catch (error) {
            console.error('Error declining delivery:', error);
            const errorMessage = 'Failed to decline delivery. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial deliveries
    useEffect(() => {
        // Only do this once
        fetchDeliveries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        getTopRiders,
        acceptDelivery,
        declineDelivery
    };

    return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
};