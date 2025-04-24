// src/components/vendor/DashboardAnalytics.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { debounce } from 'lodash'; // Assuming lodash is available or installed

type TimeRange = 'week' | 'month' | 'year';

interface ChartData {
    name: string;
    completed: number;
    inProgress: number;
    cancelled: number;
}

const DashboardAnalytics: React.FC = () => {
    const { getDeliveryAnalytics } = useDelivery();
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use this to track if component is mounted
    const isMounted = useRef(true);

    // Track previous time range to avoid duplicate fetches
    const prevTimeRangeRef = useRef<TimeRange>(timeRange);

    // Debounced fetch function to prevent multiple rapid API calls
    const debouncedFetchAnalytics = useCallback(
        debounce(async (range: TimeRange) => {
            if (prevTimeRangeRef.current === range && chartData.length > 0) {
                return; // Skip if the time range hasn't changed and we have data
            }

            setIsLoading(true);
            setError(null);

            try {
                const data = await getDeliveryAnalytics(range);

                // Only update state if component is still mounted
                if (isMounted.current) {
                    setChartData(data);
                    prevTimeRangeRef.current = range;
                }
            } catch (err) {
                console.error('Error fetching delivery analytics:', err);
                if (isMounted.current) {
                    setError('Failed to load analytics data');
                }
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        }, 300),
        [getDeliveryAnalytics, chartData.length]
    );

    // Fetch analytics data when time range changes
    useEffect(() => {
        debouncedFetchAnalytics(timeRange);

        // Cleanup function to prevent state updates on unmounted component
        return () => {
            isMounted.current = false;
        };
    }, [timeRange, debouncedFetchAnalytics]);

    // Handle time range button clicks
    const handleTimeRangeChange = useCallback((range: TimeRange) => {
        setTimeRange(range);
    }, []);

        fetchAnalytics();
    }, [timeRange]);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Delivery Analytics</CardTitle>
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant={timeRange === 'week' ? 'default' : 'outline'}
                        onClick={() => handleTimeRangeChange('week')}
                        disabled={isLoading}
                    >
                        Week
                    </Button>
                    <Button
                        size="sm"
                        variant={timeRange === 'month' ? 'default' : 'outline'}
                        onClick={() => handleTimeRangeChange('month')}
                        disabled={isLoading}
                    >
                        Month
                    </Button>
                    <Button
                        size="sm"
                        variant={timeRange === 'year' ? 'default' : 'outline'}
                        onClick={() => handleTimeRangeChange('year')}
                        disabled={isLoading}
                    >
                        Year
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No delivery data available for the selected time range.</p>
                    </div>
                ) : (
                    <div className="h-72 relative">
                        {/* Add overlay spinner for loading state when data exists but is being updated */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#0CAA41"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="inProgress"
                                    stroke="#FF9500"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cancelled"
                                    stroke="#FF4D4F"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
                <div className="mt-2 text-sm text-gray-500 text-center">
                    {timeRange === 'week'
                        ? 'Delivery activity for the past 7 days'
                        : timeRange === 'month'
                            ? 'Delivery activity for the past 4 weeks'
                            : 'Delivery activity for the past 12 months'}
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardAnalytics;