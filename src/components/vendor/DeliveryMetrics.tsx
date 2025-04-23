// src/components/vendor/DeliveryMetrics.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { useDelivery } from '../../context/DeliveryContext';

interface DeliveryMetricsProps {
    period?: 'day' | 'week' | 'month' | 'all';
}

const DeliveryMetrics: React.FC<DeliveryMetricsProps> = ({ period = 'week' }) => {
    const { getDashboardStats } = useDelivery();
    const [metrics, setMetrics] = useState({
        completion_rate: 0,
        avg_delivery_time: 0,
        cancel_rate: 0,
        total_deliveries: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track if component is mounted to prevent state updates after unmount
    const isMounted = useRef(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getDashboardStats(period);
                if (isMounted.current) {
                    setMetrics(data);
                }
            } catch (err) {
                console.error('Error fetching delivery metrics:', err);
                if (isMounted.current) {
                    setError('Failed to load metrics');
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchMetrics();

        // Clean up function
        return () => {
            isMounted.current = false;
        };
    }, [period, getDashboardStats]);

    // Format time from minutes to hours and minutes
    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours} hr`;
        }

        return `${hours} hr ${remainingMinutes} min`;
    };

    // Render skeleton loader
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Display error message
    if (error) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-4">
                    <CardContent className="p-6 text-center text-red-500">
                        <p>{error}</p>
                        <button
                            className="mt-2 text-primary underline"
                            onClick={() => getDashboardStats(period).then(data => setMetrics(data)).catch(err => setError(String(err)))}
                        >
                            Try again
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">{period === 'day' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}</h3>
                    <p className="text-3xl font-bold">{metrics.total_deliveries}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Deliveries</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">Completion Rate</h3>
                    <p className="text-3xl font-bold">{metrics.completion_rate}%</p>
                    <p className="text-sm text-gray-500 mt-1">Successfully Delivered</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">Avg Delivery Time</h3>
                    <p className="text-3xl font-bold">{formatTime(metrics.avg_delivery_time)}</p>
                    <p className="text-sm text-gray-500 mt-1">From Creation to Delivery</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">Cancel Rate</h3>
                    <p className="text-3xl font-bold">{metrics.cancel_rate}%</p>
                    <p className="text-sm text-gray-500 mt-1">Cancelled Deliveries</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeliveryMetrics;