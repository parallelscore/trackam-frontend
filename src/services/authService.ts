import { apiClient, ApiResponse } from './apiClient';
import { SecureStorage } from '@/utils/secureStorage';

// Authentication service
const authService = {
    // Request OTP for registration
    requestRegistrationOTP: async (phoneNumber: string): Promise<ApiResponse> => {
        console.log('📱 Requesting registration OTP for:', {
            phone_number: phoneNumber,
            length: phoneNumber.length,
            format: phoneNumber
        });
        
        return apiClient.post('/register/request-otp', {
            phone_number: phoneNumber,
        });
    },

    // Verify OTP for registration
    verifyRegistrationOTP: async (phoneNumber: string, otp: string): Promise<ApiResponse> => {
        const result = await apiClient.post('/register/verify-otp', {
            phone_number: phoneNumber,
            otp: otp
        });

        // Save auth token if registration is successful
        if (result.success && result.data?.access_token) {
            apiClient.setAuthToken(result.data.access_token);
            if (result.data.user_id) {
                localStorage.setItem('user_id', result.data.user_id);
            }
        }

        return result;
    },

    // Request OTP for login
    requestLoginOTP: async (phoneNumber: string): Promise<ApiResponse> => {
        return apiClient.post('/login/request-otp', {
            phone_number: phoneNumber,
        });
    },

    // Verify OTP for login
    verifyLoginOTP: async (phoneNumber: string, otp: string): Promise<ApiResponse> => {
        const result = await apiClient.post('/login/verify-otp', {
            phone_number: phoneNumber,
            otp: otp,
        });

        // Save auth token if login is successful
        if (result.success && result.data?.access_token) {
            apiClient.setAuthToken(result.data.access_token);
            if (result.data.user_id) {
                localStorage.setItem('user_id', result.data.user_id);
            }
        }

        return result;
    },

    // Complete user profile
    completeProfile: async (profileData: {
        first_name: string;
        last_name: string;
        business_name: string;
        email: string;
        profile_image_url?: string;
    }): Promise<ApiResponse> => {
        return apiClient.post('/complete-profile', profileData);
    },

    // Get current user profile
    getCurrentUser: async (): Promise<ApiResponse> => {
        return apiClient.get('/users/me');
    },

    // Logout user
    logout: () => {
        apiClient.clearAuthToken();
    },

    // Check if the user is authenticated
    isAuthenticated: () => {
        // Check both SecureStorage and legacy localStorage for compatibility
        return SecureStorage.isAuthenticated() || !!localStorage.getItem('token');
    },
};

export default authService;