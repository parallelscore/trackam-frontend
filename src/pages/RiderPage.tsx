import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import OtpVerification from '../components/rider/OtpVerification';
import RiderTracker from '../components/rider/RiderTracker';
import { useDelivery } from '../context/DeliveryContext';
import { Card, CardContent } from '../components/ui/card';

const RiderPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const { getDeliveryByTrackingId, currentDelivery, isLoading, error } = useDelivery();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                await getDeliveryByTrackingId(trackingId);
            }
        };

        fetchDelivery();
    }, [trackingId, getDeliveryByTrackingId]);

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
        if (isLoading) {
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
                <OtpVerification
                    trackingId={currentDelivery.trackingId}
                    onVerified={handleVerified}
                />
            );
        }

        return <RiderTracker delivery={currentDelivery} />;
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary">Rider Delivery Tracking</h1>
                    <p className="text-gray-600 mt-2">
                        {isVerified
                            ? 'Track your delivery in real-time and update the customer'
                            : 'Verify your OTP to start the delivery tracking'}
                    </p>
                </div>

                {renderContent()}
            </div>
        </Layout>
    );
};

export default RiderPage;