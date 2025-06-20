// src/services/apiConfig.ts
export interface ApiEndpoints {
    auth: {
        requestLoginOTP: string;
        verifyLoginOTP: string;
        requestRegistrationOTP: string;
        verifyRegistrationOTP: string;
        completeProfile: string;
        getCurrentUser: string;
    };
    deliveries: {
        list: string;
        create: string;
        getById: (id: string) => string;
        getByTracking: (trackingId: string) => string;
        getPublicByTracking: (trackingId: string) => string;
        getDashboardStats: (period?: string) => string;
        getAnalytics: (timeRange?: string) => string;
        getTopRiders: (limit?: number) => string;
        complete: (trackingId: string) => string;
    };
    rider: {
        verifyOTP: string;
        accept: (trackingId: string) => string;
        decline: (trackingId: string) => string;
        startTracking: (trackingId: string) => string;
        updateLocation: string;
        complete: (trackingId: string) => string;
        notifyCustomer: (trackingId: string) => string;
    };
}

export const API_ENDPOINTS: ApiEndpoints = {
    auth: {
        requestLoginOTP: '/login/request-otp',
        verifyLoginOTP: '/login/verify-otp',
        requestRegistrationOTP: '/register/request-otp',
        verifyRegistrationOTP: '/register/verify-otp',
        completeProfile: '/complete-profile',
        getCurrentUser: '/users/me',
    },
    deliveries: {
        list: '/deliveries',
        create: '/deliveries',
        getById: (id: string) => `/deliveries/${id}`,
        getByTracking: (trackingId: string) => `/deliveries/tracking/${trackingId}`,
        getPublicByTracking: (trackingId: string) => `/public/deliveries/track/${trackingId}`,
        getDashboardStats: (period = 'all') => `/deliveries/stats/dashboard?period=${period}`,
        getAnalytics: (timeRange = 'week') => `/deliveries/stats/analytics?time_range=${timeRange}`,
        getTopRiders: (limit = 5) => `/deliveries/stats/top-riders?limit=${limit}`,
        complete: (trackingId: string) => `/customer/confirm/${trackingId}`,
    },
    rider: {
        verifyOTP: '/rider/verify-otp',
        accept: (trackingId: string) => `/rider/accept/${trackingId}`,
        decline: (trackingId: string) => `/rider/decline/${trackingId}`,
        startTracking: (trackingId: string) => `/rider/start-tracking/${trackingId}`,
        updateLocation: '/rider/update-location',
        complete: (trackingId: string) => `/rider/complete/${trackingId}`,
        notifyCustomer: (trackingId: string) => `/deliveries/${trackingId}/notify-customer`,
    },
};

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

// Common error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Invalid data provided. Please check your input.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;