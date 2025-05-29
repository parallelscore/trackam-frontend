//src/components/rider/RiderTracker.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery, Location } from '@/types';
import { useRider } from '../../context/RiderContext';
import useGeolocation from '../../hooks/useGeolocation';
import useWebSocket from '../../hooks/useWebSocket';
import TrackingMap from '../map/TrackingMap';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { getStatusColor, getStatusText, calculateDistance } from '@/utils/utils.ts';

interface RiderTrackerProps {
    delivery: Delivery;
}

const RiderTracker: React.FC<RiderTrackerProps> = ({ delivery }) => {
    const navigate = useNavigate();
    const { updateLocation, completeDelivery, startTracking, isLoading, locationPermissionGranted } = useRider();
    const [isBatterySaving, setIsBatterySaving] = useState(false);
    const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [connectedClients, setConnectedClients] = useState(0);
    const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);
    const [locationIssue, setLocationIssue] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastLocationUpdateRef = useRef<number>(0);
    const locationBufferRef = useRef<Location | null>(null);

    // Set up WebSocket connection
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/delivery/${delivery.tracking_id}`;
    const { isConnected, send, connectionStatus } = useWebSocket({
        url: wsUrl,
        autoConnect: delivery.status === 'in_progress',
        onConnect: () => console.log('WebSocket connected'),
        onDisconnect: () => console.log('WebSocket disconnected'),
    });

    // Set up geolocation tracking with an assumption that permission is already granted
    const {
        location,
        error: locationError,
        isTracking,
        startTracking: startLocationTracking,
        stopTracking: stopLocationTracking
    } = useGeolocation({
        enableHighAccuracy: !isBatterySaving,
        interval: isBatterySaving ? 45000 : 20000, // Increased intervals to reduce resource usage
    });

    // Check that location permission is actually granted
    useEffect(() => {
        if (!locationPermissionGranted) {
            setLocationIssue("Location permission wasn't properly granted. This may affect tracking.");
            console.warn("RiderTracker: Location permission wasn't properly granted");
        }
    }, [locationPermissionGranted]);

    // Check for location errors
    useEffect(() => {
        if (locationError) {
            setLocationIssue(`Location error: ${locationError}`);
        } else {
            setLocationIssue(null);
        }
    }, [locationError]);

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

    // Calculate backoff time for retries
    const getBackoffTime = useCallback(() => {
        // Exponential backoff: 2^retryCount * 1000 ms (1 s, 2 s, 4 s, 8 s, etc.)
        // Max out at 60 seconds
        return Math.min(Math.pow(2, retryCount) * 1000, 60000);
    }, [retryCount]);

    // Process location update with debouncing and retry logic
    const processLocationUpdate = useCallback(async () => {
        if (!locationBufferRef.current || isUpdatingLocation) return;

        const currentTime = Date.now();
        // Enforce the minimum time between updates (5 seconds in normal mode, 10 in battery saving)
        const minUpdateInterval = isBatterySaving ? 10000 : 5000;

        if (currentTime - lastLocationUpdateRef.current < minUpdateInterval) {
            // Schedule update after the interval has passed
            if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current);
            }
            locationUpdateTimeoutRef.current = setTimeout(
                processLocationUpdate,
                minUpdateInterval - (currentTime - lastLocationUpdateRef.current)
            );
            return;
        }

        setIsUpdatingLocation(true);

        try {
            const locationToSend = { ...locationBufferRef.current };
            locationBufferRef.current = null; // Clear buffer

            // Send location update through API
            const result = await updateLocation(delivery.tracking_id, locationToSend);

            if (result.success) {
                setRetryCount(0); // Reset retry count on success
                lastLocationUpdateRef.current = currentTime;

                // Also send through WebSocket for real-time updates if connected
                if (isConnected) {
                    send({
                        type: 'location_update',
                        tracking_id: delivery.tracking_id,
                        location: {
                            latitude: locationToSend.latitude,
                            longitude: locationToSend.longitude,
                            accuracy: locationToSend.accuracy,
                            speed: locationToSend.speed,
                            timestamp: locationToSend.timestamp
                        }
                    });
                }
            } else {
                // Handle an unsuccessful result directly instead of throwing
                console.error('Error updating location:', result.message || "Failed to update location");

                // Only show error to the user after multiple failures
                if (retryCount > 2) {
                    setLocationIssue('Issues sending location updates. Will keep trying.');
                }

                // Implement exponential backoff for retries
                if (retryCount < 8) { // Max 8 retries
                    setRetryCount(prev => prev + 1);
                    const backoffTime = getBackoffTime();
                    console.log(`Retrying location update in ${backoffTime/1000}s (retry #${retryCount + 1})`);

                    // Schedule retry
                    locationUpdateTimeoutRef.current = setTimeout(() => {
                        if (locationBufferRef.current) {
                            processLocationUpdate();
                        }
                    }, backoffTime);
                }

                // Set updating to false here since we're handling the error case
                setIsUpdatingLocation(false);
                return;
            }
        } catch (error: unknown) {
            console.error('Error updating location:', error);

            // Only show error to the user after multiple failures
            if (retryCount > 2) {
                setLocationIssue('Issues sending location updates. Will keep trying.');
            }

            // Implement exponential backoff for retries
            if (retryCount < 8) { // Max 8 retries
                setRetryCount(prev => prev + 1);
                const backoffTime = getBackoffTime();
                console.log(`Retrying location update in ${backoffTime/1000}s (retry #${retryCount + 1})`);

                // Schedule retry
                locationUpdateTimeoutRef.current = setTimeout(() => {
                    if (locationBufferRef.current) {
                        processLocationUpdate();
                    }
                }, backoffTime);
            }
        } finally {
            setIsUpdatingLocation(false);
        }
    // Remove location from dependencies to prevent the infinite loop
    }, [delivery.tracking_id, isConnected, isUpdatingLocation, isBatterySaving, retryCount, send, updateLocation, getBackoffTime]);

    // Buffer location updates and trigger processing
    useEffect(() => {
        if (location && isTracking && delivery.status === 'in_progress') {
            // Store latest location in buffer
            locationBufferRef.current = location;

            // Try to process if not already processing
            if (!isUpdatingLocation) {
                // Use setTimeout to break the render cycle dependency
                const timeoutId = setTimeout(() => {
                    processLocationUpdate();
                }, 0);

                return () => clearTimeout(timeoutId);
            }
        }
    }, [location, isTracking, delivery.status, processLocationUpdate, isUpdatingLocation]);

    // Clean up timeout on unmounting
    useEffect(() => {
        return () => {
            if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current);
            }
        };
    }, []);

    // Handle WebSocket ping to keep the connection alive
    useEffect(() => {
        if (!isConnected) return;

        const intervalId = setInterval(() => {
            send({ type: 'ping', timestamp: Date.now() });
        }, 30000); // Send ping every 30 seconds

        return () => clearInterval(intervalId);
    }, [isConnected, send]);

    // Handle WebSocket updates for connected clients
    useEffect(() => {
        // This would normally be handled through actual WebSocket updates
        // For now, we'll simulate it with a random number
        const simulateClientConnection = () => {
            if (isConnected) {
                // Generate a random number between 0 and 3 to simulate clients watching
                setConnectedClients(Math.floor(Math.random() * 4));
            } else {
                setConnectedClients(0);
            }
        };

        // Only set up the interval, don't call it immediately to avoid render cycle issues
        const intervalId = setInterval(simulateClientConnection, 15000);

        // Initial call with setTimeout to avoid the render cycle
        const initialTimeout = setTimeout(simulateClientConnection, 100);

        return () => {
            clearInterval(intervalId);
            clearTimeout(initialTimeout);
        };
    }, [isConnected]);

    // Handle starting the delivery tracking - auto-start when the component loads
    useEffect(() => {
        const autoStartTracking = async () => {
            // Always start location tracking regardless of delivery status
            if (!isTracking) {
                startLocationTracking();

                // Only attempt to update the delivery status if it's in the 'accepted' state
                if (delivery.status === 'accepted') {
                    try {
                        const result = await startTracking(delivery.tracking_id);

                        // Send tracking start event to WebSocket if successful
                        if (result.success && isConnected) {
                            send({
                                type: 'status_update',
                                tracking_id: delivery.tracking_id,
                                status: 'in_progress'
                            });
                        }
                    } catch (error) {
                        console.error('Error starting tracking:', error);
                        setLocationIssue('Failed to start tracking. Please refresh the page and try again.');
                    }
                }
                // If already 'in_progress', no need to call the API again
            }
        };

        autoStartTracking();

        // Cleanup when a component unmounts
        return () => {
            if (isTracking) {
                stopLocationTracking();
            }
            if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current);
            }
        };
    }, [delivery.status, delivery.tracking_id, isTracking, startTracking, startLocationTracking, isConnected, send, stopLocationTracking]);

    const toggleBatterySaving = () => {
        setIsBatterySaving(!isBatterySaving);
    };

    const handleCompleteDelivery = async () => {
        setShowCompletionConfirm(true);
    };

    const confirmCompleteDelivery = async () => {
        try {
            const result = await completeDelivery(delivery.tracking_id);

            if (result.success) {
                stopLocationTracking();
                setShowCompletionConfirm(false);

                // Send completion event to WebSocket
                if (isConnected) {
                    send({
                        type: 'status_update',
                        tracking_id: delivery.tracking_id,
                        status: 'completed'
                    });
                }

                // Redirect to completion page
                setTimeout(() => {
                    navigate(`/rider/complete/${delivery.tracking_id}`);
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
        <div className="space-y-6">
            {locationIssue && (
                <Alert variant="warning">
                    <AlertTitle>Location Issue</AlertTitle>
                    <AlertDescription>
                        {locationIssue}
                    </AlertDescription>
                </Alert>
            )}

            {connectionStatus === 'error' && (
                <Alert variant="destructive">
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                        Unable to connect to the tracking server. Your delivery will still be tracked,
                        but real-time updates may be delayed.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Delivery details */}
                <div className="md:col-span-1">
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
                            <div>
                                <h3 className="font-medium text-gray-600">Customer</h3>
                                <p className="font-bold">{delivery.customer.name}</p>
                                <p>{delivery.customer.phone_number}</p>
                                <p className="mt-1 text-sm">{delivery.customer.address}</p>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-600">Package</h3>
                                <p>{delivery.package.description}</p>
                                {delivery.package.size && (
                                    <p className="text-sm">Size: {delivery.package.size}</p>
                                )}
                                {delivery.package.special_instructions && (
                                    <div className="mt-2">
                                        <h4 className="text-sm font-medium text-gray-600">Special Instructions:</h4>
                                        <p className="text-sm italic">{delivery.package.special_instructions}</p>
                                    </div>
                                )}
                            </div>

                            {isTracking && distance !== null && (
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <div className="space-y-2">
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
                            {isTracking && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={toggleBatterySaving}
                                >
                                    {isBatterySaving ? '🔋 Battery Saving Mode: ON' : '🔋 Battery Saving Mode: OFF'}
                                </Button>
                            )}

                            {!showCompletionConfirm ? (
                                <Button
                                    variant="accent"
                                    className="w-full"
                                    onClick={handleCompleteDelivery}
                                    disabled={isLoading || !isTracking}
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
                        </CardFooter>
                    </Card>
                </div>

                {/* Right column - Map */}
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <CardContent className="p-0 h-full min-h-[400px] md:min-h-[600px]">
                            <TrackingMap
                                riderLocation={location || undefined}
                                destinationLocation={delivery.customer.location}
                                isTracking={isTracking}
                                height="100%"
                            />
                        </CardContent>

                        {locationError && !locationIssue && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm">
                                <strong>Location Error:</strong> {locationError}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RiderTracker;
