// src/pages/RiderPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import RiderOtpVerification from '../components/rider/RiderOtpVerification';
import RiderTracker from '../components/rider/RiderTracker';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

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
    }, [trackingId, getPublicDeliveryByTrackingId, setCurrentDelivery]);

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

    // Show loading state while initializing
    if (initializing) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                            <p className="text-center mt-4">Checking permissions...</p>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    // If location permission hasn't been granted, we need to redirect back to the acceptance page
    if (!isPermissionGranted && trackingId && !isVerified) {
        console.log('Permission not granted. Redirecting back to acceptance page.');

        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardContent className="p-6">
                            <Alert variant="warning" className="mb-6">
                                <AlertTitle className="text-amber-800">Location Permission Required</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    <p className="mb-4">You need to accept this delivery and grant location permission first.</p>
                                    <p>Please return to the acceptance page to continue the process.</p>
                                </AlertDescription>
                            </Alert>
                            <div className="flex justify-center">
                                <Button onClick={() => window.location.href = `/rider/accept/${trackingId}`}>
                                    Return to Acceptance Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (isLoading && !currentDelivery) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-red-600">
                                <p>Error: {error}</p>
                                <p className="mt-2">Please try again later.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (!currentDelivery) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <p>No delivery found with tracking ID: {trackingId}</p>
                            </div>
                        </CardContent>
                    </Card>
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-secondary text-center">Verify Your Identity</h1>
                        <p className="text-gray-600 mt-2 text-center">
                            Please enter the OTP code sent to you via WhatsApp
                        </p>
                    </div>
                    {deliveryTrackingId ? (
                        <RiderOtpVerification
                            trackingId={deliveryTrackingId}
                            onVerified={handleVerified}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-6">
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        Unable to find the tracking ID for verification.
                                        Please go back and try again.
                                    </AlertDescription>
                                </Alert>
                                <div className="flex justify-center mt-4">
                                    <Button onClick={() => window.history.back()}>
                                        Go Back
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </Layout>
        );
    }

    // If verified, show the tracker
    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary">Delivery Tracking</h1>
                    <p className="text-gray-600 mt-2">
                        Track your delivery in real-time and update the customer
                    </p>
                </div>

                {/* Progress Restored Notification */}
                {showProgressRestored && progressRestoredData && (
                    <div className="mb-4">
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0">
                                    <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-amber-800">
                                    Progress restored: {progressRestoredData.progress}% complete
                                    {progressRestoredData.pathPoints > 0 && `, ${progressRestoredData.pathPoints} path points`}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowProgressRestored(false)}
                                className="text-amber-500 hover:text-amber-600"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <RiderTracker delivery={currentDelivery} />
            </div>
        </Layout>
    );
};

export default RiderPage;