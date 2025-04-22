// src/context/DeliveryContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import deliveryService from '../services/deliveryService';
import { Delivery } from '@/types';

interface DeliveryContextProps {
    deliveries: Delivery[];
    totalDeliveries: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    fetchDeliveries: (filters?: { status?: string; search?: string; page?: number; limit?: number }) => Promise<void>;
    createDelivery: (deliveryData: any) => Promise<Delivery | null>;
    getDeliveryById: (id: string) => Promise<Delivery | null>;
    getDeliveryByTracking: (trackingId: string) => Promise<Delivery | null>;
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
    const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Fetch deliveries with optional filtering
    const fetchDeliveries = async (filters?: { status?: string; search?: string; page?: number; limit?: number }) => {
        setIsLoading(true);
        try {
            const result = await deliveryService.getDeliveries(filters || {});
            if (result.success) {
                setDeliveries(result.data.items);
                setTotalDeliveries(result.data.total);
                setCurrentPage(result.data.page);
                setTotalPages(result.data.pages);
            } else {
                toast.error(result.error || 'Failed to fetch deliveries');
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new delivery
    const createDelivery = async (deliveryData: any): Promise<Delivery | null> => {
        setIsLoading(true);
        try {
            const result = await deliveryService.createDelivery(deliveryData);
            if (result.success) {
                toast.success('Delivery created successfully');
                return result.data;
            } else {
                toast.error(result.error || 'Failed to create delivery');
                return null;
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            toast.error('An unexpected error occurred');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Get delivery by ID
    const getDeliveryById = async (id: string): Promise<Delivery | null> => {
        setIsLoading(true);
        try {
            const result = await deliveryService.getDeliveryById(id);
            if (result.success) {
                return result.data;
            } else {
                toast.error(result.error || 'Failed to fetch delivery');
                return null;
            }
        } catch (error) {
            console.error('Error fetching delivery:', error);
            toast.error('An unexpected error occurred');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Get delivery by tracking ID
    const getDeliveryByTracking = async (trackingId: string): Promise<Delivery | null> => {
        setIsLoading(true);
        try {
            const result = await deliveryService.getDeliveryByTracking(trackingId);
            if (result.success) {
                return result.data;
            } else {
                toast.error(result.error || 'Failed to fetch delivery');
                return null;
            }
        } catch (error) {
            console.error('Error fetching delivery:', error);
            toast.error('An unexpected error occurred');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Load deliveries on initial mount
    useEffect(() => {
        fetchDeliveries();
    }, []);

    const value = {
        deliveries,
        totalDeliveries,
        currentPage,
        totalPages,
        isLoading,
        fetchDeliveries,
        createDelivery,
        getDeliveryById,
        getDeliveryByTracking,
    };

    return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
};