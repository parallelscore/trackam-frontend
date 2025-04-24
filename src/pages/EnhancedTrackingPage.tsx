import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import EnhancedTrackingView from '../components/customer/EnhancedTrackingView';
import { Card, CardContent } from '../components/ui/card';
import { useDelivery } from '../context/DeliveryContext';

const EnhancedTrackingPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const { getDeliveryByTrackingId, currentDelivery, isLoading, error } = useDelivery();
    const [refreshKey, setRefreshKey] = useState(0);

    // Set up polling for delivery updates
    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                await getDeliveryByTrackingId(trackingId);
            }
        };

        fetchDelivery();

        // Poll for updates every 15 seconds unless we have a websocket connection
        const intervalId = setInterval(fetchDelivery, 15000);

        return () => clearInterval(intervalId);
    }, [trackingId, getDeliveryByTrackingId, refreshKey]);

    // Function to manually refresh the delivery data
    const handleRefresh = async () => {
        if (trackingId) {
            await getDeliveryByTrackingId(trackingId);
            setRefreshKey(prevKey => prevKey + 1);
        }
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

        return (
            <EnhancedTrackingView
                delivery={currentDelivery}
                onRefresh={handleRefresh}
            />
        );
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary">Track Your Delivery</h1>
                    <p className="text-gray-600 mt-2">
                        {trackingId
                            ? `Tracking ID: ${trackingId}`
                            : 'Enter your tracking ID to monitor your delivery in real-time'}
                    </p>
                </div>

                {renderContent()}
            </div>
        </Layout>
    );
};

export default EnhancedTrackingPage;