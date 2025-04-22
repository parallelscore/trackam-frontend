import React, { useState, useEffect } from 'react';
import { Delivery, Location } from '@/types';
import { useDelivery } from '../../context/DeliveryContext';
import useGeolocation from '../../hooks/useGeolocation';
import TrackingMap from '../map/TrackingMap';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getStatusColor, getStatusText, formatDateTime, calculateDistance } from '@/utils/utils.ts';

interface RiderTrackerProps {
    delivery: Delivery;
}

const RiderTracker: React.FC<RiderTrackerProps> = ({ delivery }) => {
    const { updateRiderLocation, completeDelivery, isLoading } = useDelivery();
    const [isBatterySaving, setIsBatterySaving] = useState(false);
    const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

    // Track rider's location
    const {
        location,
        error,
        isTracking,
        startTracking,
        stopTracking
    } = useGeolocation({
        enableHighAccuracy: !isBatterySaving,
        interval: isBatterySaving ? 30000 : 15000, // 30 seconds in battery saving mode, 15 seconds in normal mode
    });

    // Update estimated time based on location
    useEffect(() => {
        if (location && delivery.customer.location) {
            const dist = calculateDistance(
                location.latitude,
                location.longitude,
                delivery.customer.location.latitude,
                delivery.customer.location.longitude
            );

            setDistance(dist);

            // Calculate estimated time based on average speed
            // Use 25 km/h for normal mode, 20 km/h for battery saving (less frequent updates)
            const speedKmh = isBatterySaving ? 20 : 25;
            const timeMinutes = Math.ceil((dist / speedKmh) * 60);
            setEstimatedTimeMinutes(timeMinutes);
        }
    }, [location, delivery.customer.location, isBatterySaving]);

    // Send location updates to the server
    useEffect(() => {
        const sendLocationUpdate = async () => {
            if (location && isTracking && delivery.trackingId) {
                try {
                    await updateRiderLocation(delivery.trackingId, location);
                } catch (error) {
                    console.error('Error updating location:', error);
                }
            }
        };

        if (location && isTracking) {
            sendLocationUpdate();
        }
    }, [location, isTracking, delivery.trackingId, updateRiderLocation]);

    const handleStartTracking = () => {
        startTracking();
    };

    const handleStopTracking = () => {
        stopTracking();
    };

    const toggleBatterySaving = () => {
        setIsBatterySaving(!isBatterySaving);
    };

    const handleCompleteDelivery = async () => {
        if (window.confirm('Are you sure you want to mark this delivery as complete?')) {
            try {
                await completeDelivery(delivery.trackingId);
                stopTracking();
            } catch (error) {
                console.error('Error completing delivery:', error);
            }
        }
    };

    const renderEstimatedTime = () => {
        if (estimatedTimeMinutes === null) return 'Calculating...';

        if (estimatedTimeMinutes < 1) return 'Less than a minute';

        if (estimatedTimeMinutes < 60) {
            return `${estimatedTimeMinutes} minute${estimatedTimeMinutes > 1 ? 's' : ''}`;
        }

        const hours = Math.floor(estimatedTimeMinutes / 60);
        const minutes = estimatedTimeMinutes % 60;

        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Delivery Status</CardTitle>
                        <Badge className={getStatusColor(delivery.status)}>
                            {getStatusText(delivery.status)}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-600">Customer</h3>
                            <p className="font-bold">{delivery.customer.name}</p>
                            <p>{delivery.customer.phoneNumber}</p>
                            <p className="mt-1 text-sm">{delivery.customer.address}</p>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-600">Package</h3>
                            <p>{delivery.package.description}</p>
                            {delivery.package.size && (
                                <p className="text-sm">Size: {delivery.package.size}</p>
                            )}
                            {delivery.package.specialInstructions && (
                                <div className="mt-2">
                                    <h4 className="text-sm font-medium text-gray-600">Special Instructions:</h4>
                                    <p className="text-sm italic">{delivery.package.specialInstructions}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {isTracking && distance !== null && (
                        <div className="p-4 bg-gray-50 rounded-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">Distance to Destination</h3>
                                    <p className="text-xl font-bold text-primary">{distance.toFixed(1)} km</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Estimated Time</h3>
                                    <p className="text-xl font-bold text-primary">{renderEstimatedTime()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="border-t pt-4 flex-col space-y-2">
                    {delivery.status === 'accepted' && !isTracking && (
                        <Button
                            className="w-full"
                            onClick={handleStartTracking}
                            disabled={isLoading}
                        >
                            Start Tracking
                        </Button>
                    )}

                    {isTracking && (
                        <>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={toggleBatterySaving}
                            >
                                {isBatterySaving ? '🔋 Battery Saving Mode: ON' : '🔋 Battery Saving Mode: OFF'}
                            </Button>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleStopTracking}
                            >
                                Stop Tracking
                            </Button>

                            <Button
                                variant="accent"
                                className="w-full mt-4"
                                onClick={handleCompleteDelivery}
                                disabled={isLoading}
                            >
                                Mark as Delivered
                            </Button>
                        </>
                    )}

                    {(delivery.status === 'completed' || delivery.status === 'cancelled') && (
                        <div className="text-center text-gray-500">
                            This delivery is {delivery.status === 'completed' ? 'completed' : 'cancelled'}.
                        </div>
                    )}
                </CardFooter>
            </Card>

            <div className="rounded-lg overflow-hidden border">
                <div className="h-[350px]">
                    <TrackingMap
                        riderLocation={location || undefined}
                        destinationLocation={delivery.customer.location}
                        isTracking={isTracking}
                        height="350px"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm">
                        <strong>Location Error:</strong> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderTracker;