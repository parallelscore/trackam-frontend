// src/services/riderService.ts
import axios from 'axios';
import { determineApiUrl } from './authService';
import { Location, OtpVerificationFormData } from '@/types';

// Define base API URL from environment or determine dynamically
const API_URL = import.meta.env.VITE_API_URL || determineApiUrl();

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

// Rider service
const riderService = {
    // Verify rider OTP
    verifyOTP: async (data: OtpVerificationFormData) => {
        try {
            const response = await apiClient.post('/rider/verify-otp', {
                tracking_id: data.trackingId,
                otp: data.otp
            });

            return {
                success: true,
                data: response.data,
                message: 'OTP verified successfully',
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                'Failed to verify OTP. Please try again.';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            };
        }
    },

    // Accept a delivery assignment
    acceptDelivery: async (trackingId: string) => {
        try {
            const response = await apiClient.post(`/rider/accept/${trackingId}`);

            return {
                success: true,
                data: response.data,
                message: 'Delivery assigned successfully',
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                'Failed to accept delivery. Please try again.';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            };
        }
    },

    // Start tracking a delivery
    startTracking: async (trackingId: string) => {
        try {
            const response = await apiClient.post(`/rider/start-tracking/${trackingId}`);

            return {
                success: true,
                data: response.data,
                message: 'Tracking started successfully',
                delivery: response.data.delivery,
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                'Failed to start tracking. Please try again.';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            };
        }
    },

    // Update rider location
    updateLocation: async (location: Location & { tracking_id: string }) => {
        try {
            const response = await apiClient.post('/rider/update-location', {
                tracking_id: location.tracking_id,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                speed: location.speed
            });

            return {
                success: true,
                data: response.data,
                message: 'Location updated successfully',
                delivery: response.data.delivery,
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                'Failed to update location. Please try again.';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            };
        }
    },

    // Complete a delivery
    completeDelivery: async (trackingId: string) => {
        try {
            const response = await apiClient.post(`/rider/complete/${trackingId}`);

            return {
                success: true,
                data: response.data,
                message: 'Delivery completed successfully',
                delivery: response.data.delivery,
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                'Failed to complete delivery. Please try again.';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            };
        }
    },
};

export default riderService;