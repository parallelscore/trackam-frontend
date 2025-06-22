import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
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

// Enhanced animation variants matching the dashboard components
const containerVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
        }
    }
};

const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -45 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 120
        }
    }
};

const legendVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
        }
    }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(16, 185, 129, 0)" },
    animate: {
        boxShadow: [
            "0 0 20px rgba(16, 185, 129, 0.3)",
            "0 0 40px rgba(16, 185, 129, 0.1)",
            "0 0 20px rgba(16, 185, 129, 0.3)"
        ],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
};

// Enhanced custom rider icon with better animations and styling
const createRiderIcon = (heading: number = 0) => {
    return L.divIcon({
        className: 'custom-rider-marker',
        html: `
            <div class="rider-marker-container">
                <div class="rider-marker-pulse"></div>
                <div class="rider-marker-dot">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 4.1 13.6 3 12.1 3C10.6 3 9.4 4.1 9.2 5.5L3 7V9L9.2 7.5C9.2 7.7 9.2 7.8 9.2 8C9.2 8.3 9.3 8.6 9.4 8.9L12 22L14.6 8.9C14.7 8.6 14.8 8.3 14.8 8C14.8 7.8 14.8 7.7 14.8 7.5L21 9Z" fill="#10B981"/>
                    </svg>
                </div>
                <div class="direction-arrow" style="transform: rotate(${heading}deg)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L22 12L12 22V16H2V8H12V2Z" fill="#10B981"/>
                    </svg>
                </div>
                <div class="rider-marker-sparkles">
                    <div class="sparkle sparkle-1"></div>
                    <div class="sparkle sparkle-2"></div>
                    <div class="sparkle sparkle-3"></div>
                </div>
            </div>
            <style>
                .rider-marker-container {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .rider-marker-pulse {
                    position: absolute;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4));
                    animation: pulse-rider 2.5s infinite ease-in-out;
                    backdrop-filter: blur(8px);
                }
                .rider-marker-dot {
                    position: relative;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ffffff, #f8fafc);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1);
                    z-index: 10;
                    border: 2px solid rgba(16, 185, 129, 0.3);
                    backdrop-filter: blur(12px);
                }
                .direction-arrow {
                    position: absolute;
                    top: -6px;
                    right: -2px;
                    background: linear-gradient(135deg, #ffffff, #f8fafc);
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 12px rgba(16, 185, 129, 0.3), 0 1px 4px rgba(0, 0, 0, 0.1);
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    z-index: 11;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    backdrop-filter: blur(8px);
                }
                .rider-marker-sparkles {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .sparkle {
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    background: linear-gradient(45deg, #10B981, #34D399);
                    border-radius: 50%;
                    opacity: 0;
                    animation: sparkle 3s infinite ease-in-out;
                }
                .sparkle-1 {
                    top: 8px;
                    left: 8px;
                    animation-delay: 0s;
                }
                .sparkle-2 {
                    top: 8px;
                    right: 8px;
                    animation-delay: 1s;
                }
                .sparkle-3 {
                    bottom: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    animation-delay: 2s;
                }
                @keyframes pulse-rider {
                    0% {
                        transform: scale(0.85);
                        opacity: 0.9;
                    }
                    50% {
                        transform: scale(1.15);
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(0.85);
                        opacity: 0.9;
                    }
                }
                @keyframes sparkle {
                    0%, 100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            </style>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });
};

// Enhanced destination icon with better styling
const createDestinationIcon = () => {
    return L.divIcon({
        className: 'custom-destination-marker',
        html: `
            <div class="destination-marker-container">
                <div class="destination-marker-pin">
                    <svg width="36" height="44" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="destGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#FF6B35"/>
                                <stop offset="100%" style="stop-color:#F7931E"/>
                            </linearGradient>
                        </defs>
                        <path d="M12 0C18.627 0 24 5.373 24 12C24 18.627 12 29 12 29S0 18.627 0 12C0 5.373 5.373 0 12 0Z" fill="url(#destGradient)"/>
                        <circle cx="12" cy="12" r="7" fill="white" opacity="0.95"/>
                        <svg x="7" y="7" width="10" height="10" viewBox="0 0 24 24" fill="url(#destGradient)">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                    </svg>
                </div>
                <div class="destination-glow"></div>
            </div>
            <style>
                .destination-marker-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .destination-marker-pin {
                    filter: drop-shadow(0 4px 12px rgba(255, 107, 53, 0.4));
                    animation: bounce-destination 2.5s infinite ease-in-out;
                    z-index: 10;
                }
                .destination-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 60px;
                    height: 60px;
                    background: radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%);
                    border-radius: 50%;
                    animation: glow-pulse 2s infinite ease-in-out;
                    z-index: 1;
                }
                @keyframes bounce-destination {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    40% {
                        transform: translateY(-8px) scale(1.05);
                    }
                    60% {
                        transform: translateY(-4px) scale(1.02);
                    }
                }
                @keyframes glow-pulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                }
            </style>
        `,
        iconSize: [72, 44],
        iconAnchor: [36, 44],
    });
};

// Enhanced starting point icon
const createStartingPointIcon = () => {
    return L.divIcon({
        className: 'custom-start-marker',
        html: `
            <div class="start-marker-container">
                <div class="start-marker-pulse"></div>
                <div class="start-marker-dot"></div>
                <div class="start-marker-ring"></div>
            </div>
            <style>
                .start-marker-container {
                    position: relative;
                    width: 24px;
                    height: 24px;
                }
                .start-marker-dot {
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    width: 12px;
                    height: 12px;
                    background: linear-gradient(135deg, #1A2C56, #3B4C74);
                    border-radius: 50%;
                    z-index: 3;
                    box-shadow: 0 2px 8px rgba(26, 44, 86, 0.4);
                }
                .start-marker-pulse {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(26, 44, 86, 0.6) 0%, transparent 70%);
                    animation: pulse-start 2s infinite ease-in-out;
                    z-index: 1;
                }
                .start-marker-ring {
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(26, 44, 86, 0.4);
                    border-radius: 50%;
                    animation: ring-expand 3s infinite ease-in-out;
                    z-index: 2;
                }
                @keyframes pulse-start {
                    0% {
                        transform: scale(0.7);
                        opacity: 0.9;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.4;
                    }
                    100% {
                        transform: scale(0.7);
                        opacity: 0.9;
                    }
                }
                @keyframes ring-expand {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 0.3;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                }
            </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
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
                <Popup closeButton={false} className="custom-popup enhanced-popup">
                    <div className="p-4 min-w-[200px] bg-gradient-to-br from-emerald-50 to-green-50">
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 4.1 13.6 3 12.1 3C10.6 3 9.4 4.1 9.2 5.5L3 7V9L9.2 7.5C9.2 7.7 9.2 7.8 9.2 8C9.2 8.3 9.3 8.6 9.4 8.9L12 22L14.6 8.9C14.7 8.6 14.8 8.3 14.8 8C14.8 7.8 14.8 7.7 14.8 7.5L21 9Z" fill="white"/>
                                </svg>
                            </motion.div>
                            <h3 className="font-bold text-emerald-800 text-lg">🚴 Rider Location</h3>
                        </div>

                        <div className="space-y-3 text-sm">
                            <motion.div
                                className="flex items-center gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="text-lg">📍</span>
                                <span className="text-gray-700 font-mono text-xs">
                                    {riderLocation.latitude.toFixed(6)}, {riderLocation.longitude.toFixed(6)}
                                </span>
                            </motion.div>

                            {riderLocation.accuracy && (
                                <motion.div
                                    className="flex items-center gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <span className="text-lg">🎯</span>
                                    <span className="text-gray-700 font-semibold">±{Math.round(riderLocation.accuracy)}m accuracy</span>
                                </motion.div>
                            )}

                            <motion.div
                                className="flex items-center gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="text-lg">🕒</span>
                                <span className="text-gray-700 font-medium">
                                    {new Date(riderLocation.timestamp).toLocaleTimeString()}
                                </span>
                            </motion.div>
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
                    color: '#10B981',
                    fillColor: '#10B981',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '5, 5'
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
                <Popup closeButton={false} className="custom-popup enhanced-popup">
                    <div className="p-4 min-w-[220px] bg-gradient-to-br from-orange-50 to-amber-50">
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="white"/>
                                </svg>
                            </motion.div>
                            <h3 className="font-bold text-orange-800 text-lg">🏠 Destination</h3>
                        </div>

                        <div className="space-y-3 text-sm">
                            <motion.div
                                className="flex items-center gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="text-lg">👤</span>
                                <span className="text-gray-800 font-semibold">{delivery.customer.name}</span>
                            </motion.div>

                            <motion.div
                                className="flex items-center gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-lg">📞</span>
                                <span className="text-gray-700 font-mono text-xs">{delivery.customer.phone_number}</span>
                            </motion.div>

                            <motion.div
                                className="flex items-start gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="text-lg">📍</span>
                                <span className="text-gray-700 text-xs leading-relaxed font-medium">
                                    {delivery.customer.address}
                                </span>
                            </motion.div>
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
                <Popup closeButton={false} className="custom-popup enhanced-popup">
                    <div className="p-4 min-w-[200px] bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                                    <path d="M2 17L12 22L22 17" fill="white"/>
                                    <path d="M2 12L12 17L22 12" fill="white"/>
                                </svg>
                            </motion.div>
                            <h3 className="font-bold text-blue-800 text-lg">🏁 Starting Point</h3>
                        </div>

                        <div className="space-y-3 text-sm">
                            <motion.div
                                className="flex items-center gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="text-lg">📍</span>
                                <span className="text-gray-700 font-mono text-xs">
                                    {startingPoint.latitude.toFixed(6)}, {startingPoint.longitude.toFixed(6)}
                                </span>
                            </motion.div>

                            <motion.div
                                className="flex items-center gap-3 p-2 bg-white/70 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-lg">🕒</span>
                                <span className="text-gray-700 font-medium">
                                    Started at {new Date(startingPoint.timestamp).toLocaleTimeString()}
                                </span>
                            </motion.div>
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
                    color: '#10B981',
                    weight: 5,
                    opacity: 0.9,
                    dashArray: '10, 15',
                    lineCap: 'round',
                    lineJoin: 'round',
                    className: 'animated-path'
                }}
            >
                <Popup closeButton={false} className="custom-popup enhanced-popup">
                    <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50">
                        <div className="flex items-center gap-3 mb-3">
                            <motion.div
                                className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </motion.div>
                            <span className="font-bold text-emerald-800">🚴 Rider's Trail</span>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div className="flex items-center gap-2">
                                <span>📍</span>
                                <span className="font-semibold">{pathCoordinates.length} tracking points</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📏</span>
                                <span>Live journey path</span>
                            </div>
                        </div>
                    </div>
                </Popup>
            </Polyline>
        );
    }, [isTracking, pathCoordinates]);

    return (
        <motion.div
            style={{ height, width: '100%' }}
            className="relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Enhanced background with floating particles */}
            <div className="absolute inset-0 -z-10">
                {/* Floating particles around the map */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20"
                        style={{
                            left: `${10 + i * 12}%`,
                            top: `${8 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -25, 0],
                            x: [0, 12, 0],
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 5 + i * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.6
                        }}
                    />
                ))}
            </div>

            {/* Enhanced map container with glow effect */}
            <motion.div
                className="h-full w-full relative"
                variants={glowEffect}
                initial="initial"
                animate="animate"
                whileHover={{
                    scale: 1.001,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
            >
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-0.5 z-0">
                    <div className="bg-white rounded-2xl h-full w-full" />
                </div>

                <div className="relative z-10 h-full w-full rounded-2xl overflow-hidden backdrop-blur-sm">
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        whenCreated={(map) => {
                            mapRef.current = map;
                        }}
                        className="rounded-2xl"
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
                </div>
            </motion.div>

            {/* Enhanced Map Controls - Bottom Right */}
            <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
                {/* Recenter Button */}
                <motion.div
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                >
                    <motion.button
                        onClick={handleRecenter}
                        className={`bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-4 border border-gray-200/50 hover:bg-white transition-all duration-300 group ${
                            shouldRecenter ? 'bg-emerald-50 border-emerald-300 shadow-emerald-500/20' : 'hover:shadow-xl'
                        }`}
                        title="Recenter map to show rider and destination"
                        disabled={shouldRecenter}
                        whileHover={{
                            scale: 1.05,
                            y: -2,
                            boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)"
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Button glow effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={false}
                        />

                        <motion.svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`${shouldRecenter ? 'text-emerald-600' : 'text-gray-700 group-hover:text-emerald-600'} transition-colors duration-300 relative z-10`}
                            animate={shouldRecenter ? { rotate: 360 } : {}}
                            transition={{
                                duration: shouldRecenter ? 1 : 0,
                                repeat: shouldRecenter ? Infinity : 0,
                                ease: "linear"
                            }}
                        >
                            <path
                                d="M12 2L12 6M12 18L12 22M22 12L18 12M6 12L2 12M20.485 20.485L17.657 17.657M6.343 6.343L3.515 3.515M20.485 3.515L17.657 6.343M6.343 17.657L3.515 20.485"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" />
                        </motion.svg>

                        {/* Floating particles inside button */}
                        {!shouldRecenter && [...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-emerald-400/40 rounded-full opacity-0 group-hover:opacity-100"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: `${15 + i * 20}%`,
                                }}
                                animate={{
                                    y: [0, -8, 0],
                                    opacity: [0.4, 0.8, 0.4],
                                    scale: [1, 1.3, 1]
                                }}
                                transition={{
                                    duration: 1.5 + i * 0.3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </motion.button>
                </motion.div>
            </div>

            {/* Enhanced Collapsible Map Legend - Mobile Optimized */}
            {(riderLocation || destinationLocation || pathHistory.length > 0) && (
                <div className="absolute bottom-4 left-4 z-[1000] md:bottom-6 md:left-6">
                    {/* Toggle Button */}
                    <motion.button
                        onClick={() => setIsLegendOpen(!isLegendOpen)}
                        className="bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl p-2 mb-2 flex items-center gap-2 border border-gray-200/50 hover:bg-white transition-all duration-300 group md:p-3 md:mb-3 md:gap-3 md:rounded-xl"
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.7 }}
                        whileHover={{
                            scale: 1.02,
                            y: -1,
                            boxShadow: "0 15px 30px rgba(16, 185, 129, 0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Button glow effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={false}
                        />

                        <motion.svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`transition-all duration-300 text-gray-700 group-hover:text-emerald-600 relative z-10 md:w-5 md:h-5 ${isLegendOpen ? 'rotate-180' : ''}`}
                            animate={{ rotate: isLegendOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </motion.svg>
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors duration-300 relative z-10 md:text-sm">
                            Legend
                        </span>
                    </motion.button>

                    {/* Legend Content - Mobile Optimized */}
                    <AnimatePresence>
                        {isLegendOpen && (
                            <motion.div
                                variants={legendVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl p-3 text-xs space-y-2 border border-gray-200/50 w-44 md:w-52 md:p-4 md:text-sm md:space-y-3 md:rounded-xl"
                            >
                                <div className="font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200/50 flex items-center gap-1.5 md:mb-3 md:pb-2 md:gap-2">
                                    <motion.div
                                        className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded md:w-4 md:h-4"
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="text-xs md:text-sm">Map Legend</span>
                                </div>

                                {riderLocation && (
                                    <motion.div
                                        className="flex items-center gap-2 p-1.5 bg-emerald-50/50 rounded hover:bg-emerald-50 transition-colors duration-200 md:gap-3 md:p-2 md:rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center relative md:w-4 md:h-4">
                                            <div className="w-1 h-1 bg-white rounded-full md:w-1.5 md:h-1.5"></div>
                                            <motion.div
                                                className="absolute inset-0 border border-emerald-400 rounded-full md:border-2"
                                                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </div>
                                        <span className="text-gray-700 font-medium text-xs md:text-sm">Rider</span>
                                    </motion.div>
                                )}

                                {destinationLocation && (
                                    <motion.div
                                        className="flex items-center gap-2 p-1.5 bg-orange-50/50 rounded hover:bg-orange-50 transition-colors duration-200 md:gap-3 md:p-2 md:rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-sm flex items-center justify-center relative md:w-4 md:h-4">
                                            <div className="w-1 h-1 bg-white rounded-full md:w-1.5 md:h-1.5"></div>
                                            <motion.div
                                                animate={{ y: [-1, 0, -1] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-orange-500 rounded-full md:-top-1 md:w-1 md:h-1.5"
                                            />
                                        </div>
                                        <span className="text-gray-700 font-medium text-xs md:text-sm">Customer</span>
                                    </motion.div>
                                )}

                                {startingPoint && pathHistory.length > 3 && (
                                    <motion.div
                                        className="flex items-center gap-2 p-1.5 bg-blue-50/50 rounded hover:bg-blue-50 transition-colors duration-200 md:gap-3 md:p-2 md:rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-sm flex items-center justify-center relative md:w-4 md:h-4">
                                            <div className="w-1 h-1 bg-white rounded-full md:w-1.5 md:h-1.5"></div>
                                            <motion.div
                                                className="absolute inset-0 border border-blue-400 rounded-sm"
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            />
                                        </div>
                                        <span className="text-gray-700 font-medium text-xs md:text-sm">Start</span>
                                    </motion.div>
                                )}

                                {pathHistory.length > 0 && (
                                    <motion.div
                                        className="flex items-center gap-2 p-1.5 bg-emerald-50/50 rounded hover:bg-emerald-50 transition-colors duration-200 md:gap-3 md:p-2 md:rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <div className="relative">
                                            <div className="w-3 h-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full md:w-4 md:h-1" style={{borderStyle: 'dashed'}}></div>
                                            <motion.div
                                                className="absolute top-0 left-0 w-1 h-0.5 bg-emerald-300 rounded-full md:w-1.5 md:h-1"
                                                animate={{ x: [0, 8, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                        </div>
                                        <span className="text-gray-700 font-medium text-xs md:text-sm">Trail ({pathHistory.length})</span>
                                    </motion.div>
                                )}

                                <motion.div
                                    className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200/50 flex items-center gap-1.5 md:mt-3 md:pt-3 md:gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-xs"
                                    >
                                        💡
                                    </motion.span>
                                    <span className="text-xs">Tap markers for info</span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Enhanced custom styles for popups and animations */}
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 16px;
                    padding: 0;
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    line-height: 1.4;
                }
                .custom-popup .leaflet-popup-tip {
                    background: white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .leaflet-popup-close-button {
                    display: none !important;
                }
                .enhanced-popup .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .animated-path {
                    filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
                }

                /* Enhanced map container animations */
                .leaflet-container {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                }

                /* Floating animation for map controls */
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                }

                /* Subtle pulse animation */
                @keyframes subtle-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </motion.div>
    );
};

export default TrackingMap;