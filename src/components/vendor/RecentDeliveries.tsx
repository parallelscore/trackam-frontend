// src/components/vendor/RecentDeliveries.tsx
import React, { useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Delivery } from '@/types';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DeliveryItemSkeleton } from '../ui/skeleton';
import { getStatusColor, getStatusText, formatDateTime, generateWhatsAppLink } from '@/utils/utils.ts';

interface RecentDeliveriesProps {
    deliveries: Delivery[];
    isLoading: boolean;
    onViewAll?: () => void;
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

const deliveryItemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        x: -20,
        scale: 0.95,
        rotateX: -10
    },
    visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
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

const buttonPulse = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.02, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
};

const RecentDeliveries: React.FC<RecentDeliveriesProps> = ({
                                                               deliveries,
                                                               isLoading,
                                                               onViewAll
                                                           }) => {
    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Generate WhatsApp message for rider
    const handleShareWithRider = (delivery: Delivery) => {
        if (delivery.rider) {
            const message = `Hello ${delivery.rider.name}, you have a delivery to make. Track it here: ${delivery.tracking.rider_link} - Your OTP is: ${delivery.tracking.otp}`;
            const whatsappLink = generateWhatsAppLink(delivery.rider.phone_number, message);
            window.open(whatsappLink, '_blank');
        }
    };

    // Status color mapping for enhanced styling
    const getEnhancedStatusColor = (status: string) => {
        const colorMap = {
            'created': 'from-blue-500 to-indigo-600',
            'assigned': 'from-purple-500 to-violet-600',
            'accepted': 'from-cyan-500 to-blue-600',
            'in_progress': 'from-orange-500 to-amber-600',
            'completed': 'from-emerald-500 to-green-600',
            'cancelled': 'from-red-500 to-rose-600'
        };
        return colorMap[status as keyof typeof colorMap] || 'from-gray-500 to-gray-600';
    };

    const getStatusIcon = (status: string) => {
        const iconMap = {
            'created': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
            'assigned': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            'accepted': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'in_progress': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            'completed': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            'cancelled': (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        };
        return iconMap[status as keyof typeof iconMap] || null;
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
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20"
                            style={{
                                left: `${10 + i * 15}%`,
                                top: `${15 + (i % 2) * 30}%`,
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
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(16, 185, 129, 0.05) 4px, rgba(16, 185, 129, 0.05) 8px)`,
                            backgroundSize: "40px 40px"
                        }}
                    />

                    {/* Enhanced Header */}
                    <CardHeader className="relative z-10 pb-4">
                        <motion.div
                            variants={headerVariants}
                            className="flex items-center justify-between"
                        >
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </motion.div>

                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-800">
                                        Recent Deliveries
                                    </CardTitle>
                                    <motion.p
                                        className="text-sm text-gray-500 mt-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                    >
                                        Latest delivery activities
                                    </motion.p>
                                </div>
                            </div>

                            {/* View All Button */}
                            {onViewAll && deliveries.length > 0 && (
                                <motion.div
                                    variants={buttonPulse}
                                    initial="initial"
                                    animate="animate"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={onViewAll}
                                        variant="outline"
                                        size="sm"
                                        className="bg-white/80 hover:bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:border-emerald-300 font-medium transition-all duration-300"
                                    >
                                        <span className="flex items-center gap-2">
                                            View All
                                            <motion.svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                whileHover={{ x: 2 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </motion.svg>
                                        </span>
                                    </Button>
                                </motion.div>
                            )}
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
                                    className="space-y-4"
                                >
                                    {/* Enhanced loading skeletons */}
                                    {[1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1, duration: 0.5 }}
                                        >
                                            <DeliveryItemSkeleton />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : deliveries.length === 0 ? (
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
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H9a2 2 0 00-2 2v3a2 2 0 002 2h11a2 2 0 002-2v-3a2 2 0 00-2-2H6" />
                                        </svg>
                                    </motion.div>
                                    <div className="space-y-3">
                                        <motion.p
                                            className="text-gray-500 font-medium text-lg"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                        >
                                            No deliveries found
                                        </motion.p>
                                        <motion.p
                                            className="text-gray-400 text-sm"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6, duration: 0.5 }}
                                        >
                                            Your recent deliveries will appear here once you start creating them
                                        </motion.p>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                    >
                                        <Button
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                            variant="default"
                                        >
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Create Your First Delivery
                                            </span>
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    className="space-y-0 divide-y divide-gray-100"
                                >
                                    {deliveries.map((delivery) => (
                                        <motion.div
                                            key={delivery.id}
                                            variants={deliveryItemVariants}
                                            className="group"
                                        >
                                            <motion.div
                                                className="p-4 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/30 transition-all duration-300 rounded-lg mx-2 my-1"
                                                whileHover={{
                                                    scale: 1.02,
                                                    x: 4,
                                                    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.1)"
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    {/* Enhanced Delivery Info */}
                                                    <div className="space-y-3 flex-1">
                                                        {/* Status and ID Row */}
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <Badge
                                                                    className={`${getStatusColor(delivery.status)} relative overflow-hidden group-hover:shadow-md transition-shadow duration-300`}
                                                                >
                                                                    <span className="flex items-center gap-1.5">
                                                                        {getStatusIcon(delivery.status)}
                                                                        {getStatusText(delivery.status)}
                                                                    </span>

                                                                    {/* Badge glow effect */}
                                                                    <motion.div
                                                                        className={`absolute inset-0 bg-gradient-to-r ${getEnhancedStatusColor(delivery.status)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                                                                        initial={false}
                                                                    />
                                                                </Badge>
                                                            </motion.div>

                                                            <motion.span
                                                                className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-md group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors duration-300"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                ID: {delivery.tracking_id}
                                                            </motion.span>
                                                        </div>

                                                        {/* Package Description */}
                                                        <motion.h3
                                                            className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300"
                                                            initial={{ opacity: 0.8 }}
                                                            whileHover={{ opacity: 1 }}
                                                        >
                                                            {delivery.package.description}
                                                        </motion.h3>

                                                        {/* Customer and Date Info */}
                                                        <div className="flex items-center gap-6 text-sm text-gray-600">
                                                            <motion.div
                                                                className="flex items-center gap-2 group-hover:text-emerald-700 transition-colors duration-300"
                                                                whileHover={{ x: 2 }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <span className="font-medium">{delivery.customer.name}</span>
                                                            </motion.div>

                                                            <motion.div
                                                                className="flex items-center gap-2 group-hover:text-emerald-700 transition-colors duration-300"
                                                                whileHover={{ x: 2 }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{formatDateTime(delivery.created_at)}</span>
                                                            </motion.div>
                                                        </div>
                                                    </div>

                                                    {/* Enhanced Action Buttons */}
                                                    <div className="flex items-center gap-2 self-end md:self-center">
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(`/track/${delivery.tracking_id}`, '_blank')}
                                                                className="bg-white/80 hover:bg-blue-50 text-blue-700 border-blue-200/50 hover:border-blue-300 transition-all duration-300"
                                                            >
                                                                <motion.span
                                                                    className="flex items-center gap-1.5"
                                                                    whileHover={{ x: 2 }}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Track
                                                                </motion.span>
                                                            </Button>
                                                        </motion.div>

                                                        {delivery.rider && (
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="bg-white/80 hover:bg-green-50 text-green-700 border-green-200/50 hover:border-green-300 transition-all duration-300"
                                                                    onClick={() => handleShareWithRider(delivery)}
                                                                >
                                                                    <motion.span
                                                                        className="flex items-center gap-1.5"
                                                                        whileHover={{ scale: 1.1 }}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                                        </svg>
                                                                        Rider
                                                                    </motion.span>
                                                                </Button>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Enhanced hover effect line */}
                                                <motion.div
                                                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                                                    initial={false}
                                                />
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Decorative Corner Elements */}
            <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [360, 180, 0]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </motion.div>
    );
};

export default RecentDeliveries;