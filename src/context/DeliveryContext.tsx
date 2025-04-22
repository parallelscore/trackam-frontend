import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Delivery, Location, CreateDeliveryFormData, OtpVerificationFormData } from '@/types';
import { mockDeliveryService } from '../services/mockDeliveryService';

interface DeliveryContextProps {
    deliveries: Delivery[];
    currentDelivery: Delivery | null;
    isLoading: boolean;
    error: string | null;
    fetchDeliveries: () => Promise<void>;
    getDeliveryByTrackingId: (trackingId: string) => Promise<Delivery | null>;
    createDelivery: (data: CreateDeliveryFormData) => Promise<Delivery>;
    verifyOTP: (data: OtpVerificationFormData) => Promise<{success: boolean; delivery?: Delivery; message?: string}>;
    startTracking: (trackingId: string) => Promise<{success: boolean; delivery?: Delivery; message?: string}>;
    updateRiderLocation: (trackingId: string, location: Location) => Promise<{success: boolean; delivery?: Delivery; message?: string}>;
    completeDelivery: (trackingId: string) => Promise<{success: boolean; delivery?: Delivery; message?: string}>;
    cancelDelivery: (trackingId: string) => Promise<{success: boolean; delivery?: Delivery; message?: string}>;
    setCurrentDelivery: (delivery: Delivery | null) => void;
}

const DeliveryContext = createContext<DeliveryContextProps | undefined>(undefined);

export const useDelivery = (): DeliveryContextProps => {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error('useDelivery must be used within a DeliveryProvider');
    }
    return context;
};

interface DeliveryProviderProps {
    children: ReactNode;
}

export const DeliveryProvider: React.FC<DeliveryProviderProps> = ({ children }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all deliveries
    const fetchDeliveries = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const fetchedDeliveries = await mockDeliveryService.getAllDeliveries();
            setDeliveries(fetchedDeliveries);
        } catch (err) {
            setError('Failed to fetch deliveries');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get delivery by tracking ID
    const getDeliveryByTrackingId = useCallback(async (trackingId: string): Promise<Delivery | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const delivery = await mockDeliveryService.getDeliveryByTrackingId(trackingId);
            if (delivery) {
                setCurrentDelivery(delivery);
            }
            return delivery;
        } catch (err) {
            setError('Failed to fetch delivery');
            console.error(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create a new delivery
    const createDelivery = useCallback(async (data: CreateDeliveryFormData): Promise<Delivery> => {
        setIsLoading(true);
        setError(null);

        try {
            const newDelivery = await mockDeliveryService.createDelivery(data);
            setDeliveries(prev => [...prev, newDelivery]);
            setCurrentDelivery(newDelivery);
            return newDelivery;
        } catch (err) {
            setError('Failed to create delivery');
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Verify OTP
    const verifyOTP = useCallback(async (data: OtpVerificationFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await mockDeliveryService.verifyOTP(data);
            if (result.success && result.delivery) {
                // Update deliveries list
                setDeliveries(prev =>
                    prev.map(d => d.id === result.delivery!.id ? result.delivery! : d)
                );
                // Update current delivery if it's the same
                if (currentDelivery && currentDelivery.id === result.delivery.id) {
                    setCurrentDelivery(result.delivery);
                }
            }
            return result;
        } catch (err) {
            setError('Failed to verify OTP');
            console.error(err);
            return { success: false, message: 'An error occurred' };
        } finally {
            setIsLoading(false);
        }
    }, [currentDelivery]);

    // Start tracking
    const startTracking = useCallback(async (trackingId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await mockDeliveryService.startTracking(trackingId);
            if (result.success && result.delivery) {
                // Update deliveries list
                setDeliveries(prev =>
                    prev.map(d => d.id === result.delivery!.id ? result.delivery! : d)
                );
                // Update current delivery if it's the same
                if (currentDelivery && currentDelivery.id === result.delivery.id) {
                    setCurrentDelivery(result.delivery);
                }
            }
            return result;
        } catch (err) {
            setError('Failed to start tracking');
            console.error(err);
            return { success: false, message: 'An error occurred' };
        } finally {
            setIsLoading(false);
        }
    }, [currentDelivery]);

    // Update rider location
    const updateRiderLocation = useCallback(async (trackingId: string, location: Location) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await mockDeliveryService.updateRiderLocation(trackingId, location);
            if (result.success && result.delivery) {
                // Update deliveries list
                setDeliveries(prev =>
                    prev.map(d => d.id === result.delivery!.id ? result.delivery! : d)
                );
                // Update current delivery if it's the same
                if (currentDelivery && currentDelivery.id === result.delivery.id) {
                    setCurrentDelivery(result.delivery);
                }
            }
            return result;
        } catch (err) {
            setError('Failed to update location');
            console.error(err);
            return { success: false, message: 'An error occurred' };
        } finally {
            setIsLoading(false);
        }
    }, [currentDelivery]);

    // Complete delivery
    const completeDelivery = useCallback(async (trackingId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await mockDeliveryService.completeDelivery(trackingId);
            if (result.success && result.delivery) {
                // Update deliveries list
                setDeliveries(prev =>
                    prev.map(d => d.id === result.delivery!.id ? result.delivery! : d)
                );
                // Update current delivery if it's the same
                if (currentDelivery && currentDelivery.id === result.delivery.id) {
                    setCurrentDelivery(result.delivery);
                }
            }
            return result;
        } catch (err) {
            setError('Failed to complete delivery');
            console.error(err);
            return { success: false, message: 'An error occurred' };
        } finally {
            setIsLoading(false);
        }
    }, [currentDelivery]);

    // Cancel delivery
    const cancelDelivery = useCallback(async (trackingId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await mockDeliveryService.cancelDelivery(trackingId);
            if (result.success && result.delivery) {
                // Update deliveries list
                setDeliveries(prev =>
                    prev.map(d => d.id === result.delivery!.id ? result.delivery! : d)
                );
                // Update current delivery if it's the same
                if (currentDelivery && currentDelivery.id === result.delivery.id) {
                    setCurrentDelivery(result.delivery);
                }
            }
            return result;
        } catch (err) {
            setError('Failed to cancel delivery');
            console.error(err);
            return { success: false, message: 'An error occurred' };
        } finally {
            setIsLoading(false);
        }
    }, [currentDelivery]);

    // Load deliveries on initial mount
    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    const value = {
        deliveries,
        currentDelivery,
        isLoading,
        error,
        fetchDeliveries,
        getDeliveryByTrackingId,
        createDelivery,
        verifyOTP,
        startTracking,
        updateRiderLocation,
        completeDelivery,
        cancelDelivery,
        setCurrentDelivery,
    };

    return (
        <DeliveryContext.Provider value={value}>
            {children}
        </DeliveryContext.Provider>
    );
};