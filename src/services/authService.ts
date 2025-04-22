import axios from 'axios';

// Dynamically determine API URL based on current environment
const determineApiUrl = () => {
    const hostname = window.location.hostname;

    // When accessing from a mobile device or another computer on the network
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8000/api/v1`;
    }

    // When accessing locally
    return 'http://localhost:8000/api/v1';
};

// Define base API URL from environment or use default
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
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to send OTP. Please try again.',
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
        } catch (error: any) {
            console.error('OTP verification error:', error.response?.data || error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Invalid OTP. Please try again.',
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
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to send OTP. Please try again.',
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
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Invalid OTP. Please try again.',
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
        } catch (error: any) {
            console.error("Profile completion error:", error.response?.data || error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to update profile. Please try again.',
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
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to fetch user data.',
            };
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;