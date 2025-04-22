// User Types
export interface User {
    id: string;
    name: string;
    phoneNumber: string;
    role: 'vendor' | 'rider' | 'customer';
}

// Location Type
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
    speed?: number;
}

// Delivery Status Types
export type DeliveryStatus =
    | 'created'
    | 'assigned'
    | 'accepted'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

// Delivery Types
export interface Delivery {
    id: string;
    trackingId: string;
    status: DeliveryStatus;
    createdAt: string;
    updatedAt: string;
    estimatedDeliveryTime?: string;

    // Customer information
    customer: {
        name: string;
        phoneNumber: string;
        address: string;
        location?: Location;
    };

    // Rider information
    rider?: {
        id: string;
        name: string;
        phoneNumber: string;
        currentLocation?: Location;
    };

    // Vendor information
    vendor: {
        id: string;
        name: string;
    };

    // Package information
    package: {
        description: string;
        size?: 'small' | 'medium' | 'large';
        weight?: number;
        specialInstructions?: string;
    };

    // Tracking information
    tracking: {
        otp: string;
        otpExpiry: string;
        riderLink: string;
        customerLink: string;
        active: boolean;
        locationHistory: Location[];
    };
}

// Form Types
export interface CreateDeliveryFormData {
    customer: {
        name: string;
        phoneNumber: string;
        address: string;
    };
    rider: {
        name: string;
        phoneNumber: string;
    };
    package: {
        description: string;
        size?: 'small' | 'medium' | 'large';
        specialInstructions?: string;
    };
}

// OTP Verification Form
export interface OtpVerificationFormData {
    otp: string;
    trackingId: string;
}

// Socket Events
export enum SocketEvent {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    LOCATION_UPDATE = 'location_update',
    DELIVERY_STATUS_CHANGE = 'delivery_status_change',
    DELIVERY_CREATED = 'delivery_created',
    RIDER_CONNECTED = 'rider_connected',
    CUSTOMER_CONNECTED = 'customer_connected',
}