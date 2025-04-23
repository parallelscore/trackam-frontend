// src/components/vendor/DashboardAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getDeliveryAnalytics(timeRange);

                // Map API response to chart data format
                const chartData = data.map((item: any) => ({
                    name: item.name,
                    completed: item.completed,
                    inProgress: item.inProgress,
                    cancelled: item.cancelled
                }));

                setChartData(chartData);
            } catch (err) {
                console.error('Error fetching delivery analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [getDeliveryAnalytics, timeRange]);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Delivery Analytics</CardTitle>
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant={timeRange === 'week' ? 'default' : 'outline'}
                        onClick={() => setTimeRange('week')}
                    >
                        Week
                    </Button>
                    <Button
                        size="sm"
                        variant={timeRange === 'month' ? 'default' : 'outline'}
                        onClick={() => setTimeRange('month')}
                    >
                        Month
                    </Button>
                    <Button
                        size="sm"
                        variant={timeRange === 'year' ? 'default' : 'outline'}
                        onClick={() => setTimeRange('year')}
                    >
                        Year
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-72">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-72">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No delivery data available for the selected time range.</p>
                    </div>
                ) : (
                    <div className="h-72">
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