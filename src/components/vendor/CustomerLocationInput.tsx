// src/components/vendor/CustomerLocationInput.tsx

import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent } from '../ui/card';
import { MapPin, Target, Search, Loader2 } from 'lucide-react';
import { CustomerLocation } from '@/types';

interface CustomerLocationInputProps {
    value?: CustomerLocation | null;
    address: string;
    onChange: (location: CustomerLocation | null) => void;
    disabled?: boolean;
}

const CustomerLocationInput: React.FC<CustomerLocationInputProps> = ({
                                                                         value,
                                                                         address,
                                                                         onChange,
                                                                         disabled = false
                                                                     }) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);

    // Capture current location using browser geolocation
    const captureCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            return;
        }

        setIsCapturing(true);
        setError(null);

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                );
            });

            const location: CustomerLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: address || 'Current Location',
                timestamp: Date.now(),
                accuracy: position.coords.accuracy,
                source: 'current_location'
            };

            onChange(location);
            setUseCurrentLocation(true);
        } catch (err: any) {
            let errorMessage = 'Failed to get current location';

            if (err.code === 1) {
                errorMessage = 'Location access denied. Please enable location permission.';
            } else if (err.code === 2) {
                errorMessage = 'Location information unavailable.';
            } else if (err.code === 3) {
                errorMessage = 'Location request timeout.';
            }

            setError(errorMessage);
        } finally {
            setIsCapturing(false);
        }
    }, [address, onChange]);

    // Geocode address using Nominatim (OpenStreetMap) service
    const geocodeAddress = useCallback(async () => {
        if (!address.trim()) {
            setError('Please enter an address to geocode');
            return;
        }

        setIsCapturing(true);
        setError(null);

        try {
            // Using Nominatim (OpenStreetMap) geocoding service
            const encodedAddress = encodeURIComponent(`${address}, Nigeria`);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=ng`,
                {
                    headers: {
                        'User-Agent': 'TrackAm-Delivery-App/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding service unavailable');
            }

            const results = await response.json();

            if (results.length === 0) {
                throw new Error('Address not found. Please check the address or use current location.');
            }

            const result = results[0];
            const location: CustomerLocation = {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                address: result.display_name || address,
                timestamp: Date.now(),
                source: 'geocoded'
            };

            onChange(location);
            setUseCurrentLocation(false);
        } catch (err: any) {
            setError(err.message || 'Failed to geocode address');
        } finally {
            setIsCapturing(false);
        }
    }, [address, onChange]);

    const clearLocation = () => {
        onChange(null);
        setUseCurrentLocation(false);
        setError(null);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Customer Location (Optional)
                </label>
                <p className="text-sm text-gray-600 mb-2">
                    Capture precise location for better delivery tracking
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={captureCurrentLocation}
                    disabled={disabled || isCapturing}
                    className="flex-1"
                >
                    {isCapturing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Target className="w-4 h-4 mr-2" />
                    )}
                    {isCapturing ? 'Getting Location...' : 'Use Current Location'}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={geocodeAddress}
                    disabled={disabled || isCapturing || !address.trim()}
                    className="flex-1"
                >
                    {isCapturing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 mr-2" />
                    )}
                    {isCapturing ? 'Searching...' : 'Geocode Address'}
                </Button>
            </div>

            {value && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center text-sm font-medium">
                                    <MapPin className="w-4 h-4 mr-1 text-green-600" />
                                    Location Captured
                                    {useCurrentLocation && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            Current Location
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Lat: {value.latitude.toFixed(6)}, Lng: {value.longitude.toFixed(6)}
                                </p>
                                {value.address && (
                                    <p className="text-xs text-gray-500 max-w-md truncate" title={value.address}>
                                        {value.address}
                                    </p>
                                )}
                                {value.accuracy && (
                                    <p className="text-xs text-gray-400">
                                        Accuracy: ±{Math.round(value.accuracy)}m
                                    </p>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearLocation}
                                disabled={disabled}
                                className="text-red-600 hover:text-red-700"
                            >
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CustomerLocationInput;