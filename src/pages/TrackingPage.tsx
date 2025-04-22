import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import TrackingMap from '../components/map/TrackingMap';
import DeliveryStatusHeader from '../components/customer/DeliveryStatusHeader';
import PackageDetails from '../components/customer/PackageDetails';
import { useDelivery } from '../context/DeliveryContext';
import { Card, CardContent } from '../components/ui/card';
import { calculateDistance } from '../utils/utils';

const TrackingPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const { getDeliveryByTrackingId, currentDelivery, isLoading, error } = useDelivery();
    const [estimatedTime, setEstimatedTime] = useState<string | undefined>(undefined);
    const [distance, setDistance] = useState<number | null>(null);

    // Set up polling for delivery updates
    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                await getDeliveryByTrackingId(trackingId);
            }
        };

        fetchDelivery();

        // Poll for updates every 10 seconds
        const intervalId = setInterval(fetchDelivery, 10000);

        return () => clearInterval(intervalId);
    }, [trackingId, getDeliveryByTrackingId]);

    // Calculate estimated time and distance
    useEffect(() => {
        if (
            currentDelivery?.status === 'in_progress' &&
            currentDelivery?.rider?.currentLocation &&
            currentDelivery?.customer?.location
        ) {
            const dist = calculateDistance(
                currentDelivery.rider.currentLocation.latitude,
                currentDelivery.rider.currentLocation.longitude,
                currentDelivery.customer.location.latitude,
                currentDelivery.customer.location.longitude
            );

            setDistance(dist);

            // Calculate estimated time
            const speedKmh = 25; // Assume average speed of 25 km/h
            const timeMinutes = Math.ceil((dist / speedKmh) * 60);

            if (timeMinutes < 1) {
                setEstimatedTime('Less than a minute');
            } else if (timeMinutes < 60) {
                setEstimatedTime(`${timeMinutes} minute${timeMinutes > 1 ? 's' : ''}`);
            } else {
                const hours = Math.floor(timeMinutes / 60);
                const minutes = timeMinutes % 60;
                setEstimatedTime(
                    `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
                );
            }
        } else {
            setEstimatedTime(undefined);
            setDistance(null);
        }
    }, [currentDelivery]);

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
            <div className="space-y-6">
                <DeliveryStatusHeader
                    delivery={currentDelivery}
                    estimatedTime={estimatedTime}
                />

                <div className="rounded-lg overflow-hidden border h-[400px]">
                    <TrackingMap
                        riderLocation={currentDelivery.rider?.currentLocation}
                        destinationLocation={currentDelivery.customer.location}
                        isTracking={currentDelivery.status === 'in_progress'}
                        height="400px"
                    />
                </div>

                <PackageDetails delivery={currentDelivery} />

                <div className="bg-white rounded-lg shadow-sm border p-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-medium">Need Help?</h3>
                        <p className="text-sm text-gray-600">Contact our support team</p>
                    </div>
                    <a
                        href="tel:+2348001234567"
                        className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                    >
                        Call Support
                    </a>
                </div>
            </div>
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

export default TrackingPage;