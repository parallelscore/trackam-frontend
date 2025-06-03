// src/components/vendor/DeliveryMetrics.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { useDelivery } from '../../context/DeliveryContext';

interface DeliveryMetricsProps {
    period?: 'day' | 'week' | 'month' | 'all';
}

// Enhanced animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 50,
        scale: 0.9,
        rotateY: -15
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateY: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
        }
    }
};

const iconVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
        scale: 1,
        rotate: 0,
        opacity: 1,
        transition: {
            duration: 0.7,
            ease: "easeOut",
            delay: 0.4
        }
    }
};

const valueVariants = {
    hidden: { opacity: 0, scale: 0.3, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            delay: 0.6
        }
    }
};

const pulseEffect = {
    initial: { boxShadow: "0 0 0 rgba(16, 185, 129, 0)" },
    animate: {
        boxShadow: [
            "0 0 0 rgba(16, 185, 129, 0)",
            "0 0 30px rgba(16, 185, 129, 0.2)",
            "0 0 0 rgba(16, 185, 129, 0)"
        ],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
};

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

    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-50px" });

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
    }, [period]);

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

    // Enhanced metrics configuration with sophisticated styling
    const metricsConfig = [
        {
            key: 'total_deliveries',
            label: 'Total Deliveries',
            value: metrics.total_deliveries,
            suffix: '',
            period: period === 'day' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.5a2.5 2.5 0 00-2.5 2.5v0a2.5 2.5 0 01-2.5 2.5H9.5a2.5 2.5 0 01-2.5-2.5v0a2.5 2.5 0 00-2.5-2.5H2" />
                </svg>
            ),
            bgGradient: 'from-blue-500/15 via-indigo-500/10 to-purple-500/15',
            iconBg: 'from-blue-500 to-indigo-600',
            valueColor: 'text-blue-700',
            glowColor: 'rgba(59, 130, 246, 0.15)',
            description: 'Package Orders'
        },
        {
            key: 'completion_rate',
            label: 'Completion Rate',
            value: metrics.completion_rate,
            suffix: '%',
            period: 'Success Rate',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgGradient: 'from-emerald-500/15 via-green-500/10 to-teal-500/15',
            iconBg: 'from-emerald-500 to-green-600',
            valueColor: 'text-emerald-700',
            glowColor: 'rgba(16, 185, 129, 0.15)',
            description: 'Successfully Delivered'
        },
        {
            key: 'avg_delivery_time',
            label: 'Avg Delivery Time',
            value: formatTime(metrics.avg_delivery_time),
            suffix: '',
            period: 'Average Duration',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgGradient: 'from-amber-500/15 via-orange-500/10 to-yellow-500/15',
            iconBg: 'from-amber-500 to-orange-600',
            valueColor: 'text-amber-700',
            glowColor: 'rgba(245, 158, 11, 0.15)',
            description: 'From Creation to Delivery'
        },
        {
            key: 'cancel_rate',
            label: 'Cancel Rate',
            value: metrics.cancel_rate,
            suffix: '%',
            period: 'Cancellation Rate',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgGradient: 'from-red-500/15 via-rose-500/10 to-pink-500/15',
            iconBg: 'from-red-500 to-rose-600',
            valueColor: 'text-red-700',
            glowColor: 'rgba(239, 68, 68, 0.15)',
            description: 'Cancelled Deliveries'
        }
    ];

    return (
        <motion.div
            ref={containerRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {metricsConfig.map((metric, index) => (
                <motion.div
                    key={metric.key}
                    variants={cardVariants}
                    className="relative group"
                >
                    {/* Enhanced Card with sophisticated design */}
                    <motion.div
                        className="relative overflow-hidden"
                        whileHover={{
                            scale: 1.05,
                            y: -10,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        variants={pulseEffect}
                        initial="initial"
                        animate="animate"
                        style={{
                            filter: `drop-shadow(0 8px 25px ${metric.glowColor})`
                        }}
                    >
                        <Card className="relative border-0 bg-white/95 backdrop-blur-xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 overflow-hidden">
                            {/* Animated background gradient */}
                            <motion.div
                                className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                                initial={false}
                            />

                            {/* Subtle geometric pattern overlay */}
                            <motion.div
                                className="absolute inset-0 opacity-5"
                                animate={{
                                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                                }}
                                transition={{
                                    duration: 25,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px), radial-gradient(circle at 75% 75%, currentColor 2px, transparent 2px)`,
                                    backgroundSize: "20px 20px"
                                }}
                            />

                            {/* Floating micro-particles */}
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-30"
                                    style={{
                                        left: `${15 + i * 20}%`,
                                        top: `${20 + i * 15}%`,
                                    }}
                                    animate={{
                                        y: [0, -15, 0],
                                        x: [0, 10, 0],
                                        opacity: [0.3, 0.7, 0.3],
                                        scale: [1, 1.3, 1]
                                    }}
                                    transition={{
                                        duration: 4 + i * 0.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.8 + index * 0.2
                                    }}
                                />
                            ))}

                            {/* Animated corner accent */}
                            <motion.div
                                className="absolute top-0 right-0 w-20 h-20 opacity-10"
                                animate={{
                                    rotate: [0, 180, 360],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    background: `conic-gradient(from 0deg, ${metric.glowColor}, transparent, ${metric.glowColor})`
                                }}
                            />

                            <CardContent className="p-8 relative z-10">
                                <div className="space-y-6">
                                    {/* Enhanced Header Section */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <motion.h3
                                                className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                                            >
                                                {metric.period}
                                            </motion.h3>
                                            <motion.p
                                                className="text-sm text-gray-500 font-medium"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                            >
                                                {metric.label}
                                            </motion.p>
                                        </div>

                                        {/* Enhanced Icon */}
                                        <motion.div
                                            variants={iconVariants}
                                            className={`p-4 rounded-2xl bg-gradient-to-br ${metric.iconBg} shadow-lg group-hover:shadow-xl transition-shadow duration-500`}
                                            whileHover={{
                                                rotate: [0, -10, 10, 0],
                                                scale: 1.15,
                                                transition: { duration: 0.6 }
                                            }}
                                        >
                                            <motion.div
                                                className="text-white"
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {metric.icon}
                                            </motion.div>

                                            {/* Icon pulse effect */}
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl"
                                                animate={{
                                                    boxShadow: [
                                                        "0 0 0 rgba(255, 255, 255, 0)",
                                                        "0 0 25px rgba(255, 255, 255, 0.4)",
                                                        "0 0 0 rgba(255, 255, 255, 0)"
                                                    ]
                                                }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: index * 0.6
                                                }}
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Enhanced Value Section */}
                                    <div className="space-y-3">
                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="space-y-3"
                                                >
                                                    {/* Enhanced loading skeleton */}
                                                    <motion.div
                                                        className="h-12 w-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl"
                                                        animate={{
                                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        style={{
                                                            backgroundSize: "200% 100%"
                                                        }}
                                                    />
                                                    <motion.div
                                                        className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
                                                        animate={{
                                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: 0.3
                                                        }}
                                                        style={{
                                                            backgroundSize: "200% 100%"
                                                        }}
                                                    />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="content"
                                                    variants={valueVariants}
                                                    className="space-y-3"
                                                >
                                                    {/* Enhanced Value Display */}
                                                    <div className="flex items-baseline gap-1">
                                                        <motion.p
                                                            className={`text-4xl font-bold ${metric.valueColor} group-hover:scale-110 transition-transform duration-300`}
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{
                                                                delay: 0.7 + index * 0.1,
                                                                duration: 0.8,
                                                                type: "spring",
                                                                stiffness: 200
                                                            }}
                                                        >
                                                            {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
                                                        </motion.p>
                                                        {metric.suffix && (
                                                            <motion.span
                                                                className={`text-xl font-semibold ${metric.valueColor} opacity-80`}
                                                                initial={{ opacity: 0, scale: 0.5 }}
                                                                animate={{ opacity: 0.8, scale: 1 }}
                                                                transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                                                            >
                                                                {metric.suffix}
                                                            </motion.span>
                                                        )}

                                                        {/* Performance indicator */}
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                                                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                        >
                                                            {metric.key === 'completion_rate' && metrics.completion_rate >= 80 && (
                                                                <div className="text-green-500">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    </div>

                                                    {/* Enhanced Description */}
                                                    <motion.p
                                                        className="text-sm text-gray-500 font-medium leading-relaxed"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                                                    >
                                                        {metric.description}
                                                    </motion.p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Enhanced Progress Bar for Rates */}
                                {(metric.key === 'completion_rate' || metric.key === 'cancel_rate') && !isLoading && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                                    >
                                        <motion.div
                                            className={`h-full bg-gradient-to-r ${metric.iconBg} rounded-r-full`}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: metrics[metric.key as keyof typeof metrics] / 100 }}
                                            transition={{ delay: 1.2 + index * 0.1, duration: 1, ease: "easeOut" }}
                                            style={{ transformOrigin: "left" }}
                                        />
                                    </motion.div>
                                )}

                                {/* Enhanced Border Accent */}
                                <motion.div
                                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.iconBg} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}
                                    style={{ transformOrigin: "left" }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Enhanced Hover Ring Effect */}
                    <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-emerald-200/60 transition-colors duration-500 pointer-events-none"
                        initial={false}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default DeliveryMetrics;