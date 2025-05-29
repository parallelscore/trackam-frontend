// src/services/deliveryService.ts
import axios from 'axios';
import { determineApiUrl } from './authService';

// Define base API URL from environment or determine dynamically
const API_URL = import.meta.env.VITE_API_URL ?? determineApiUrl();

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to include auth token in requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Delivery service
const deliveryService = {
    // Get all deliveries with optional filtering

    getDeliveries: async (filters: {
        delivery_status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        try {
            // Build query params
            const params = new URLSearchParams();
            if (filters.delivery_status) params.append('delivery_status', filters.delivery_status);
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());

            const response = await apiClient.get(`/deliveries?${params.toString()}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to fetch deliveries. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Create a new delivery
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
    }) => {
        try {
            const response = await apiClient.post('/deliveries', deliveryData);
            console.log('Delivery creation response:', response.data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to create delivery. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Get delivery by ID
    getDeliveryById: async (id: string) => {
        try {
            const response = await apiClient.get(`/deliveries/${id}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to fetch delivery. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Get delivery by tracking ID
    getDeliveryByTracking: async (trackingId: string) => {
        try {
            const response = await apiClient.get(`/deliveries/tracking/${trackingId}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to fetch delivery. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Get dashboard statistics
    getDashboardStats: async (period: 'day' | 'week' | 'month' | 'all' = 'all') => {
        try {
            const response = await apiClient.get(`/deliveries/stats/dashboard?period=${period}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to fetch dashboard statistics. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Complete a delivery (mark as received by customer)
    completeDelivery: async (trackingId: string) => {
        try {
            const response = await apiClient.post(`/deliveries/tracking/${trackingId}/complete`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to complete delivery. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Get delivery analytics for charts
    getDeliveryAnalytics: async (timeRange: 'week' | 'month' | 'year' = 'week') => {
        try {
            const response = await apiClient.get(`/deliveries/stats/analytics?time_range=${timeRange}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to fetch delivery analytics. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Get top riders
    getTopRiders: async (limit: number = 5) => {
        try {
            const response = await apiClient.get(`/deliveries/stats/top-riders?limit=${limit}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to fetch top riders. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },
};

export default deliveryService;
