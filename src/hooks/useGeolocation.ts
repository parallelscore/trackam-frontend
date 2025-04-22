import { useState, useEffect } from 'react';
import { Location } from '@/types';

interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    interval?: number;
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
    const [watchId, setWatchId] = useState<number | null>(null);
    const [intervalId, setIntervalId] = useState<number | null>(null);

    const {
        enableHighAccuracy = true,
        timeout = 5000,
        maximumAge = 0,
        interval = 15000, // 15 seconds interval for polling
    } = options;

    const handleSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        const timestamp = position.timestamp;

        setLocation({
            latitude,
            longitude,
            accuracy: accuracy ?? undefined,
            speed: speed ?? undefined,
            timestamp
        });

        setError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
        setError(error.message);
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);

        // Initial position
        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy, timeout, maximumAge }
        );

        // Watch position for continuous updates
        const id = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy, timeout, maximumAge }
        );

        setWatchId(id);

        // Set up interval for more controlled updates
        // This helps with battery optimization
        const intervalIdValue = window.setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError,
                { enableHighAccuracy, timeout, maximumAge }
            );
        }, interval);

        setIntervalId(intervalIdValue);
    };

    const stopTracking = () => {
        setIsTracking(false);

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }

        if (intervalId !== null) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }

            if (intervalId !== null) {
                clearInterval(intervalId);
            }
        };
    }, [watchId, intervalId]);

    return { location, error, isTracking, startTracking, stopTracking };
};

export default useGeolocation;