// src/services/deliveryService.ts - Updated to use centralized API client
import { apiClient, publicApiClient, ApiResponse } from './apiClient';

// Delivery service
const deliveryService = {
    // Get all deliveries with optional filtering (REQUIRES AUTH - vendor only)
    getDeliveries: async (filters: {
        delivery_status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse> => {
        // Build query params
        const params = new URLSearchParams();
        if (filters.delivery_status) params.append('delivery_status', filters.delivery_status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        return apiClient.get(`/deliveries?${params.toString()}`);
    },

    // Create a new delivery (REQUIRES AUTH - vendor only)
    createDelivery: async (deliveryData: {
        customer: {
            name: string;
            phone_number: string;
            address: string;
        };
        rider: {
            name: string;
            phone_number: string;
        };
        package: {
            description: string;
            size?: 'small' | 'medium' | 'large';
            special_instructions?: string;
        };
    }): Promise<ApiResponse> => {
        return apiClient.post('/deliveries', deliveryData);
    },

    // Get delivery by ID (REQUIRES AUTH - vendor only)
    getDeliveryById: async (id: string): Promise<ApiResponse> => {
        return apiClient.get(`/deliveries/${id}`);
    },

    // Get delivery by tracking ID for vendor (REQUIRES AUTH - vendor only)
    getDeliveryByTracking: async (trackingId: string): Promise<ApiResponse> => {
        return apiClient.get(`/deliveries/tracking/${trackingId}`);
    },

    // Get delivery by tracking ID - PUBLIC (NO AUTH - for riders/customers)
    getPublicDeliveryByTracking: async (trackingId: string): Promise<ApiResponse> => {
        return publicApiClient.get(`/public/deliveries/track/${trackingId}`);
    },

    // Get dashboard statistics (REQUIRES AUTH - vendor only)
    getDashboardStats: async (period: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<ApiResponse> => {
        return apiClient.get(`/deliveries/stats/dashboard?period=${period}`);
    },

    // Complete a delivery (PUBLIC - NO AUTH - used by customers)
    completeDelivery: async (trackingId: string): Promise<ApiResponse> => {
        return publicApiClient.post(`/customer/confirm/${trackingId}`);
    },

    // Get delivery analytics for charts (REQUIRES AUTH - vendor only)
    getDeliveryAnalytics: async (timeRange: 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse> => {
        return apiClient.get(`/deliveries/stats/analytics?time_range=${timeRange}`);
    },

    // Get top riders (REQUIRES AUTH - vendor only)
    getTopRiders: async (limit: number = 5): Promise<ApiResponse> => {
        return apiClient.get(`/deliveries/stats/top-riders?limit=${limit}`);
    },
};

export default deliveryService;