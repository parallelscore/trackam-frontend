// src/pages/RiderPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import RiderOtpVerification from '../components/rider/RiderOtpVerification';
import RiderTracker from '../components/rider/RiderTracker';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

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

const RiderPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const [searchParams] = useSearchParams();

    // Get delivery info from DeliveryContext (for initial fetch)
    const { getPublicDeliveryByTrackingId } = useDelivery();

    // Get rider-specific functionality from RiderContext
    const {
        currentDelivery,
        setCurrentDelivery,
        isLoading,
        error,
        locationPermissionGranted,
        setLocationPermissionGranted
    } = useRider();

    // Add refs to track fetch status and prevent redundant calls
    const fetchedTrackingIdRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);

    const [isVerified, setIsVerified] = useState(false);
    const [isAccepting] = useState<boolean>(
        searchParams.get('accept') === 'true'
    );

    // Track permission status locally
    const [isPermissionGranted, setIsPermissionGranted] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // State for progress restored notification
    const [showProgressRestored, setShowProgressRestored] = useState(false);
    const [progressRestoredData, setProgressRestoredData] = useState<{
        progress: number;
        pathPoints: number;
    } | null>(null);

    // Properly initialize permission status from all possible sources
    useEffect(() => {
        const checkPermissionSources = () => {
            // Check 1: URL parameter (most immediate)
            const urlGranted = searchParams.get('locationGranted') === 'true';

            // Check 2: localStorage (persisted)
            const storageGranted = localStorage.getItem('trackam_location_permission_granted') === 'true';

            // Check 3: Context state (might not be initialized yet)
            const contextGranted = locationPermissionGranted;

            // Get tracking_id from all possible sources
            const searchParamsTrackingId = searchParams.get('tracking_id');
            const localStorageTrackingId = localStorage.getItem('trackam_current_tracking_id');

            console.log('Permission sources:', {
                urlGranted,
                storageGranted,
                contextGranted,
                trackingId,
                searchParamsTrackingId,
                localStorageTrackingId
            });

            // If any source indicates permission is granted, consider it granted
            const permissionStatus = urlGranted || storageGranted || contextGranted;

            setIsPermissionGranted(permissionStatus);

            // Update context if needed
            if (permissionStatus && !locationPermissionGranted) {
                setLocationPermissionGranted(true);
                // Ensure localStorage is consistent
                localStorage.setItem('trackam_location_permission_granted', 'true');
            }

            setPermissionChecked(true);
            setInitializing(false);
        };

        checkPermissionSources();
    }, [searchParams, locationPermissionGranted, setLocationPermissionGranted, trackingId]);

    // Modified fetch delivery data useEffect to prevent infinite loops
    useEffect(() => {
        const fetchDelivery = async () => {
            // Try to get tracking ID from all possible sources
            const finalTrackingId = trackingId ||
                searchParams.get('tracking_id') ||
                localStorage.getItem('trackam_current_tracking_id');

            // Prevent redundant fetches for the same tracking ID
            if (!finalTrackingId ||
                isFetchingRef.current ||
                fetchedTrackingIdRef.current === finalTrackingId ||
                (currentDelivery && currentDelivery.tracking_id === finalTrackingId)) {
                return;
            }

            isFetchingRef.current = true;

            try {
                console.log('Fetching delivery with tracking ID:', finalTrackingId);
                const deliveryData = await getPublicDeliveryByTrackingId(finalTrackingId);

                if (deliveryData) {
                    // Update the rider context with the fetched delivery
                    setCurrentDelivery(deliveryData);
                    // Record that we've fetched this tracking ID
                    fetchedTrackingIdRef.current = finalTrackingId;

                    // Check for restored progress after delivery is loaded
                    checkForRestoredProgress(finalTrackingId);
                } else {
                    console.error('Failed to fetch delivery data');
                }
            } catch (error) {
                console.error('Error fetching delivery data:', error);
            } finally {
                isFetchingRef.current = false;
            }
        };

        fetchDelivery();
    }, [trackingId, getPublicDeliveryByTrackingId, setCurrentDelivery, searchParams, currentDelivery]);

    // Check for restored progress
    const checkForRestoredProgress = (trackingId: string) => {
        try {
            const savedProgress = localStorage.getItem(`trackam_${trackingId}_progress`);
            const savedPathHistory = localStorage.getItem(`trackam_${trackingId}_path_history`);

            if (savedProgress || savedPathHistory) {
                const progressData = savedProgress ? JSON.parse(savedProgress) : null;
                const pathHistory = savedPathHistory ? JSON.parse(savedPathHistory) : [];

                const progressPercent = progressData?.progressPercent || 0;
                const pathPoints = pathHistory.length || 0;

                if (progressPercent > 0 || pathPoints > 0) {
                    setProgressRestoredData({
                        progress: Math.round(progressPercent),
                        pathPoints
                    });
                    setShowProgressRestored(true);

                    // Auto-hide after 8 seconds
                    setTimeout(() => {
                        setShowProgressRestored(false);
                    }, 8000);
                }
            }
        } catch (error) {
            console.error('Error checking restored progress:', error);
        }
    };

    // If the delivery status is 'accepted' or 'in_progress', it means the OTP has been verified
    useEffect(() => {
        if (currentDelivery && (
            currentDelivery.status === 'accepted' ||
            currentDelivery.status === 'in_progress' ||
            currentDelivery.status === 'completed'
        )) {
            setIsVerified(true);
        }
    }, [currentDelivery]);

    const handleVerified = () => {
        setIsVerified(true);
    };

    // Enhanced Loading Component
    const LoadingComponent = ({ title, subtitle }: { title: string; subtitle: string }) => (
        <Layout>
            {/* Enhanced Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                {/* Animated gradient overlays */}
                <motion.div
                    animate={{
                        x: [0, 120, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.35, 0.15]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-green-100/30 to-emerald-100/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/20 blur-3xl"
                />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
                            <CardHeader className="text-center pb-6">
                                <motion.div
                                    variants={itemVariants}
                                    className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative"
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
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-emerald-600 bg-clip-text text-transparent mb-2">
                                        {title}
                                    </CardTitle>
                                    <p className="text-gray-600 text-lg px-4">
                                        {subtitle}
                                    </p>
                                </motion.div>
                            </CardHeader>

                            <CardContent className="px-8 pb-8">
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col items-center justify-center h-32"
                                >
                                    <div className="relative">
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
                                    </div>
                                    <motion.p
                                        className="text-emerald-600 font-medium mt-6 text-center"
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

    // Enhanced Error Component
    const ErrorComponent = ({ errorMessage }: { errorMessage: string }) => (
        <Layout>
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-red-50/30" />

                <motion.div
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[15%] right-[25%] w-72 h-72 rounded-full bg-gradient-to-r from-red-100/30 to-rose-100/30 blur-3xl"
                />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
                            <CardContent className="p-8 text-center">
                                <motion.div
                                    variants={itemVariants}
                                    className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
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
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </motion.div>
                                </motion.div>

                                <motion.h2
                                    variants={itemVariants}
                                    className="text-2xl font-bold text-gray-900 mb-4"
                                >
                                    Something went wrong
                                </motion.h2>

                                <motion.div
                                    variants={itemVariants}
                                    className="text-red-600 mb-6 bg-red-50/80 rounded-lg p-4 border border-red-200/50"
                                >
                                    <p className="font-medium">Error: {errorMessage}</p>
                                    <p className="text-sm mt-2 text-red-700">Please try again later or contact support if the issue persists.</p>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-300"
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

    // Show loading state while initializing
    if (initializing) {
        return <LoadingComponent title="Initializing" subtitle="Checking permissions and setting up your delivery tracking..." />;
    }

    // If location permission hasn't been granted, show permission required screen
    if (!isPermissionGranted && trackingId && !isVerified) {
        return (
            <Layout>
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.3, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 16,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[12%] right-[18%] w-80 h-80 rounded-full bg-gradient-to-r from-amber-100/30 to-orange-100/30 blur-3xl"
                    />
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-xl p-0.5">
                                <div className="bg-white rounded-xl h-full w-full" />
                            </div>

                            <div className="relative z-10">
                                <CardContent className="p-8">
                                    <motion.div variants={itemVariants}>
                                        <Alert className="mb-6 bg-amber-50/80 border-amber-200/50 backdrop-blur-sm">
                                            <div className="flex items-center gap-3 mb-2">
                                                <motion.div
                                                    className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center"
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
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </motion.div>
                                                <AlertTitle className="text-amber-800 font-semibold">Location Permission Required</AlertTitle>
                                            </div>
                                            <AlertDescription className="text-amber-700 space-y-3">
                                                <p className="font-medium">You need to accept this delivery and grant location permission first.</p>
                                                <p className="text-sm">Please return to the acceptance page to continue the delivery process.</p>
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>

                                    <motion.div
                                        variants={itemVariants}
                                        className="flex justify-center"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                onClick={() => window.location.href = `/rider/accept/${trackingId}`}
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    Return to Acceptance Page
                                                </span>
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </CardContent>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    if (isLoading && !currentDelivery) {
        return <LoadingComponent title="Loading Delivery" subtitle="Fetching your delivery information..." />;
    }

    if (error) {
        return <ErrorComponent errorMessage={error} />;
    }

    if (!currentDelivery) {
        return (
            <Layout>
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                    <motion.div
                        animate={{
                            x: [0, 90, 0],
                            y: [0, -30, 0],
                            scale: [1, 1.2, 1],
                            opacity: [0.08, 0.25, 0.08]
                        }}
                        transition={{
                            duration: 14,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[20%] right-[30%] w-64 h-64 rounded-full bg-gradient-to-r from-gray-100/30 to-slate-100/30 blur-3xl"
                    />
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-400 via-slate-400 to-gray-500 rounded-xl p-0.5">
                                <div className="bg-white rounded-xl h-full w-full" />
                            </div>

                            <div className="relative z-10">
                                <CardContent className="p-8 text-center">
                                    <motion.div
                                        variants={itemVariants}
                                        className="w-20 h-20 bg-gradient-to-r from-gray-400 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 15, -15, 0]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </motion.div>
                                    </motion.div>

                                    <motion.h2
                                        variants={itemVariants}
                                        className="text-2xl font-bold text-gray-900 mb-4"
                                    >
                                        Delivery Not Found
                                    </motion.h2>

                                    <motion.p
                                        variants={itemVariants}
                                        className="text-gray-600 mb-6 bg-gray-50/80 rounded-lg p-4 border border-gray-200/50"
                                    >
                                        No delivery found with tracking ID: <span className="font-mono font-semibold text-gray-800">{trackingId}</span>
                                    </motion.p>

                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            onClick={() => window.history.back()}
                                            className="bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-300"
                                        >
                                           <span className="flex items-center gap-2">
                                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                               </svg>
                                               Go Back
                                           </span>
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

    // If not verified, show OTP verification
    if (!isVerified) {
        const deliveryTrackingId = currentDelivery?.tracking_id ||
            currentDelivery?.trackingId ||
            trackingId ||
            searchParams.get('tracking_id') ||
            localStorage.getItem('trackam_current_tracking_id');

        return (
            <Layout>
                {/* Enhanced Background */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                    {/* Animated gradient overlays */}
                    <motion.div
                        animate={{
                            x: [0, 120, 0],
                            y: [0, -60, 0],
                            scale: [1, 1.3, 1],
                            opacity: [0.15, 0.35, 0.15]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-blue-100/30 to-indigo-100/30 blur-3xl"
                    />

                    <motion.div
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 40, 0],
                            scale: [1, 1.4, 1],
                            opacity: [0.1, 0.25, 0.1]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-indigo-200/20 to-purple-200/20 blur-3xl"
                    />

                    {/* Animated geometric patterns */}
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
                        className="absolute top-[15%] left-[5%] w-40 h-40 border-2 border-blue-200/30 rounded-full"
                    />

                    <motion.div
                        animate={{
                            rotate: [360, 0],
                            scale: [1, 1.4, 1],
                            opacity: [0.06, 0.18, 0.06]
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute bottom-[25%] right-[10%] w-32 h-32 border-3 border-indigo-200/25 rounded-lg transform rotate-45"
                    />
                </div>

                {/* Centered OTP Verification Container */}
                <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                        className="w-full max-w-md"
                    >
                        {deliveryTrackingId ? (
                            <RiderOtpVerification
                                trackingId={deliveryTrackingId}
                                onVerified={handleVerified}
                            />
                        ) : (
                            <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                                {/* Red gradient border effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-xl p-0.5">
                                    <div className="bg-white rounded-xl h-full w-full" />
                                </div>

                                <div className="relative z-10">
                                    <CardContent className="p-8">
                                        <Alert className="mb-6 bg-red-50/80 border-red-200/50">
                                            <AlertTitle className="text-red-800 font-semibold flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Error
                                            </AlertTitle>
                                            <AlertDescription className="text-red-700">
                                                Unable to find the tracking ID for verification.
                                                Please go back and try again.
                                            </AlertDescription>
                                        </Alert>
                                        <div className="flex justify-center">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={() => window.history.back()}
                                                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-300"
                                                >
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    Go Back
                                                </span>
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </Layout>
        );
    }

    // If verified, show the tracker
    return (
        <Layout>
            {/* Enhanced Background matching VendorDashboard */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Clean white/off-white gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                {/* More visible animated gradient overlays with subtle green accents */}
                <motion.div
                    animate={{
                        x: [0, 120, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.35, 0.15]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-green-100/30 to-emerald-100/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/20 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.12, 0.3, 0.12]
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[40%] left-[60%] w-72 h-72 rounded-full bg-gradient-to-r from-teal-100/25 to-green-100/25 blur-3xl"
                />

                {/* Visible animated geometric patterns */}
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
                    className="absolute top-[15%] left-[5%] w-40 h-40 border-2 border-green-200/30 rounded-full"
                />

                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1, 1.4, 1],
                        opacity: [0.06, 0.18, 0.06]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-[25%] right-[10%] w-32 h-32 border-3 border-emerald-200/25 rounded-lg transform rotate-45"
                />

                {/* Additional floating shapes */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        rotate: [0, 180, 360],
                        opacity: [0.08, 0.2, 0.08]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[60%] left-[20%] w-16 h-16 bg-gradient-to-br from-green-300/15 to-emerald-300/15 rounded-full"
                />

                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        x: [0, -30, 0],
                        scale: [1, 1.5, 1],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 16,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[40%] right-[30%] w-20 h-20 bg-teal-200/15 rounded-lg transform rotate-12"
                />

                {/* Subtle dot pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='7' r='1'/%3E%3Ccircle cx='35' cy='7' r='1'/%3E%3Ccircle cx='49' cy='7' r='1'/%3E%3Ccircle cx='7' cy='21' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='21' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='7' cy='35' r='1'/%3E%3Ccircle cx='21' cy='35' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='35' r='1'/%3E%3Ccircle cx='7' cy='49' r='1'/%3E%3Ccircle cx='21' cy='49' r='1'/%3E%3Ccircle cx='35' cy='49' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                {/* Animated wave pattern */}
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(16, 185, 129, 0.05) 2px, rgba(16, 185, 129, 0.05) 4px)`,
                        backgroundSize: "30px 30px"
                    }}
                />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Enhanced Dashboard Header */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="mb-8"
                >
                    <motion.div
                        className="relative rounded-3xl shadow-2xl overflow-hidden"
                        variants={glowEffect}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Light, cool green gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500" />

                        {/* Overlay with subtle texture */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 via-emerald-500/75 to-teal-600/80" />

                        {/* Animated mesh gradient overlay */}
                        <motion.div
                            className="absolute inset-0 opacity-30"
                            animate={{
                                background: [
                                    "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)"
                                ]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <div className="relative p-8 md:p-12">
                            {/* Enhanced floating elements */}
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

                            <motion.div
                                animate={{
                                    x: [0, 15, 0],
                                    y: [0, -8, 0],
                                    scale: [1, 1.15, 1],
                                    opacity: [0.35, 0.6, 0.35]
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute bottom-8 left-12 w-12 h-12 bg-gradient-to-br from-green-200/35 to-emerald-200/35 rounded-full backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
                            />

                            {/* Additional floating shapes */}
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute top-1/2 right-1/4 w-8 h-8 border-2 border-white/30 rounded-lg backdrop-blur-sm hidden xl:block"
                            />

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                                <motion.div variants={slideInLeft}>
                                    <motion.div
                                        variants={fadeInUp}
                                        className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 text-sm text-white/95 mb-4 border border-white/20 shadow-lg"
                                    >
                                        <motion.span
                                            className="w-3 h-3 bg-emerald-200 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.7, 1, 0.7]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        <span className="font-medium">Active Delivery</span>
                                    </motion.div>

                                    <motion.h1
                                        variants={fadeInUp}
                                        className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg"
                                        style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                                    >
                                        Delivery Tracking
                                    </motion.h1>

                                    <motion.p
                                        variants={fadeInUp}
                                        className="text-white/90 text-lg font-medium"
                                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
                                    >
                                        Track your delivery in real-time and update the customer 🚚
                                    </motion.p>
                                </motion.div>

                                {/* Status indicator */}
                                <motion.div variants={slideInRight} className="mt-6 md:mt-0">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                                            y: -2
                                        }}
                                        className="relative group"
                                    >
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Enhanced Progress Restored Notification */}
                <AnimatePresence>
                    {showProgressRestored && progressRestoredData && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="mb-6"
                        >
                            <motion.div
                                className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-lg backdrop-blur-sm border border-amber-200/50"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <motion.div
                                            className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
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
                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </motion.div>
                                        <div>
                                            <motion.span
                                                className="text-sm font-semibold text-amber-800"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Progress Restored Successfully! 🎉
                                            </motion.span>
                                            <motion.p
                                                className="text-xs text-amber-700 mt-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                {progressRestoredData.progress}% complete
                                                {progressRestoredData.pathPoints > 0 && `, ${progressRestoredData.pathPoints} path points recovered`}
                                            </motion.p>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => setShowProgressRestored(false)}
                                        className="text-amber-500 hover:text-amber-600 p-1 rounded-lg hover:bg-amber-100/50 transition-colors duration-200"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enhanced Rider Tracker */}
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                    className="relative"
                >
                    {/* Floating particles around the tracker */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${8 + (i % 3) * 25}%`,
                            }}
                            animate={{
                                y: [0, -25, 0],
                                x: [0, 12, 0],
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

                    {/* Enhanced glow effect for the tracker */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/3 to-teal-500/5 rounded-3xl blur-xl"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <div className="relative z-10">
                        <RiderTracker delivery={currentDelivery} />
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default RiderPage;