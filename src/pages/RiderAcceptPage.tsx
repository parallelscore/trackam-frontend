import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { getStatusColor, getStatusText, formatDateTime } from '../utils/utils';
import { requestLocationPermission, getLocationErrorMessage, notifyVendorOfDecline } from '../utils/riderUtils';
import { useDelivery } from '../context/DeliveryContext';
import {useRider} from '../context/RiderContext';

const RiderAcceptPage: React.FC = () => {
    const { tracking_id } = useParams<{ tracking_id: string }>();
    const navigate = useNavigate();
    const { acceptDelivery } = useRider();
    const { getDeliveryByTrackingId, declineDelivery, isLoading } = useDelivery();

    const [delivery, setDelivery] = useState<any>(null);
    const [loadingDelivery, setLoadingDelivery] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
    const [showDeclineConfirmation, setShowDeclineConfirmation] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (!tracking_id) return;

            setLoadingDelivery(true);
            try {
                const deliveryData = await getDeliveryByTrackingId(tracking_id);

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

    const handleConfirmAccept = async () => {
        if (!tracking_id) return;

        setLocationError(null);

        // Request location permission before proceeding
        requestLocationPermission(
            async () => {
                try {
                    const result = await acceptDelivery(tracking_id);

                    if (result.success) {
                        setIsAccepted(true);
                        // Navigate to the rider tracking page
                        navigate(`/rider/${tracking_id}`);
                    } else {
                        setError(result.message || 'Failed to accept delivery');
                    }
                } catch (err) {
                    console.error('Error accepting delivery:', err);
                    setError('An unexpected error occurred');
                }
                setShowAcceptConfirmation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocationError(getLocationErrorMessage(error));
                setShowAcceptConfirmation(false);
            }
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

    if (loadingDelivery || isLoading) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary text-center">Delivery Assignment</h1>
                    <p className="text-gray-600 mt-2 text-center">
                        Review and accept this delivery
                    </p>
                </div>

                <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center mb-2">
                        <Badge className={getStatusColor(delivery.status)}>
                            {getStatusText(delivery.status)}
                        </Badge>
                        <h2 className="text-xl font-bold text-secondary mt-2">New Delivery Request</h2>
                        <p className="text-gray-600">
                            Review the details below and choose to accept or decline
                        </p>
                    </div>

                    {locationError && (
                        <Alert variant="destructive">
                            <AlertTitle>Location Error</AlertTitle>
                            <AlertDescription>{locationError}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Package Information</CardTitle>
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

                    <Card>
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

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-start space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-yellow-800">Important Information</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    By accepting this delivery, you agree to:
                                </p>
                                <ul className="list-disc list-inside text-sm text-yellow-700 mt-1 space-y-1">
                                    <li>Pick up the package immediately</li>
                                    <li>Share your real-time location</li>
                                    <li>Deliver to the specified address</li>
                                    <li>Contact the customer upon arrival</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {showAcceptConfirmation ? (
                        <Card className="border-primary">
                            <CardContent className="pt-6">
                                <AlertTitle className="font-bold text-center mb-2">Confirm Acceptance</AlertTitle>
                                <AlertDescription className="text-center mb-4">
                                    Are you sure you want to accept this delivery?
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
                        <Card className="border-destructive">
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
                        <div className="flex gap-3">
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
                    )}

                    <div className="text-center text-sm text-gray-500">
                        By accepting, you agree to deliver this package to the specified address in a timely manner.
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RiderAcceptPage;