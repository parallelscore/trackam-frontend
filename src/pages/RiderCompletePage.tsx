// src/pages/RiderCompletePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { OptimisticButton, OptimisticWrapper, OptimisticToast } from '../components/ui/optimistic';

// Enhanced animation variants matching VendorDashboard
const fadeInUp = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
        }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1
        }
    }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -60, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 80
        }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 60, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 80
        }
    }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(16, 185, 129, 0)" },
    animate: {
        boxShadow: [
            "0 0 20px rgba(16, 185, 129, 0.3)",
            "0 0 40px rgba(16, 185, 129, 0.1)",
            "0 0 20px rgba(16, 185, 129, 0.3)"
        ],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
};

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const RiderCompletePage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const navigate = useNavigate();
    const { getPublicDeliveryByTrackingId } = useDelivery();
    const { completeDelivery, isLoading, error } = useRider();

    const [delivery, setDelivery] = useState<any>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [completeError, setCompleteError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    
    // Optimistic UI state
    const [completeOptimisticState, setCompleteOptimisticState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [optimisticToastMessage, setOptimisticToastMessage] = useState('');
    const [showOptimisticToast, setShowOptimisticToast] = useState(false);

    // Animation refs
    const headerRef = useRef(null);

    // Fetch delivery data
    useEffect(() => {
        const fetchDelivery = async () => {
            if (!trackingId) return;

            try {
                const deliveryData = await getPublicDeliveryByTrackingId(trackingId);

                if (deliveryData) {
                    setDelivery(deliveryData);

                    // Check if already completed
                    if (deliveryData.status === 'completed') {
                        setIsCompleted(true);
                    }
                }
            } catch (err) {
                console.error('Error fetching delivery:', err);
            }
            setHasFetched(true);
        };

        fetchDelivery();
    }, [trackingId, getPublicDeliveryByTrackingId]);

    const handleCompleteClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmComplete = async () => {
        if (!trackingId) return;

        setIsSubmitting(true);
        setCompleteError(null);
        setCompleteOptimisticState('pending');
        setOptimisticToastMessage('Completing delivery...');
        setShowOptimisticToast(true);

        try {
            const result = await completeDelivery(trackingId);

            if (result.success) {
                setIsCompleted(true);
                setShowConfirmation(false);
                setCompleteOptimisticState('success');
                setOptimisticToastMessage('Delivery completed successfully!');

                // Remove tracking data from localStorage to reset rider state
                localStorage.removeItem('trackam_current_tracking_id');
                localStorage.removeItem('trackam_location_permission_granted');
                localStorage.removeItem(`trackam_${trackingId}_progress`);
                localStorage.removeItem(`trackam_${trackingId}_path_history`);

                // Delay to show success state before redirecting
                setTimeout(() => {
                    navigate('/');
                }, 5000);
            } else {
                setCompleteOptimisticState('error');
                setOptimisticToastMessage('Failed to complete delivery');
                setCompleteError(result.message || 'Failed to complete delivery');
            }
        } catch (err: any) {
            console.error('Error completing delivery:', err);
            setCompleteOptimisticState('error');
            setOptimisticToastMessage('An unexpected error occurred');
            setCompleteError(err.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
            // Hide toast after a delay
            setTimeout(() => setShowOptimisticToast(false), 3000);
        }
    };

    const handleCancelComplete = () => {
        setShowConfirmation(false);
    };

    if (!hasFetched) {
        // Loading state until fetch is completed
        return (
            <Layout>
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                    {/* Animated gradient overlays - reduced size for mobile */}
                    <motion.div
                        animate={{
                            x: [0, 80, 0],
                            y: [0, -40, 0],
                            scale: [1, 1.3, 1],
                            opacity: [0.15, 0.35, 0.15]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[10%] right-[20%] w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-gradient-to-r from-green-100/30 to-emerald-100/30 blur-3xl"
                    />

                    <motion.div
                        animate={{
                            x: [0, -60, 0],
                            y: [0, 30, 0],
                            scale: [1, 1.4, 1],
                            opacity: [0.1, 0.25, 0.1]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-[15%] left-[10%] w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/20 blur-3xl"
                    />
                </div>

                <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                            {/* Gradient border effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-xl p-0.5">
                                <div className="bg-white rounded-xl h-full w-full" />
                            </div>

                            <div className="relative z-10">
                                <CardHeader className="text-center pb-3 sm:pb-6">
                                    <motion.div
                                        variants={itemVariants}
                                        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl relative"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, -5, 5, 0]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </motion.div>

                                        {/* Pulsing rings */}
                                        <motion.div
                                            className="absolute inset-0 rounded-3xl border-2 border-emerald-400/40"
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 rounded-3xl border-2 border-green-400/40"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-secondary to-emerald-600 bg-clip-text text-transparent mb-2">
                                            Loading Delivery
                                        </CardTitle>
                                        <CardDescription className="text-base sm:text-lg text-gray-600 px-2 sm:px-4">
                                            Fetching delivery information...
                                        </CardDescription>
                                    </motion.div>
                                </CardHeader>

                                <CardContent className="px-4 sm:px-8 pb-4 sm:pb-8">
                                    <motion.div
                                        variants={itemVariants}
                                        className="flex flex-col items-center justify-center h-24 sm:h-32"
                                    >
                                        <div className="relative">
                                            <motion.div
                                                className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-200 rounded-full"
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
                                                className="absolute top-1 left-1 w-10 h-10 sm:w-14 sm:h-14 border-4 border-transparent border-t-emerald-500 rounded-full"
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>
                                        <motion.p
                                            className="text-emerald-600 font-medium mt-4 sm:mt-6 text-center"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            Please wait...
                                        </motion.p>
                                    </motion.div>
                                </CardContent>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    if (!delivery) {
        // Render error UI only after fetch attempt completed and delivery is missing
        return (
            <Layout>
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-red-50/30" />

                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[15%] right-[25%] w-40 sm:w-72 h-40 sm:h-72 rounded-full bg-gradient-to-r from-red-100/30 to-rose-100/30 blur-3xl"
                    />
                </div>

                <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-xl p-0.5">
                                <div className="bg-white rounded-xl h-full w-full" />
                            </div>

                            <div className="relative z-10">
                                <CardContent className="p-4 sm:p-8 text-center">
                                    <motion.div
                                        variants={itemVariants}
                                        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, -10, 10, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </motion.div>
                                    </motion.div>

                                    <motion.h2
                                        variants={itemVariants}
                                        className="text-xl sm:text-2xl font-bold text-gray-900 mb-4"
                                    >
                                        Something went wrong
                                    </motion.h2>

                                    <motion.div
                                        variants={itemVariants}
                                        className="text-red-600 mb-6 bg-red-50/80 rounded-lg p-3 sm:p-4 border border-red-200/50"
                                    >
                                        <p className="font-medium text-sm sm:text-base">Error: {error || 'Failed to load delivery data'}</p>
                                        <p className="text-xs sm:text-sm mt-2 text-red-700">Please try again later or contact support if the issue persists.</p>
                                    </motion.div>

                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            onClick={() => window.location.reload()}
                                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg shadow-lg transition-all duration-300"
                                        >
                                            Try Again
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    // Render completed state
    if (isCompleted) {
        return (
            <Layout>
                {/* Enhanced Background - reduced size for mobile */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-emerald-50/30" />

                    {/* Animated gradient overlays - reduced size for mobile */}
                    <motion.div
                        animate={{
                            x: [0, 80, 0],
                            y: [0, -40, 0],
                            scale: [1, 1.3, 1],
                            opacity: [0.15, 0.35, 0.15]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[10%] right-[20%] w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-gradient-to-r from-green-100/30 to-emerald-100/30 blur-3xl"
                    />

                    {/* Less geometric patterns for mobile */}
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.3, 1],
                            opacity: [0.08, 0.2, 0.08]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute top-[15%] left-[5%] w-24 sm:w-40 h-24 sm:h-40 border-2 border-green-200/30 rounded-full hidden sm:block"
                    />

                    {/* Fewer floating shapes for mobile */}
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 15, 0],
                            rotate: [0, 180, 360],
                            opacity: [0.08, 0.2, 0.08]
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[60%] left-[20%] w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-green-300/15 to-emerald-300/15 rounded-full hidden sm:block"
                    />
                </div>

                <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-4 sm:mb-8"
                    >
                        <motion.div
                            className="relative rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
                            variants={glowEffect}
                            initial="initial"
                            animate="animate"
                        >
                            {/* Green success gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500" />

                            <div className="relative p-4 sm:p-8 md:p-12">
                                <motion.div
                                    animate={{
                                        y: [0, -15, 0],
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1],
                                        opacity: [0.4, 0.7, 0.4]
                                    }}
                                    transition={{
                                        duration: 12,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-emerald-200/35 to-teal-200/35 rounded-2xl backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
                                />

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                                    <motion.div variants={slideInLeft} className="text-center md:text-left">
                                        <motion.div
                                            variants={fadeInUp}
                                            className="inline-flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-white/95 mb-3 sm:mb-4 border border-white/20 shadow-lg"
                                        >
                                            <motion.span
                                                className="w-2 sm:w-3 h-2 sm:h-3 bg-emerald-200 rounded-full"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.7, 1, 0.7]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                            <span className="font-medium">Delivery Complete</span>
                                        </motion.div>

                                        <motion.h1
                                            variants={fadeInUp}
                                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg"
                                            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                                        >
                                            Great Job! 🎉
                                        </motion.h1>

                                        <motion.p
                                            variants={fadeInUp}
                                            className="text-white/90 text-base sm:text-lg font-medium"
                                            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
                                        >
                                            You've successfully completed this delivery
                                        </motion.p>
                                    </motion.div>

                                    <motion.div variants={slideInRight} className="mt-4 md:mt-0 text-center md:text-left">
                                        <Badge className="bg-white/80 text-green-700 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium shadow-lg border border-white/50">
                                            Completed
                                        </Badge>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-emerald-100/60 p-4 sm:p-8 md:p-10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                            {/* Success Message */}
                            <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <motion.svg
                                            className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 100,
                                                delay: 0.3,
                                                duration: 0.6
                                            }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </motion.svg>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Delivery Confirmed</h2>
                                        <p className="text-sm sm:text-base text-gray-600">The customer has received their package</p>
                                    </div>
                                </div>

                                <Alert className="bg-emerald-50/80 border-emerald-200/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <motion.div
                                            className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center"
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </motion.div>
                                        <AlertTitle className="text-emerald-800 font-semibold mb-0 sm:mb-1 text-sm sm:text-base">Thank you for your service!</AlertTitle>
                                    </div>
                                    <AlertDescription className="text-emerald-700 pl-8 sm:pl-11 text-xs sm:text-sm">
                                        You'll be redirected to the homepage in a few seconds. Thank you for your service.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-4">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1"
                                    >
                                        <Button
                                            onClick={() => navigate('/')}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 sm:py-6 rounded-xl shadow-xl transition-all duration-300 text-sm sm:text-base"
                                        >
                                            Return to Home
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Delivery Info - Simplified for mobile */}
                            <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6 bg-gray-50/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200/50">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-secondary to-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    Delivery Details
                                </h3>

                                <div className="space-y-3 text-xs sm:text-sm">
                                    <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                                        <div className="text-gray-500 text-xs sm:text-sm">Tracking ID:</div>
                                        <div className="col-span-2 font-mono font-medium text-gray-800 text-xs sm:text-sm break-all">{delivery.tracking_id}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                                        <div className="text-gray-500 text-xs sm:text-sm">Customer:</div>
                                        <div className="col-span-2 font-medium text-gray-800 text-xs sm:text-sm">{delivery.customer.name}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                                        <div className="text-gray-500 text-xs sm:text-sm">Package:</div>
                                        <div className="col-span-2 font-medium text-gray-800 text-xs sm:text-sm line-clamp-2">{delivery.package.description}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                                        <div className="text-gray-500 text-xs sm:text-sm">Address:</div>
                                        <div className="col-span-2 font-medium text-gray-800 text-xs line-clamp-3">{delivery.customer.address}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                                        <div className="text-gray-500 text-xs sm:text-sm">Completed:</div>
                                        <div className="col-span-2 font-medium text-gray-800 text-xs sm:text-sm">{new Date().toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Animated Completion Badge - Smaller for mobile */}
                                <div className="flex justify-center pt-2 sm:pt-4">
                                    <motion.div
                                        className="bg-gradient-to-r from-emerald-500 to-green-600 p-1 rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            delay: 0.5,
                                            rotate: {
                                                delay: 1,
                                                duration: 0.5,
                                                ease: "easeInOut"
                                            }
                                        }}
                                    >
                                        <div className="bg-white rounded-full p-2 sm:p-3">
                                            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-inner">
                                                <motion.svg
                                                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 1, duration: 0.3 }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </motion.svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Flying Confetti Effect - Fewer particles for mobile */}
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="fixed w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}vw`,
                                    top: `${Math.random() * 100}vh`,
                                    background: `${['#10B981', '#059669', '#34D399', '#6EE7B7', '#A7F3D0'][Math.floor(Math.random() * 5)]}`,
                                }}
                                initial={{
                                    opacity: 0,
                                    scale: 0,
                                    y: -50
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0.5],
                                    y: [0, 200],
                                    x: [0, (Math.random() - 0.5) * 150]
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    delay: Math.random() * 1.5,
                                    repeat: Infinity,
                                    repeatDelay: Math.random() * 3
                                }}
                            />
                        ))}
                    </motion.div>
                </div>
            </Layout>
        );
    }

    // Render the main page content
    return (
        <Layout>
            {/* Enhanced Background - reduced size for mobile */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                {/* Animated gradient overlays - reduced size for mobile */}
                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.35, 0.15]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[10%] right-[20%] w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-gradient-to-r from-orange-100/30 to-amber-100/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[15%] left-[10%] w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-gradient-to-r from-amber-200/20 to-orange-200/20 blur-3xl"
                />

                {/* Fewer geometric patterns for mobile */}
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.3, 1],
                        opacity: [0.08, 0.2, 0.08]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[15%] left-[5%] w-24 sm:w-40 h-24 sm:h-40 border-2 border-orange-200/30 rounded-full hidden sm:block"
                />
            </div>

            <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
                {/* Enhanced Header Section - Simplified for mobile */}
                <motion.div
                    ref={headerRef}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="mb-4 sm:mb-8"
                >
                    <motion.div
                        className="relative rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
                        variants={glowEffect}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Header gradient background - orange theme for completion */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500" />

                        {/* Overlay with subtle texture */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-amber-500/75 to-yellow-600/80" />

                        <div className="relative p-4 sm:p-8 md:p-12">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                                <motion.div variants={slideInLeft} className="text-center md:text-left">
                                    <motion.div
                                        variants={fadeInUp}
                                        className="inline-flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-white/95 mb-3 sm:mb-4 border border-white/20 shadow-lg"
                                    >
                                        <motion.span
                                            className="w-2 sm:w-3 h-2 sm:h-3 bg-amber-200 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.7, 1, 0.7]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        <span className="font-medium">Delivery Completion</span>
                                    </motion.div>

                                    <motion.h1
                                        variants={fadeInUp}
                                        className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg"
                                        style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                                    >
                                        Complete Delivery
                                    </motion.h1>

                                    <motion.p
                                        variants={fadeInUp}
                                        className="text-white/90 text-sm sm:text-base md:text-lg font-medium"
                                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
                                    >
                                        Confirm the package has been delivered
                                    </motion.p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {showConfirmation ? (
                        <motion.div
                            key="confirmation"
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-2 border-amber-200 bg-amber-50/80 backdrop-blur-xl shadow-xl mb-4 sm:mb-6">
                                <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
                                    <div className="text-center mb-4 sm:mb-6">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <AlertTitle className="font-bold text-lg sm:text-xl text-amber-800 mb-2">Confirm Completion</AlertTitle>
                                        <AlertDescription className="text-amber-700 space-y-2 text-sm sm:text-base">
                                            <p>Are you sure the package has been delivered?</p>
                                            <p className="text-xs sm:text-sm bg-amber-100/50 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 border border-amber-200/50">
                                                This action cannot be undone. Please confirm only if you have handed the package to the customer.
                                            </p>
                                        </AlertDescription>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 border-gray-300 hover:bg-gray-50"
                                            onClick={handleCancelComplete}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <OptimisticButton
                                            state={completeOptimisticState}
                                            onClick={handleConfirmComplete}
                                            className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm sm:text-base shadow-lg"
                                            disabled={isSubmitting}
                                            pendingMessage="Completing..."
                                            successMessage="Completed!"
                                            errorMessage="Try Again"
                                        >
                                            Yes, Complete Delivery
                                        </OptimisticButton>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="main-content"
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                {/* Package Information */}
                                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30" />
                                    <CardHeader className="relative z-10 pb-2 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
                                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            Package Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4 relative z-10 pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Description</h3>
                                            <p className="font-semibold text-sm sm:text-base text-gray-900 bg-gray-50/50 rounded-lg px-3 py-2">
                                                {delivery.package.description}
                                            </p>
                                        </div>

                                        {delivery.package.size && (
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Size</h3>
                                                <p className="capitalize font-medium text-sm sm:text-base text-gray-900 bg-blue-50/50 rounded-lg px-3 py-2">
                                                    {delivery.package.size}
                                                </p>
                                            </div>
                                        )}

                                        {delivery.package.special_instructions && (
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Special Instructions</h3>
                                                <p className="italic text-xs sm:text-sm text-gray-800 bg-amber-50/50 rounded-lg px-3 py-2 border border-amber-200/50">
                                                    {delivery.package.special_instructions}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Tracking ID</h3>
                                            <p className="text-xs sm:text-sm text-gray-900 font-mono bg-gray-50/50 rounded-lg px-3 py-2 break-all">
                                                {delivery.tracking_id}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Customer Information */}
                                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/30" />
                                    <CardHeader className="relative z-10 pb-2 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
                                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            Customer Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4 relative z-10 pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Name</h3>
                                            <p className="font-semibold text-sm sm:text-base text-gray-900 bg-gray-50/50 rounded-lg px-3 py-2">
                                                {delivery.customer.name}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Phone Number</h3>
                                            <p className="font-medium text-sm sm:text-base text-gray-900 bg-orange-50/50 rounded-lg px-3 py-2">
                                                {delivery.customer.phone_number}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Delivery Address</h3>
                                            <div className="bg-orange-50/50 rounded-lg px-3 py-2 border border-orange-200/50">
                                                <p className="text-xs sm:text-sm text-gray-900 font-medium leading-relaxed">
                                                    {delivery.customer.address}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {completeError && (
                                <Alert variant="destructive" className="mb-4 sm:mb-6 bg-red-50/80 border-red-200/50 backdrop-blur-sm">
                                    <AlertTitle className="text-red-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Error
                                    </AlertTitle>
                                    <AlertDescription className="text-red-700 text-xs sm:text-sm">
                                        {completeError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl">
                                <CardContent className="p-4 sm:p-8">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="text-center">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Complete this Delivery</h2>
                                            <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
                                                Confirm that you have delivered the package to the customer at the specified address.
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigate(`/rider/${trackingId}`)}
                                                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                        </svg>
                                                        Back to Tracking
                                                    </span>
                                                </Button>
                                            </motion.div>

                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1"
                                            >
                                                <OptimisticButton
                                                    state={completeOptimisticState}
                                                    onClick={handleCompleteClick}
                                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 sm:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base"
                                                    pendingMessage="Preparing..."
                                                    successMessage="Ready!"
                                                    errorMessage="Complete Delivery"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Complete Delivery
                                                    </span>
                                                </OptimisticButton>
                                            </motion.div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm border-t border-gray-200/60 px-4 sm:px-8 py-3 sm:py-4 rounded-b-xl">
                                    <p className="text-center text-xs sm:text-sm text-gray-600 w-full font-medium">
                                        By completing this delivery, you confirm that the package has been successfully delivered to the customer.
                                    </p>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Optimistic Toast */}
            <OptimisticToast
                show={showOptimisticToast}
                message={optimisticToastMessage}
                type={completeOptimisticState === 'success' ? 'success' : 
                      completeOptimisticState === 'error' ? 'error' : 'info'}
                onClose={() => setShowOptimisticToast(false)}
            />
        </Layout>
    );
};

export default RiderCompletePage;
