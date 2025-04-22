import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';

// Fix for Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const riderIcon = new L.Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: 'pulse'
});

const destinationIcon = new L.Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

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
        <div style={{ height, width: '100%' }}>
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

                {riderLocation && (
                    <Marker
                        position={[riderLocation.latitude, riderLocation.longitude]}
                        icon={riderIcon}
                    >
                        <Popup>
                            Rider's current location
                            <br />
                            Updated: {new Date(riderLocation.timestamp).toLocaleTimeString()}
                        </Popup>
                    </Marker>
                )}

                {destinationLocation && (
                    <Marker
                        position={[destinationLocation.latitude, destinationLocation.longitude]}
                        icon={destinationIcon}
                    >
                        <Popup>
                            Delivery destination
                        </Popup>
                    </Marker>
                )}

                <MapCenterUpdater center={center} />
            </MapContainer>
        </div>
    );
};

export default TrackingMap;