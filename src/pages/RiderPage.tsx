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
    const { getDeliveryByTrackingId } = useDelivery();

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
                const deliveryData = await getDeliveryByTrackingId(finalTrackingId);
                
                if (deliveryData) {
                    // Update the rider context with the fetched delivery
                    setCurrentDelivery(deliveryData);
                    // Record that we've fetched this tracking ID
                    fetchedTrackingIdRef.current = finalTrackingId;
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
    }, [trackingId, getDeliveryByTrackingId, setCurrentDelivery]);
    // Removed searchParams from dependency array to prevent infinite loops

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

    // Debug permission state
    useEffect(() => {
        console.log('RiderPage - Current permission state:', {
            localStorage: localStorage.getItem('trackam_location_permission_granted'),
            contextState: locationPermissionGranted,
            localState: isPermissionGranted,
            urlParam: searchParams.get('locationGranted'),
            permissionChecked,
            initializing
        });
    }, [locationPermissionGranted, searchParams, isPermissionGranted, permissionChecked, initializing]);

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
    // IMPORTANT: Use isPermissionGranted, not locationPermissionGranted
    if (!isPermissionGranted && trackingId && !isVerified) {
        // Log permissions for debugging
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
    // Since location is already granted, we only need to verify OTP
    if (!isVerified) {
        // Get tracking ID from multiple sources to ensure it's available
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
                <RiderTracker delivery={currentDelivery} />
            </div>
        </Layout>
    );
};

export default RiderPage;

