// src/components/vendor/DashboardAnalytics.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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
    created: number;
}

// Enhanced animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const headerVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut"
        }
    }
};

const buttonGroupVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut",
            staggerChildren: 0.1
        }
    }
};

const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

const chartVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3
        }
    }
};

const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(16, 185, 129, 0)" },
    animate: {
        boxShadow: [
            "0 0 30px rgba(16, 185, 129, 0.1)",
            "0 0 60px rgba(16, 185, 129, 0.05)",
            "0 0 30px rgba(16, 185, 129, 0.1)"
        ],
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
};

// Custom tooltip component with enhanced styling
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-xl border border-emerald-200/50 rounded-xl shadow-2xl p-4 min-w-[200px]"
                style={{
                    filter: "drop-shadow(0 8px 25px rgba(16, 185, 129, 0.15))"
                }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"></div>
                    <p className="font-semibold text-gray-800">{`Period: ${label}`}</p>
                </div>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => {
                        const colors = {
                            completed: '#10B981',
                            inProgress: '#F59E0B',
                            cancelled: '#EF4444',
                            created: '#1A2C56'
                        };
                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: colors[entry.dataKey as keyof typeof colors] }}
                                    ></div>
                                    <span className="text-sm text-gray-600 capitalize">
                                        {entry.dataKey === 'inProgress' ? 'In Progress' : entry.dataKey}
                                    </span>
                                </div>
                                <span className="font-semibold text-gray-800">{entry.value}</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    }
    return null;
};

const DashboardAnalytics: React.FC = () => {
    const { getDeliveryAnalytics } = useDelivery();
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

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
                    cancelled: item.cancelled,
                    created: item.created || 0
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
    }, [timeRange]);

    const timeRangeConfig = {
        week: {
            label: 'Week',
            icon: '📅',
            description: 'Delivery activity for the past 7 days',
            gradient: 'from-blue-500 to-cyan-500'
        },
        month: {
            label: 'Month',
            icon: '📊',
            description: 'Delivery activity for the past 4 weeks',
            gradient: 'from-purple-500 to-pink-500'
        },
        year: {
            label: 'Year',
            icon: '📈',
            description: 'Delivery activity for the past 12 months',
            gradient: 'from-orange-500 to-red-500'
        }
    };

    return (
        <motion.div
            ref={containerRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
        >
            {/* Enhanced Card with gradient background and animations */}
            <motion.div
                className="relative overflow-hidden"
                variants={glowEffect}
                initial="initial"
                animate="animate"
                whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
            >
                <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-2xl">
                    {/* Animated background gradient */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/3 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700"
                        initial={false}
                    />

                    {/* Floating particles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20"
                            style={{
                                left: `${15 + i * 20}%`,
                                top: `${10 + i * 15}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.2, 0.6, 0.2],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{
                                duration: 4 + i * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.8
                            }}
                        />
                    ))}

                    {/* Subtle animated pattern overlay */}
                    <motion.div
                        className="absolute inset-0 opacity-3"
                        animate={{
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(16, 185, 129, 0.1) 3px, rgba(16, 185, 129, 0.1) 6px)`,
                            backgroundSize: "30px 30px"
                        }}
                    />

                    {/* Enhanced Header */}
                    <CardHeader className="relative z-10 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Enhanced Title */}
                            <motion.div variants={headerVariants} className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                                        whileHover={{
                                            rotate: 10,
                                            scale: 1.1,
                                            boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)"
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </motion.div>

                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-800">
                                            Delivery Analytics
                                        </CardTitle>
                                        <motion.p
                                            className="text-sm text-gray-500 mt-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                        >
                                            Track your delivery performance over time
                                        </motion.p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Enhanced Time Range Buttons */}
                            <motion.div variants={buttonGroupVariants} className="flex gap-2">
                                {(['week', 'month', 'year'] as const).map((range) => {
                                    const config = timeRangeConfig[range];
                                    const isActive = timeRange === range;

                                    return (
                                        <motion.div
                                            key={range}
                                            variants={buttonVariants}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                size="sm"
                                                variant={isActive ? 'default' : 'outline'}
                                                onClick={() => setTimeRange(range)}
                                                className={`relative overflow-hidden transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl border-0'
                                                        : 'bg-white/80 hover:bg-emerald-50 text-gray-700 border-emerald-200/50 hover:border-emerald-300'
                                                }`}
                                                style={isActive ? {
                                                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                                                } : {}}
                                            >
                                                {/* Active button glow effect */}
                                                {isActive && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-20"
                                                        animate={{
                                                            opacity: [0.2, 0.4, 0.2]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                    />
                                                )}

                                                <span className="relative z-10 flex items-center gap-2">
                                                    <span className="text-sm">{config.icon}</span>
                                                    {config.label}
                                                </span>
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </CardHeader>

                    {/* Enhanced Content */}
                    <CardContent className="relative z-10 pt-4">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    variants={loadingVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex justify-center items-center h-80"
                                >
                                    <div className="relative">
                                        {/* Enhanced loading spinner */}
                                        <motion.div
                                            className="w-16 h-16 border-4 border-emerald-200 rounded-full"
                                            animate={{
                                                rotate: 360,
                                                borderColor: [
                                                    "rgba(16, 185, 129, 0.2)",
                                                    "rgba(16, 185, 129, 0.8)",
                                                    "rgba(16, 185, 129, 0.2)"
                                                ]
                                            }}
                                            transition={{
                                                rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                                                borderColor: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-1 left-1 w-14 h-14 border-4 border-transparent border-t-emerald-500 rounded-full"
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        />

                                        {/* Loading text */}
                                        <motion.p
                                            className="text-emerald-600 font-medium mt-4 text-center"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            Loading analytics...
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    key="error"
                                    variants={loadingVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex flex-col justify-center items-center h-80 space-y-4"
                                >
                                    <motion.div
                                        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </motion.div>
                                    <p className="text-red-600 font-medium">{error}</p>
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        Try Again
                                    </Button>
                                </motion.div>
                            ) : chartData.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    variants={loadingVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="text-center py-16 space-y-4"
                                >
                                    <motion.div
                                        className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </motion.div>
                                    <div className="space-y-2">
                                        <p className="text-gray-500 font-medium">No delivery data available</p>
                                        <p className="text-gray-400 text-sm">
                                            Data will appear here once you start creating deliveries for the selected time range.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chart"
                                    variants={chartVariants}
                                    className="space-y-6"
                                >
                                    {/* Enhanced Chart Container */}
                                    <motion.div
                                        className="h-80 relative"
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Chart background with subtle gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-lg -m-2" />

                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={chartData}
                                                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="rgba(16, 185, 129, 0.1)"
                                                    strokeWidth={1}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                                    tickLine={{ stroke: 'rgba(16, 185, 129, 0.2)' }}
                                                    axisLine={{ stroke: 'rgba(16, 185, 129, 0.3)' }}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                                    tickLine={{ stroke: 'rgba(16, 185, 129, 0.2)' }}
                                                    axisLine={{ stroke: 'rgba(16, 185, 129, 0.3)' }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend
                                                    wrapperStyle={{
                                                        paddingTop: '20px',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}
                                                />

                                                {/* Enhanced Lines with better colors and effects */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="completed"
                                                    stroke="#10B981"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#10B981', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{
                                                        r: 8,
                                                        fill: '#10B981',
                                                        stroke: '#fff',
                                                        strokeWidth: 3,
                                                        filter: "drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))"
                                                    }}
                                                    name="Completed"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="inProgress"
                                                    stroke="#F59E0B"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#F59E0B', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{
                                                        r: 8,
                                                        fill: '#F59E0B',
                                                        stroke: '#fff',
                                                        strokeWidth: 3,
                                                        filter: "drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))"
                                                    }}
                                                    name="In Progress"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="cancelled"
                                                    stroke="#EF4444"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#EF4444', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{
                                                        r: 8,
                                                        fill: '#EF4444',
                                                        stroke: '#fff',
                                                        strokeWidth: 3,
                                                        filter: "drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))"
                                                    }}
                                                    name="Cancelled"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="created"
                                                    stroke="#1A2C56"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#1A2C56', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{
                                                        r: 8,
                                                        fill: '#1A2C56',
                                                        stroke: '#fff',
                                                        strokeWidth: 3,
                                                        filter: "drop-shadow(0 4px 8px rgba(26, 44, 86, 0.3))"
                                                    }}
                                                    name="Created"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </motion.div>

                                    {/* Enhanced Description */}
                                    <motion.div
                                        className="mt-4 text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                    >
                                        <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                                            <span className="text-sm">{timeRangeConfig[timeRange].icon}</span>
                                            <span className="text-sm text-emerald-700 font-medium">
                                                {timeRangeConfig[timeRange].description}
                                            </span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default DashboardAnalytics;