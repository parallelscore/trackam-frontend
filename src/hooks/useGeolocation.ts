// src/hooks/useGeolocation.ts
import { useState, useEffect, useRef } from 'react';
import { Location } from '@/types';

interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    interval?: number;
    skipInitialPermissionCheck?: boolean; // New option to skip permission checking
}

interface UseGeolocationResult {
    location: Location | null;
    error: string | null;
    isTracking: boolean;
    startTracking: () => void;
    stopTracking: () => void;
}

const useGeolocation = (options: GeolocationOptions = {}): UseGeolocationResult => {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const watchId = useRef<number | null>(null);
    const intervalId = useRef<number | null>(null);
    const retryCount = useRef<number>(0);
    const maxRetries = 3;

    const {
        enableHighAccuracy = true,
        timeout = 5000,
        maximumAge = 0,
        interval = 15000, // 15-second interval for polling
        skipInitialPermissionCheck = false // Skip the permission check if we know it's already granted
    } = options;

    const handleSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        const timestamp = position.timestamp;

        // Log successful location update
        console.log('Location updated:', {
            latitude,
            longitude,
            accuracy,
            speed,
            timestamp: new Date(timestamp).toISOString(),
            highAccuracyMode: options.enableHighAccuracy
        });

        setLocation({
            latitude,
            longitude,
            accuracy: accuracy ?? undefined,
            speed: speed ?? undefined,
            timestamp
        });

        setError(null);
        retryCount.current = 0; // Reset retry count on success
    };

    const handleError = (error: GeolocationPositionError) => {
        if (retryCount.current < maxRetries) {
            // Try again with a slight delay
            retryCount.current++;
            setTimeout(() => {
                navigator.geolocation.getCurrentPosition(
                    handleSuccess,
                    handleError,
                    { enableHighAccuracy, timeout, maximumAge }
                );
            }, 1000);
            return;
        }

        let errorMessage = 'Unknown location error';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timeout';
                break;
        }

        setError(errorMessage);
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);

        // Initial position - can skip the permission check if we know it's already granted
        if (!skipInitialPermissionCheck) {
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError,
                { enableHighAccuracy, timeout, maximumAge }
            );
        }

        // Watch position for continuous updates
        watchId.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy, timeout, maximumAge }
        );

        // Set up interval for more controlled updates
        // This helps with battery optimization
        intervalId.current = window.setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError,
                { enableHighAccuracy, timeout, maximumAge }
            );
        }, interval);
    };

    const stopTracking = () => {
        setIsTracking(false);

        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }

        if (intervalId.current !== null) {
            clearInterval(intervalId.current);
            intervalId.current = null;
        }
    };

    // Clean up on unmounting
    useEffect(() => {
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }

            if (intervalId.current !== null) {
                clearInterval(intervalId.current);
            }
        };
    }, []);

    return { location, error, isTracking, startTracking, stopTracking };
};

export default useGeolocation;