// src/components/vendor/DeliveryMetrics.tsx
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getDashboardStats(period);
                setMetrics(data);
            } catch (err) {
                console.error('Error fetching delivery metrics:', err);
                setError('Failed to load metrics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [getDashboardStats, period]);

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">{period === 'day' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}</h3>
                    {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                    ) : (
                        <p className="text-3xl font-bold">{metrics.total_deliveries}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Total Deliveries</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">Completion Rate</h3>
                    {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                    ) : (
                        <p className="text-3xl font-bold">{metrics.completion_rate}%</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Successfully Delivered</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">Avg Delivery Time</h3>
                    {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                    ) : (
                        <p className="text-3xl font-bold">{formatTime(metrics.avg_delivery_time)}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">From Creation to Delivery</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-secondary">Cancel Rate</h3>
                    {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                    ) : (
                        <p className="text-3xl font-bold">{metrics.cancel_rate}%</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Cancelled Deliveries</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeliveryMetrics;