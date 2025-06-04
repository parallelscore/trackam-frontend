// src/pages/RiderPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Layout from '../components/common/Layout';
import RiderOtpVerification from '../components/rider/RiderOtpVerification';
import RiderTracker from '../components/rider/RiderTracker';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: -40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: 'spring',
            stiffness: 100,
        },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: 'spring',
            stiffness: 100,
        },
    },
};

const glowEffect = {
    initial: { boxShadow: '0 0 0 rgba(16, 185, 129, 0)' },
    animate: {
        boxShadow: [
            '0 0 30px rgba(16, 185, 129, 0.1)',
            '0 0 60px rgba(16, 185, 129, 0.05)',
            '0 0 30px rgba(16, 185, 129, 0.1)',
        ],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
};

// Helper: LoadingComponent
const LoadingComponent = ({ message }: { message: string }) => (
    <Layout>
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

            <motion.div
                animate={{
                    x: [0, 120, 0],
                    y: [0, -60, 0],
                    scale: [1, 1.3, 1],
                    opacity: [0.15, 0.35, 0.15],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-emerald-100/30 to-green-100/30 blur-3xl"
            />

            <motion.div
                animate={{
                    x: [0, -100, 0],
                    y: [0, 40, 0],
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.25, 0.1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-green-200/20 to-emerald-200/20 blur-3xl"
            />
        </div>

        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
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
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full"
                                />

                                <motion.div
                                    className="absolute inset-0 rounded-3xl border-2 border-emerald-400/40"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-3xl border-2 border-green-400/40"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-emerald-600 bg-clip-text text-transparent mb-2">
                                    Delivery Tracking
                                </CardTitle>
                                <p className="text-gray-600 text-lg">{message}</p>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="pb-8">
                            <motion.div variants={itemVariants} className="flex justify-center items-center h-16">
                                <div className="text-center">
                                    <motion.p
                                        className="text-emerald-600 font-medium"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        Please wait...
                                    </motion.p>
                                </div>
                            </motion.div>
                        </CardContent>
                    </div>
                </Card>
            </motion.div>
        </div>
    </Layout>
);

// Helper: ErrorComponent
const ErrorComponent = ({
                            title,
                            message,
                            showButton = true,
                        }: {
    title: string;
    message: string;
    showButton?: boolean;
}) => (
    <Layout>
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-red-50/30" />

            <motion.div
                animate={{
                    x: [0, 80, 0],
                    y: [0, -40, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[10%] right-[20%] w-80 h-80 rounded-full bg-gradient-to-r from-red-100/30 to-rose-100/30 blur-3xl"
            />
        </div>

        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-xl p-0.5">
                        <div className="bg-white rounded-xl h-full w-full" />
                    </div>

                    <div className="relative z-10">
                        <CardHeader className="text-center pb-6">
                            <motion.div
                                variants={itemVariants}
                                className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </motion.div>

                                <motion.div
                                    className="absolute inset-0 rounded-3xl border-2 border-red-400/40"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent mb-2">
                                    {title}
                                </CardTitle>
                                <p className="text-gray-600 text-lg px-4">{message}</p>
                            </motion.div>
                        </CardHeader>

                        {showButton && (
                            <CardContent className="pb-8">
                                <motion.div variants={itemVariants} className="text-center">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={() => window.history.back()}
                                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                                        >
                                            Go Back
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </CardContent>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    </Layout>
);

// Main: RiderPage (only one declaration)
const RiderPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const [searchParams] = useSearchParams();
    const { getPublicDeliveryByTrackingId } = useDelivery();
    const {
        currentDelivery,
        setCurrentDelivery,
        isLoading,
        error,
        locationPermissionGranted,
        setLocationPermissionGranted,
    } = useRider();

    const fetchedTrackingIdRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);
    const initialLoadAttemptedRef = useRef(false);

    const [isVerified, setIsVerified] = useState(false);
    const [isAccepting] = useState<boolean>(searchParams.get('accept') === 'true');

    const [isPermissionGranted, setIsPermissionGranted] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [initializing, setInitializing] = useState(true);
    
    // Add a state to track if we're in initial loading with a brief delay
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [showProgressRestored, setShowProgressRestored] = useState(false);
    const [progressRestoredData, setProgressRestoredData] = useState<{
        progress: number;
        pathPoints: number;
    } | null>(null);

    // Animation refs
    const headerRef = useRef(null);
    const contentRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-100px' });
    const contentInView = useInView(contentRef, { once: true, margin: '-100px' });

    // Always show initial loading state briefly on mount to prevent flash of error states
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 1000); // Brief delay to prevent flashing of error states
        
        return () => clearTimeout(timer);
    }, []);

    // 1) Check permission sources
    useEffect(() => {
        const checkPermissionSources = () => {
            const urlGranted = searchParams.get('locationGranted') === 'true';
            const storageGranted =
                localStorage.getItem('trackam_location_permission_granted') === 'true';
            const contextGranted = locationPermissionGranted;

            const permissionStatus = urlGranted || storageGranted || contextGranted;
            setIsPermissionGranted(permissionStatus);

            if (permissionStatus && !locationPermissionGranted) {
                setLocationPermissionGranted(true);
                localStorage.setItem('trackam_location_permission_granted', 'true');
            }

            setPermissionChecked(true);
            setInitializing(false);
        };

        checkPermissionSources();
    }, [searchParams, locationPermissionGranted, setLocationPermissionGranted]);

    // 2) Fetch delivery data (once per tracking ID)
    useEffect(() => {
        const fetchDelivery = async () => {
            const finalTrackingId =
                trackingId ||
                searchParams.get('tracking_id') ||
                localStorage.getItem('trackam_current_tracking_id');

            if (!finalTrackingId) {
                initialLoadAttemptedRef.current = true;
                return;
            }

            if (
                isFetchingRef.current ||
                fetchedTrackingIdRef.current === finalTrackingId ||
                (currentDelivery && currentDelivery.tracking_id === finalTrackingId)
            ) {
                initialLoadAttemptedRef.current = true;
                return;
            }

            isFetchingRef.current = true;
            try {
                const deliveryData = await getPublicDeliveryByTrackingId(finalTrackingId);
                if (deliveryData) {
                    setCurrentDelivery(deliveryData);
                    fetchedTrackingIdRef.current = finalTrackingId;
                    checkForRestoredProgress(finalTrackingId);
                }
            } catch (err) {
                console.error('Error fetching delivery data:', err);
            } finally {
                isFetchingRef.current = false;
                initialLoadAttemptedRef.current = true;
            }
        };

        fetchDelivery();
    }, [trackingId, getPublicDeliveryByTrackingId, setCurrentDelivery, currentDelivery, searchParams]);

    // 3) Check for restored progress
    const checkForRestoredProgress = (tid: string) => {
        try {
            const savedProgress = localStorage.getItem(`trackam_${tid}_progress`);
            const savedPathHistory = localStorage.getItem(`trackam_${tid}_path_history`);

            if (savedProgress || savedPathHistory) {
                const progressData = savedProgress ? JSON.parse(savedProgress) : null;
                const pathHistory = savedPathHistory ? JSON.parse(savedPathHistory) : [];

                const progressPercent = progressData?.progressPercent || 0;
                const pathPoints = pathHistory.length || 0;

                if (progressPercent > 0 || pathPoints > 0) {
                    setProgressRestoredData({
                        progress: Math.round(progressPercent),
                        pathPoints,
                    });
                    setShowProgressRestored(true);

                    setTimeout(() => {
                        setShowProgressRestored(false);
                    }, 8000);
                }
            }
        } catch (err) {
            console.error('Error checking restored progress:', err);
        }
    };

    // 4) If delivery status indicates OTP already verified
    useEffect(() => {
        if (
            currentDelivery &&
            ['accepted', 'in_progress', 'completed'].includes(currentDelivery.status)
        ) {
            setIsVerified(true);
        }
    }, [currentDelivery]);

    const handleVerified = () => {
        setIsVerified(true);
    };

    // ============================================================
    //                RENDERING LOGIC (Single Component)
    // ============================================================

    // (A) Still initializing permissions or in initial loading state?
    if (initializing || isInitialLoading) {
        return <LoadingComponent message="Checking permissions..." />;
    }

    // (B) Permission denied and OTP not yet verified
    if (!isPermissionGranted && trackingId && !isVerified) {
        return (
            <Layout>
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30" />
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.3, 1],
                            opacity: [0.15, 0.35, 0.15],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-amber-100/30 to-orange-100/30 blur-3xl"
                    />
                </div>

                <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full max-w-md"
                    >
                        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-xl p-0.5">
                                <div className="bg-white rounded-xl h-full w-full" />
                            </div>
                            <div className="relative z-10">
                                <CardContent className="p-8">
                                    <motion.div variants={itemVariants}>
                                        <Alert
                                            variant="warning"
                                            className="mb-6 bg-amber-50/80 backdrop-blur-sm border-amber-200/60"
                                        >
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                            >
                                                <svg
                                                    className="w-5 h-5 text-amber-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                    />
                                                </svg>
                                            </motion.div>
                                            <AlertTitle className="text-amber-800 font-semibold">
                                                Location Permission Required
                                            </AlertTitle>
                                            <AlertDescription className="text-amber-700 space-y-3">
                                                <p>You need to accept this delivery and grant location permission first.</p>
                                                <p className="text-sm">
                                                    Please return to the acceptance page to continue the process.
                                                </p>
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex justify-center">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                onClick={() => (window.location.href = `/rider/accept/${trackingId}`)}
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                                Return to Acceptance Page
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

    // (C) While loading (no delivery data yet) OR we haven't attempted an initial load
    if ((isLoading || !initialLoadAttemptedRef.current) && !currentDelivery) {
        return <LoadingComponent message="Loading delivery information..." />;
    }

    // (D) If the API returned an error
    if (error) {
        return (
            <ErrorComponent
                title="Error Loading Delivery"
                message={`${error}. Please try again later.`}
            />
        );
    }

    // (E) If there is no delivery after we've attempted to load it
    if (!currentDelivery && initialLoadAttemptedRef.current) {
        return (
            <ErrorComponent
                title="Delivery Not Found"
                message={`No delivery found with tracking ID: ${trackingId}`}
            />
        );
    }

    // (F) If the delivery exists but OTP is not verified yet
    if (!isVerified) {
        const deliveryTrackingId =
            currentDelivery.tracking_id ||
            currentDelivery.trackingId ||
            trackingId ||
            searchParams.get('tracking_id') ||
            localStorage.getItem('trackam_current_tracking_id');

        return (
            <Layout>
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                    <motion.div
                        animate={{
                            x: [0, 120, 0],
                            y: [0, -60, 0],
                            scale: [1, 1.3, 1],
                            opacity: [0.15, 0.35, 0.15],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-emerald-100/30 to-green-100/30 blur-3xl"
                    />

                    <motion.div
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 40, 0],
                            scale: [1, 1.4, 1],
                            opacity: [0.1, 0.25, 0.1],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-green-200/20 to-emerald-200/20 blur-3xl"
                    />
                </div>

                <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full max-w-3xl"
                    >
                        <motion.div ref={headerRef} variants={headerVariants} className="mb-8">
                            <div className="relative rounded-3xl shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-400 to-teal-500" />
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/80 via-green-500/75 to-teal-600/80" />

                                <div className="relative p-8 md:p-12">
                                    <div className="text-center relative z-10">
                                        <motion.div
                                            className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 text-sm text-white/95 mb-4 border border-white/20 shadow-lg"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                        >
                                            <motion.span
                                                className="w-3 h-3 bg-green-200 rounded-full"
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                            />
                                            <span className="font-medium">Delivery Verification</span>
                                        </motion.div>

                                        <motion.h1
                                            className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg"
                                            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5, duration: 0.7 }}
                                        >
                                            Verify Your Identity
                                        </motion.h1>

                                        <motion.p
                                            className="text-white/90 text-lg font-medium"
                                            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7, duration: 0.7 }}
                                        >
                                            Please enter the OTP code sent to you via WhatsApp 📱
                                        </motion.p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            ref={contentRef}
                            variants={fadeInUp}
                            initial="hidden"
                            animate={contentInView ? 'visible' : 'hidden'}
                        >
                            {deliveryTrackingId ? (
                                <RiderOtpVerification
                                    trackingId={deliveryTrackingId}
                                    onVerified={handleVerified}
                                />
                            ) : (
                                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-xl p-0.5">
                                        <div className="bg-white rounded-xl h-full w-full" />
                                    </div>
                                    <div className="relative z-10">
                                        <CardContent className="p-8">
                                            <Alert
                                                variant="destructive"
                                                className="bg-red-50/80 backdrop-blur-sm border-red-200/60"
                                            >
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <svg
                                                        className="w-5 h-5 text-red-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        />
                                                    </svg>
                                                </motion.div>
                                                <AlertTitle className="text-red-800 font-semibold">Error</AlertTitle>
                                                <AlertDescription className="text-red-700">
                                                    Unable to find the tracking ID for verification. Please go back and try again.
                                                </AlertDescription>
                                            </Alert>
                                            <div className="flex justify-center mt-6">
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        onClick={() => window.history.back()}
                                                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                                                    >
                                                        Go Back
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    // (G) Final: OTP is verified → show the tracker
    return (
        <Layout>
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                <motion.div
                    animate={{
                        x: [0, 120, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.35, 0.15],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-emerald-100/30 to-green-100/30 blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-green-200/20 to-emerald-200/20 blur-3xl"
                />

                {/* Additional floating shapes */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        rotate: [0, 180, 360],
                        opacity: [0.08, 0.2, 0.08],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[60%] left-[20%] w-16 h-16 bg-gradient-to-br from-emerald-300/15 to-green-300/15 rounded-full"
                />
                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        x: [0, -30, 0],
                        scale: [1, 1.5, 1],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[40%] right-[30%] w-20 h-20 bg-teal-200/15 rounded-lg transform rotate-12"
                />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="relative rounded-3xl shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-400 to-teal-500" />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/80 via-green-500/75 to-teal-600/80" />

                        {/* Animated mesh gradient overlay */}
                        <motion.div
                            className="absolute inset-0 opacity-30"
                            animate={{
                                background: [
                                    'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                    'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                    'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                ],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <div className="relative p-8 md:p-12">
                            {/* Enhanced floating elements */}
                            <motion.div
                                animate={{
                                    y: [0, -15, 0],
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1],
                                    opacity: [0.4, 0.7, 0.4],
                                }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-green-200/35 to-teal-200/35 rounded-2xl backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
                            />
                            <motion.div
                                animate={{
                                    x: [0, 15, 0],
                                    y: [0, -8, 0],
                                    scale: [1, 1.15, 1],
                                    opacity: [0.35, 0.6, 0.35],
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute bottom-8 left-12 w-12 h-12 bg-gradient-to-br from-emerald-200/35 to-green-200/35 rounded-full backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
                            />

                            <div className="text-center relative z-10">
                                <motion.div
                                    className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 text-sm text-white/95 mb-4 border border-white/20 shadow-lg"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <motion.span
                                        className="w-3 h-3 bg-green-200 rounded-full"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.7, 1, 0.7],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <span className="font-medium">Delivery Tracking Active</span>
                                </motion.div>

                                <motion.h1
                                    className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg"
                                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.7 }}
                                >
                                    Delivery Tracking
                                </motion.h1>

                                <motion.p
                                    className="text-white/90 text-lg font-medium"
                                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.7 }}
                                >
                                    Track your delivery in real-time and update the customer 📍
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Progress‐Restored Notification */}
                <AnimatePresence>
                    {showProgressRestored && progressRestoredData && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="mb-6"
                        >
                            <motion.div
                                className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-center justify-between shadow-lg backdrop-blur-sm"
                                variants={glowEffect}
                                initial="initial"
                                animate="animate"
                            >
                                <div className="flex items-center space-x-3">
                                    <motion.div
                                        className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <svg
                                            className="h-5 w-5 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </motion.div>
                                    <div>
                                        <motion.span
                                            className="text-sm font-semibold text-amber-800"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                        >
                                            Progress restored: {progressRestoredData.progress}% complete
                                        </motion.span>
                                        {progressRestoredData.pathPoints > 0 && (
                                            <motion.p
                                                className="text-xs text-amber-700 mt-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4, duration: 0.5 }}
                                            >
                                                {progressRestoredData.pathPoints} path points recovered
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => setShowProgressRestored(false)}
                                    className="text-amber-500 hover:text-amber-600 p-2 rounded-lg hover:bg-amber-100/50 transition-colors duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* RiderTracker (final state) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative"
                >
                    {currentDelivery ? (
                        <RiderTracker delivery={currentDelivery} />
                    ) : (
                        <div className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-8 text-center">
                            <div className="text-gray-500 mb-4">
                                <svg
                                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H9a2 2 0 00-2 2v3a2 2 0 002 2h11a2 2 0 002-2v-3a2 2 0 00-2-2H6"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Delivery Data</h3>
                                <p className="text-gray-600">Unable to load delivery information. Please try refreshing the page.</p>
                            </div>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                            >
                                Refresh Page
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>
        </Layout>
    );
};

export default RiderPage;
