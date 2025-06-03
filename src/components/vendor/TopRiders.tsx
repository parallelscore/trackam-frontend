// src/components/vendor/TopRiders.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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
    hidden: { opacity: 0, x: -40, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: "easeOut"
        }
    }
};

const riderItemVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        x: -30,
        scale: 0.9,
        rotateY: -15
    },
    visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateY: 0,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
        }
    }
};

const rankBadgeVariants = {
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

const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
            delay: 0.4
        }
    }
};

const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 40 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
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
            "0 0 20px rgba(16, 185, 129, 0.1)",
            "0 0 40px rgba(16, 185, 129, 0.05)",
            "0 0 20px rgba(16, 185, 129, 0.1)"
        ],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
};

const TopRiders: React.FC = () => {
    const { getTopRiders } = useDelivery();
    const [riders, setRiders] = useState<RiderStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    useEffect(() => {
        const fetchTopRiders = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getTopRiders(5);
                setRiders(data);
            } catch (err) {
                console.error('Error fetching top riders:', err);
                setError('Failed to load rider data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopRiders();
    }, []);

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

    // Get rank styling based on position
    const getRankStyling = (index: number) => {
        const styles = [
            {
                gradient: 'from-yellow-400 via-yellow-500 to-amber-600',
                bgGradient: 'from-yellow-50 to-amber-50',
                textColor: 'text-yellow-700',
                icon: '👑',
                glow: 'rgba(245, 158, 11, 0.3)'
            },
            {
                gradient: 'from-slate-300 via-slate-400 to-slate-500',
                bgGradient: 'from-slate-50 to-gray-50',
                textColor: 'text-slate-700',
                icon: '🥈',
                glow: 'rgba(148, 163, 184, 0.3)'
            },
            {
                gradient: 'from-orange-400 via-orange-500 to-orange-600',
                bgGradient: 'from-orange-50 to-amber-50',
                textColor: 'text-orange-700',
                icon: '🥉',
                glow: 'rgba(251, 146, 60, 0.3)'
            },
            {
                gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
                bgGradient: 'from-emerald-50 to-green-50',
                textColor: 'text-emerald-700',
                icon: '⭐',
                glow: 'rgba(16, 185, 129, 0.3)'
            },
            {
                gradient: 'from-blue-400 via-blue-500 to-blue-600',
                bgGradient: 'from-blue-50 to-indigo-50',
                textColor: 'text-blue-700',
                icon: '🌟',
                glow: 'rgba(59, 130, 246, 0.3)'
            }
        ];
        return styles[index] || styles[4];
    };

    // Get performance badge styling
    const getPerformanceBadge = (completionRate: number) => {
        if (completionRate >= 95) {
            return {
                variant: 'default' as const,
                className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0',
                label: 'Excellent',
                icon: '🏆'
            };
        } else if (completionRate >= 90) {
            return {
                variant: 'default' as const,
                className: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0',
                label: 'Great',
                icon: '⚡'
            };
        } else if (completionRate >= 80) {
            return {
                variant: 'default' as const,
                className: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0',
                label: 'Good',
                icon: '👍'
            };
        } else if (completionRate >= 70) {
            return {
                variant: 'secondary' as const,
                className: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0',
                label: 'Fair',
                icon: '📈'
            };
        } else {
            return {
                variant: 'destructive' as const,
                className: 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-0',
                label: 'Needs Improvement',
                icon: '📊'
            };
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
            {/* Enhanced Card with sophisticated design */}
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
                <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
                    {/* Animated background gradient */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/3 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700"
                        initial={false}
                    />

                    {/* Floating particles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${15 + (i % 3) * 25}%`,
                            }}
                            animate={{
                                y: [0, -25, 0],
                                x: [0, 10, 0],
                                opacity: [0.2, 0.6, 0.2],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{
                                duration: 5 + i * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.6
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
                            duration: 35,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(16, 185, 129, 0.05) 60deg, transparent 120deg)`,
                            backgroundSize: "50px 50px"
                        }}
                    />

                    {/* Enhanced Header */}
                    <CardHeader className="relative z-10 pb-4">
                        <motion.div variants={headerVariants} className="flex items-center gap-3">
                            <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                                whileHover={{
                                    rotate: 15,
                                    scale: 1.15,
                                    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)"
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.span
                                    className="text-xl"
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    🚴‍♂️
                                </motion.span>
                            </motion.div>

                            <div>
                                <CardTitle className="text-xl font-bold text-gray-800">
                                    Top Performing Riders
                                </CardTitle>
                                <motion.p
                                    className="text-sm text-gray-500 mt-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    Your best delivery partners
                                </motion.p>
                            </div>
                        </motion.div>
                    </CardHeader>

                    {/* Enhanced Content */}
                    <CardContent className="relative z-10 pt-0">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    variants={loadingVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    {/* Enhanced loading skeletons */}
                                    {[1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1, duration: 0.5 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Rank skeleton */}
                                                <motion.div
                                                    className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"
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
                                                <div className="space-y-2">
                                                    <motion.div
                                                        className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-28"
                                                        animate={{
                                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: 0.2
                                                        }}
                                                        style={{
                                                            backgroundSize: "200% 100%"
                                                        }}
                                                    />
                                                    <motion.div
                                                        className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-20"
                                                        animate={{
                                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: 0.4
                                                        }}
                                                        style={{
                                                            backgroundSize: "200% 100%"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <motion.div
                                                className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
                                                animate={{
                                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: 0.6
                                                }}
                                                style={{
                                                    backgroundSize: "200% 100%"
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    key="error"
                                    variants={emptyStateVariants}
                                    className="text-center py-8 space-y-4"
                                >
                                    <motion.div
                                        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </motion.div>
                                    <p className="text-red-600 font-medium">{error}</p>
                                </motion.div>
                            ) : riders.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    variants={emptyStateVariants}
                                    className="text-center py-12 space-y-6"
                                >
                                    <motion.div
                                        className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        <motion.span
                                            className="text-2xl"
                                            animate={{
                                                rotate: [0, 10, -10, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            🚴‍♂️
                                        </motion.span>
                                    </motion.div>
                                    <div className="space-y-3">
                                        <motion.p
                                            className="text-gray-500 font-medium text-lg"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                        >
                                            No rider data available
                                        </motion.p>
                                        <motion.p
                                            className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6, duration: 0.5 }}
                                        >
                                            Riders will appear here after they complete deliveries. Start by creating deliveries and assigning them to riders.
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    className="space-y-6"
                                >
                                    {riders.map((rider, index) => {
                                        const rankStyle = getRankStyling(index);
                                        const performanceBadge = getPerformanceBadge(rider.completionRate);

                                        return (
                                            <motion.div
                                                key={rider.id}
                                                variants={riderItemVariants}
                                                className="group relative"
                                            >
                                                <motion.div
                                                    className={`p-6 rounded-xl bg-gradient-to-r ${rankStyle.bgGradient} hover:shadow-lg transition-all duration-300 border border-gray-100/50 relative overflow-hidden`}
                                                    whileHover={{
                                                        scale: 1.02,
                                                        y: -4,
                                                        boxShadow: `0 8px 25px ${rankStyle.glow}`
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {/* Rank Position Glow Effect */}
                                                    <motion.div
                                                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                                                        style={{
                                                            background: `radial-gradient(circle at 20% 50%, ${rankStyle.glow}, transparent 70%)`
                                                        }}
                                                    />

                                                    <div className="flex justify-between items-start relative z-10">
                                                        {/* Enhanced Rider Info */}
                                                        <div className="flex items-start gap-4">
                                                            {/* Enhanced Rank Badge */}
                                                            <motion.div
                                                                variants={rankBadgeVariants}
                                                                className={`relative flex-shrink-0 w-12 h-12 bg-gradient-to-br ${rankStyle.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                                                                whileHover={{
                                                                    rotate: [0, -10, 10, 0],
                                                                    scale: 1.1,
                                                                    transition: { duration: 0.5 }
                                                                }}
                                                                style={{
                                                                    filter: `drop-shadow(0 4px 12px ${rankStyle.glow})`
                                                                }}
                                                            >
                                                                <span className="text-lg font-bold">{index + 1}</span>

                                                                {/* Rank Icon Overlay */}
                                                                <motion.div
                                                                    className="absolute -top-1 -right-1 text-sm"
                                                                    animate={{
                                                                        rotate: [0, 10, -10, 0],
                                                                        scale: [1, 1.1, 1]
                                                                    }}
                                                                    transition={{
                                                                        duration: 3,
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut",
                                                                        delay: index * 0.5
                                                                    }}
                                                                >
                                                                    {rankStyle.icon}
                                                                </motion.div>

                                                                {/* Badge pulse effect */}
                                                                <motion.div
                                                                    className="absolute inset-0 rounded-full"
                                                                    animate={{
                                                                        boxShadow: [
                                                                            "0 0 0 rgba(255, 255, 255, 0)",
                                                                            "0 0 20px rgba(255, 255, 255, 0.4)",
                                                                            "0 0 0 rgba(255, 255, 255, 0)"
                                                                        ]
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut",
                                                                        delay: index * 0.3
                                                                    }}
                                                                />
                                                            </motion.div>

                                                            {/* Enhanced Rider Details */}
                                                            <div className="space-y-2">
                                                                <motion.h3
                                                                    className={`font-bold text-lg ${rankStyle.textColor} group-hover:scale-105 transition-transform duration-300`}
                                                                    initial={{ opacity: 0.8 }}
                                                                    whileHover={{ opacity: 1 }}
                                                                >
                                                                    {rider.name}
                                                                </motion.h3>
                                                                <motion.p
                                                                    className="text-sm text-gray-600 font-medium"
                                                                    whileHover={{ x: 2 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    📞 {rider.phoneNumber}
                                                                </motion.p>
                                                            </div>
                                                        </div>

                                                        {/* Enhanced Stats Section */}
                                                        <motion.div
                                                            variants={statsVariants}
                                                            className="text-right space-y-3"
                                                        >
                                                            {/* Delivery Count */}
                                                            <div className="space-y-1">
                                                                <motion.div
                                                                    className={`font-bold text-xl ${rankStyle.textColor}`}
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{
                                                                        delay: 0.5 + index * 0.1,
                                                                        duration: 0.6,
                                                                        type: "spring",
                                                                        stiffness: 200
                                                                    }}
                                                                >
                                                                    {rider.completedDeliveries}/{rider.totalDeliveries}
                                                                </motion.div>
                                                                <p className="text-xs text-gray-500 font-medium">Deliveries</p>
                                                            </div>

                                                            {/* Performance Badges */}
                                                            <div className="flex flex-col items-end gap-2">
                                                                <motion.div
                                                                    whileHover={{ scale: 1.05 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <Badge
                                                                        variant={performanceBadge.variant}
                                                                        className={`${performanceBadge.className} text-xs font-semibold shadow-lg`}
                                                                    >
                                                                        <span className="flex items-center gap-1">
                                                                            <span>{performanceBadge.icon}</span>
                                                                            {Math.round(rider.completionRate)}%
                                                                        </span>
                                                                    </Badge>
                                                                </motion.div>

                                                                <motion.span
                                                                    className="text-xs text-gray-500 font-medium bg-white/70 px-2 py-1 rounded-full"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    ⏱️ Avg: {formatTime(rider.avgDeliveryTimeMinutes)}
                                                                </motion.span>
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    {/* Enhanced Progress Bar */}
                                                    <motion.div
                                                        className="mt-4 relative"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-medium text-gray-600">Completion Rate</span>
                                                            <span className="text-xs font-bold text-gray-700">{Math.round(rider.completionRate)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200/70 rounded-full h-2.5 overflow-hidden">
                                                            <motion.div
                                                                className={`h-full bg-gradient-to-r ${rankStyle.gradient} rounded-full shadow-sm relative overflow-hidden`}
                                                                initial={{ scaleX: 0 }}
                                                                animate={{ scaleX: rider.completionRate / 100 }}
                                                                transition={{
                                                                    delay: 0.8 + index * 0.1,
                                                                    duration: 1,
                                                                    ease: "easeOut"
                                                                }}
                                                                style={{ transformOrigin: "left" }}
                                                            >
                                                                {/* Progress bar shimmer effect */}
                                                                <motion.div
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                                    animate={{
                                                                        x: ["-100%", "100%"]
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Infinity,
                                                                        ease: "easeInOut",
                                                                        delay: 1 + index * 0.2
                                                                    }}
                                                                />
                                                            </motion.div>
                                                        </div>
                                                    </motion.div>

                                                    {/* Enhanced hover effect border */}
                                                    <motion.div
                                                        className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-opacity-50 transition-all duration-500`}
                                                        style={{ borderColor: rankStyle.glow }}
                                                        initial={false}
                                                    />
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Decorative Elements */}
            <motion.div
                className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.4, 1],
                    rotate: [360, 180, 0]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Performance Legend */}
            {riders.length > 0 && (
                <motion.div
                    className="mt-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    <div className="flex flex-wrap justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <span>🏆</span>
                            <span className="text-gray-600">Excellent (95%+)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>⚡</span>
                            <span className="text-gray-600">Great (90%+)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>👍</span>
                            <span className="text-gray-600">Good (80%+)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>📈</span>
                            <span className="text-gray-600">Fair (70%+)</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default TopRiders;