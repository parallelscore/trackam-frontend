// src/pages/TrackingPage.tsx - Updated to use public API
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import TrackingMap from '../components/map/TrackingMap';
import DeliveryStatusHeader from '../components/customer/DeliveryStatusHeader';
import PackageDetails from '../components/customer/PackageDetails';
import { useDelivery } from '../context/DeliveryContext';
import { Card, CardContent } from '../components/ui/card';
import { calculateDistance } from '../utils/utils';
import { Button } from '../components/ui/button';
import { MapSkeleton, DeliveryItemSkeleton, CardSkeleton } from '../components/ui/skeleton';
import { motion } from 'framer-motion';

const TrackingPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const { getPublicDeliveryByTrackingId, currentDelivery, isLoading, error } = useDelivery();
    const [estimatedTime, setEstimatedTime] = useState<string | undefined>(undefined);
    const [distance, setDistance] = useState<number | null>(null);
    const [hasLocationAccess, setHasLocationAccess] = useState(false);

    // Set up polling for delivery updates
    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                // Use the public API endpoint that doesn't require authentication
                await getPublicDeliveryByTrackingId(trackingId);
            }
        };

        fetchDelivery();

        // Poll for updates every 10 seconds
        const intervalId = setInterval(fetchDelivery, 10000);

        return () => clearInterval(intervalId);
    }, [trackingId, getPublicDeliveryByTrackingId]);

    // Calculate estimated time and distance
    useEffect(() => {
        if (
            currentDelivery?.status === 'in_progress' &&
            currentDelivery?.rider?.current_location &&
            currentDelivery?.customer?.location
        ) {
            const dist = calculateDistance(
                currentDelivery.rider.current_location.latitude,
                currentDelivery.rider.current_location.longitude,
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

    // Check if location access is granted for customer location sharing
    useEffect(() => {
        navigator.permissions
            .query({ name: 'geolocation' })
            .then(permissionStatus => {
                setHasLocationAccess(permissionStatus.state === 'granted');

                permissionStatus.onchange = () => {
                    setHasLocationAccess(permissionStatus.state === 'granted');
                };
            })
            .catch(error => {
                console.error('Error checking location permission:', error);
            });
    }, []);

    const handleShareMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setHasLocationAccess(true);
                    // Here you would typically send this location to the backend
                    // For now, we'll just update the UI state
                    console.log('Location shared:', position.coords);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    };

    const renderContent = () => {
        if (isLoading && !currentDelivery) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Delivery status skeleton */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <CardSkeleton showImage={false} textLines={2} className="h-32" />
                    </motion.div>
                    
                    {/* Map skeleton */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <MapSkeleton className="h-[400px]" />
                    </motion.div>
                    
                    {/* Package details skeleton */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <DeliveryItemSkeleton />
                    </motion.div>
                </motion.div>
            );
        }

        if (error) {
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-600">
                            <p>Error: {error}</p>
                            <p className="mt-2">Please check your tracking ID and try again.</p>
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
                            <p className="mt-2 text-gray-600">Please check your tracking ID and try again.</p>
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

                {/* Map Section */}
                <div className="space-y-2">
                    <div className="rounded-lg overflow-hidden border h-[400px]">
                        <TrackingMap
                            riderLocation={currentDelivery.rider?.current_location}
                            destinationLocation={currentDelivery.customer.location}
                            isTracking={currentDelivery.status === 'in_progress'}
                            height="400px"
                        />
                    </div>

                    {/* Location sharing prompt */}
                    {currentDelivery.status === 'in_progress' && !hasLocationAccess && (
                        <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md flex items-center justify-between">
                            <span>Share your location to help the rider find you more easily</span>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-700"
                                onClick={handleShareMyLocation}
                            >
                                Share My Location
                            </Button>
                        </div>
                    )}
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