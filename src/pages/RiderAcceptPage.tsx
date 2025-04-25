import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import DeliveryAcceptance from '../components/rider/DeliveryAcceptance';
import { Card, CardContent } from '../components/ui/card';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';
import { Delivery } from '@/types';

const RiderAcceptPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const navigate = useNavigate();
    const { getDeliveryByTrackingId } = useDelivery();
    const { acceptDelivery, declineDelivery, isLoading, error, setCurrentDelivery } = useRider();
    const [loadingDelivery, setLoadingDelivery] = useState(true);
    const [deliveryData, setDeliveryData] = useState<Delivery | null>(null);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                setLoadingDelivery(true);
                console.log(`Fetching delivery with tracking ID: ${trackingId}`);
                try {
                    const result = await getDeliveryByTrackingId(trackingId);
                    console.log("Fetch result:", result);

                    if (result) {
                        setDeliveryData(result);
                        // Also set in RiderContext for consistency
                        if (typeof setCurrentDelivery === 'function') {
                            setCurrentDelivery(result);
                        }
                        console.log("Delivery data set successfully");
                    } else {
                        console.log("No delivery found for this tracking ID");
                    }
                } catch (error) {
                    console.error("Error fetching delivery:", error);
                } finally {
                    setLoadingDelivery(false);
                }
            }
        };

        fetchDelivery();
    }, [trackingId, getDeliveryByTrackingId, setCurrentDelivery]);

    const handleAccept = async () => {
        if (!trackingId) return;

        const result = await acceptDelivery(trackingId);
        if (result.success) {
            navigate(`/rider/${trackingId}`);
        }
    };

    const handleDecline = async () => {
        if (!trackingId) return;

        const result = await declineDelivery(trackingId);
        if (result.success) {
            // Return to home page or rider dashboard
            navigate('/');
        }
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

        if (!deliveryData) {
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
                delivery={deliveryData}
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