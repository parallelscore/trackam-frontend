// src/components/rider/DeliveryAcceptPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../common/Layout';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { generateWhatsAppLink, formatDateTime } from '@/utils/utils.ts';

const DeliveryAcceptPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const navigate = useNavigate();
    const { getDeliveryByTrackingId, acceptDelivery, declineDelivery, isLoading, error } = useDelivery();
    const [delivery, setDelivery] = useState<any>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                const deliveryData = await getDeliveryByTrackingId(trackingId);
                if (deliveryData) {
                    setDelivery(deliveryData);
                    // Check if already accepted
                    if (deliveryData.status === 'accepted' || deliveryData.status === 'in_progress' || deliveryData.status === 'completed') {
                        setIsAccepted(true);
                    } else if (deliveryData.status === 'cancelled') {
                        setIsDeclined(true);
                    }
                }
            }
        };

        fetchDelivery();
    }, [trackingId, getDeliveryByTrackingId]);

    const handleAccept = async () => {
        if (!delivery || !trackingId) return;

        setIsAccepting(true);
        setLocationError(null);

        try {
            // Request location permission before proceeding
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        // Accept the delivery
                        const result = await acceptDelivery(trackingId);

                        if (result.success) {
                            setIsAccepted(true);
                            // Navigate to the rider tracking page
                            navigate(`/rider/${trackingId}`);
                        } else {
                            alert(result.message || 'Failed to accept delivery');
                            setIsAccepting(false);
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        let errorMsg = "Location permission denied. Please enable location services and try again.";

                        if (error.code === 1) {
                            errorMsg = "You denied location permission. Please enable location services in your browser settings.";
                        } else if (error.code === 2) {
                            errorMsg = "Location information is unavailable. Please try again.";
                        } else if (error.code === 3) {
                            errorMsg = "Location request timed out. Please try again.";
                        }

                        setLocationError(errorMsg);
                        setIsAccepting(false);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 0
                    }
                );
            } else {
                setLocationError("Your browser doesn't support geolocation. Please use a different browser.");
                setIsAccepting(false);
            }
        } catch (error) {
            console.error('Error accepting delivery:', error);
            setIsAccepting(false);
        }
    };

    const handleDecline = async () => {
        if (!delivery || !trackingId) return;

        setIsDeclining(true);

        try {
            const result = await declineDelivery(trackingId);

            if (result.success) {
                setIsDeclined(true);

                // Notify the vendor about the decline
                if (delivery.vendor?.phoneNumber) {
                    const vendorMessage = `Rider ${delivery.rider.name} has declined the delivery for ${delivery.customer.name} (ID: ${delivery.trackingId}).`;
                    const whatsappLink = generateWhatsAppLink(delivery.vendor.phoneNumber, vendorMessage);
                    window.open(whatsappLink, '_blank');
                }
            } else {
                alert(result.message || 'Failed to decline delivery');
            }
        } catch (error) {
            console.error('Error declining delivery:', error);
        } finally {
            setIsDeclining(false);
        }
    };

    if (isLoading && !delivery) {
        return (
            <Layout>
                <div className="max-w-md mx-auto px-4 py-12">
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !delivery) {
        return (
            <Layout>
                <div className="max-w-md mx-auto px-4 py-12">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-red-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="mt-2">Delivery not found or has expired</p>
                            </div>
                            <Button onClick={() => window.close()}>Close</Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (isDeclined) {
        return (
            <Layout>
                <div className="max-w-md mx-auto px-4 py-12">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-yellow-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-2">You have declined this delivery</p>
                                <p className="text-sm text-gray-600 mt-2">The vendor has been notified.</p>
                            </div>
                            <Button onClick={() => window.close()}>Close</Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-md mx-auto px-4 py-12">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">New Delivery Request</CardTitle>
                        <div className="mt-2">
                            <Badge className="bg-primary">Tracking ID: {delivery.trackingId}</Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-secondary mb-2">Package Details</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Description:</span> {delivery.package.description}</p>
                                {delivery.package.size && (
                                    <p><span className="font-medium">Size:</span> {delivery.package.size}</p>
                                )}
                                {delivery.package.specialInstructions && (
                                    <p><span className="font-medium">Instructions:</span> {delivery.package.specialInstructions}</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-secondary mb-2">Customer Information</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Name:</span> {delivery.customer.name}</p>
                                <p><span className="font-medium">Phone:</span> {delivery.customer.phoneNumber}</p>
                                <p><span className="font-medium">Address:</span> {delivery.customer.address}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-secondary mb-2">Delivery Information</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Created:</span> {formatDateTime(delivery.createdAt)}</p>
                                {delivery.estimatedDeliveryTime && (
                                    <p><span className="font-medium">Estimated Delivery:</span> {formatDateTime(delivery.estimatedDeliveryTime)}</p>
                                )}
                                <p><span className="font-medium">Status:</span> {delivery.status}</p>
                            </div>
                        </div>

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

                        {locationError && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                                <div className="flex items-start space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="font-semibold">Location Permission Required</h3>
                                        <p className="text-sm mt-1">{locationError}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 p-6 bg-gray-50">
                        {isAccepted ? (
                            <div className="text-center">
                                <p className="text-green-600 font-medium mb-2">You've already accepted this delivery</p>
                                <Button onClick={() => navigate(`/rider/${trackingId}`)}>
                                    Continue to Delivery
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex w-full gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-1/2"
                                        onClick={handleDecline}
                                        disabled={isAccepting || isDeclining}
                                    >
                                        {isDeclining ? 'Declining...' : 'Decline'}
                                    </Button>
                                    <Button
                                        className="w-1/2 bg-green-600 hover:bg-green-700"
                                        onClick={handleAccept}
                                        disabled={isAccepting || isDeclining}
                                    >
                                        {isAccepting ? 'Accepting...' : 'Accept'}
                                    </Button>
                                </div>
                                <p className="text-xs text-center text-gray-500">
                                    Accepting will request location access and take you to OTP verification
                                </p>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default DeliveryAcceptPage;