// src/utils/riderUtils.ts
import { generateWhatsAppLink } from './utils';
import toast from 'react-hot-toast';

/**
 * Helper functions for rider operations
 */

/**
 * Helper function to notify vendor that a rider has declined a delivery
 * @param delivery The delivery object
 */
export const notifyVendorOfDecline = (delivery: any) => {
    if (delivery?.vendor?.phoneNumber) {
        const vendorMessage = `Rider ${delivery.rider.name} has declined the delivery for ${delivery.customer.name} (ID: ${delivery.tracking_id}).`;
        const whatsappLink = generateWhatsAppLink(delivery.vendor.phoneNumber, vendorMessage);
        window.open(whatsappLink, '_blank');
    }
};

/**
 * Platform-specific location detection
 */
const platforms = {
    isIOS: () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    },
    isAndroid: () => {
        return /Android/.test(navigator.userAgent);
    },
    isMacOS: () => {
        return /Mac/.test(navigator.userAgent) && !(/iPad|iPhone|iPod/.test(navigator.userAgent));
    },
    isWindows: () => {
        return /Windows/.test(navigator.userAgent);
    },
    isDesktop: () => {
        return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
};

/**
 * Location settings URL helpers
 */
export const getLocationSettingsUrl = (): string => {
    if (platforms.isIOS()) {
        return 'App Settings > Privacy > Location Services';
    } else if (platforms.isAndroid()) {
        return 'Settings > Location';
    } else if (platforms.isMacOS()) {
        return 'System Preferences > Security & Privacy > Privacy > Location Services';
    } else if (platforms.isWindows()) {
        return 'Settings > Privacy > Location';
    } else {
        return 'browser settings';
    }
};

/**
 * Helper function to check if the browser supports geolocation
 * @returns {boolean} True if geolocation is supported
 */
export const isGeolocationSupported = (): boolean => {
    return 'geolocation' in navigator;
};

/**
 * Maximum number of retries for location requests
 */
const MAX_LOCATION_RETRIES = 3;

/**
 * Helper function to request location permission with automatic retries
 * @param onSuccess Callback function when permission is granted and position is available
 * @param onError Callback function when an error occurs after all retries
 * @param maxRetries Number of retries to attempt (default: 3)
 * @param retryDelay Delay between retries in ms (default: 1000)
 * @param retryCount Current retry count (used internally)
 */
export const requestLocationPermission = (
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void,
    maxRetries: number = MAX_LOCATION_RETRIES,
    retryDelay: number = 1000,
    retryCount: number = 0
) => {
    if (!isGeolocationSupported()) {
        // Create a custom error when geolocation is not supported
        const customError = {
            code: 0,
            message: "Geolocation is not supported by this browser.",
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
        } as GeolocationPositionError;

        onError(customError);
        return;
    }

    // Show toast notification on first attempt
    if (retryCount === 0) {
        toast.loading("Requesting location access...", { id: "location-request" });
    }

    // Platform-specific settings
    const geoOptions: PositionOptions = {
        enableHighAccuracy: !platforms.isDesktop(), // Higher accuracy for mobile, lower for desktop to save battery
        timeout: platforms.isIOS() ? 20000 : 15000, // iOS sometimes needs more time
        maximumAge: 0 // Always get fresh location
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success - dismiss the loading toast and call success callback
            toast.dismiss("location-request");
            toast.success("Location access granted");
            onSuccess(position);
        },
        (error) => {
            // Check if we should retry
            if (retryCount < maxRetries) {
                // Update the loading toast with retry information
                toast.loading(`Retrying location request (${retryCount + 1}/${maxRetries})...`, { id: "location-request" });

                // Retry after delay
                setTimeout(() => {
                    requestLocationPermission(onSuccess, onError, maxRetries, retryDelay, retryCount + 1);
                }, retryDelay);
            } else {
                // All retries failed
                toast.dismiss("location-request");
                toast.error(getLocationErrorMessage(error));
                onError(error);
            }
        },
        geoOptions
    );
};

/**
 * Continuous location tracking with error handling and retries
 * @param onUpdate Callback function to handle position updates
 * @param onError Callback function to handle errors
 * @param options Configuration options
 * @returns Function to stop tracking
 */
export const startLocationTracking = (
    onUpdate: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void,
    options: {
        updateInterval?: number;     // Time between updates (ms)
        enableHighAccuracy?: boolean; // Use high accuracy mode
        maxRetries?: number;         // Max retries on failure
        retryDelay?: number;         // Delay between retries (ms)
        showToasts?: boolean;        // Show toast notifications
    } = {}
) => {
    const {
        updateInterval = 10000,
        enableHighAccuracy = true,
        maxRetries = MAX_LOCATION_RETRIES,
        retryDelay = 1000,
        showToasts = true
    } = options;

    let watchId: number | null = null;
    let retryCount = 0;
    let retryTimeoutId: number | null = null;
    let isTracking = true;

    // Platform-specific settings
    const geoOptions: PositionOptions = {
        enableHighAccuracy: enableHighAccuracy && !platforms.isDesktop(), // Desktop doesn't need high accuracy
        timeout: platforms.isIOS() ? 20000 : 15000, // iOS sometimes needs more time
        maximumAge: updateInterval / 2 // Allow cached positions for half the update interval
    };

    const startWatching = () => {
        if (!isGeolocationSupported()) {
            const customError = {
                code: 0,
                message: "Geolocation is not supported by this browser.",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3
            } as GeolocationPositionError;

            onError(customError);
            return;
        }

        try {
            if (showToasts && retryCount === 0) {
                toast.loading("Starting location tracking...", { id: "location-tracking" });
            }

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    // Success - reset retry count
                    retryCount = 0;
                    if (showToasts) {
                        toast.dismiss("location-tracking");
                        toast.success("Location tracking active", { id: "location-active", duration: 2000 });
                    }
                    onUpdate(position);
                },
                (error) => {
                    // Handle error with retries
                    if (retryCount < maxRetries && isTracking) {
                        retryCount++;
                        if (showToasts) {
                            toast.loading(`Retrying location tracking (${retryCount}/${maxRetries})...`,
                                { id: "location-tracking" });
                        }

                        // Clear previous timeout if it exists
                        if (retryTimeoutId !== null) {
                            window.clearTimeout(retryTimeoutId);
                        }

                        // Schedule retry
                        retryTimeoutId = window.setTimeout(() => {
                            if (watchId !== null) {
                                navigator.geolocation.clearWatch(watchId);
                                watchId = null;
                            }
                            startWatching();
                        }, retryDelay);
                    } else if (isTracking) {
                        // All retries failed
                        if (showToasts) {
                            toast.dismiss("location-tracking");
                            toast.error(getLocationErrorMessage(error), { duration: 4000 });
                        }
                        onError(error);
                    }
                },
                geoOptions
            );
        } catch (e) {
            if (showToasts) {
                toast.dismiss("location-tracking");
                toast.error("Failed to initialize location tracking");
            }
            console.error("Failed to start location tracking:", e);
        }
    };

    // Start tracking
    startWatching();

    // Return function to stop tracking
    return () => {
        isTracking = false;
        if (retryTimeoutId !== null) {
            window.clearTimeout(retryTimeoutId);
        }
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        toast.dismiss("location-tracking");
    };
};

/**
 * Gets a human-readable error message for geolocation errors
 * with platform-specific instructions
 * @param error The geolocation error object
 * @returns {string} Human-readable error message
 */
export const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    const settingsUrl = getLocationSettingsUrl();

    switch (error.code) {
        case error.PERMISSION_DENIED:
            return `Location permission denied. Please enable location services in your ${settingsUrl} and refresh the page.`;
        case error.POSITION_UNAVAILABLE:
            return platforms.isIOS() || platforms.isAndroid()
                ? "Couldn't determine your location. Please make sure your device's location is turned on and you're in an area with good GPS signal."
                : "Location information is unavailable. Please check your internet connection and try again.";
        case error.TIMEOUT:
            return "Location request timed out. Please check your internet connection and try again.";
        default:
            return `Location permission denied. Please enable location services in your ${settingsUrl} and try again.`;
    }
};

/**
 * Manually request a one-time location update with battery-saving options
 * Useful for when continuous tracking isn't needed
 */
export const requestOneTimeLocation = (
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void,
    highAccuracy: boolean = false
) => {
    const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 60000 // Accept positions up to 1 minute old
    };

    toast.loading("Getting your location...", { id: "one-time-location" });

    navigator.geolocation.getCurrentPosition(
        (position) => {
            toast.dismiss("one-time-location");
            toast.success("Location obtained");
            onSuccess(position);
        },
        (error) => {
            toast.dismiss("one-time-location");
            toast.error(getLocationErrorMessage(error));
            onError(error);
        },
        options
    );
};

/**
 * A battery-saving location tracking mode that reduces update frequency
 * when the device isn't moving significantly
 */
export const startBatterySavingLocationTracking = (
    onUpdate: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void,
    options: {
        minUpdateInterval?: number;   // Minimum time between updates (ms)
        maxUpdateInterval?: number;   // Maximum time between updates (ms)
        significantDistance?: number; // Distance (meters) considered significant movement
        showToasts?: boolean;         // Show toast notifications
    } = {}
) => {
    const {
        minUpdateInterval = 5000,    // 5 seconds minimum
        maxUpdateInterval = 60000,   // 1 minute maximum
        significantDistance = 20,     // 20 meters considered significant
        showToasts = true
    } = options;

    let lastPosition: GeolocationPosition | null = null;
    let currentInterval = minUpdateInterval;
    let timeoutId: number | null = null;
    let isTracking = true;

    const updateLocation = () => {
        if (!isTracking) return;

        requestOneTimeLocation(
            (position) => {
                // Calculate distance if we have a previous position
                if (lastPosition) {
                    const distance = calculateDistance(
                        lastPosition.coords.latitude,
                        lastPosition.coords.longitude,
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    // Adjust interval based on movement
                    if (distance > significantDistance) {
                        // Significant movement - use faster updates
                        currentInterval = minUpdateInterval;
                        if (showToasts) {
                            toast.success("Movement detected - increasing location updates",
                                { id: "battery-saving", duration: 2000 });
                        }
                    } else {
                        // No significant movement - slow down updates
                        currentInterval = Math.min(currentInterval * 1.5, maxUpdateInterval);
                        if (showToasts && currentInterval === maxUpdateInterval) {
                            toast.success("Battery saving mode active",
                                { id: "battery-saving", duration: 2000 });
                        }
                    }
                }

                lastPosition = position;
                onUpdate(position);

                // Schedule next update
                timeoutId = window.setTimeout(updateLocation, currentInterval);
            },
            (error) => {
                onError(error);
                // Even on error, keep trying with backoff
                timeoutId = window.setTimeout(updateLocation, Math.min(currentInterval * 2, maxUpdateInterval));
            },
            currentInterval === minUpdateInterval // Use high accuracy only when updating frequently
        );
    };

    // Helper function to calculate distance between coordinates in meters
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };

    // Start tracking immediately
    updateLocation();

    // Return function to stop tracking
    return () => {
        isTracking = false;
        if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
        }
        toast.dismiss("battery-saving");
    };
};