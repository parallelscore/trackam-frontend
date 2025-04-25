// src/components/vendor/ResendNotificationsButton.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Delivery } from '@/types';
import toast from 'react-hot-toast';
import axios from 'axios';
import { determineApiUrl } from '@/services/authService';

interface ResendNotificationsButtonProps {
    delivery: Delivery;
    onSuccess?: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'accent' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

const ResendNotificationsButton: React.FC<ResendNotificationsButtonProps> = ({
                                                                                 delivery,
                                                                                 onSuccess,
                                                                                 variant = 'outline',
                                                                                 size = 'sm',
                                                                                 className
                                                                             }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleResendNotifications = async () => {
        if (!delivery.tracking_id) {
            toast.error('Tracking ID is missing');
            return;
        }

        setIsLoading(true);

        try {
            const apiUrl = determineApiUrl();
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${apiUrl}/deliveries/${delivery.tracking_id}/resend-notifications`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Notifications resent successfully');
                if (onSuccess) onSuccess();
            } else {
                toast.error(response.data.message || 'Failed to resend notifications');
            }
        } catch (error: any) {
            console.error('Error resending notifications:', error);
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to resend notifications. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleResendNotifications}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resending...
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Resend Notifications
                </>
            )}
        </Button>
    );
};

export default ResendNotificationsButton;