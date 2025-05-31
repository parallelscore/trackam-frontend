//src/components/rider/RiderTracker.tsx - Part 1: Imports and Setup

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

// Fixed storage utilities
const TrackingStorage = {
    getStorageKey: (trackingId: string, suffix: string) => `trackam_${trackingId}_${suffix}`,

    savePathHistory: (trackingId: string, pathHistory: Location[]) => {
        try {
            const key = TrackingStorage.getStorageKey(trackingId, 'path_history');
            localStorage.setItem(key, JSON.stringify(pathHistory));
        } catch (error) {
            console.error('Error saving path history:', error);
        }
    },

    loadPathHistory: (trackingId: string): Location[] => {
        try {
            const key = TrackingStorage.getStorageKey(trackingId, 'path_history');
            const saved = localStorage.getItem(key);
            if (saved) {
                return JSON.parse(saved) as Location[];
            }
        } catch (error) {
            console.error('Error loading path history:', error);
        }
        return [];
    },

    saveTrackingProgress: (trackingId: string, data: {
        startDistance: number | null;
        totalDistance: number | null;
        startTime: number;
        progressPercent: number;
    }) => {
        try {
            const key = TrackingStorage.getStorageKey(trackingId, 'progress');
            localStorage.setItem(key, JSON.stringify({
                ...data,
                lastUpdated: Date.now()
            }));
        } catch (error) {
            console.error('Error saving tracking progress:', error);
        }
    },

    loadTrackingProgress: (trackingId: string) => {
        try {
            const key = TrackingStorage.getStorageKey(trackingId, 'progress');
            const saved = localStorage.getItem(key);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.lastUpdated && (Date.now() - data.lastUpdated) < 24 * 60 * 60 * 1000) {
                    return data;
                }
            }
        } catch (error) {
            console.error('Error loading tracking progress:', error);
        }
        return null;
    },

    cleanupOldData: (trackingId: string) => {
        try {
            const keys = [
                TrackingStorage.getStorageKey(trackingId, 'path_history'),
                TrackingStorage.getStorageKey(trackingId, 'progress'),
                TrackingStorage.getStorageKey(trackingId, 'speed_history')
            ];

            keys.forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error cleaning up tracking data:', error);
        }
    }
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

const RiderTracker: React.FC<RiderTrackerProps> = ({ delivery }) => {
    const navigate = useNavigate();
    const { updateLocation, completeDelivery, startTracking, isLoading, locationPermissionGranted } = useRider();

    // Basic state
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
    const [averageSpeed, setAverageSpeed] = useState<number>(25);
    const [lastLocationTime, setLastLocationTime] = useState<number | null>(null);
    const [currentView, setCurrentView] = useState<'map' | 'progress'>('map');
    const [isFirstLocationUpdate, setIsFirstLocationUpdate] = useState(true);
    const [trackingStartDistance, setTrackingStartDistance] = useState<number | null>(null);
    const [trackingStartTime, setTrackingStartTime] = useState<number | null>(null);
    const [pathHistory, setPathHistory] = useState<Location[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Refs for values that shouldn't trigger re-renders
    const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastLocationUpdateRef = useRef<number>(0);
    const locationBufferRef = useRef<Location | null>(null);
    const speedHistory = useRef<number[]>([]);
    const hasLoadedData = useRef<boolean>(false);

    // Memoize the tracking ID to prevent unnecessary re-renders
    const trackingId = useMemo(() => delivery.tracking_id, [delivery.tracking_id]);

    // Load persisted data only once
    useEffect(() => {
        if (hasLoadedData.current) return;

        console.log('🔄 Loading persisted tracking data...');

        const savedPathHistory = TrackingStorage.loadPathHistory(trackingId);
        const savedProgress = TrackingStorage.loadTrackingProgress(trackingId);

        if (savedPathHistory.length > 0) {
            setPathHistory(savedPathHistory);
            console.log(`📂 Loaded ${savedPathHistory.length} path points`);
        }

        if (savedProgress) {
            setTrackingStartDistance(savedProgress.startDistance);
            setTotalDistance(savedProgress.totalDistance);
            setJourneyProgress(savedProgress.progressPercent || 0);
            setTrackingStartTime(savedProgress.startTime);

            if (savedProgress.startDistance !== null) {
                setIsFirstLocationUpdate(false);
            }
            console.log(`📂 Loaded tracking progress: ${savedProgress.progressPercent?.toFixed(1)}%`);
        }

        hasLoadedData.current = true;
        setIsDataLoaded(true);
    }, [trackingId]);

    // Debounced save functions to prevent excessive storage writes
    const debouncedSavePathHistory = useCallback(
        debounce((trackingId: string, pathHistory: Location[]) => {
            TrackingStorage.savePathHistory(trackingId, pathHistory);
        }, 1000),
        []
    );

    const debouncedSaveProgress = useCallback(
        debounce((trackingId: string, progressData: any) => {
            TrackingStorage.saveTrackingProgress(trackingId, progressData);
        }, 2000),
        []
    );

    // Save path history when it changes (debounced)
    useEffect(() => {
        if (isDataLoaded && pathHistory.length > 0) {
            debouncedSavePathHistory(trackingId, pathHistory);
        }
    }, [pathHistory.length, trackingId, isDataLoaded, debouncedSavePathHistory]);

    // Save tracking progress when it changes (debounced)
    useEffect(() => {
        if (isDataLoaded && trackingStartDistance !== null && totalDistance !== null) {
            debouncedSaveProgress(trackingId, {
                startDistance: trackingStartDistance,
                totalDistance: totalDistance,
                startTime: trackingStartTime || Date.now(),
                progressPercent: journeyProgress
            });
        }
    }, [
        trackingStartDistance,
        totalDistance,
        journeyProgress,
        trackingStartTime,
        trackingId,
        isDataLoaded,
        debouncedSaveProgress
    ]);

    // Clean up when delivery is completed
    useEffect(() => {
        if (delivery.status === 'completed') {
            setTimeout(() => {
                TrackingStorage.cleanupOldData(trackingId);
            }, 5000);
        }
    }, [delivery.status, trackingId]);

    // WebSocket URL - memoized to prevent re-creation
    const wsUrl = useMemo(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const apiUrl = import.meta.env.VITE_API_URL;

        if (apiUrl) {
            try {
                const url = new URL(apiUrl);
                const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                return `${wsProtocol}//${url.host}/api/v1/ws/delivery/${trackingId}`;
            } catch (error) {
                console.warn('Invalid VITE_API_URL, falling back to current host');
            }
        }

        return `${protocol}//${host}/api/v1/ws/delivery/${trackingId}`;
    }, [trackingId]);

    // Handle WebSocket messages - fixed message handling
    const handleWebSocketMessage = useCallback((data: any) => {
        console.log('📡 WebSocket message received:', data);

        switch (data.type) {
            case 'connections_info':
            case 'connection_status':
                setConnectedClients(data.connections_count || data.count || 1);
                break;
            case 'location_update':
                console.log('📍 Received location update:', data);
                break;
            case 'status_update':
                console.log('📊 Received status update:', data);
                break;
            case 'pong':
                // Heartbeat response - connection is alive
                break;
            case 'ping':
                // Send pong back
                break;
            case 'error':
                console.error('❌ WebSocket error message:', data.message || data.detail);
                break;
            default:
                // Don't log unknown message types as errors if they have error field
                if (data.error) {
                    console.warn('⚠️ WebSocket server error:', data.error);
                } else {
                    console.log('📦 Unknown message type:', data.type || 'undefined', data);
                }
        }
    }, []);

    // Set up WebSocket connection with better error handling
    const { isConnected, send, disconnect } = useWebSocket({
        url: wsUrl,
        autoConnect: delivery.status === 'in_progress' || delivery.status === 'accepted',
        reconnectAttempts: 3,
        reconnectInterval: 10000,
        heartbeatInterval: 25000,
        onConnect: () => {
            console.log('✅ WebSocket connected to:', wsUrl);
            setConnectedClients(1);
        },
        onDisconnect: () => {
            console.log('❌ WebSocket disconnected');
            setConnectedClients(0);
        },
        onError: (error) => {
            console.error('🚨 WebSocket error:', error);
        },
        onMessage: handleWebSocketMessage
    });

    // Set up geolocation tracking with stable options
    const geolocationOptions = useMemo(() => ({
        enableHighAccuracy: !isBatterySaving,
        interval: isBatterySaving ? 45000 : 20000,
        timeout: isBatterySaving ? 15000 : 10000,
        maximumAge: isBatterySaving ? 60000 : 30000,
        skipInitialPermissionCheck: locationPermissionGranted
    }), [isBatterySaving, locationPermissionGranted]);

    const {
        location,
        error: locationError,
        isTracking,
        startTracking: startLocationTracking,
        stopTracking: stopLocationTracking
    } = useGeolocation(geolocationOptions);

    // Check location permission (stable)
    useEffect(() => {
        if (!locationPermissionGranted) {
            setLocationIssue("Location permission wasn't properly granted. This may affect tracking.");
        }
    }, [locationPermissionGranted]);

    // Check for location errors (stable)
    useEffect(() => {
        if (locationError) {
            setLocationIssue(`Location error: ${locationError}`);
        } else {
            setLocationIssue(null);
        }
    }, [locationError]);

    // Calculate speed and update average (optimized)
    useEffect(() => {
        if (!location) return;

        if (location.speed && location.speed > 0) {
            const speedKmh = location.speed * 3.6;
            speedHistory.current.push(speedKmh);

            if (speedHistory.current.length > 50) {
                speedHistory.current.shift();
            }

            const avgSpeed = speedHistory.current.reduce((sum, speed) => sum + speed, 0) / speedHistory.current.length;
            setAverageSpeed(Math.max(avgSpeed, 15));
        }

        setLastLocationTime(Date.now());
    }, [location?.speed, location?.timestamp]);

    // Progress calculation (optimized with proper dependencies)
    useEffect(() => {
        if (!isDataLoaded || !location || !delivery.customer.location) return;

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
            setTrackingStartTime(Date.now());
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
    }, [
        isDataLoaded,
        location?.latitude,
        location?.longitude,
        delivery.customer.location?.latitude,
        delivery.customer.location?.longitude,
        delivery.status,
        isFirstLocationUpdate,
        trackingStartDistance,
        totalDistance,
        averageSpeed,
        isBatterySaving
    ]);

    // Enhanced path history management (optimized)
    useEffect(() => {
        if (!isDataLoaded || !location || !isTracking || !(delivery.status === 'in_progress' || delivery.status === 'accepted')) {
            return;
        }

        setPathHistory(prev => {
            // Only add if significantly different from last position
            if (prev.length === 0) {
                return [location];
            }

            const lastLocation = prev[prev.length - 1];
            const distance = calculateDistance(
                lastLocation.latitude,
                lastLocation.longitude,
                location.latitude,
                location.longitude
            );

            // Only add if moved more than 10 meters
            if (distance > 0.01) {
                const newHistory = [...prev, location];

                // Keep only last 200 points
                if (newHistory.length > 200) {
                    newHistory.shift();
                }

                return newHistory;
            }

            return prev;
        });
    }, [
        isDataLoaded,
        location?.latitude,
        location?.longitude,
        delivery.status,
        isTracking
    ]);

    // Process location updates with proper WebSocket messaging
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

            const result = await updateLocation(trackingId, locationToSend);

            if (result.success) {
                setRetryCount(0);
                lastLocationUpdateRef.current = currentTime;

                // Send location update via WebSocket (using correct message format)
                if (isConnected) {
                    const success = send({
                        type: 'location_update',
                        tracking_id: trackingId,
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
    }, [trackingId, isConnected, isUpdatingLocation, isBatterySaving, retryCount, send, updateLocation, getBackoffTime]);

    // Buffer location updates (optimized)
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

    // Auto-start tracking (stable)
    useEffect(() => {
        let mounted = true;

        const autoStartTracking = async () => {
            if (!isTracking && mounted) {
                startLocationTracking();

                if (delivery.status === 'accepted') {
                    try {
                        const result = await startTracking(trackingId);

                        if (result.success && isConnected && mounted) {
                            setTimeout(() => {
                                send({
                                    type: 'status_update',
                                    tracking_id: trackingId,
                                    status: 'in_progress',
                                    timestamp: Date.now()
                                });
                            }, 500);
                        }
                    } catch (error) {
                        console.error('Error starting tracking:', error);
                        if (mounted) {
                            setLocationIssue('Failed to start tracking. Please refresh the page and try again.');
                        }
                    }
                }
            }
        };

        autoStartTracking();

        return () => {
            mounted = false;
            if (isTracking) {
                stopLocationTracking();
            }
            if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current);
            }
        };
    }, [delivery.status, trackingId, isTracking, startTracking, startLocationTracking, isConnected, send, stopLocationTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current);
            }
            if (isConnected) {
                setTimeout(() => {
                    disconnect();
                }, 100);
            }
        };
    }, [isConnected, disconnect]);

    // Stable callback functions
    const toggleBatterySaving = useCallback(() => {
        setIsBatterySaving(prev => !prev);
    }, []);

    const handleCompleteDelivery = useCallback(async () => {
        setShowCompletionConfirm(true);
    }, []);

    const confirmCompleteDelivery = useCallback(async () => {
        try {
            const result = await completeDelivery(trackingId);

            if (result.success) {
                stopLocationTracking();
                setShowCompletionConfirm(false);

                if (isConnected) {
                    send({
                        type: 'status_update',
                        tracking_id: trackingId,
                        status: 'completed'
                    });
                }

                setTimeout(() => {
                    navigate(`/rider/complete/${trackingId}`);
                }, 1000);
            }
        } catch (error) {
            console.error('Error completing delivery:', error);
        }
    }, [completeDelivery, trackingId, stopLocationTracking, isConnected, send, navigate]);

    const cancelCompleteDelivery = useCallback(() => {
        setShowCompletionConfirm(false);
    }, []);

    // Memoized helper functions
    const renderEstimatedTime = useMemo(() => {
        if (estimatedTimeMinutes === null) return 'Calculating...';
        if (estimatedTimeMinutes < 1) return 'Arriving now';
        if (estimatedTimeMinutes < 60) return `${estimatedTimeMinutes} min`;
        const hours = Math.floor(estimatedTimeMinutes / 60);
        const minutes = estimatedTimeMinutes % 60;
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    }, [estimatedTimeMinutes]);

    const getLiveTrackingIndicator = useMemo(() => {
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
    }, [isTracking, isConnected, locationIssue, lastLocationTime]);

    const getConnectionIcon = useMemo(() => {
        if (isConnected && connectedClients > 0) {
            return <Wifi className="w-4 h-4 text-green-600" />;
        }
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }, [isConnected, connectedClients]);

    const getProgressColor = useMemo(() => {
        if (journeyProgress > 75) return 'from-blue-500 to-green-500';
        if (journeyProgress > 50) return 'from-orange-500 to-blue-500';
        return 'from-red-500 to-orange-500';
    }, [journeyProgress]);

    const getProgressRingColor = useMemo(() => {
        if (journeyProgress > 75) return 'stroke-green-500';
        if (journeyProgress > 50) return 'stroke-blue-500';
        return 'stroke-orange-500';
    }, [journeyProgress]);

    // Map overlay component for ETA and distance - with auto-hide functionality
    const MapOverlay = useMemo(() => () => (
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

            {/* Auto-hiding stats positioned next to zoom controls */}
            <div className="absolute top-4 left-16 space-y-2 pointer-events-none group">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 pointer-events-auto opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-300">
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
                                {renderEstimatedTime}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Speed indicator - also auto-hiding */}
                {isTracking && location?.speed && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-1.5 pointer-events-auto opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-xs">
                            <Zap className="w-3 h-3 text-blue-500" />
                            <span className="font-medium">{(location.speed * 3.6).toFixed(1)} km/h</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Hover hint - shows briefly then fades */}
            <div className="absolute top-20 left-16 pointer-events-none">
                <div className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-1000">
                    Hover to show stats
                </div>
            </div>
        </div>
    ), [distance, renderEstimatedTime, isTracking, location?.speed]);

    // Show loading indicator while data is being loaded
    if (!isDataLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <div className="text-center">
                                <p className="font-medium text-gray-900">Loading tracking data...</p>
                                <p className="text-sm text-gray-600 mt-1">Restoring your progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                            {getLiveTrackingIndicator}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            {getConnectionIcon}
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

            {/* Main Content */}
            <div className="p-4">
                {currentView === 'map' ? (
                    /* Map View */
                    <div className="space-y-4">
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

                        {/* Controls */}
                        <div className="grid grid-cols-1 gap-4">
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

                            <div className="flex gap-3">
                                {/* Battery saving toggle - always show when tracking */}
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

                                {/* Completion controls */}
                                {delivery.status === 'in_progress' && !showCompletionConfirm ? (
                                    <Button
                                        className="flex-1 bg-[#0CAA41] hover:bg-[#0CAA41]/90"
                                        onClick={handleCompleteDelivery}
                                        disabled={isLoading || !isTracking}
                                    >
                                        Mark as Delivered
                                    </Button>
                                ) : delivery.status === 'in_progress' && showCompletionConfirm ? (
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
                                ) : delivery.status === 'completed' ? (
                                    <div className="flex-1 text-center">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="text-green-800 font-medium">✅ Delivery Completed</div>
                                            <div className="text-green-600 text-sm mt-1">
                                                Great job! This delivery has been marked as complete.
                                            </div>
                                        </div>
                                    </div>
                                ) : delivery.status === 'accepted' ? (
                                    <div className="flex-1 text-center">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="text-blue-800 font-medium">🚀 Starting Tracking...</div>
                                            <div className="text-blue-600 text-sm mt-1">
                                                Location tracking will begin automatically
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Progress View */
                    <div className="max-w-md mx-auto space-y-6">
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
                                            className={`transition-all duration-500 ${getProgressRingColor}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-3xl font-bold text-gray-800">{Math.round(journeyProgress)}%</div>
                                        <div className="text-sm text-gray-500">Complete</div>
                                    </div>
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
                                            {renderEstimatedTime}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {averageSpeed.toFixed(1)} km/h avg
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced tracking info */}
                                {totalDistance && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium">Journey Progress</span>
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

                                        <div className="text-sm text-gray-600 mb-1">
                                            Delivering to: {delivery.customer.name}
                                        </div>

                                        {trackingStartTime && (
                                            <div className="text-xs text-gray-500 mb-3">
                                                Tracking since: {new Date(trackingStartTime).toLocaleTimeString()}
                                            </div>
                                        )}

                                        <div className="relative">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${getProgressColor} rounded-full transition-all duration-500`}
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
                                        {speedHistory.current.length > 0 && (
                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                <span>Speed samples:</span>
                                                <span>{speedHistory.current.length}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Controls */}
                        <div className="space-y-3">
                            {/* Battery saving toggle */}
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

                            {/* Completion controls */}
                            {delivery.status === 'in_progress' && !showCompletionConfirm ? (
                                <Button
                                    size="lg"
                                    className="w-full bg-[#0CAA41] hover:bg-[#0CAA41]/90"
                                    onClick={handleCompleteDelivery}
                                    disabled={isLoading || !isTracking}
                                >
                                    Mark as Delivered
                                </Button>
                            ) : delivery.status === 'in_progress' && showCompletionConfirm ? (
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
                            ) : delivery.status === 'completed' ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-green-800 font-medium">✅ Delivery Completed</div>
                                    <div className="text-green-600 text-sm mt-1">
                                        Great job! This delivery has been marked as complete.
                                    </div>
                                </div>
                            ) : delivery.status === 'accepted' ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-blue-800 font-medium">🚀 Starting Tracking...</div>
                                    <div className="text-blue-600 text-sm mt-1">
                                        Location tracking will begin automatically
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderTracker;