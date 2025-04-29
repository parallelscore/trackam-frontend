// User Types
export interface User {
    id: string;
    phone_number: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    business_name?: string;
    profile_image_url?: string;
    is_phone_verified?: boolean;
    is_email_verified?: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    role?: 'vendor' | 'rider' | 'customer';
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
    tracking_id: string;
    status: DeliveryStatus;
    created_at: string;
    updated_at: string;
    estimated_delivery_time?: string;

    // Customer information
    customer: {
        name: string;
        phone_number: string;
        address: string;
        location?: Location;
    };

    // Rider information
    rider: {
        id: string;
        name: string;
        phone_number: string;
        current_location?: Location;
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
        special_instructions?: string;
    };

    // Tracking information
    tracking: {
        otp: string;
        otp_expiry: string;
        rider_link: string;
        customer_link: string;
        active: boolean;
        location_history: Location[];
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
    tracking_id: string;
    otp: string;
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

/** Filters for fetching deliveries */
export interface DeliveryFilters {
    /** Only return deliveries in this status */
    delivery_status?: DeliveryStatus;
    /** Search term for ID, customer or rider */
    search?: string;
    /** Page number (1-based) */
    page: number;
    /** Items per page */
    limit: number;
}