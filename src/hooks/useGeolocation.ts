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

    // Track last update time to prevent excessive updates
    const lastUpdateTime = useRef<number>(0);

    const {
        enableHighAccuracy = true,
        timeout = 10000, // Increased timeout to reduce chances of failure
        maximumAge = 30000, // Increased maximumAge to allow for cached positions
        interval = 20000, // Default to 20 seconds between updates
        skipInitialPermissionCheck = false // Skip the permission check if we know it's already granted
    } = options;

    const handleSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        const timestamp = position.timestamp;
        const now = Date.now();

        // Prevent updates that are too frequent (minimum 3 seconds between updates)
        if (now - lastUpdateTime.current < 3000) {
            return;
        }

        lastUpdateTime.current = now;

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
            // Try again with a slight delay, with increasing delay for each retry
            retryCount.current++;
            const retryDelay = 1000 * retryCount.current;

            console.log(`Location error, retrying in ${retryDelay/1000}s (retry #${retryCount.current})`);

            setTimeout(() => {
                navigator.geolocation.getCurrentPosition(
                    handleSuccess,
                    handleError,
                    { enableHighAccuracy, timeout, maximumAge }
                );
            }, retryDelay);
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

        // Watch position for continuous updates, but with reduced frequency
        // Use less accurate but more battery-friendly settings for the watch
        watchId.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: false, // Use low accuracy for watch to save battery
                timeout: timeout * 2,
                maximumAge: maximumAge * 2
            }
        );

        // Set up interval for more controlled updates with requested accuracy settings
        // This helps with battery optimization and prevents excessive resource usage
        intervalId.current = window.setInterval(() => {
            if (Date.now() - lastUpdateTime.current >= interval / 2) {
                navigator.geolocation.getCurrentPosition(
                    handleSuccess,
                    handleError,
                    { enableHighAccuracy, timeout, maximumAge }
                );
            }
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
