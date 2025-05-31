import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';

// Fix for Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom rider icon with directional arrow
const createRiderIcon = (heading: number = 0) => {
    return L.divIcon({
        className: 'custom-rider-marker',
        html: `
            <div class="rider-marker-container">
                <div class="rider-marker-pulse"></div>
                <div class="rider-marker-dot">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 4.1 13.6 3 12.1 3C10.6 3 9.4 4.1 9.2 5.5L3 7V9L9.2 7.5C9.2 7.7 9.2 7.8 9.2 8C9.2 8.3 9.3 8.6 9.4 8.9L12 22L14.6 8.9C14.7 8.6 14.8 8.3 14.8 8C14.8 7.8 14.8 7.7 14.8 7.5L21 9Z" fill="#0CAA41"/>
                    </svg>
                </div>
                <div class="direction-arrow" style="transform: rotate(${heading}deg)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L22 12L12 22V16H2V8H12V2Z" fill="#0CAA41"/>
                    </svg>
                </div>
            </div>
            <style>
                .rider-marker-container {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .rider-marker-pulse {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: rgba(12, 170, 65, 0.3);
                    animation: pulse-rider 2s infinite;
                }
                .rider-marker-dot {
                    position: relative;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background-color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    z-index: 10;
                }
                .direction-arrow {
                    position: absolute;
                    top: -8px;
                    right: -2px;
                    background-color: white;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s ease;
                    z-index: 11;
                }
                @keyframes pulse-rider {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.4;
                    }
                    100% {
                        transform: scale(0.8);
                        opacity: 0.8;
                    }
                }
            </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

// Custom destination icon
const createDestinationIcon = () => {
    return L.divIcon({
        className: 'custom-destination-marker',
        html: `
            <div class="destination-marker-container">
                <div class="destination-marker-pin">
                    <svg width="32" height="40" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C18.627 0 24 5.373 24 12C24 18.627 12 29 12 29S0 18.627 0 12C0 5.373 5.373 0 12 0Z" fill="#FF9500"/>
                        <circle cx="12" cy="12" r="6" fill="white"/>
                        <svg x="8" y="8" width="8" height="8" viewBox="0 0 24 24" fill="#FF9500">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                    </svg>
                </div>
            </div>
            <style>
                .destination-marker-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .destination-marker-pin {
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
                    animation: bounce-destination 2s infinite;
                }
                @keyframes bounce-destination {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-5px);
                    }
                    60% {
                        transform: translateY(-3px);
                    }
                }
            </style>
        `,
        iconSize: [60, 40],
        iconAnchor: [30, 40],
    });
};

// Custom starting point icon
const createStartingPointIcon = () => {
    return L.divIcon({
        className: 'custom-start-marker',
        html: `
            <div class="start-marker-container">
                <div class="start-marker-pulse"></div>
                <div class="start-marker-dot"></div>
            </div>
            <style>
                .start-marker-container {
                    position: relative;
                    width: 18px;
                    height: 18px;
                }
                .start-marker-dot {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: 10px;
                    height: 10px;
                    background-color: #FF3B30;
                    border-radius: 50%;
                    z-index: 2;
                }
                .start-marker-pulse {
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background-color: rgba(255, 59, 48, 0.6);
                    animation: pulse-start 1.5s infinite;
                    z-index: 1;
                }
                @keyframes pulse-start {
                    0% {
                        transform: scale(0.5);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1);
                        opacity: 0.4;
                    }
                    100% {
                        transform: scale(0.5);
                        opacity: 0.8;
                    }
                }
            </style>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
};

interface MapControllerProps {
    riderLocation?: Location;
    destinationLocation?: Location;
    pathHistory: Location[];
    shouldRecenter: boolean;
    onRecenterComplete: () => void;
}

// Optimized map controller that only updates when needed
const MapController: React.FC<MapControllerProps> = ({
                                                         riderLocation,
                                                         destinationLocation,
                                                         pathHistory,
                                                         shouldRecenter,
                                                         onRecenterComplete,
                                                     }) => {
    const map = useMap();
    const lastRecenterRef = useRef<number>(0);

    // Handle recentering only when explicitly requested
    useEffect(() => {
        if (!shouldRecenter || !riderLocation) return;

        const now = Date.now();
        // Prevent rapid recentering calls
        if (now - lastRecenterRef.current < 1000) return;

        lastRecenterRef.current = now;

        try {
            if (destinationLocation) {
                // Fit bounds to include both rider and destination
                const bounds = L.latLngBounds(
                    [riderLocation.latitude, riderLocation.longitude],
                    [destinationLocation.latitude, destinationLocation.longitude]
                );

                // Include path history in bounds if available
                if (pathHistory.length > 0) {
                    pathHistory.forEach(location => {
                        bounds.extend([location.latitude, location.longitude]);
                    });
                }

                map.fitBounds(bounds, {
                    padding: [50, 50],
                    animate: true,
                    duration: 0.5
                });
            } else {
                // Just center on rider
                map.setView([riderLocation.latitude, riderLocation.longitude], 15, {
                    animate: true,
                    duration: 0.5
                });
            }
        } catch (error) {
            console.warn('Error recentering map:', error);
        }

        // Notify that recentering is complete
        setTimeout(() => {
            onRecenterComplete();
        }, 600);
    }, [shouldRecenter, riderLocation, destinationLocation, pathHistory, map, onRecenterComplete]);

    return null;
};

interface TrackingMapProps {
    riderLocation?: Location;
    destinationLocation?: Location;
    isTracking: boolean;
    height?: string;
    pathHistory?: Location[];
    delivery?: {
        customer: {
            name: string;
            phone_number: string;
            address: string;
        };
        package: {
            description: string;
            size?: string;
            special_instructions?: string;
        };
    };
}

const TrackingMap: React.FC<TrackingMapProps> = ({
                                                     riderLocation,
                                                     destinationLocation,
                                                     isTracking,
                                                     height = '400px',
                                                     pathHistory = [],
                                                     delivery
                                                 }) => {
    const mapRef = useRef<L.Map | null>(null);
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [shouldRecenter, setShouldRecenter] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Calculate rider heading from path history
    const calculateHeading = useCallback((): number => {
        if (pathHistory.length < 2) return 0;

        const current = pathHistory[pathHistory.length - 1];
        const previous = pathHistory[pathHistory.length - 2];

        const dLon = (current.longitude - previous.longitude) * Math.PI / 180;
        const lat1 = previous.latitude * Math.PI / 180;
        const lat2 = current.latitude * Math.PI / 180;

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

        let heading = Math.atan2(y, x) * 180 / Math.PI;
        heading = (heading + 360) % 360; // Normalize to 0-360

        return heading;
    }, [pathHistory]);

    const riderHeading = useMemo(() => calculateHeading(), [calculateHeading]);

    // Default to Lagos, Nigeria if no locations provided
    const defaultCenter: [number, number] = [6.5244, 3.3792];
    const center = useMemo(() => {
        return riderLocation
            ? [riderLocation.latitude, riderLocation.longitude] as [number, number]
            : defaultCenter;
    }, [riderLocation]);

    // Convert path history to leaflet LatLng format (memoized)
    const pathCoordinates: [number, number][] = useMemo(() => {
        return pathHistory.map(location => [location.latitude, location.longitude]);
    }, [pathHistory]);

    // Get starting point from path history (first point)
    const startingPoint = useMemo(() => {
        return pathHistory.length > 0 ? pathHistory[0] : null;
    }, [pathHistory]);

    // Initial setup - only fit bounds once when map is first loaded
    useEffect(() => {
        if (!isInitialized && mapRef.current && riderLocation && destinationLocation) {
            const bounds = L.latLngBounds(
                [riderLocation.latitude, riderLocation.longitude],
                [destinationLocation.latitude, destinationLocation.longitude]
            );

            // Include path history in bounds if available
            if (pathHistory.length > 0) {
                pathHistory.forEach(location => {
                    bounds.extend([location.latitude, location.longitude]);
                });
            }

            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            setIsInitialized(true);
        }
    }, [riderLocation, destinationLocation, pathHistory, isInitialized]);

    // Handle recenter button click
    const handleRecenter = useCallback(() => {
        setShouldRecenter(true);
    }, []);

    // Handle recenter completion
    const handleRecenterComplete = useCallback(() => {
        setShouldRecenter(false);
    }, []);

    // Memoized marker components to prevent unnecessary re-renders
    const RiderMarker = useMemo(() => {
        if (!riderLocation) return null;

        return (
            <Marker
                position={[riderLocation.latitude, riderLocation.longitude]}
                icon={createRiderIcon(riderHeading)}
            >
                <Popup closeButton={false} className="custom-popup">
                    <div className="p-3 min-w-[180px]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 4.1 13.6 3 12.1 3C10.6 3 9.4 4.1 9.2 5.5L3 7V9L9.2 7.5C9.2 7.7 9.2 7.8 9.2 8C9.2 8.3 9.3 8.6 9.4 8.9L12 22L14.6 8.9C14.7 8.6 14.8 8.3 14.8 8C14.8 7.8 14.8 7.7 14.8 7.5L21 9Z" fill="#0CAA41"/>
                                </svg>
                            </div>
                            <h3 className="font-semibold text-green-700">🚴 Your Location</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span>📍</span>
                                <span className="text-gray-600 font-mono text-xs">
                                    {riderLocation.latitude.toFixed(6)}, {riderLocation.longitude.toFixed(6)}
                                </span>
                            </div>

                            {riderLocation.accuracy && (
                                <div className="flex items-center gap-2">
                                    <span>🎯</span>
                                    <span className="text-gray-600">±{Math.round(riderLocation.accuracy)}m</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <span>🕒</span>
                                <span className="text-gray-600">
                                    {new Date(riderLocation.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </Popup>
            </Marker>
        );
    }, [riderLocation, riderHeading]);

    const AccuracyCircle = useMemo(() => {
        if (!riderLocation?.accuracy || riderLocation.accuracy >= 100) return null;

        return (
            <Circle
                center={[riderLocation.latitude, riderLocation.longitude]}
                radius={riderLocation.accuracy}
                pathOptions={{
                    color: '#0CAA41',
                    fillColor: '#0CAA41',
                    fillOpacity: 0.1,
                    weight: 2,
                }}
            />
        );
    }, [riderLocation]);

    const DestinationMarker = useMemo(() => {
        if (!destinationLocation || !delivery) return null;

        return (
            <Marker
                position={[destinationLocation.latitude, destinationLocation.longitude]}
                icon={createDestinationIcon()}
            >
                <Popup closeButton={false} className="custom-popup">
                    <div className="p-3 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#FF9500"/>
                                </svg>
                            </div>
                            <h3 className="font-semibold text-orange-700">🏠 Destination</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span>👤</span>
                                <span className="text-gray-700">{delivery.customer.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span>📞</span>
                                <span className="text-gray-600 font-mono text-xs">{delivery.customer.phone_number}</span>
                            </div>

                            <div className="flex items-start gap-2">
                                <span>📍</span>
                                <span className="text-gray-600 text-xs leading-relaxed">
                                    {delivery.customer.address}
                                </span>
                            </div>
                        </div>
                    </div>
                </Popup>
            </Marker>
        );
    }, [destinationLocation, delivery]);

    const StartingPointMarker = useMemo(() => {
        if (!startingPoint || pathHistory.length <= 1) return null;

        return (
            <Marker
                position={[startingPoint.latitude, startingPoint.longitude]}
                icon={createStartingPointIcon()}
            >
                <Popup closeButton={false} className="custom-popup">
                    <div className="p-3 min-w-[180px]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1A2C56"/>
                                    <path d="M2 17L12 22L22 17" fill="#1A2C56"/>
                                    <path d="M2 12L12 17L22 12" fill="#1A2C56"/>
                                </svg>
                            </div>
                            <h3 className="font-semibold text-blue-700">🏁 Starting Point</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span>📍</span>
                                <span className="text-gray-600 font-mono text-xs">
                                    {startingPoint.latitude.toFixed(6)}, {startingPoint.longitude.toFixed(6)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span>🕒</span>
                                <span className="text-gray-600">
                                    {new Date(startingPoint.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </Popup>
            </Marker>
        );
    }, [startingPoint, pathHistory.length]);

    const PathTrail = useMemo(() => {
        if (!isTracking || pathCoordinates.length <= 1) return null;

        return (
            <Polyline
                positions={pathCoordinates}
                pathOptions={{
                    color: '#0CAA41',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '5, 10',
                    lineCap: 'round',
                    lineJoin: 'round'
                }}
            >
                <Popup closeButton={false} className="custom-popup">
                    <div className="p-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-700">🚴 Rider's Trail</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            <div>📍 {pathCoordinates.length} tracking points</div>
                            <div>📏 Path shows rider's journey</div>
                        </div>
                    </div>
                </Popup>
            </Polyline>
        );
    }, [isTracking, pathCoordinates]);

    return (
        <div style={{ height, width: '100%' }} className="relative">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                whenCreated={(map) => {
                    mapRef.current = map;
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Path History Trail */}
                {PathTrail}

                {/* Rider location */}
                {RiderMarker}
                {AccuracyCircle}

                {/* Destination location */}
                {DestinationMarker}

                {/* Starting point marker */}
                {StartingPointMarker}

                {/* Map controller for handling recentering */}
                <MapController
                    riderLocation={riderLocation}
                    destinationLocation={destinationLocation}
                    pathHistory={pathHistory}
                    shouldRecenter={shouldRecenter}
                    onRecenterComplete={handleRecenterComplete}
                />
            </MapContainer>

            {/* Enhanced Map Controls - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                {/* Recenter Button */}
                <button
                    onClick={handleRecenter}
                    className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 hover:bg-white transition-all duration-200 ${
                        shouldRecenter ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    title="Recenter map to show rider and destination"
                    disabled={shouldRecenter}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${shouldRecenter ? 'animate-spin text-blue-600' : 'text-gray-700'} transition-colors`}
                    >
                        <path
                            d="M12 2L12 6M12 18L12 22M22 12L18 12M6 12L2 12M20.485 20.485L17.657 17.657M6.343 6.343L3.515 3.515M20.485 3.515L17.657 6.343M6.343 17.657L3.515 20.485"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
            </div>

            {/* Collapsible Map Legend - Keep original */}
            {(riderLocation || destinationLocation || pathHistory.length > 0) && (
                <div className="absolute bottom-4 left-4 z-[1000]">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsLegendOpen(!isLegendOpen)}
                        className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 mb-2 flex items-center gap-2 border border-gray-200 hover:bg-white transition-colors"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`transition-transform ${isLegendOpen ? 'rotate-180' : ''}`}
                        >
                            <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xs font-medium text-gray-700">Legend</span>
                    </button>

                    {/* Legend Content */}
                    {isLegendOpen && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs space-y-2 border border-gray-200">
                            <div className="font-medium text-gray-700 mb-2">Map Legend</div>
                            {riderLocation && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700">Rider (You)</span>
                                </div>
                            )}
                            {destinationLocation && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700">Customer</span>
                                </div>
                            )}
                            {startingPoint && pathHistory.length > 3 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700">Start Point</span>
                                </div>
                            )}
                            {pathHistory.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-1 bg-green-500 border border-green-600" style={{borderStyle: 'dashed'}}></div>
                                    <span className="text-gray-700">Trail ({pathHistory.length} points)</span>
                                </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                💡 Tap markers for details
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Custom styles for enhanced popups */}
            <style jsx global>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    padding: 0;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    line-height: 1.4;
                }
                .custom-popup .leaflet-popup-tip {
                    background: white;
                }
                .leaflet-popup-close-button {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default TrackingMap;
