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
            // Validate data before making the API call
            if (!data.tracking_id) {
                console.error('Missing tracking_id in OTP verification data', data);
                return {
                    success: false,
                    error: 'Missing tracking ID',
                    message: 'Tracking ID is required for OTP verification',
                };
            }
            
            console.log('Verifying OTP with data:', data);
            const response = await apiClient.post('/rider/verify-otp', {
                tracking_id: data.tracking_id,
                otp: data.otp
            });

            return {
                success: true,
                data: response.data,
                message: 'OTP verified successfully',
            };
        } catch (error: any) {
            console.error('OTP verification error:', error?.response?.data || error);
            
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
    acceptDelivery: async (tracking_id: string) => {
        try {
            console.log('Accepting delivery with tracking ID:', tracking_id);
            const response = await apiClient.post(`/rider/accept/${tracking_id}`);

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

    // Decline a delivery assignment
    declineDelivery: async (tracking_id: string) => {
        try {
            console.log('Declining delivery with tracking ID:', tracking_id);
            const response = await apiClient.post(`/rider/decline/${tracking_id}`);

            return {
                success: true,
                data: response.data,
                message: 'Delivery declined successfully',
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                'Failed to decline delivery. Please try again.';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            };
        }
    },

    // Start tracking a delivery
    startTracking: async (tracking_id: string) => {
        try {
            console.log('Starting tracking for delivery with tracking ID:', tracking_id);
            const response = await apiClient.post(`/rider/start-tracking/${tracking_id}`);

            return {
                success: true,
                data: response.data,
                message: 'Tracking started successfully',
                delivery: response.data.delivery,
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ??
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
        console.log( 'Updating location with data:', location);
        console.log( 'Tracking ID:', location.tracking_id);
        try {
            const response = await apiClient.post('/rider/update-location', {
                tracking_id: location.tracking_id,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                speed: location.speed
            });

            console.log('Location update response:', response.data);

            return {
                success: true,
                data: response.data,
                message: 'Location updated successfully',
                delivery: response.data.delivery,
            };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ??
                'Failed to update location. Please try again.';
            return {
                success: false,
                error: errorMessage,
                message: errorMessage,
            };
        }
    },

    // Notify customer after OTP verification
    notifyCustomer: async (trackingId: string) => {
        try {
            // Real API implementation - no need for USE_MOCK_SERVICE check here
            const response = await apiClient.post(`/deliveries/${trackingId}/notify-customer`);
            return {
                success: true,
                message: 'Customer notified successfully',
                data: response.data
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to notify customer. Please try again.';

            return {
                success: false,
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
