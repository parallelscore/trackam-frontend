import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery, Location } from '@/types';
import { useDelivery } from '../../context/DeliveryContext';
import useGeolocation from '../../hooks/useGeolocation';
import useWebSocket from '../../hooks/useWebSocket';
import TrackingMap from '../map/TrackingMap';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { getStatusColor, getStatusText, formatDateTime, calculateDistance } from '@/utils/utils.ts';

interface RiderTrackerProps {
    delivery: Delivery;
}

const RiderTracker: React.FC<RiderTrackerProps> = ({ delivery }) => {
    const navigate = useNavigate();
    const { updateRiderLocation, completeDelivery, startTracking, isLoading } = useDelivery();
    const [isBatterySaving, setIsBatterySaving] = useState(false);
    const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [connectedClients, setConnectedClients] = useState(0);
    const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);

    // Set up WebSocket connection
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/delivery/${delivery.trackingId}`;
    const { isConnected, send } = useWebSocket({
        url: wsUrl,
        autoConnect: delivery.status === 'in_progress',
        onConnect: () => console.log('WebSocket connected'),
        onDisconnect: () => console.log('WebSocket disconnected'),
    });

    // Set up geolocation tracking
    const {
        location,
        error: locationError,
        isTracking,
        startTracking: startLocationTracking,
        stopTracking: stopLocationTracking
    } = useGeolocation({
        enableHighAccuracy: !isBatterySaving,
        interval: isBatterySaving ? 30000 : 10000, // 30 seconds in battery saving mode, 10 seconds in normal mode
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
            if (location && isTracking && delivery.status === 'in_progress') {
                try {
                    // Send location update through API
                    await updateRiderLocation(delivery.trackingId, location);

                    // Also send through WebSocket for real-time updates
                    if (isConnected) {
                        send({
                            type: 'location_update',
                            tracking_id: delivery.trackingId,
                            location: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                accuracy: location.accuracy,
                                speed: location.speed,
                                timestamp: location.timestamp
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error updating location:', error);
                }
            }
        };

        if (location && isTracking) {
            sendLocationUpdate();
        }
    }, [location, isTracking, delivery.trackingId, delivery.status, isConnected, updateRiderLocation, send]);

    // Handle WebSocket ping to keep connection alive
    useEffect(() => {
        if (!isConnected) return;

        const intervalId = setInterval(() => {
            send({ type: 'ping', timestamp: Date.now() });
        }, 30000); // Send ping every 30 seconds

        return () => clearInterval(intervalId);
    }, [isConnected, send]);

    // Handle starting the delivery tracking
    const handleStartTracking = async () => {
        try {
            // Call API to update delivery status
            const result = await startTracking(delivery.trackingId);

            if (result.success) {
                // Start tracking the rider's location
                startLocationTracking();

                // Send tracking start event to WebSocket
                if (isConnected) {
                    send({
                        type: 'status_update',
                        tracking_id: delivery.trackingId,
                        status: 'in_progress'
                    });
                }
            }
        } catch (error) {
            console.error('Error starting tracking:', error);
        }
    };

    const handleStopTracking = () => {
        stopLocationTracking();
    };

    const toggleBatterySaving = () => {
        setIsBatterySaving(!isBatterySaving);
    };

    const handleCompleteDelivery = async () => {
        setShowCompletionConfirm(true);
    };

    const confirmCompleteDelivery = async () => {
        try {
            const result = await completeDelivery(delivery.trackingId);

            if (result.success) {
                stopLocationTracking();
                setShowCompletionConfirm(false);

                // Send completion event to WebSocket
                if (isConnected) {
                    send({
                        type: 'status_update',
                        tracking_id: delivery.trackingId,
                        status: 'completed'
                    });
                }

                // Redirect to completion page
                setTimeout(() => {
                    navigate(`/rider/complete/${delivery.trackingId}`);
                }, 1000);
            }
        } catch (error) {
            console.error('Error completing delivery:', error);
        }
    };

    const cancelCompleteDelivery = () => {
        setShowCompletionConfirm(false);
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

                    {isConnected && (
                        <div className="text-sm text-green-600 flex items-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                            Live: {connectedClients > 0 ? `${connectedClients} client${connectedClients > 1 ? 's' : ''} watching` : 'Connected'}
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
                            Start Delivery
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

                            {!showCompletionConfirm ? (
                                <Button
                                    variant="accent"
                                    className="w-full"
                                    onClick={handleCompleteDelivery}
                                    disabled={isLoading}
                                >
                                    Mark as Delivered
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <Alert variant="warning">
                                        <AlertTitle>Confirm Delivery Completion</AlertTitle>
                                        <AlertDescription>
                                            Are you sure the customer has received this package?
                                        </AlertDescription>
                                    </Alert>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={cancelCompleteDelivery}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="default"
                                            className="flex-1"
                                            onClick={confirmCompleteDelivery}
                                        >
                                            Confirm Completion
                                        </Button>
                                    </div>
                                </div>
                            )}
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

                {locationError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm">
                        <strong>Location Error:</strong> {locationError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderTracker;