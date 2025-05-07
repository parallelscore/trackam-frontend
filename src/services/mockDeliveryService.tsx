import { v4 as uuidv4 } from 'uuid';
import {
    Delivery,
    Location,
    OtpVerificationFormData,
    DeliveryStatus
} from '@/types';
import { generateTrackingId } from '../utils/utils';

// In-memory storage for deliveries
let deliveries: Delivery[] = [];

// Generate a random 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a new delivery
const createDelivery = async (data: Delivery): Promise<Delivery> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const id = uuidv4();
    const tracking_id = generateTrackingId();
    const otp = generateOTP();

    // Generate tracking links
    const baseUrl = window.location.origin;
    const rider_link = `${baseUrl}/rider/${tracking_id}`;
    const customer_link = `${baseUrl}/track/${tracking_id}`;

    // Create a new delivery object with snake_case property names
    const newDelivery: Delivery = {
        id,
        tracking_id,
        status: 'created',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        customer: {
            name: data.customer.name,
            phone_number: data.customer.phone_number,
            address: data.customer.address,
        },

        rider: {
            id: uuidv4(),
            name: data.rider.name,
            phone_number: data.rider.phone_number,
        },

        vendor: {
            id: 'vendor-1', // Mocked vendor ID
            name: 'Sample Vendor',
        },

        package: {
            description: data.package.description,
            size: data.package.size,
            special_instructions: data.package.special_instructions,
        },

        tracking: {
            otp,
            otp_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes expiry
            rider_link,
            customer_link,
            active: false,
            location_history: [],
        },
    };

    // Add to local storage
    deliveries.push(newDelivery);

    return newDelivery;
};

// Get all deliveries
const getAllDeliveries = async (): Promise<Delivery[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...deliveries];
};

// Get delivery by tracking ID
const getDeliveryByTrackingId = async (trackingId: string): Promise<Delivery | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("Looking for delivery with trackingId:", trackingId);
    console.log("Available deliveries:", deliveries);

    // Make sure we're using the correct property name from your types
    const delivery = deliveries.find(d => d.tracking_id === trackingId);

    console.log("Found delivery:", delivery);
    return delivery || null;
};

// Verify OTP for a delivery
const verifyOTP = async (data: OtpVerificationFormData): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const delivery = deliveries.find(d => d.tracking_id === data.tracking_id);

    if (!delivery) {
        return { success: false, message: 'Delivery not found' };
    }

    if (delivery.tracking.otp !== data.otp) {
        return { success: false, message: 'Invalid OTP' };
    }

    const otpExpiry = new Date(delivery.tracking.otp_expiry);
    if (otpExpiry < new Date()) {
        return { success: false, message: 'OTP has expired' };
    }

    // Update delivery status
    const updatedDelivery: Delivery = {
        ...delivery,
        status: 'accepted' as DeliveryStatus,
        updated_at: new Date().toISOString(),
    };

    // Update in-memory storage
    deliveries = deliveries.map(d => d.id === delivery.id ? updatedDelivery : d);

    return { success: true, delivery: updatedDelivery };
};

// Accept a delivery by rider
const acceptDelivery = async (trackingId: string): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const deliveryIndex = deliveries.findIndex(d => d.tracking_id === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    if (deliveries[deliveryIndex].status !== 'created') {
        return { success: false, message: 'Delivery cannot be accepted in its current state' };
    }

    // Update delivery status
    const updatedDelivery: Delivery = {
        ...deliveries[deliveryIndex],
        status: 'assigned' as DeliveryStatus,
        updated_at: new Date().toISOString(),
    };

    // Update in-memory storage
    deliveries[deliveryIndex] = updatedDelivery;

    return { success: true, delivery: updatedDelivery };
};

// Decline a delivery by rider
const declineDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const deliveryIndex = deliveries.findIndex(d => d.tracking_id === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    if (deliveries[deliveryIndex].status !== 'created' && deliveries[deliveryIndex].status !== 'assigned') {
        return { success: false, message: 'Delivery cannot be declined in its current state' };
    }

    // Update in-memory storage - just mark as cancelled for simplicity in our mock
    deliveries[deliveryIndex] = {
        ...deliveries[deliveryIndex],
        status: 'cancelled' as DeliveryStatus,
        updated_at: new Date().toISOString(),
    };

    return { success: true };
};

// Start tracking a delivery
const startTracking = async (trackingId: string): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const deliveryIndex = deliveries.findIndex(d => d.tracking_id === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update delivery status
    const updatedDelivery: Delivery = {
        ...deliveries[deliveryIndex],
        status: 'in_progress' as DeliveryStatus,
        updated_at: new Date().toISOString(),
        tracking: {
            ...deliveries[deliveryIndex].tracking,
            active: true,
        },
    };

    // Update in-memory storage
    deliveries[deliveryIndex] = updatedDelivery;

    return { success: true, delivery: updatedDelivery };
};

// Update rider location
const updateRiderLocation = async (trackingId: string, location: Location): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const deliveryIndex = deliveries.findIndex(d => d.tracking_id === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update rider location
    const updatedDelivery: Delivery = {
        ...deliveries[deliveryIndex],
        updated_at: new Date().toISOString(),
        rider: {
            ...deliveries[deliveryIndex].rider,
            current_location: location,
        },
        tracking: {
            ...deliveries[deliveryIndex].tracking,
            location_history: [...deliveries[deliveryIndex].tracking.location_history, location],
        },
    };

    // Update in-memory storage
    deliveries[deliveryIndex] = updatedDelivery;

    return { success: true, delivery: updatedDelivery };
};

// Complete a delivery
const completeDelivery = async (trackingId: string): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const deliveryIndex = deliveries.findIndex(d => d.tracking_id === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update delivery status
    const updatedDelivery: Delivery = {
        ...deliveries[deliveryIndex],
        status: 'completed' as DeliveryStatus,
        updated_at: new Date().toISOString(),
        tracking: {
            ...deliveries[deliveryIndex].tracking,
            active: false,
        },
    };

    // Update in-memory storage
    deliveries[deliveryIndex] = updatedDelivery;

    return { success: true, delivery: updatedDelivery };
};

// Cancel a delivery
const cancelDelivery = async (trackingId: string): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const deliveryIndex = deliveries.findIndex(d => d.tracking_id === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update delivery status
    const updatedDelivery: Delivery = {
        ...deliveries[deliveryIndex],
        status: 'cancelled' as DeliveryStatus,
        updated_at: new Date().toISOString(),
        tracking: {
            ...deliveries[deliveryIndex].tracking,
            active: false,
        },
    };

    // Update in-memory storage
    deliveries[deliveryIndex] = updatedDelivery;

    return { success: true, delivery: updatedDelivery };
};

// Preload some sample deliveries
const preloadSampleDeliveries = () => {
    if (deliveries.length === 0) {
        const sampleDeliveries: Partial<Delivery>[] = [
            {
                id: uuidv4(),
                tracking_id: 'ABC123',
                status: 'in_progress',
                created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                customer: {
                    name: 'John Doe',
                    phone_number: '+2348012345678',
                    address: '123 Lagos Street, Ikeja, Lagos',
                    location: {
                        latitude: 6.5955,
                        longitude: 3.3429,
                        timestamp: Date.now(),
                    },
                },
                rider: {
                    id: uuidv4(),
                    name: 'Rider A',
                    phone_number: '+2348023456789',
                    current_location: {
                        latitude: 6.5800,
                        longitude: 3.3400,
                        timestamp: Date.now(),
                    },
                },
                vendor: {
                    id: 'vendor-1',
                    name: 'Sample Vendor',
                },
                package: {
                    description: 'Food delivery',
                    size: 'small',
                },
                tracking: {
                    otp: '123456',
                    otp_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                    rider_link: `${window.location.origin}/rider/ABC123`,
                    customer_link: `${window.location.origin}/track/ABC123`,
                    active: true,
                    location_history: [
                        {
                            latitude: 6.5750,
                            longitude: 3.3350,
                            timestamp: Date.now() - 20 * 60 * 1000,
                        },
                        {
                            latitude: 6.5800,
                            longitude: 3.3400,
                            timestamp: Date.now(),
                        },
                    ],
                },
            },
            {
                id: uuidv4(),
                tracking_id: 'XYZ789',
                status: 'completed',
                created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                customer: {
                    name: 'Jane Smith',
                    phone_number: '+2348087654321',
                    address: '456 Abuja Road, Wuse, Abuja',
                    location: {
                        latitude: 9.0765,
                        longitude: 7.3986,
                        timestamp: Date.now() - 3 * 60 * 60 * 1000,
                    },
                },
                rider: {
                    id: uuidv4(),
                    name: 'Rider B',
                    phone_number: '+2348076543210',
                    current_location: {
                        latitude: 9.0765,
                        longitude: 7.3986,
                        timestamp: Date.now() - 3 * 60 * 60 * 1000,
                    },
                },
                vendor: {
                    id: 'vendor-1',
                    name: 'Sample Vendor',
                },
                package: {
                    description: 'Electronics',
                    size: 'medium',
                    special_instructions: 'Handle with care',
                },
                tracking: {
                    otp: '654321',
                    otp_expiry: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    rider_link: `${window.location.origin}/rider/XYZ789`,
                    customer_link: `${window.location.origin}/track/XYZ789`,
                    active: false,
                    location_history: [
                        {
                            latitude: 9.0700,
                            longitude: 7.3900,
                            timestamp: Date.now() - 5 * 60 * 60 * 1000,
                        },
                        {
                            latitude: 9.0730,
                            longitude: 7.3940,
                            timestamp: Date.now() - 4 * 60 * 60 * 1000,
                        },
                        {
                            latitude: 9.0765,
                            longitude: 7.3986,
                            timestamp: Date.now() - 3 * 60 * 60 * 1000,
                        },
                    ],
                },
            },
            // Add another delivery in 'created' status for testing acceptance
            {
                id: uuidv4(),
                tracking_id: 'NEW123',
                status: 'created',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                customer: {
                    name: 'Test Customer',
                    phone_number: '+2348011112222',
                    address: '789 Test Street, Lagos Island, Lagos',
                    location: {
                        latitude: 6.4550,
                        longitude: 3.4206,
                        timestamp: Date.now(),
                    },
                },
                rider: {
                    id: uuidv4(),
                    name: 'Rider C',
                    phone_number: '+2348033334444',
                    current_location: {
                        latitude: 6.4500,
                        longitude: 3.4100,
                        timestamp: Date.now(),
                    },
                },
                vendor: {
                    id: 'vendor-1',
                    name: 'Sample Vendor',
                },
                package: {
                    description: 'Clothing items',
                    size: 'medium',
                    special_instructions: 'Leave at reception if customer not available',
                },
                tracking: {
                    otp: '123789',
                    otp_expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                    rider_link: `${window.location.origin}/rider/NEW123`,
                    customer_link: `${window.location.origin}/track/NEW123`,
                    active: false,
                    location_history: [],
                },
            },
        ];

        sampleDeliveries.forEach(delivery => {
            deliveries.push(delivery as Delivery);
        });
    }
};

// Call preload function
preloadSampleDeliveries();

export const mockDeliveryService = {
    createDelivery,
    getAllDeliveries,
    getDeliveryByTrackingId,
    verifyOTP,
    acceptDelivery,
    declineDelivery,
    startTracking,
    updateRiderLocation,
    completeDelivery,
    cancelDelivery,
};