// src/services/riderService.ts
import { apiClient, ApiResponse } from './apiClient';
import { Location, OtpVerificationFormData } from '@/types';

// Rider service
const riderService = {
    // Verify rider OTP
    verifyOTP: async (data: OtpVerificationFormData): Promise<ApiResponse> => {
        // Validate data before making the API call
        if (!data.tracking_id) {
            return {
                success: false,
                error: 'Missing tracking ID',
                message: 'Tracking ID is required for OTP verification',
            };
        }
        
        return apiClient.post('/rider/verify-otp', {
            tracking_id: data.tracking_id,
            otp: data.otp
        });
    },

    // Accept a delivery assignment
    acceptDelivery: async (tracking_id: string): Promise<ApiResponse> => {
        return apiClient.post(`/rider/accept/${tracking_id}`);
    },

    // Decline a delivery assignment
    declineDelivery: async (tracking_id: string): Promise<ApiResponse> => {
        return apiClient.post(`/rider/decline/${tracking_id}`);
    },

    // Start tracking a delivery
    startTracking: async (tracking_id: string): Promise<ApiResponse> => {
        return apiClient.post(`/rider/start-tracking/${tracking_id}`);
    },

    // Update rider location
    updateLocation: async (location: Location & { tracking_id: string }): Promise<ApiResponse> => {
        return apiClient.post('/rider/update-location', {
            tracking_id: location.tracking_id,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            speed: location.speed
        });
    },

    // Notify customer after OTP verification
    notifyCustomer: async (trackingId: string): Promise<ApiResponse> => {
        return apiClient.post(`/deliveries/${trackingId}/notify-customer`);
    },

    // Complete a delivery
    completeDelivery: async (trackingId: string): Promise<ApiResponse> => {
        return apiClient.post(`/rider/complete/${trackingId}`);
    },
};

export default riderService;
