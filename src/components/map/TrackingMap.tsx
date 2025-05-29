import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
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

// Custom rider icon with animation
const createRiderIcon = () => {
    return L.divIcon({
        className: 'custom-rider-marker',
        html: `
            <div class="rider-marker-container">
                <div class="rider-marker-pulse"></div>
                <div class="rider-marker-dot">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" fill="#0CAA41"/>
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 4.1 13.6 3 12.1 3C10.6 3 9.4 4.1 9.2 5.5L3 7V9L9.2 7.5C9.2 7.7 9.2 7.8 9.2 8C9.2 8.3 9.3 8.6 9.4 8.9L12 22L14.6 8.9C14.7 8.6 14.8 8.3 14.8 8C14.8 7.8 14.8 7.7 14.8 7.5L21 9Z" fill="white"/>
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
                <div class="destination-marker-label">Customer</div>
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
                .destination-marker-label {
                    background-color: #FF9500;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: bold;
                    margin-top: -2px;
                    white-space: nowrap;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
        iconSize: [60, 60],
        iconAnchor: [30, 40],
    });
};

interface MapCenterUpdaterProps {
    center: [number, number];
}

// Helper component to update map center
const MapCenterUpdater: React.FC<MapCenterUpdaterProps> = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);

    return null;
};

interface TrackingMapProps {
    riderLocation?: Location;
    destinationLocation?: Location;
    isTracking: boolean;
    height?: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
                                                     riderLocation,
                                                     destinationLocation,
                                                     isTracking,
                                                     height = '400px'
                                                 }) => {
    const mapRef = useRef<L.Map | null>(null);

    // Default to Lagos, Nigeria if no locations provided
    const defaultCenter: [number, number] = [6.5244, 3.3792];
    const center = riderLocation
        ? [riderLocation.latitude, riderLocation.longitude] as [number, number]
        : defaultCenter;

    // Calculate bounds to fit all markers
    useEffect(() => {
        if (mapRef.current && riderLocation && destinationLocation) {
            const bounds = L.latLngBounds(
                [riderLocation.latitude, riderLocation.longitude],
                [destinationLocation.latitude, destinationLocation.longitude]
            );
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [riderLocation, destinationLocation]);

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

                {/* Rider location with accuracy circle */}
                {riderLocation && (
                    <>
                        <Marker
                            position={[riderLocation.latitude, riderLocation.longitude]}
                            icon={createRiderIcon()}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="font-semibold text-green-700 mb-1">🚴 Rider Location</div>
                                    <div className="text-sm space-y-1">
                                        <div>📍 {riderLocation.latitude.toFixed(6)}, {riderLocation.longitude.toFixed(6)}</div>
                                        {riderLocation.accuracy && (
                                            <div>🎯 Accuracy: ±{Math.round(riderLocation.accuracy)}m</div>
                                        )}
                                        {riderLocation.speed && riderLocation.speed > 0 && (
                                            <div>⚡ Speed: {(riderLocation.speed * 3.6).toFixed(1)} km/h</div>
                                        )}
                                        <div className="text-xs text-gray-600">
                                            Updated: {new Date(riderLocation.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Accuracy circle */}
                        {riderLocation.accuracy && riderLocation.accuracy < 100 && (
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
                        )}
                    </>
                )}

                {/* Destination location */}
                {destinationLocation && (
                    <Marker
                        position={[destinationLocation.latitude, destinationLocation.longitude]}
                        icon={createDestinationIcon()}
                    >
                        <Popup>
                            <div className="text-center">
                                <div className="font-semibold text-orange-700 mb-1">🏠 Delivery Destination</div>
                                <div className="text-sm">
                                    <div>📍 {destinationLocation.latitude.toFixed(6)}, {destinationLocation.longitude.toFixed(6)}</div>
                                    <div className="text-xs text-gray-600 mt-1">Customer's location</div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <MapCenterUpdater center={center} />
            </MapContainer>

            {/* Map legend - positioned to not interfere with zoom controls */}
            {(riderLocation || destinationLocation) && (
                <div className="absolute bottom-4 left-4 z-[1000]">
                    <div className="bg-white rounded-lg shadow-lg p-3 text-xs space-y-2">
                        {riderLocation && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <span>Rider</span>
                            </div>
                        )}
                        {destinationLocation && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <span>Customer</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackingMap;