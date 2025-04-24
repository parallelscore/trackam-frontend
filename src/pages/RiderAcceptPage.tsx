import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import DeliveryAcceptance from '../components/rider/DeliveryAcceptance';
import { Card, CardContent } from '../components/ui/card';
import { useDelivery } from '../context/DeliveryContext';

const RiderAcceptPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const navigate = useNavigate();
    const { getDeliveryByTrackingId, isLoading, error, acceptDelivery } = useDelivery();
    const [loadingDelivery, setLoadingDelivery] = useState(true);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                setLoadingDelivery(true);
                await getDeliveryByTrackingId(trackingId);
                setLoadingDelivery(false);
            }
        };

        fetchDelivery();
    }, [trackingId, getDeliveryByTrackingId]);

    const handleAccept = async () => {
        if (!trackingId) return;

        await acceptDelivery(trackingId);
        navigate(`/rider/${trackingId}`);
    };

    const handleDecline = () => {
        // Return to home page or rider dashboard
        navigate('/');
    };

    const renderContent = () => {
        if (loadingDelivery || isLoading) {
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

        const { currentDelivery } = useDelivery();

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

        return (
            <DeliveryAcceptance
                delivery={currentDelivery}
                onAccept={handleAccept}
                onDecline={handleDecline}
            />
        );
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary text-center">Delivery Assignment</h1>
                    <p className="text-gray-600 mt-2 text-center">
                        Review and accept this delivery
                    </p>
                </div>

                {renderContent()}
            </div>
        </Layout>
    );
};

export default RiderAcceptPage;