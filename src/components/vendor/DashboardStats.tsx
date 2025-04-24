// src/components/vendor/DashboardStats.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { useDelivery } from '../../context/DeliveryContext';

interface StatsProps {
    period?: 'day' | 'week' | 'month' | 'all';
}

const DashboardStats: React.FC<StatsProps> = ({ period = 'all' }) => {
    const { getDashboardStats } = useDelivery();
    const [stats, setStats] = useState({
        total_deliveries: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use this to track if component is mounted
    const isMounted = useRef(true);

    // Fetch stats only once on mount with the specified period
    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getDashboardStats(period);

                // Only update state if component is still mounted
                if (isMounted.current) {
                    setStats(data);
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                if (isMounted.current) {
                    setError('Failed to load statistics');
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchStats();
    }, [period, error]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Deliveries */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                            <p className="text-2xl font-bold text-secondary">{stats.total_deliveries}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* In Progress Deliveries */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">In Progress</p>
                            <p className="text-2xl font-bold text-accent">{stats.in_progress}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Completed Deliveries */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cancelled Deliveries */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Cancelled</p>
                            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardStats;