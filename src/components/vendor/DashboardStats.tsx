// src/components/vendor/DashboardStats.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { useDelivery } from '../../context/DeliveryContext';

interface StatsProps {
    period?: 'day' | 'week' | 'month' | 'all';
}

// Enhanced animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.95,
        rotateX: -15
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
        }
    }
};

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            delay: 0.3
        }
    }
};

const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            delay: 0.5
        }
    }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(16, 185, 129, 0)" },
    animate: {
        boxShadow: [
            "0 0 20px rgba(16, 185, 129, 0.1)",
            "0 0 40px rgba(16, 185, 129, 0.05)",
            "0 0 20px rgba(16, 185, 129, 0.1)"
        ],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
};

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

    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-50px" });

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getDashboardStats(period);
                setStats(data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load statistics');
                // Set default/empty data to prevent retries
                setStats({
                    total_deliveries: 0,
                    in_progress: 0,
                    completed: 0,
                    cancelled: 0
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [period, error]);

    // Enhanced stat configurations with gradients and better colors
    const statConfigs = [
        {
            key: 'total_deliveries',
            label: 'Total Deliveries',
            value: stats.total_deliveries,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            bgGradient: 'from-emerald-500/20 via-green-500/15 to-teal-500/20',
            iconBg: 'from-emerald-500 to-green-600',
            iconColor: 'text-white',
            valueColor: 'text-emerald-700',
            glowColor: 'rgba(16, 185, 129, 0.15)'
        },
        {
            key: 'in_progress',
            label: 'In Progress',
            value: stats.in_progress,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            bgGradient: 'from-orange-500/20 via-amber-500/15 to-yellow-500/20',
            iconBg: 'from-orange-500 to-amber-600',
            iconColor: 'text-white',
            valueColor: 'text-orange-700',
            glowColor: 'rgba(255, 149, 0, 0.15)'
        },
        {
            key: 'completed',
            label: 'Completed',
            value: stats.completed,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            ),
            bgGradient: 'from-green-500/20 via-emerald-500/15 to-teal-500/20',
            iconBg: 'from-green-500 to-emerald-600',
            iconColor: 'text-white',
            valueColor: 'text-green-700',
            glowColor: 'rgba(34, 197, 94, 0.15)'
        },
        {
            key: 'cancelled',
            label: 'Cancelled',
            value: stats.cancelled,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
            bgGradient: 'from-red-500/20 via-rose-500/15 to-pink-500/20',
            iconBg: 'from-red-500 to-rose-600',
            iconColor: 'text-white',
            valueColor: 'text-red-700',
            glowColor: 'rgba(239, 68, 68, 0.15)'
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
            {statConfigs.map((config, index) => (
                <motion.div
                    key={config.key}
                    variants={cardVariants}
                    className="relative group"
                >
                    {/* Enhanced Card with gradients and animations */}
                    <motion.div
                        className="relative overflow-hidden"
                        whileHover={{
                            scale: 1.05,
                            y: -8,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        variants={glowEffect}
                        initial="initial"
                        animate="animate"
                        style={{
                            filter: `drop-shadow(0 4px 20px ${config.glowColor})`
                        }}
                    >
                        <Card className="relative border-0 bg-white/90 backdrop-blur-xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                            {/* Animated background gradient */}
                            <motion.div
                                className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                initial={false}
                            />

                            {/* Subtle animated pattern overlay */}
                            <motion.div
                                className="absolute inset-0 opacity-5"
                                animate={{
                                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)`,
                                    backgroundSize: "20px 20px"
                                }}
                            />

                            {/* Floating particles */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-30"
                                    style={{
                                        left: `${20 + i * 25}%`,
                                        top: `${15 + i * 20}%`,
                                    }}
                                    animate={{
                                        y: [0, -10, 0],
                                        opacity: [0.3, 0.7, 0.3],
                                        scale: [1, 1.5, 1]
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.7 + index * 0.2
                                    }}
                                />
                            ))}

                            <CardContent className="p-8 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {/* Enhanced icon with gradient background */}
                                        <motion.div
                                            variants={iconVariants}
                                            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${config.iconBg} shadow-lg mb-6 group-hover:shadow-xl transition-shadow duration-500`}
                                            whileHover={{
                                                rotate: [0, -10, 10, 0],
                                                scale: 1.1,
                                                transition: { duration: 0.5 }
                                            }}
                                        >
                                            <motion.div
                                                className={config.iconColor}
                                                whileHover={{ scale: 1.2 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {config.icon}
                                            </motion.div>

                                            {/* Icon glow effect */}
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl"
                                                animate={{
                                                    boxShadow: [
                                                        `0 0 0 rgba(255, 255, 255, 0)`,
                                                        `0 0 20px rgba(255, 255, 255, 0.3)`,
                                                        `0 0 0 rgba(255, 255, 255, 0)`
                                                    ]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: index * 0.5
                                                }}
                                            />
                                        </motion.div>

                                        {/* Enhanced label */}
                                        <motion.p
                                            className="text-sm font-semibold text-gray-600 mb-2 group-hover:text-gray-700 transition-colors duration-300"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                                        >
                                            {config.label}
                                        </motion.p>

                                        {/* Enhanced value with loading animation */}
                                        {isLoading ? (
                                            <motion.div
                                                className="h-10 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
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
                                        ) : (
                                            <motion.div
                                                variants={numberVariants}
                                                className="flex items-baseline gap-2"
                                            >
                                                <motion.p
                                                    className={`text-4xl font-bold ${config.valueColor} group-hover:scale-110 transition-transform duration-300`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay: 0.6 + index * 0.1,
                                                        duration: 0.6,
                                                        type: "spring",
                                                        stiffness: 200
                                                    }}
                                                >
                                                    {config.value.toLocaleString()}
                                                </motion.p>

                                                {/* Trend indicator */}
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                                                    className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7m0 10H7" />
                                                    </svg>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Enhanced decorative element */}
                                    <motion.div
                                        className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                                        animate={{
                                            rotate: [0, 10, -10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 0.5
                                        }}
                                    >
                                        <motion.div
                                            className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.iconBg} opacity-30`}
                                            whileHover={{ scale: 1.2, opacity: 0.5 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Enhanced bottom border with animation */}
                                <motion.div
                                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.iconBg} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                                    style={{ width: '100%' }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Enhanced hover effect ring */}
                    <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-emerald-200/50 transition-colors duration-500 pointer-events-none"
                        initial={false}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default DashboardStats;