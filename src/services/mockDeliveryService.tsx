import { v4 as uuidv4 } from 'uuid';
import {
    Delivery,
    CreateDeliveryFormData,
    Location,
    OtpVerificationFormData
} from '@/types';
import { generateTrackingId } from '../utils/utils';

// In-memory storage for deliveries
let deliveries: Delivery[] = [];

// Generate a random 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a new delivery
const createDelivery = async (data: CreateDeliveryFormData): Promise<Delivery> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const id = uuidv4();
    const trackingId = generateTrackingId();
    const otp = generateOTP();

    // Generate tracking links
    const baseUrl = window.location.origin;
    const riderLink = `${baseUrl}/rider/${trackingId}`;
    const customerLink = `${baseUrl}/track/${trackingId}`;

    // Create new delivery object
    const newDelivery: Delivery = {
        id,
        trackingId,
        status: 'created',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        customer: {
            name: data.customer.name,
            phoneNumber: data.customer.phoneNumber,
            address: data.customer.address,
        },

        rider: {
            id: uuidv4(),
            name: data.rider.name,
            phoneNumber: data.rider.phoneNumber,
        },

        vendor: {
            id: 'vendor-1', // Mocked vendor ID
            name: 'Sample Vendor',
        },

        package: {
            description: data.package.description,
            size: data.package.size,
            specialInstructions: data.package.specialInstructions,
        },

        tracking: {
            otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes expiry
            riderLink,
            customerLink,
            active: false,
            locationHistory: [],
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

    const delivery = deliveries.find(d => d.trackingId === trackingId);
    return delivery || null;
};

// Verify OTP for a delivery
const verifyOTP = async (data: OtpVerificationFormData): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const delivery = deliveries.find(d => d.trackingId === data.trackingId);

    if (!delivery) {
        return { success: false, message: 'Delivery not found' };
    }

    if (delivery.tracking.otp !== data.otp) {
        return { success: false, message: 'Invalid OTP' };
    }

    const otpExpiry = new Date(delivery.tracking.otpExpiry);
    if (otpExpiry < new Date()) {
        return { success: false, message: 'OTP has expired' };
    }

    // Update delivery status
    const updatedDelivery = {
        ...delivery,
        status: 'accepted' as const,
        updatedAt: new Date().toISOString(),
    };

    // Update in-memory storage
    deliveries = deliveries.map(d => d.id === delivery.id ? updatedDelivery : d);

    return { success: true, delivery: updatedDelivery };
};

// Start tracking a delivery
const startTracking = async (trackingId: string): Promise<{ success: boolean; delivery?: Delivery; message?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const deliveryIndex = deliveries.findIndex(d => d.trackingId === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update delivery status
    const updatedDelivery = {
        ...deliveries[deliveryIndex],
        status: 'in_progress' as const,
        updatedAt: new Date().toISOString(),
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

    const deliveryIndex = deliveries.findIndex(d => d.trackingId === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update rider location
    const updatedDelivery = {
        ...deliveries[deliveryIndex],
        updatedAt: new Date().toISOString(),
        rider: {
            ...deliveries[deliveryIndex].rider!,
            currentLocation: location,
        },
        tracking: {
            ...deliveries[deliveryIndex].tracking,
            locationHistory: [...deliveries[deliveryIndex].tracking.locationHistory, location],
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

    const deliveryIndex = deliveries.findIndex(d => d.trackingId === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update delivery status
    const updatedDelivery = {
        ...deliveries[deliveryIndex],
        status: 'completed' as const,
        updatedAt: new Date().toISOString(),
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

    const deliveryIndex = deliveries.findIndex(d => d.trackingId === trackingId);

    if (deliveryIndex === -1) {
        return { success: false, message: 'Delivery not found' };
    }

    // Update delivery status
    const updatedDelivery = {
        ...deliveries[deliveryIndex],
        status: 'cancelled' as const,
        updatedAt: new Date().toISOString(),
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
                trackingId: 'ABC123',
                status: 'in_progress',
                createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                customer: {
                    name: 'John Doe',
                    phoneNumber: '+2348012345678',
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
                    phoneNumber: '+2348023456789',
                    currentLocation: {
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
                    otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                    riderLink: `${window.location.origin}/rider/ABC123`,
                    customerLink: `${window.location.origin}/track/ABC123`,
                    active: true,
                    locationHistory: [
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
                trackingId: 'XYZ789',
                status: 'completed',
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                customer: {
                    name: 'Jane Smith',
                    phoneNumber: '+2348087654321',
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
                    phoneNumber: '+2348076543210',
                    currentLocation: {
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
                    specialInstructions: 'Handle with care',
                },
                tracking: {
                    otp: '654321',
                    otpExpiry: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    riderLink: `${window.location.origin}/rider/XYZ789`,
                    customerLink: `${window.location.origin}/track/XYZ789`,
                    active: false,
                    locationHistory: [
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
    startTracking,
    updateRiderLocation,
    completeDelivery,
    cancelDelivery,
};
