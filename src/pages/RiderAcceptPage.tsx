import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
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
    const { getPublicDeliveryByTrackingId, isLoading } = useDelivery();

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

    // Detect platform
    useEffect(() => {
        const userAgent = navigator.userAgent;
        if (/iPhone|iPad|iPod/.test(userAgent)) {
            setPlatformName('iOS');
        } else if (/Android/.test(userAgent)) {
            setPlatformName('Android');
        } else if (/Mac/.test(userAgent)) {
            setPlatformName('macOS');
        } else if (/Windows/.test(userAgent)) {
            setPlatformName('Windows');
        } else {
            setPlatformName('your device');
        }
    }, []);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (!tracking_id) return;

            setLoadingDelivery(true);
            try {
                const deliveryData = await getPublicDeliveryByTrackingId(tracking_id);

                if (deliveryData) {
                    setDelivery(deliveryData);
                    // Check if already accepted
                    if (deliveryData.status === 'accepted' ||
                        deliveryData.status === 'in_progress' ||
                        deliveryData.status === 'completed') {
                        setIsAccepted(true);
                    } else if (deliveryData.status === 'cancelled') {
                        setIsDeclined(true);
                    }
                } else {
                    setError('Delivery not found');
                }
            } catch (err) {
                console.error('Error fetching delivery:', err);
                setError('Failed to load delivery information');
            } finally {
                setLoadingDelivery(false);
            }
        };

        fetchDelivery();
    }, [tracking_id]);

    const handleAcceptClick = () => {
        setShowAcceptConfirmation(true);
    };

    const handleDeclineClick = () => {
        setShowDeclineConfirmation(true);
    };

const handleLocationSuccess = async (position: GeolocationPosition) => {
    if (!tracking_id) return;

    // Log the position (for debugging)
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
            // CRUCIAL: Store permission in localStorage and update context state BEFORE navigation
            localStorage.setItem('trackam_location_permission_granted', 'true');
            
            // Also store the tracking ID in localStorage to maintain consistency
            localStorage.setItem('trackam_current_tracking_id', tracking_id);
            
            setLocationPermissionGranted(true);
            setIsAccepted(true);

            // Log the permission state before navigation
            console.log('Set permission before navigation:', {
                localStorage: localStorage.getItem('trackam_location_permission_granted'),
                trackingId: tracking_id,
                contextStateUpdated: true
            });

            // Add a brief delay before navigation to ensure state is saved
            setTimeout(() => {
                // Use the same tracking_id parameter format in both URLs for consistency
                navigate(`/rider/${tracking_id}?locationGranted=true&tracking_id=${tracking_id}`);
            }, 500); // Increase timeout to ensure state propagation
        } else {
            setError(result.message || 'Failed to accept delivery');
        }
    } catch (err) {
        console.error('Error accepting delivery:', err);
        setError('An unexpected error occurred');
    }
    setShowAcceptConfirmation(false);
};

const handleLocationError = (error: GeolocationPositionError) => {
    console.log('Location permission error:', error);
    
    // Get the appropriate error message based on the error code
    const message = getLocationErrorMessage(error);
    
    // Update state with the error message
    setLocationError(message);
    
    // Show location settings help if permission was denied
    if (error.code === 1) { // PERMISSION_DENIED
        setShowLocationSettings(true);
    }
    
    // Hide the acceptance confirmation dialog
    setShowAcceptConfirmation(false);
};

    const handleConfirmAccept = async () => {
        if (!tracking_id) return;

        setLocationError(null);

        // Check if geolocation is supported first
        if (!isGeolocationSupported()) {
            setLocationError("Your browser does not support location services. Please use a modern browser.");
            setShowAcceptConfirmation(false);
            return;
        }

        // Request location permission with a retry mechanism
        requestLocationPermission(
            handleLocationSuccess,
            handleLocationError,
            3,  // 3 retries
            1500 // 1.5 seconds between retries
        );
    };

    const handleConfirmDecline = async () => {
        if (!tracking_id) return;

        try {
            const result = await declineDelivery(tracking_id);

            if (result.success) {
                setIsDeclined(true);

                // Notify the vendor about the decline
                if (delivery?.vendor) {
                    notifyVendorOfDecline(delivery);
                }
            } else {
                setError(result.message || 'Failed to decline delivery');
            }
        } catch (err) {
            console.error('Error declining delivery:', err);
            setError('An unexpected error occurred');
        } finally {
            setShowDeclineConfirmation(false);
        }
    };

    const handleRetryLocation = () => {
        setLocationRetries(prev => prev + 1);
        setLocationError(null);
        setShowLocationSettings(false);
        handleConfirmAccept();
    };

    const toggleImportantInfo = () => {
        setShowImportantInfo(prev => !prev);
    };

    const ImportantInfoModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-yellow-800">Important Information</h3>
                        <button
                            onClick={() => setShowImportantInfo(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-yellow-700">
                        <p className="mb-3">
                            By accepting this delivery, you agree to the following terms and conditions:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mb-4">
                            <li>Pick up the package immediately from the vendor</li>
                            <li>Share your real-time location during the delivery process</li>
                            <li>Deliver the package to the specified address in a timely manner</li>
                            <li>Contact the customer upon arrival at the delivery location</li>
                            <li>Handle the package with care and ensure it remains in good condition</li>
                            <li>Obtain confirmation from the customer upon successful delivery</li>
                            <li>Notify the vendor of any issues or delays during the delivery process</li>
                        </ul>
                        <p className="text-sm italic">
                            Failure to comply with these terms may affect your rider rating and future delivery opportunities.
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 flex justify-end rounded-b-lg">
                    <Button onClick={() => setShowImportantInfo(false)}>
                        I Understand
                    </Button>
                </div>
            </div>
        </div>
    );

    if (loadingDelivery || isLoading) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-secondary text-center">Delivery Assignment</h1>
                        <p className="text-gray-600 mt-2 text-center">
                            Loading delivery information...
                        </p>
                    </div>
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

    if (error || !delivery) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-secondary text-center">Delivery Assignment</h1>
                    </div>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-red-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="mt-2">{error || 'Delivery not found'}</p>
                            </div>
                            <Button onClick={() => window.history.back()}>Go Back</Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (isDeclined) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-secondary text-center">Delivery Declined</h1>
                    </div>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-yellow-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-2">You have declined this delivery</p>
                                <p className="text-sm text-gray-600 mt-2">The vendor has been notified.</p>
                            </div>
                            <Button onClick={() => navigate('/')}>Return Home</Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    // Improved layout with responsive design
    return (
        <Layout>
            {showImportantInfo && <ImportantInfoModal />}

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-secondary text-center">Delivery Assignment</h1>
                    <p className="text-gray-600 mt-2 text-center">
                        Review and accept this delivery
                    </p>
                </div>

                {locationError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Location Access Required</AlertTitle>
                        <AlertDescription className="space-y-2">
                            <p>{locationError}</p>
                            {showLocationSettings && (
                                <div className="text-sm mt-2">
                                    <h4 className="font-semibold">How to enable location on {platformName}:</h4>
                                    <p className="mt-1">{getLocationSettingsUrl()}</p>

                                    <div className="flex justify-center mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRetryLocation}
                                            className="text-primary"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Package Info */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Package Information</CardTitle>
                                    <Badge className={getStatusColor(delivery.status)}>
                                        {getStatusText(delivery.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">Description</h3>
                                    <p className="font-medium">{delivery.package.description}</p>
                                </div>

                                {delivery.package.size && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600">Size</h3>
                                        <p className="capitalize">{delivery.package.size}</p>
                                    </div>
                                )}

                                {delivery.package.special_instructions && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600">Special Instructions</h3>
                                        <p className="italic">{delivery.package.special_instructions}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">Created</h3>
                                    <p>{formatDateTime(delivery.created_at)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Customer Info */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-lg">Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">Name</h3>
                                    <p className="font-medium">{delivery.customer.name}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">Phone Number</h3>
                                    <p>{delivery.customer.phone_number}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">Delivery Address</h3>
                                    <p>{delivery.customer.address}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Important Info Button - Centered and outside the grid */}
                <div className="flex justify-center my-6">
                    <Button
                        variant="outline"
                        onClick={toggleImportantInfo}
                        className="text-yellow-700 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        View Important Delivery Information
                    </Button>
                </div>

                {/* Accept/Decline Confirmation Cards */}
                {showAcceptConfirmation ? (
                    <Card className="border-primary mb-6">
                        <CardContent className="pt-6">
                            <AlertTitle className="font-bold text-center mb-2">Confirm Acceptance</AlertTitle>
                            <AlertDescription className="text-center mb-4">
                                <p>Are you sure you want to accept this delivery?</p>
                                <p className="text-sm text-amber-600 mt-2">
                                    We'll need access to your location to track the delivery.
                                </p>
                            </AlertDescription>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowAcceptConfirmation(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleConfirmAccept}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Yes, Accept Delivery'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : showDeclineConfirmation ? (
                    <Card className="border-destructive mb-6">
                        <CardContent className="pt-6">
                            <AlertTitle className="font-bold text-center mb-2">Confirm Decline</AlertTitle>
                            <AlertDescription className="text-center mb-4">
                                Are you sure you want to decline this delivery?
                            </AlertDescription>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeclineConfirmation(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleConfirmDecline}
                                >
                                    Yes, Decline
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleDeclineClick}
                                >
                                    Decline
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleAcceptClick}
                                >
                                    Accept Delivery
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t px-6 py-3">
                            <p className="text-center text-sm text-gray-500 w-full">
                                By accepting, you agree to deliver this package to the specified address in a timely manner.
                            </p>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default RiderAcceptPage;

