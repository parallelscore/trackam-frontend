// src/components/vendor/TopRiders.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface RiderStats {
    id: string;
    name: string;
    phoneNumber: string;
    totalDeliveries: number;
    completedDeliveries: number;
    completionRate: number;
    avgDeliveryTimeMinutes: number;
}

const TopRiders: React.FC = () => {
    const { getTopRiders } = useDelivery();
    const [riders, setRiders] = useState<RiderStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track if component is mounted to prevent state updates after unmount
    const isMounted = useRef(true);

    useEffect(() => {
        const fetchTopRiders = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getTopRiders(5);

                // Only update state if component is still mounted
                if (isMounted.current) {
                    setRiders(data);
                }
            } catch (err) {
                console.error('Error fetching top riders:', err);
                if (isMounted.current) {
                    setError('Failed to load rider data');
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchTopRiders();

        // Clean up function
        return () => {
            isMounted.current = false;
        };
    }, [getTopRiders]);

    // Format time from minutes to hours and minutes
    const formatTime = (minutes: number) => {
        if (isNaN(minutes)) return 'N/A';
        if (minutes < 60) {
            return `${Math.round(minutes)} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.round(minutes % 60);

        if (remainingMinutes === 0) {
            return `${hours} hr`;
        }

        return `${hours} hr ${remainingMinutes} min`;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Top Performing Riders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
                                    <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Top Performing Riders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-red-500">
                        <p>{error}</p>
                        <button
                            className="mt-2 text-primary underline"
                            onClick={() => getTopRiders(5).then(data => setRiders(data)).catch(err => setError(String(err)))}
                        >
                            Try again
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (riders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Top Performing Riders</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-gray-500 py-2">
                        No rider data available. Riders will appear here after they complete deliveries.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Top Performing Riders</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {riders.map((rider, index) => (
                        <div key={rider.id} className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-medium">{rider.name}</h3>
                                    <p className="text-sm text-gray-500">{rider.phoneNumber}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold">{rider.completedDeliveries}/{rider.totalDeliveries}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        variant={rider.completionRate >= 90 ? 'success' :
                                            rider.completionRate >= 75 ? 'default' : 'warning'}
                                        className="text-xs"
                                    >
                                        {Math.round(rider.completionRate)}%
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        Avg: {formatTime(rider.avgDeliveryTimeMinutes)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TopRiders;