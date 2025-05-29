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
import { MapPin, Clock, Package, User, Battery, Wifi, WifiOff, Navigation, Phone } from 'lucide-react';

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
    const [averageSpeed, setAverageSpeed] = useState<number>(25); // km/h
    const [lastLocationTime, setLastLocationTime] = useState<number | null>(null);
    const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastLocationUpdateRef = useRef<number>(0);
    const locationBufferRef = useRef<Location | null>(null);
    const speedHistory = useRef<number[]>([]);

    // Fix WebSocket URL construction to match backend endpoint
    const getWebSocketUrl = useCallback(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;

        // Use environment variable for API URL if available, otherwise construct from current location
        const apiUrl = import.meta.env.VITE_API_URL;

        if (apiUrl) {
            // Extract host from API URL
            try {
                const url = new URL(apiUrl);
                const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                return `${wsProtocol}//${url.host}/api/v1/ws/delivery/${delivery.tracking_id}`;
            } catch (error) {
                console.warn('Invalid VITE_API_URL, falling back to current host');
            }
        }

        // Fallback to current host with /api/v1 prefix
        return `${protocol}//${host}/api/v1/ws/delivery/${delivery.tracking_id}`;
    }, [delivery.tracking_id]);

    const wsUrl = getWebSocketUrl();

    // Handle WebSocket messages
    const handleWebSocketMessage = useCallback((data: any) => {
        switch (data.type) {
            case 'connections_info':
            case 'connection_status': // Handle both message types
                setConnectedClients(data.connections_count || data.count || 1);
                break;
            case 'location_update':
                // Handle location updates from other sources if needed
                console.log('Received location update:', data);
                break;
            case 'status_update':
                // Handle status updates if needed
                console.log('Received status update:', data);
                break;
            case 'pong':
                // Heartbeat response - connection is alive
                break;
            case 'error':
                console.error('WebSocket error message:', data.message);
                break;
            default:
                console.log('Received unknown message type:', data.type, data);
        }
    }, []);

    // Set up WebSocket connection
    const { isConnected, send, connectionStatus, disconnect } = useWebSocket({
        url: wsUrl,
        autoConnect: delivery.status === 'in_progress' || delivery.status === 'accepted',
        reconnectAttempts: 3,
        reconnectInterval: 10000,
        heartbeatInterval: 25000, // Heartbeat every 25 seconds
        onConnect: () => {
            console.log('WebSocket connected to:', wsUrl);
            setConnectedClients(1);

            // Send initial connection message
            setTimeout(() => {
                send({
                    type: 'join_tracking',
                    tracking_id: delivery.tracking_id,
                    user_type: 'rider'
                });
            }, 100);
        },
        onDisconnect: () => {
            console.log('WebSocket disconnected');
            setConnectedClients(0);
        },
        onError: (error) => {
            console.error('WebSocket error:', error);
        },
        onMessage: handleWebSocketMessage
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
        interval: isBatterySaving ? 45000 : 20000,
        skipInitialPermissionCheck: locationPermissionGranted
    });

    // Check location permission
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

    // Calculate speed and update average
    useEffect(() => {
        if (location && location.speed && location.speed > 0) {
            const speedKmh = location.speed * 3.6; // Convert m/s to km/h
            speedHistory.current.push(speedKmh);

            // Keep only last 10 speed readings
            if (speedHistory.current.length > 10) {
                speedHistory.current.shift();
            }

            // Calculate average speed
            const avgSpeed = speedHistory.current.reduce((sum, speed) => sum + speed, 0) / speedHistory.current.length;
            setAverageSpeed(Math.max(avgSpeed, 15)); // Minimum 15 km/h assumption
        }

        if (location) {
            setLastLocationTime(Date.now());
        }
    }, [location]);

    // Enhanced ETA calculation
    useEffect(() => {
        if (location && delivery.customer.location) {
            const dist = calculateDistance(
                location.latitude,
                location.longitude,
                delivery.customer.location.latitude,
                delivery.customer.location.longitude
            );

            setDistance(dist);

            // Use actual average speed if available, otherwise use default based on mode
            const speedToUse = speedHistory.current.length > 0 ? averageSpeed : (isBatterySaving ? 20 : 25);

            // Add buffer time for delivery (2-5 minutes depending on distance)
            const bufferMinutes = dist > 2 ? 5 : 2;
            const timeMinutes = Math.ceil((dist / speedToUse) * 60) + bufferMinutes;
            setEstimatedTimeMinutes(timeMinutes);
        }
    }, [location, delivery.customer.location, averageSpeed, isBatterySaving]);

    // Calculate backoff time for retries
    const getBackoffTime = useCallback(() => {
        return Math.min(Math.pow(2, retryCount) * 1000, 60000);
    }, [retryCount]);

    // Process location update with debouncing and retry logic
    const processLocationUpdate = useCallback(async () => {
        if (!locationBufferRef.current || isUpdatingLocation) return;

        const currentTime = Date.now();
        const minUpdateInterval = isBatterySaving ? 10000 : 5000;

        if (currentTime - lastLocationUpdateRef.current < minUpdateInterval) {
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
            locationBufferRef.current = null;

            const result = await updateLocation(delivery.tracking_id, locationToSend);

            if (result.success) {
                setRetryCount(0);
                lastLocationUpdateRef.current = currentTime;

                if (isConnected) {
                    const success = send({
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

                    if (!success) {
                        console.warn('Failed to send location update via WebSocket');
                    }
                }
            } else {
                console.error('Error updating location:', result.message || "Failed to update location");

                if (retryCount > 2) {
                    setLocationIssue('Issues sending location updates. Will keep trying.');
                }

                if (retryCount < 8) {
                    setRetryCount(prev => prev + 1);
                    const backoffTime = getBackoffTime();
                    console.log(`Retrying location update in ${backoffTime/1000}s (retry #${retryCount + 1})`);

                    locationUpdateTimeoutRef.current = setTimeout(() => {
                        if (locationBufferRef.current) {
                            processLocationUpdate();
                        }
                    }, backoffTime);
                }

                setIsUpdatingLocation(false);
                return;
            }
        } catch (error: unknown) {
            console.error('Error updating location:', error);

            if (retryCount > 2) {
                setLocationIssue('Issues sending location updates. Will keep trying.');
            }

            if (retryCount < 8) {
                setRetryCount(prev => prev + 1);
                const backoffTime = getBackoffTime();
                console.log(`Retrying location update in ${backoffTime/1000}s (retry #${retryCount + 1})`);

                locationUpdateTimeoutRef.current = setTimeout(() => {
                    if (locationBufferRef.current) {
                        processLocationUpdate();
                    }
                }, backoffTime);
            }
        } finally {
            setIsUpdatingLocation(false);
        }
    }, [delivery.tracking_id, isConnected, isUpdatingLocation, isBatterySaving, retryCount, send, updateLocation, getBackoffTime]);

    // Buffer location updates and trigger processing
    useEffect(() => {
        if (location && isTracking && (delivery.status === 'in_progress' || delivery.status === 'accepted')) {
            locationBufferRef.current = location;

            if (!isUpdatingLocation) {
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

    // Handle WebSocket ping removed - now handled by the hook itself

    // Cleanup WebSocket connection when component unmounts
    useEffect(() => {
        return () => {
            if (isConnected) {
                send({
                    type: 'leave_tracking',
                    tracking_id: delivery.tracking_id,
                    user_type: 'rider'
                });
                setTimeout(() => {
                    disconnect();
                }, 100);
            }
        };
    }, [isConnected, send, disconnect, delivery.tracking_id]);

    // Auto-start tracking
    useEffect(() => {
        const autoStartTracking = async () => {
            if (!isTracking) {
                startLocationTracking();

                if (delivery.status === 'accepted') {
                    try {
                        const result = await startTracking(delivery.tracking_id);

                        if (result.success && isConnected) {
                            // Send tracking start event with throttling
                            setTimeout(() => {
                                send({
                                    type: 'status_update',
                                    tracking_id: delivery.tracking_id,
                                    status: 'in_progress',
                                    timestamp: Date.now()
                                });
                            }, 500);
                        }
                    } catch (error) {
                        console.error('Error starting tracking:', error);
                        setLocationIssue('Failed to start tracking. Please refresh the page and try again.');
                    }
                }
            }
        };

        autoStartTracking();

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

                if (isConnected) {
                    send({
                        type: 'status_update',
                        tracking_id: delivery.tracking_id,
                        status: 'completed'
                    });
                }

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

        if (estimatedTimeMinutes < 1) return 'Arriving now';

        if (estimatedTimeMinutes < 60) {
            return `${estimatedTimeMinutes} min`;
        }

        const hours = Math.floor(estimatedTimeMinutes / 60);
        const minutes = estimatedTimeMinutes % 60;

        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    };

    const getLiveTrackingIndicator = () => {
        const isLive = isTracking && isConnected && !locationIssue;
        const lastUpdate = lastLocationTime ? Date.now() - lastLocationTime : null;
        const isStale = lastUpdate && lastUpdate > 60000; // 1 minute

        if (isLive && !isStale) {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-xs font-medium text-green-700">Live Tracking</span>
                </div>
            );
        } else if (isTracking) {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-medium text-yellow-700">
                        {isStale ? 'Signal Lost' : 'Connecting...'}
                    </span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600">Not Tracking</span>
                </div>
            );
        }
    };

    const getConnectionIcon = () => {
        if (isConnected && connectedClients > 0) {
            return <Wifi className="w-4 h-4 text-green-600" />;
        }
        return <WifiOff className="w-4 h-4 text-red-500" />;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with live tracking indicator */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(delivery.status)}>
                                {getStatusText(delivery.status)}
                            </Badge>
                            {getLiveTrackingIndicator()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            {getConnectionIcon()}
                            <span>{connectedClients} watching</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {locationIssue && (
                <div className="px-4 pt-4">
                    <Alert variant="warning" className="mb-4">
                        <AlertTitle>Location Issue</AlertTitle>
                        <AlertDescription>{locationIssue}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Main content */}
            <div className="flex flex-col lg:flex-row gap-4 p-4">
                {/* Left sidebar - Compact info panel */}
                <div className="w-full lg:w-80 bg-white rounded-lg border border-gray-200 flex flex-col lg:max-h-[calc(100vh-140px)] overflow-y-auto">
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                                <MapPin className="w-4 h-4" />
                                Distance
                            </div>
                            <div className="text-lg font-bold text-[#0CAA41]">
                                {distance !== null ? `${distance.toFixed(1)} km` : '--'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                                <Clock className="w-4 h-4" />
                                ETA
                            </div>
                            <div className="text-lg font-bold text-[#FF9500]">
                                {renderEstimatedTime()}
                            </div>
                        </div>
                    </div>

                    {/* Customer info */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Customer</h3>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <p className="font-medium">{delivery.customer.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-3 h-3" />
                                    <span>{delivery.customer.phone_number}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {delivery.customer.address}
                            </p>
                        </div>
                    </div>

                    {/* Package info */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Package</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm">{delivery.package.description}</p>
                            {delivery.package.size && (
                                <p className="text-xs text-gray-600">Size: {delivery.package.size}</p>
                            )}
                            {delivery.package.special_instructions && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <h4 className="text-xs font-medium text-yellow-800 mb-1">Special Instructions:</h4>
                                    <p className="text-xs text-yellow-700">{delivery.package.special_instructions}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Speed info */}
                    {isTracking && location?.speed && (
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Navigation className="w-4 h-4 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">Speed</h3>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Current:</span>
                                <span className="font-medium">{(location.speed * 3.6).toFixed(1)} km/h</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Average:</span>
                                <span className="font-medium">{averageSpeed.toFixed(1)} km/h</span>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="mt-auto p-4 space-y-3">
                        {isTracking && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start gap-2"
                                onClick={toggleBatterySaving}
                            >
                                <Battery className={`w-4 h-4 ${isBatterySaving ? 'text-yellow-600' : 'text-gray-600'}`} />
                                Battery Saving: {isBatterySaving ? 'ON' : 'OFF'}
                            </Button>
                        )}

                        {!showCompletionConfirm ? (
                            <Button
                                className="w-full bg-[#0CAA41] hover:bg-[#0CAA41]/90"
                                onClick={handleCompleteDelivery}
                                disabled={isLoading || !isTracking}
                            >
                                Mark as Delivered
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Alert>
                                    <AlertTitle>Confirm Delivery</AlertTitle>
                                    <AlertDescription>
                                        Has the customer received this package?
                                    </AlertDescription>
                                </Alert>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelCompleteDelivery}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-[#0CAA41] hover:bg-[#0CAA41]/90"
                                        onClick={confirmCompleteDelivery}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side - Map */}
                <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="h-[400px] lg:h-[calc(100vh-140px)]">
                        <TrackingMap
                            riderLocation={location || undefined}
                            destinationLocation={delivery.customer.location}
                            isTracking={isTracking}
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderTracker;