import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { OptimisticButton, OptimisticWrapper, OptimisticToast } from '../components/ui/optimistic';
import { getStatusColor, getStatusText, formatDateTime } from '../utils/utils';
import {
    requestLocationPermission,
    getLocationErrorMessage,
    notifyVendorOfDecline,
    getLocationSettingsUrl,
    isGeolocationSupported
} from '../utils/riderUtils';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';

const RiderAcceptPage: React.FC = () => {
    const { tracking_id } = useParams<{ tracking_id: string }>();
    const navigate = useNavigate();
    const { acceptDelivery, declineDelivery, setLocationPermissionGranted } = useRider();
    const { getPublicDeliveryByTrackingId, isLoading: contextIsLoading } = useDelivery();

    // State management
    const [delivery, setDelivery] = useState<any>(null);
    const [loadingDelivery, setLoadingDelivery] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [locationRetries, setLocationRetries] = useState(0);
    const [platformName, setPlatformName] = useState<string>('');

    const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
    const [showDeclineConfirmation, setShowDeclineConfirmation] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [showLocationSettings, setShowLocationSettings] = useState(false);
    const [showImportantInfo, setShowImportantInfo] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Optimistic UI state
    const [acceptOptimisticState, setAcceptOptimisticState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [declineOptimisticState, setDeclineOptimisticState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [optimisticToastMessage, setOptimisticToastMessage] = useState('');
    const [showOptimisticToast, setShowOptimisticToast] = useState(false);

    // Status check flags
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [redirectMessage, setRedirectMessage] = useState('');

    // Only detect platform once
    useEffect(() => {
        const detectPlatform = () => {
            const userAgent = navigator.userAgent;
            if (/iPhone|iPad|iPod/.test(userAgent)) {
                return 'iOS';
            } else if (/Android/.test(userAgent)) {
                return 'Android';
            } else if (/Mac/.test(userAgent)) {
                return 'macOS';
            } else if (/Windows/.test(userAgent)) {
                return 'Windows';
            } else {
                return 'your device';
            }
        };

        setPlatformName(detectPlatform());
    }, []);

    // Memoize fetch delivery function to prevent unnecessary re-renders
    const fetchDelivery = useCallback(async () => {
        if (!tracking_id) return;

        setLoadingDelivery(true);
        setIsCheckingStatus(true);

        try {
            const deliveryData = await getPublicDeliveryByTrackingId(tracking_id);

            if (deliveryData) {
                setDelivery(deliveryData);

                // Check delivery status and handle routing
                const status = deliveryData.status.toLowerCase();

                switch (status) {
                    case 'created':
                        // This is the correct status for this page
                        setIsCheckingStatus(false);
                        break;

                    case 'assigned':
                        // Delivery is assigned - redirect to OTP verification in rider page
                        setRedirectMessage('This delivery has been assigned. Redirecting to OTP verification...');
                        setShouldRedirect(true);
                        setTimeout(() => {
                            navigate(`/rider/${tracking_id}`, {
                                replace: true,
                                state: {
                                    from: 'accept-page',
                                    reason: 'status-assigned'
                                }
                            });
                        }, 2000);
                        break;

                    case 'accepted':
                    case 'in_progress':
                        // Delivery is already in progress - redirect to rider tracking page
                        setRedirectMessage('This delivery is already in progress. Redirecting to tracking page...');
                        setShouldRedirect(true);
                        setTimeout(() => {
                            navigate(`/rider/${tracking_id}`, {
                                replace: true,
                                state: {
                                    from: 'accept-page',
                                    reason: 'status-in-progress'
                                }
                            });
                        }, 2000);
                        break;

                    case 'completed':
                        // Delivery is completed
                        setError('This delivery has already been completed.');
                        setIsCheckingStatus(false);
                        break;

                    case 'cancelled':
                        // Delivery is cancelled
                        setError('This delivery has been cancelled.');
                        setIsCheckingStatus(false);
                        break;

                    default:
                        // Unknown status
                        setError(`Delivery has an unknown status: ${status}`);
                        setIsCheckingStatus(false);
                        break;
                }
            } else {
                setError('Delivery not found');
                setIsCheckingStatus(false);
            }
        } catch (err) {
            console.error('Error fetching delivery:', err);
            setError('Failed to load delivery information');
            setIsCheckingStatus(false);
        } finally {
            setLoadingDelivery(false);
        }
    }, [tracking_id, navigate]);

    // Fetch data only once on mount
    useEffect(() => {
        fetchDelivery();
    }, [fetchDelivery]);

    const handleAcceptClick = useCallback(() => {
        setShowAcceptConfirmation(true);
    }, []);

    const handleDeclineClick = useCallback(() => {
        setShowDeclineConfirmation(true);
    }, []);

    const handleLocationSuccess = useCallback(async (position: GeolocationPosition) => {
        if (!tracking_id) return;
        setIsLoading(true);
        setAcceptOptimisticState('pending');
        setOptimisticToastMessage('Accepting delivery...');
        setShowOptimisticToast(true);

        console.log('Initial rider position:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString(),
            trackingId: tracking_id
        });

        try {
            const result = await acceptDelivery(tracking_id);
            console.log('Accept delivery result:', result);

            if (result.success) {
                localStorage.setItem('trackam_location_permission_granted', 'true');
                localStorage.setItem('trackam_current_tracking_id', tracking_id);

                setLocationPermissionGranted(true);
                setIsAccepted(true);
                setAcceptOptimisticState('success');
                setOptimisticToastMessage('Delivery accepted successfully!');

                console.log('Set permission before navigation:', {
                    localStorage: localStorage.getItem('trackam_location_permission_granted'),
                    trackingId: tracking_id,
                    contextStateUpdated: true
                });

                setTimeout(() => {
                    navigate(`/rider/${tracking_id}?locationGranted=true&tracking_id=${tracking_id}`);
                }, 500);
            } else {
                setAcceptOptimisticState('error');
                setOptimisticToastMessage('Failed to accept delivery');
                setError(result.message || 'Failed to accept delivery');
            }
        } catch (err) {
            console.error('Error accepting delivery:', err);
            setAcceptOptimisticState('error');
            setOptimisticToastMessage('An unexpected error occurred');
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
            setShowAcceptConfirmation(false);
            // Hide toast after a delay
            setTimeout(() => setShowOptimisticToast(false), 3000);
        }
    }, [tracking_id, acceptDelivery, navigate, setLocationPermissionGranted]);

    const handleLocationError = useCallback((error: GeolocationPositionError) => {
        console.log('Location permission error:', error);

        const message = getLocationErrorMessage(error);
        setLocationError(message);

        if (error.code === 1) {
            setShowLocationSettings(true);
        }

        setShowAcceptConfirmation(false);
    }, []);

    const handleConfirmAccept = useCallback(() => {
        if (!tracking_id) return;

        setLocationError(null);

        if (!isGeolocationSupported()) {
            setLocationError("Your browser does not support location services. Please use a modern browser.");
            setShowAcceptConfirmation(false);
            return;
        }

        requestLocationPermission(
            handleLocationSuccess,
            handleLocationError,
            3,
            1500
        );
    }, [tracking_id, handleLocationSuccess, handleLocationError]);

    const handleConfirmDecline = useCallback(async () => {
        if (!tracking_id) return;
        setIsLoading(true);
        setDeclineOptimisticState('pending');
        setOptimisticToastMessage('Declining delivery...');
        setShowOptimisticToast(true);

        try {
            const result = await declineDelivery(tracking_id);

            if (result.success) {
                setIsDeclined(true);
                setDeclineOptimisticState('success');
                setOptimisticToastMessage('Delivery declined successfully!');

                if (delivery?.vendor) {
                    notifyVendorOfDecline(delivery);
                }
            } else {
                setDeclineOptimisticState('error');
                setOptimisticToastMessage('Failed to decline delivery');
                setError(result.message || 'Failed to decline delivery');
            }
        } catch (err) {
            console.error('Error declining delivery:', err);
            setDeclineOptimisticState('error');
            setOptimisticToastMessage('An unexpected error occurred');
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
            setShowDeclineConfirmation(false);
            // Hide toast after a delay
            setTimeout(() => setShowOptimisticToast(false), 3000);
        }
    }, [tracking_id, declineDelivery, delivery]);

    const handleRetryLocation = useCallback(() => {
        setLocationRetries(prev => prev + 1);
        setLocationError(null);
        setShowLocationSettings(false);
        handleConfirmAccept();
    }, [handleConfirmAccept]);

    const toggleImportantInfo = useCallback(() => {
        setShowImportantInfo(prev => !prev);
    }, []);

    // Important Info Modal component (same as before)
    const ImportantInfoModal = useMemo(() => () => (
        <AnimatePresence>
            {showImportantInfo && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setShowImportantInfo(false)}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Important Information</h3>
                                </div>
                                <motion.button
                                    onClick={() => setShowImportantInfo(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            </div>
                            <div className="text-gray-700 space-y-4">
                                <p className="text-base font-medium">
                                    By accepting this delivery, you agree to the following terms and conditions:
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Pick up the package immediately from the vendor",
                                        "Share your real-time location during the delivery process",
                                        "Deliver the package to the specified address in a timely manner",
                                        "Contact the customer upon arrival at the delivery location",
                                        "Handle the package with care and ensure it remains in good condition",
                                        "Obtain confirmation from the customer upon successful delivery",
                                        "Notify the vendor of any issues or delays during the delivery process"
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm">
                                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                                    <p className="text-sm text-amber-800 font-medium italic">
                                        Failure to comply with these terms may affect your rider rating and future delivery opportunities.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl border-t border-gray-100">
                            <Button
                                onClick={() => setShowImportantInfo(false)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-300"
                            >
                                I Understand
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    ), [showImportantInfo]);

    const ErrorPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <Layout>
            <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center">
                {children}
            </div>
        </Layout>
    );

    // Combined loading state from both sources
    const isPageLoading = loadingDelivery || contextIsLoading || isCheckingStatus;

    // Show loading while checking status or redirecting
    if (isPageLoading || shouldRedirect) {
        return (
            <ErrorPageLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            {shouldRedirect ? 'Redirecting...' : 'Delivery Assignment'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {shouldRedirect ? redirectMessage : 'Loading delivery information...'}
                        </p>
                    </div>

                    <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center justify-center h-32">
                                <div className={`w-12 h-12 border-4 ${shouldRedirect ? 'border-blue-500' : 'border-blue-500'} border-t-transparent rounded-full animate-spin`}></div>
                                <p className="text-gray-600 mt-4 font-medium">
                                    {shouldRedirect ? 'Please wait...' : 'Please wait...'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ErrorPageLayout>
        );
    }

    if (error || !delivery) {
        return (
            <ErrorPageLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Delivery Assignment</h1>
                    </div>

                    <Card className="bg-white/90 backdrop-blur-xl border border-red-200/60 shadow-xl">
                        <CardContent className="p-8 text-center">
                            <div className="text-red-500 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                {error || 'Delivery not found'}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error === 'This delivery has already been completed.' ?
                                    'This delivery has been marked as completed.' :
                                    error === 'This delivery has been cancelled.' ?
                                        'This delivery has been cancelled and is no longer available.' :
                                        'We couldn\'t load the delivery information. Please try again.'
                                }
                            </p>
                            <Button
                                onClick={() => navigate('/')}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                            >
                                Go to Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ErrorPageLayout>
        );
    }

    if (isDeclined) {
        return (
            <ErrorPageLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Delivery Declined</h1>
                    </div>

                    <Card className="bg-white/90 backdrop-blur-xl border border-yellow-200/60 shadow-xl">
                        <CardContent className="p-8 text-center">
                            <div className="text-yellow-500 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                You have declined this delivery
                            </h2>
                            <p className="text-gray-600 mb-6">
                                The vendor has been notified of your decision.
                            </p>
                            <Button
                                onClick={() => navigate('/')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                            >
                                Return Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ErrorPageLayout>
        );
    }

    // Only show the acceptance page if delivery status is 'created'
    if (delivery.status.toLowerCase() !== 'created') {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Delivery Status Notice</h1>
                        </div>

                        <Card className="bg-white/90 backdrop-blur-xl border border-amber-200/60 shadow-xl">
                            <CardContent className="p-8 text-center">
                                <div className="text-amber-500 mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                    Delivery Cannot Be Accepted
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    This delivery has a status of <Badge className={getStatusColor(delivery.status)}>{getStatusText(delivery.status)}</Badge> and cannot be accepted at this time.
                                </p>
                                <p className="text-gray-600 mb-6">
                                    Only deliveries with "Created" status can be accepted through this page.
                                </p>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                                >
                                    Return Home
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Layout>
        );
    }

    // Main content - only render for 'created' status deliveries
    return (
        <Layout>
            <div className="min-h-[calc(100vh-8rem)]">
                <ImportantInfoModal />

                {/* Enhanced Background */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                    {/* Static background elements instead of animated ones */}
                    <div className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-green-100/30 to-emerald-100/30 blur-3xl" />
                    <div className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/20 blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    {/* Enhanced Header Section */}
                    <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="relative rounded-3xl shadow-2xl overflow-hidden">
                            {/* Header gradient background - matching green theme */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500" />

                            {/* Overlay with subtle texture - matching green theme */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 via-emerald-500/75 to-teal-600/80" />

                            <div className="relative p-8 md:p-12">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                                    <div>
                                        <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 text-sm text-white/95 mb-4 border border-white/20 shadow-lg">
                                            <span className="w-3 h-3 bg-emerald-200 rounded-full" />
                                            <span className="font-medium">Delivery Assignment</span>
                                        </div>

                                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                                            New Delivery Request
                                        </h1>

                                        <p className="text-white/90 text-lg font-medium">
                                            Review the details below and accept to start tracking 📦
                                        </p>
                                    </div>

                                    <div className="mt-6 md:mt-0">
                                        <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-4 border border-white/30 shadow-lg">
                                            <div className="text-center">
                                                <Badge className={`${getStatusColor(delivery.status)} text-white font-semibold text-base px-6 py-1`}>
                                                    {getStatusText(delivery.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Location Error Alert */}
                    {locationError && (
                        <div className="mb-6">
                            <Alert variant="destructive" className="bg-red-50/90 backdrop-blur-sm border border-red-200/60 shadow-lg">
                                <AlertTitle className="flex items-center gap-2 text-red-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    Location Access Required
                                </AlertTitle>
                                <AlertDescription className="space-y-3 text-red-700">
                                    <p>{locationError}</p>
                                    {showLocationSettings && (
                                        <div className="text-sm bg-red-100/50 rounded-lg p-4 border border-red-200/50">
                                            <h4 className="font-semibold mb-2">How to enable location on {platformName}:</h4>
                                            <p className="mb-3">{getLocationSettingsUrl()}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRetryLocation}
                                                className="text-red-600 border-red-300 hover:bg-red-50"
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Package and Customer Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Package Information */}
                        <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    Package Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Description</h3>
                                    <p className="font-semibold text-gray-900 bg-gray-50/50 rounded-lg px-3 py-2">
                                        {delivery.package.description}
                                    </p>
                                </div>

                                {delivery.package.size && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Size</h3>
                                        <p className="capitalize font-medium text-gray-900 bg-blue-50/50 rounded-lg px-3 py-2">
                                            {delivery.package.size}
                                        </p>
                                    </div>
                                )}

                                {delivery.package.special_instructions && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600 mb-1">Special Instructions</h3>
                                        <p className="italic text-gray-800 bg-amber-50/50 rounded-lg px-3 py-2 border border-amber-200/50">
                                            {delivery.package.special_instructions}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Created</h3>
                                    <p className="text-gray-900 font-medium bg-gray-50/50 rounded-lg px-3 py-2">
                                        {formatDateTime(delivery.created_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Name</h3>
                                    <p className="font-semibold text-gray-900 bg-gray-50/50 rounded-lg px-3 py-2">
                                        {delivery.customer.name}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Phone Number</h3>
                                    <p className="font-medium text-gray-900 bg-green-50/50 rounded-lg px-3 py-2">
                                        {delivery.customer.phone_number}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Delivery Address</h3>
                                    <div className="bg-green-50/50 rounded-lg px-3 py-2 border border-green-200/50">
                                        <p className="text-gray-900 font-medium leading-relaxed">
                                            {delivery.customer.address}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Important Info Button */}
                    <div className="flex justify-center mb-6">
                        <Button
                            variant="outline"
                            onClick={toggleImportantInfo}
                            className="text-amber-700 border-amber-300 bg-amber-50/80 hover:bg-amber-100/80 hover:text-amber-800 backdrop-blur-sm shadow-lg font-medium px-6 py-3 rounded-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            View Important Delivery Information
                        </Button>
                    </div>

                    {/* Action Cards */}
                    <div className="pb-8">
                        <AnimatePresence mode="wait">
                            {showAcceptConfirmation ? (
                                <motion.div
                                    key="accept-confirmation"
                                    initial={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="border-2 border-green-200 bg-green-50/80 backdrop-blur-xl shadow-xl">
                                        <CardContent className="pt-8 pb-6">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <AlertTitle className="font-bold text-xl text-green-800 mb-2">Confirm Acceptance</AlertTitle>
                                                <AlertDescription className="text-green-700 space-y-2">
                                                    <p className="text-lg">Are you sure you want to accept this delivery?</p>
                                                    <p className="text-sm bg-green-100/50 rounded-lg px-4 py-2 border border-green-200/50">
                                                        We'll need access to your location to track the delivery.
                                                    </p>
                                                </AlertDescription>
                                            </div>
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    onClick={() => setShowAcceptConfirmation(false)}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </Button>
                                                <OptimisticButton
                                                    state={acceptOptimisticState}
                                                    onClick={handleConfirmAccept}
                                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
                                                    disabled={isLoading}
                                                    pendingMessage="Accepting..."
                                                    successMessage="Accepted!"
                                                    errorMessage="Try Again"
                                                >
                                                    Yes, Accept Delivery
                                                </OptimisticButton>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : showDeclineConfirmation ? (
                                <motion.div
                                    key="decline-confirmation"
                                    initial={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="border-2 border-red-200 bg-red-50/80 backdrop-blur-xl shadow-xl">
                                        <CardContent className="pt-8 pb-6">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                                <AlertTitle className="font-bold text-xl text-red-800 mb-2">Confirm Decline</AlertTitle>
                                                <AlertDescription className="text-red-700">
                                                    <p className="text-lg">Are you sure you want to decline this delivery?</p>
                                                </AlertDescription>
                                            </div>
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    onClick={() => setShowDeclineConfirmation(false)}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </Button>
                                                <OptimisticButton
                                                    state={declineOptimisticState}
                                                    onClick={handleConfirmDecline}
                                                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold shadow-lg text-white"
                                                    disabled={isLoading}
                                                    pendingMessage="Declining..."
                                                    successMessage="Declined!"
                                                    errorMessage="Try Again"
                                                >
                                                    Yes, Decline
                                                </OptimisticButton>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="action-buttons"
                                    initial={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl">
                                        <CardContent className="p-8">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 py-4 text-lg font-medium text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl shadow-lg transition-all duration-300"
                                                    onClick={handleDeclineClick}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Decline
                                                </Button>
                                                <Button
                                                    className="flex-1 py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-xl transition-all duration-300"
                                                    onClick={handleAcceptClick}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Accept Delivery
                                                </Button>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm border-t border-gray-200/60 px-8 py-4 rounded-b-xl">
                                            <p className="text-center text-sm text-gray-600 w-full font-medium">
                                                By accepting, you agree to deliver this package to the specified address in a timely manner.
                                            </p>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                {/* Optimistic Toast */}
                <OptimisticToast
                    show={showOptimisticToast}
                    message={optimisticToastMessage}
                    type={acceptOptimisticState === 'success' || declineOptimisticState === 'success' ? 'success' : 
                          acceptOptimisticState === 'error' || declineOptimisticState === 'error' ? 'error' : 'info'}
                    onClose={() => setShowOptimisticToast(false)}
                />
            </div>
        </Layout>
    );
};

export default RiderAcceptPage;
