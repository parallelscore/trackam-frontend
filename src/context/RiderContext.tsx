// src/context/RiderContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import riderService from '../services/riderService';
import { mockDeliveryService } from '../services/mockDeliveryService';
import { Delivery, OtpVerificationFormData, Location } from '@/types';

// Toggle between mock service (for development) and real service
const USE_MOCK_SERVICE = false;

interface RiderContextProps {
    currentDelivery: Delivery | null;
    isLoading: boolean;
    error: string | null;
    verifyOTP: (data: OtpVerificationFormData) => Promise<{ success: boolean; message?: string }>;
    acceptDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    startTracking: (trackingId: string) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    updateLocation: (trackingId: string, location: Location) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    completeDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    declineDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
    setCurrentDelivery: (delivery: Delivery | null) => void;
}

const RiderContext = createContext<RiderContextProps | undefined>(undefined);

export const useRider = (): RiderContextProps => {
    const context = useContext(RiderContext);
    if (!context) {
        throw new Error('useRider must be used within a RiderProvider');
    }
    return context;
};

interface RiderProviderProps {
    children: ReactNode;
}

export const RiderProvider: React.FC<RiderProviderProps> = ({ children }) => {
    const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Verify rider OTP
    const verifyOTP = async (data: OtpVerificationFormData): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service
                const result = await mockDeliveryService.verifyOTP(data);

                if (result.success && result.delivery) {
                    setCurrentDelivery(result.delivery);
                    toast.success('OTP verified successfully');
                } else {
                    toast.error(result.message || 'Failed to verify OTP');
                    setError(result.message || 'Failed to verify OTP');
                }

                return result;
            } else {
                // Use real service
                const result = await riderService.verifyOTP(data);

                if (result.success) {
                    if (result.data && result.data.delivery) {
                        setCurrentDelivery(result.data.delivery);
                    }
                    toast.success('OTP verified successfully');
                } else {
                    toast.error(result.message || 'Failed to verify OTP');
                    setError(result.message || 'Failed to verify OTP');
                }

                return result;
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            const errorMessage = 'Failed to verify OTP. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Accept a delivery assignment
    const acceptDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string; delivery?: Delivery }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service
                const result = await mockDeliveryService.acceptDelivery(trackingId);

                if (result.success && result.delivery) {
                    setCurrentDelivery(result.delivery);
                    toast.success('Delivery assignment accepted');
                } else {
                    toast.error(result.message || 'Failed to accept delivery');
                    setError(result.message || 'Failed to accept delivery');
                }

                return result;
            } else {
                // Use real service
                const result = await riderService.acceptDelivery(trackingId);

                if (result.success) {
                    if (result.data && result.data.delivery) {
                        setCurrentDelivery(result.data.delivery);
                    }
                    toast.success('Delivery assignment accepted');
                } else {
                    toast.error(result.message || 'Failed to accept delivery');
                    setError(result.message || 'Failed to accept delivery');
                }

                return result;
            }
        } catch (error) {
            console.error('Error accepting delivery:', error);
            const errorMessage = 'Failed to accept delivery. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Start tracking a delivery
    const startTracking = async (trackingId: string): Promise<{ success: boolean; message?: string; delivery?: Delivery }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service
                const result = await mockDeliveryService.startTracking(trackingId);

                if (result.success && result.delivery) {
                    setCurrentDelivery(result.delivery);
                    toast.success('Tracking started successfully');
                } else {
                    toast.error(result.message || 'Failed to start tracking');
                    setError(result.message || 'Failed to start tracking');
                }

                return result;
            } else {
                // Use real service
                const result = await riderService.startTracking(trackingId);

                if (result.success) {
                    if (result.delivery) {
                        setCurrentDelivery(result.delivery);
                    }
                    toast.success('Tracking started successfully');
                } else {
                    toast.error(result.message || 'Failed to start tracking');
                    setError(result.message || 'Failed to start tracking');
                }

                return result;
            }
        } catch (error) {
            console.error('Error starting tracking:', error);
            const errorMessage = 'Failed to start tracking. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Update rider location
    const updateLocation = async (trackingId: string, location: Location): Promise<{ success: boolean; message?: string; delivery?: Delivery }> => {
        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service
                const result = await mockDeliveryService.updateRiderLocation(trackingId, location);

                if (result.success && result.delivery) {
                    setCurrentDelivery(result.delivery);
                }

                return result;
            } else {
                // Use real service - convert Location to expected format
                const locationData = {
                    tracking_id: trackingId,
                    ...location
                };

                const result = await riderService.updateLocation(locationData);

                if (result.success && result.delivery) {
                    setCurrentDelivery(result.delivery);
                }

                return result;
            }
        } catch (error) {
            console.error('Error updating location:', error);
            setError('Failed to update location. Please try again.');
            return { success: false, message: 'Failed to update location' };
        }
    };

    // Complete a delivery
    const completeDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string; delivery?: Delivery }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service
                const result = await mockDeliveryService.completeDelivery(trackingId);

                if (result.success && result.delivery) {
                    setCurrentDelivery(result.delivery);
                    toast.success('Delivery completed successfully');
                } else {
                    toast.error(result.message || 'Failed to complete delivery');
                    setError(result.message || 'Failed to complete delivery');
                }

                return result;
            } else {
                // Use real service
                const result = await riderService.completeDelivery(trackingId);

                if (result.success) {
                    if (result.delivery) {
                        setCurrentDelivery(result.delivery);
                    }
                    toast.success('Delivery completed successfully');
                } else {
                    toast.error(result.message || 'Failed to complete delivery');
                    setError(result.message || 'Failed to complete delivery');
                }

                return result;
            }
        } catch (error) {
            console.error('Error completing delivery:', error);
            const errorMessage = 'Failed to complete delivery. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Decline a delivery
    const declineDelivery = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service for now - this is not fully implemented in mock service
                const result = await mockDeliveryService.declineDelivery(trackingId);

                if (result.success) {
                    toast.success('Delivery declined successfully');
                } else {
                    toast.error(result.message || 'Failed to decline delivery');
                    setError(result.message || 'Failed to decline delivery');
                }

                return result;
            } else {
                // Would use real service here - currently not implemented in backend
                // For now, just simulate success
                toast.success('Delivery declined successfully');
                return { success: true, message: 'Delivery declined successfully' };
            }
        } catch (error) {
            console.error('Error declining delivery:', error);
            const errorMessage = 'Failed to decline delivery. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        currentDelivery,
        isLoading,
        error,
        verifyOTP,
        acceptDelivery,
        startTracking,
        updateLocation,
        completeDelivery,
        declineDelivery,
        setCurrentDelivery
    };

    return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
};