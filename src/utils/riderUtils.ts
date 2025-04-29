// src/utils/riderUtils.ts
import { generateWhatsAppLink } from './utils';

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
 * Helper function to check if the browser supports geolocation
 * @returns {boolean} True if geolocation is supported
 */
export const isGeolocationSupported = (): boolean => {
    return 'geolocation' in navigator;
};

/**
 * Helper function to request location permission
 * @param onSuccess Callback function when permission is granted and position is available
 * @param onError Callback function when an error occurs
 */
export const requestLocationPermission = (
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void
) => {
    if (isGeolocationSupported()) {
        navigator.geolocation.getCurrentPosition(
            onSuccess,
            onError,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    } else {
        // Create a custom error when geolocation is not supported
        const customError = {
            code: 0,
            message: "Geolocation is not supported by this browser.",
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
        } as GeolocationPositionError;

        onError(customError);
    }
};

/**
 * Gets a human-readable error message for geolocation errors
 * @param error The geolocation error object
 * @returns {string} Human-readable error message
 */
export const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "You denied location permission. Please enable location services in your browser settings.";
        case error.POSITION_UNAVAILABLE:
            return "Location information is unavailable. Please try again.";
        case error.TIMEOUT:
            return "Location request timed out. Please try again.";
        default:
            return "Location permission denied. Please enable location services and try again.";
    }
};