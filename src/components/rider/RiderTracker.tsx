//src/components/rider/RiderTracker.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery, Location } from '@/types';
import { useRider } from '../../context/RiderContext';
import useGeolocation from '../../hooks/useGeolocation';
import useWebSocket from '../../hooks/useWebSocket';
import TrackingMap from '../map/TrackingMap';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { getStatusColor, getStatusText, calculateDistance } from '@/utils/utils.ts';
import {
    MapPin,
    Clock,
    Package,
    Battery,
    Wifi,
    WifiOff,
    Navigation,
    Zap,
    Map,
    Target,
} from 'lucide-react';

interface RiderTrackerProps {
    delivery: Delivery;
}

const RiderTracker: React.FC<RiderTrackerProps> = ({ delivery }) => {
    const navigate = useNavigate();
    const { updateLocation, completeDelivery, startTracking, isLoading, locationPermissionGranted } = useRider();
    const [isBatterySaving, setIsBatterySaving] = useState(false);
    const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [totalDistance, setTotalDistance] = useState<number | null>(null);
    const [journeyProgress, setJourneyProgress] = useState<number>(0);
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

    // New state for view toggle
    const [currentView, setCurrentView] = useState<'map' | 'progress'>('map');
    const [isFirstLocationUpdate, setIsFirstLocationUpdate] = useState(true);
    const [trackingStartDistance, setTrackingStartDistance] = useState<number | null>(null);
    const [pathHistory, setPathHistory] = useState<Location[]>([]); // Store path trail

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
            case 'connection_status':
                setConnectedClients(data.connections_count || data.count || 1);
                break;
            case 'location_update':
                console.log('Received location update:', data);
                break;
            case 'status_update':
                console.log('Received status update:', data);
                break;
            case 'pong':
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
        heartbeatInterval: 25000,
        onConnect: () => {
            console.log('WebSocket connected to:', wsUrl);
            setConnectedClients(1);
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
            const speedKmh = location.speed * 3.6;
            speedHistory.current.push(speedKmh);

            if (speedHistory.current.length > 10) {
                speedHistory.current.shift();
            }

            const avgSpeed = speedHistory.current.reduce((sum, speed) => sum + speed, 0) / speedHistory.current.length;
            setAverageSpeed(Math.max(avgSpeed, 15));
        }

        if (location) {
            setLastLocationTime(Date.now());
        }
    }, [location]);

    // Fixed progress calculation
    useEffect(() => {
        if (location && delivery.customer.location) {
            const remainingDist = calculateDistance(
                location.latitude,
                location.longitude,
                delivery.customer.location.latitude,
                delivery.customer.location.longitude
            );

            setDistance(remainingDist);

            // Handle initial distance setup
            if (isFirstLocationUpdate && (delivery.status === 'in_progress' || delivery.status === 'accepted')) {
                setTrackingStartDistance(remainingDist);
                setTotalDistance(remainingDist);
                setJourneyProgress(0);
                setIsFirstLocationUpdate(false);
                console.log('🎯 Tracking started - Initial distance:', remainingDist.toFixed(2), 'km');
            } else if (trackingStartDistance !== null && totalDistance !== null) {
                const distanceCovered = Math.max(0, trackingStartDistance - remainingDist);
                const progressPercent = trackingStartDistance > 0
                    ? Math.min(100, Math.max(0, (distanceCovered / trackingStartDistance) * 100))
                    : 0;

                setJourneyProgress(progressPercent);

                if (remainingDist > trackingStartDistance) {
                    setTrackingStartDistance(remainingDist);
                    setTotalDistance(remainingDist);
                    setJourneyProgress(0);
                }
            }

            // ETA calculation
            const speedToUse = speedHistory.current.length > 0 ? averageSpeed : (isBatterySaving ? 20 : 25);
            const bufferMinutes = remainingDist > 2 ? 5 : 2;
            const timeMinutes = Math.ceil((remainingDist / speedToUse) * 60) + bufferMinutes;
            setEstimatedTimeMinutes(timeMinutes);
        }
    }, [location, delivery.customer.location, delivery.status, isFirstLocationUpdate, trackingStartDistance, totalDistance, averageSpeed, isBatterySaving]);

    // Reset tracking state when delivery status changes
    useEffect(() => {
        if (delivery.status === 'accepted' || delivery.status === 'in_progress') {
            setIsFirstLocationUpdate(true);
            setTrackingStartDistance(null);
            setTotalDistance(null);
            setJourneyProgress(0);
        }
    }, [delivery.status]);

    // Process location updates (keeping existing logic)
    const getBackoffTime = useCallback(() => {
        return Math.min(Math.pow(2, retryCount) * 1000, 60000);
    }, [retryCount]);

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

    // Separate effect for path history to avoid infinite loops
    useEffect(() => {
        if (location && isTracking && (delivery.status === 'in_progress' || delivery.status === 'accepted')) {
            // Add to path history for trail visualization
            setPathHistory(prev => {
                const newHistory = [...prev];
                // Only add if it's significantly different from the last position (to avoid cluttering)
                if (newHistory.length === 0) {
                    newHistory.push(location);
                } else {
                    const lastLocation = newHistory[newHistory.length - 1];
                    const distance = calculateDistance(
                        lastLocation.latitude,
                        lastLocation.longitude,
                        location.latitude,
                        location.longitude
                    );

                    // Only add if moved more than 10 meters
                    if (distance > 0.01) {
                        newHistory.push(location);
                        // Keep only last 100 points to prevent memory issues
                        if (newHistory.length > 100) {
                            newHistory.shift();
                        }
                    }
                }
                return newHistory;
            });
        }
    }, [location?.latitude, location?.longitude, delivery.status]); // Only depend on lat/lng to avoid loops

    // Auto-start tracking
    useEffect(() => {
        const autoStartTracking = async () => {
            if (!isTracking) {
                startLocationTracking();

                if (delivery.status === 'accepted') {
                    try {
                        const result = await startTracking(delivery.tracking_id);

                        if (result.success && isConnected) {
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

    // Cleanup
    useEffect(() => {
        return () => {
            if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current);
            }
        };
    }, []);

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
        if (estimatedTimeMinutes < 60) return `${estimatedTimeMinutes} min`;
        const hours = Math.floor(estimatedTimeMinutes / 60);
        const minutes = estimatedTimeMinutes % 60;
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    };

    const getLiveTrackingIndicator = () => {
        const isLive = isTracking && isConnected && !locationIssue;
        const lastUpdate = lastLocationTime ? Date.now() - lastLocationTime : null;
        const isStale = lastUpdate && lastUpdate > 60000;

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

    const getProgressColor = () => {
        if (journeyProgress > 75) return 'from-blue-500 to-green-500';
        if (journeyProgress > 50) return 'from-orange-500 to-blue-500';
        return 'from-red-500 to-orange-500';
    };

    const getProgressRingColor = () => {
        if (journeyProgress > 75) return 'stroke-green-500';
        if (journeyProgress > 50) return 'stroke-blue-500';
        return 'stroke-orange-500';
    };

    // Map overlay component for ETA and distance
    const MapOverlay = () => (
        <div className="absolute inset-0 z-[1000] pointer-events-none">
            {/* Top-right view toggle button */}
            <div className="absolute top-4 right-4">
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 backdrop-blur-sm border-gray-200 pointer-events-auto shadow-lg"
                    onClick={() => setCurrentView('progress')}
                >
                    <Target className="w-4 h-4 mr-2" />
                    Progress
                </Button>
            </div>

            {/* Stats positioned next to zoom controls (top-left, beside zoom buttons) */}
            <div className="absolute top-4 left-16 space-y-2 pointer-events-none">
                {/* Distance and ETA card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>Distance</span>
                            </div>
                            <div className="text-sm font-bold text-orange-600">
                                {distance !== null ? `${distance.toFixed(1)} km` : '--'}
                            </div>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="text-center">
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                                <Clock className="w-3 h-3" />
                                <span>ETA</span>
                            </div>
                            <div className="text-sm font-bold text-blue-600">
                                {renderEstimatedTime()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Speed indicator (when available) */}
                {isTracking && location?.speed && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-1.5 pointer-events-auto">
                        <div className="flex items-center gap-2 text-xs">
                            <Zap className="w-3 h-3 text-blue-500" />
                            <span className="font-medium">{(location.speed * 3.6).toFixed(1)} km/h</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
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

            {/* Main Content - Toggle between views */}
            <div className="p-4">
                {currentView === 'map' ? (
                    /* Map View */
                    <div className="space-y-4">
                        {/* Map with overlay */}
                        <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="h-[calc(100vh-280px)] min-h-[400px]">
                                <TrackingMap
                                    riderLocation={location || undefined}
                                    destinationLocation={delivery.customer.location}
                                    isTracking={isTracking}
                                    height="100%"
                                    delivery={{
                                        customer: delivery.customer,
                                        package: delivery.package
                                    }}
                                    pathHistory={pathHistory}
                                />
                                <MapOverlay />
                            </div>
                        </div>

                        {/* Bottom controls for map view - with collapsible package details */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Collapsible Package Details */}
                            <Card>
                                <CardContent className="p-4">
                                    <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer list-none">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">Package Details</span>
                                            </div>
                                            <svg
                                                className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </summary>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Item: </span>
                                                    <span className="text-sm text-gray-600">{delivery.package.description}</span>
                                                </div>
                                                {delivery.package.size && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Size: </span>
                                                        <span className="text-sm text-gray-600 capitalize">{delivery.package.size}</span>
                                                    </div>
                                                )}
                                                {delivery.package.special_instructions && (
                                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                                        <div className="text-xs font-medium text-yellow-800 mb-1">⚠️ Special Instructions:</div>
                                                        <div className="text-xs text-yellow-700 leading-relaxed">
                                                            {delivery.package.special_instructions}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </details>
                                </CardContent>
                            </Card>

                            {/* Controls only */}
                            <div className="flex gap-3">
                                {isTracking && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={toggleBatterySaving}
                                    >
                                        <Battery className={`w-4 h-4 mr-2 ${isBatterySaving ? 'text-yellow-600' : 'text-gray-600'}`} />
                                        Battery: {isBatterySaving ? 'Saving' : 'Normal'}
                                    </Button>
                                )}

                                {!showCompletionConfirm ? (
                                    <Button
                                        className="flex-1 bg-[#0CAA41] hover:bg-[#0CAA41]/90"
                                        onClick={handleCompleteDelivery}
                                        disabled={isLoading || !isTracking}
                                    >
                                        Mark as Delivered
                                    </Button>
                                ) : (
                                    <div className="flex gap-2 flex-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={cancelCompleteDelivery}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-[#0CAA41] hover:bg-[#0CAA41]/90"
                                            onClick={confirmCompleteDelivery}
                                        >
                                            Confirm Delivery
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Progress View */
                    <div className="max-w-md mx-auto space-y-6">
                        {/* Header with back button */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Delivery Progress</h2>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentView('map')}
                            >
                                <Map className="w-4 h-4 mr-2" />
                                Map
                            </Button>
                        </div>

                        {/* Progress Section */}
                        <Card>
                            <CardContent className="p-6">
                                {/* Circular Progress Ring */}
                                <div className="relative flex justify-center mb-6">
                                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            stroke="#e5e7eb"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 50}`}
                                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - journeyProgress / 100)}`}
                                            className={`transition-all duration-500 ${getProgressRingColor()}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-3xl font-bold text-gray-800">{Math.round(journeyProgress)}%</div>
                                        <div className="text-sm text-gray-500">Complete</div>
                                    </div>
                                </div>

                                {/* Linear Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Route Progress</span>
                                        <span className="text-sm text-gray-500">{Math.round(journeyProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                                        <div
                                            className={`h-4 rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${getProgressColor()} relative`}
                                            style={{ width: `${journeyProgress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                                        </div>
                                        <div className="absolute top-0 left-1/4 w-0.5 h-4 bg-white opacity-60"></div>
                                        <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-white opacity-60"></div>
                                        <div className="absolute top-0 left-3/4 w-0.5 h-4 bg-white opacity-60"></div>
                                        <div
                                            className="absolute top-0 w-5 h-4 transform -translate-x-1/2 transition-all duration-500"
                                            style={{ left: `${journeyProgress}%` }}
                                        >
                                            <div className="w-full h-full bg-white border-2 border-blue-500 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Distance markers */}
                                <div className="flex justify-between text-xs text-gray-500 mb-6">
                                    <span>Start</span>
                                    <span>25%</span>
                                    <span>50%</span>
                                    <span>75%</span>
                                    <span>Goal</span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">Remaining</span>
                                        </div>
                                        <div className="text-xl font-bold text-orange-600">
                                            {distance !== null ? `${distance.toFixed(1)} km` : '--'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {totalDistance ? `of ${totalDistance.toFixed(1)} km` : 'total'}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">ETA</span>
                                        </div>
                                        <div className="text-xl font-bold text-blue-600">
                                            {renderEstimatedTime()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {averageSpeed.toFixed(1)} km/h avg
                                        </div>
                                    </div>
                                </div>

                                {/* Journey Visualization */}
                                {totalDistance && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium">You are here</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Navigation className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">
                                                    {trackingStartDistance && distance !== null
                                                        ? `${Math.max(0, trackingStartDistance - distance).toFixed(1)} km covered`
                                                        : '0.0 km covered'
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-3">
                                            Delivering to: {delivery.customer.name}
                                        </div>

                                        <div className="relative">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500`}
                                                    style={{ width: `${journeyProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between mt-3 text-xs">
                                            <span className="text-gray-500">📍 Start</span>
                                            <span className="text-green-600">🏠 {delivery.customer.name}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Speed info */}
                                {isTracking && location?.speed && (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="w-4 h-4 text-gray-600" />
                                            <h3 className="font-semibold text-gray-900">Current Speed</h3>
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
                            </CardContent>
                        </Card>

                        {/* Controls */}
                        <div className="space-y-3">
                            {isTracking && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full justify-start gap-2"
                                    onClick={toggleBatterySaving}
                                >
                                    <Battery className={`w-4 h-4 ${isBatterySaving ? 'text-yellow-600' : 'text-gray-600'}`} />
                                    Battery Saving: {isBatterySaving ? 'ON' : 'OFF'}
                                </Button>
                            )}

                            {!showCompletionConfirm ? (
                                <Button
                                    size="lg"
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
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={cancelCompleteDelivery}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="lg"
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
                )}
            </div>
        </div>
    );
};

export default RiderTracker;