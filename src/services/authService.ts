import axios from 'axios';

// Dynamically determine API URL based on the current environment
export const determineApiUrl = () => {
    const hostname = window.location.hostname;

    // When accessing from a mobile device or another computer on the network
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8000/api/v1`;
    }

    // When accessing locally
    return 'http://localhost:8000/api/v1';
};

// Define base API URL from environment or use default
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

// Authentication service
const authService = {
    // Request OTP for registration
    requestRegistrationOTP: async (phoneNumber: string) => {
        try {
            const response = await apiClient.post('/register/request-otp', {
                phone_number: phoneNumber,
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to send OTP. Please try again.';
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    // Verify OTP for registration
    verifyRegistrationOTP: async (phoneNumber: string, otp: string) => {
        try {
            // Match the expected backend parameter structure
            const response = await apiClient.post('/register/verify-otp', {
                phone_number: phoneNumber,
                otp: otp
            });

            // Save auth token if registration is successful
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user_id', response.data.user_id);
            }

            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            console.error("Registration OTP verification error:", error);
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Invalid OTP. Please try again.';
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    // Request OTP for login
    requestLoginOTP: async (phoneNumber: string) => {
        try {
            const response = await apiClient.post('/login/request-otp', {
                phone_number: phoneNumber,
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to send OTP. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Verify OTP for login
    verifyLoginOTP: async (phoneNumber: string, otp: string) => {
        try {
            const response = await apiClient.post('/login/verify-otp', {
                phone_number: phoneNumber,
                otp: otp,
            });

            // Save auth token if login is successful
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user_id', response.data.user_id);
            }

            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Invalid OTP. Please try again.';
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    // Complete user profile
    completeProfile: async (profileData: {
        first_name: string;
        last_name: string;
        business_name: string;
        email: string;
        profile_image_url?: string;
    }) => {
        try {
            console.log("Sending profile data to backend:", profileData);
            const response = await apiClient.post('/complete-profile', profileData);
            console.log("Backend response:", response.data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            console.error("Profile completion error:", error);

            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to complete profile. Please try again.';
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    // Get current user profile
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/users/me');
            console.log("Raw backend response:", response.data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                'Failed to fetch user data. Please try again.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
    },

    // Check if the user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;