// src/pages/RiderPage.tsx - Updated with RiderContext
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import RiderOtpVerification from '../components/rider/RiderOtpVerification';
import RiderTracker from '../components/rider/RiderTracker';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';
import { Card, CardContent } from '../components/ui/card';

const RiderPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const [searchParams] = useSearchParams();
    // const navigate = useNavigate();

    // Get delivery info from DeliveryContext (for initial fetch)
    const { getDeliveryByTrackingId } = useDelivery();

    // Get rider-specific functionality from RiderContext
    const {
        currentDelivery,
        setCurrentDelivery,
        isLoading,
        error
    } = useRider();

    const [isVerified, setIsVerified] = useState(false);
    const [isAccepting] = useState<boolean>(
        searchParams.get('accept') === 'true'
    );

    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                const deliveryData = await getDeliveryByTrackingId(trackingId);
                if (deliveryData) {
                    // Update the rider context with the fetched delivery
                    setCurrentDelivery(deliveryData);
                }
            }
        };

        fetchDelivery();
    }, [trackingId, getDeliveryByTrackingId, setCurrentDelivery]);

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

    const renderContent = () => {
        if (isLoading && !currentDelivery) {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (error) {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-600">
                            <p>Error: {error}</p>
                            <p className="mt-2">Please try again later.</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (!currentDelivery) {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p>No delivery found with tracking ID: {trackingId}</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (!isVerified) {
            return (
                <RiderOtpVerification
                    trackingId={currentDelivery.trackingId}
                    onVerified={handleVerified}
                />
            );
        }

        return <RiderTracker delivery={currentDelivery} />;
    };

    // If the user is accepting the delivery and the delivery exists
    // but the tracking isn't started yet, render the OTP verification
    const renderAcceptingContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (error || !currentDelivery) {
            return (
                <div className="text-center text-red-600">
                    <p>Error: {error || 'Delivery not found'}</p>
                    <p className="mt-2">Please try again later.</p>
                </div>
            );
        }

        return (
            <RiderOtpVerification
                trackingId={currentDelivery.trackingId}
                onVerified={handleVerified}
            />
        );
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary">Rider Delivery Tracking</h1>
                    <p className="text-gray-600 mt-2">
                        {isAccepting
                            ? 'Verify your OTP to start the delivery tracking'
                            : isVerified
                                ? 'Track your delivery in real-time and update the customer'
                                : 'Verify your OTP to start the delivery tracking'}
                    </p>
                </div>

                {isAccepting ? renderAcceptingContent() : renderContent()}
            </div>
        </Layout>
    );
};

export default RiderPage;