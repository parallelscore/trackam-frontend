import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import DeliveryConfirmation from '../components/customer/DeliveryConfirmation';
import { Card, CardContent } from '../components/ui/card';
import { useDelivery } from '../context/DeliveryContext';

const DeliveryConfirmedPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const { getPublicDeliveryByTrackingId, currentDelivery, isLoading, error } = useDelivery();
    const [loadingDelivery, setLoadingDelivery] = useState(true);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                setLoadingDelivery(true);
                await getPublicDeliveryByTrackingId(trackingId);
                setLoadingDelivery(false);
            }
        };

        fetchDelivery();
    }, [trackingId, getPublicDeliveryByTrackingId]);

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

        if (currentDelivery.status !== 'completed') {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p>This delivery has not been confirmed yet.</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return <DeliveryConfirmation delivery={currentDelivery} />;
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary text-center">Delivery Confirmation</h1>
                    <p className="text-gray-600 mt-2 text-center">
                        Thank you for confirming your delivery
                    </p>
                </div>

                {renderContent()}
            </div>
        </Layout>
    );
};

export default DeliveryConfirmedPage;