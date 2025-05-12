// src/context/RiderContext.tsx
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import toast from 'react-hot-toast';
import riderService from '../services/riderService';
import { mockDeliveryService } from '../services/mockDeliveryService';
import { Delivery, OtpVerificationFormData, Location } from '@/types';
import { USE_MOCK_SERVICE } from '../config/serviceConfig';

export interface RiderContextProps {
    currentDelivery: Delivery | null;
    isLoading: boolean;
    error: string | null;
    locationPermissionGranted: boolean;
    verifyOTP: (data: OtpVerificationFormData) => Promise<{ success: boolean; message?: string }>;
    acceptDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    startTracking: (trackingId: string) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    updateLocation: (trackingId: string, location: Location) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    completeDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string; delivery?: Delivery }>;
    declineDelivery: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
    setCurrentDelivery: (delivery: Delivery | null) => void;
    setLocationPermissionGranted: (granted: boolean) => void;
    notifyCustomer: (trackingId: string) => Promise<{ success: boolean; message?: string }>;
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
    const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);

    // Verify rider OTP
    const verifyOTP = async (data: OtpVerificationFormData): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        // Validate the data first
        if (!data.tracking_id) {
            const errorMessage = 'Missing tracking ID for OTP verification';
            console.error(errorMessage, data);
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, message: errorMessage };
        }

        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service - ensure we use the correct property names
                const adaptedData = {
                    tracking_id: data.tracking_id,
                    otp: data.otp
                };

                const result = await mockDeliveryService.verifyOTP(adaptedData);

                if (result.success && result.delivery) {
                    setCurrentDelivery(result.delivery);
                    toast.success('OTP verified successfully');
                } else {
                    toast.error(result.message ?? 'Failed to verify OTP');
                    setError(result.message ?? 'Failed to verify OTP');
                }

                return result;
            } else {
                // Use real service
                console.log('Verifying OTP with data:', data);
                const result = await riderService.verifyOTP(data);

                if (result.success) {
                    if (result.data?.delivery) {
                        setCurrentDelivery(result.data.delivery);
                    }
                    toast.success('OTP verified successfully');
                } else {
                    toast.error(result.message ?? 'Failed to verify OTP');
                    setError(result.message ?? 'Failed to verify OTP');
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
                    toast.error(result.message ?? 'Failed to accept delivery');
                    setError(result.message ?? 'Failed to accept delivery');
                }

                return result;
            } else {
                // Use real service
                console.log('Accepting delivery with tracking ID:', trackingId);
                const result = await riderService.acceptDelivery(trackingId);
                console.log( 'Accept delivery result:', result);

                if (result.success) {
                    if (result.data?.delivery) {
                        setCurrentDelivery(result.data.delivery);
                    }
                    toast.success('Delivery assignment accepted');
                } else {
                    toast.error(result.message ?? 'Failed to accept delivery');
                    setError(result.message ?? 'Failed to accept delivery');
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

    // Notify customer after OTP verification
    const notifyCustomer = async (trackingId: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_SERVICE) {
                // Use mock service - simulate notification
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
                toast.success('Customer notified successfully');
                return { success: true };
            } else {
                // Use real service
                const result = await riderService.notifyCustomer(trackingId);

                if (result.success) {
                    toast.success('Customer notified successfully');
                } else {
                    toast.error(result.message ?? 'Failed to notify customer');
                    setError(result.message ?? 'Failed to notify customer');
                }

                return result;
            }
        } catch (error) {
            console.error('Error notifying customer:', error);
            const errorMessage = 'Failed to notify customer. Please try again.';
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
                // Use mock service
                const result = await mockDeliveryService.declineDelivery(trackingId);

                if (result.success) {
                    toast.success('Delivery declined successfully');
                } else {
                    toast.error(result.message ?? 'Failed to decline delivery');
                    setError(result.message ?? 'Failed to decline delivery');
                }

                return result;
            } else {
                // Use real service
                const result = await riderService.declineDelivery(trackingId);

                if (result.success) {
                    toast.success('Delivery declined successfully');
                } else {
                    toast.error(result.message ?? 'Failed to decline delivery');
                    setError(result.message ?? 'Failed to decline delivery');
                }

                return result;
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
                    toast.error(result.message ?? 'Failed to start tracking');
                    setError(result.message ?? 'Failed to start tracking');
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
                    toast.error(result.message ?? 'Failed to start tracking');
                    setError(result.message ?? 'Failed to start tracking');
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
                // Use real service - ensure tracking_id is set
                // Handle case where tracking_id might already be in the location object
                const locationData = {
                    tracking_id: trackingId,
                    ...location
                };
                
                // Log to verify data is correct
                console.log('Sending location update with data:', locationData);
                
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
                    toast.error(result.message ?? 'Failed to complete delivery');
                    setError(result.message ?? 'Failed to complete delivery');
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
                    toast.error(result.message ?? 'Failed to complete delivery');
                    setError(result.message ?? 'Failed to complete delivery');
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

    const value = useMemo(() => ({
        currentDelivery,
        isLoading,
        error,
        verifyOTP,
        notifyCustomer,
        acceptDelivery,
        startTracking,
        updateLocation,
        completeDelivery,
        declineDelivery,
        setCurrentDelivery,
        setLocationPermissionGranted,
    }), [
        currentDelivery,
        isLoading,
        error,
        locationPermissionGranted,
        // Functions don't need to be in dependencies as they don't change between renders
    ]);

    return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
};
