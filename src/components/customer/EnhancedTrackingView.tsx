import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery, Location } from '@/types';
import { useDelivery } from '../../context/DeliveryContext';
import { useWebSocket } from '../../context/WebSocketContext';
import TrackingMap from '../map/TrackingMap';
import DeliveryStatusHeader from '../customer/DeliveryStatusHeader';
import PackageDetails from '../customer/PackageDetails';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { calculateDistance } from '@/utils/utils.ts';

interface EnhancedTrackingViewProps {
    delivery: Delivery;
    onRefresh: () => Promise<void>;
}

const EnhancedTrackingView: React.FC<EnhancedTrackingViewProps> = ({ delivery, onRefresh }) => {
    const navigate = useNavigate();
    const { completeDelivery, isLoading } = useDelivery();
    const { connectToDelivery, disconnectFromDelivery, isConnected, lastMessage } = useWebSocket();
    const [riderLocation, setRiderLocation] = useState<Location | undefined>(
        delivery.rider?.current_location
    );
    const [estimatedTime, setEstimatedTime] = useState<string | undefined>(undefined);
    const [distance, setDistance] = useState<number | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deliveryCompleted, setDeliveryCompleted] = useState(delivery.status === 'completed');

    // Connect to WebSocket when delivery is being tracked
    useEffect(() => {
        if (delivery.tracking_id && delivery.status === 'in_progress') {
            connectToDelivery(delivery.tracking_id);
        }

        return () => {
            disconnectFromDelivery();
        };
    }, [delivery.tracking_id, delivery.status]);

    // Process websocket messages
    useEffect(() => {
        if (!lastMessage) return;

        try {
            const data = JSON.parse(lastMessage);

            // Handle location updates
            if (data.type === 'location_update' && data.location) {
                setRiderLocation(data.location);
            }

            // Handle status updates
            if (data.type === 'status_update' || data.type === 'delivery_confirmation') {
                onRefresh();

                if (data.status === 'completed') {
                    setDeliveryCompleted(true);
                }
            }
        } catch (e) {
            console.error('Error processing WebSocket message:', e);
        }
    }, [lastMessage, onRefresh]);

    // Calculate estimated time and distance
    useEffect(() => {
        if (riderLocation && delivery.customer.location) {
            // Use the imported calculateDistance function
            const dist = calculateDistance(
                riderLocation.latitude,
                riderLocation.longitude,
                delivery.customer.location.latitude,
                delivery.customer.location.longitude
            );

            setDistance(dist);

            // Calculate estimated time
            const speedKmh = 25; // Assume average speed of 25 km/h
            const timeMinutes = Math.ceil((dist / speedKmh) * 60);

            if (timeMinutes < 1) {
                setEstimatedTime('Less than a minute');
            } else if (timeMinutes < 60) {
                setEstimatedTime(`${timeMinutes} minute${timeMinutes > 1 ? 's' : ''}`);
            } else {
                const hours = Math.floor(timeMinutes / 60);
                const minutes = timeMinutes % 60;
                setEstimatedTime(
                    `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
                );
            }
        } else {
            setEstimatedTime(undefined);
            setDistance(null);
        }
    }, [riderLocation, delivery.customer.location]);

    const handleConfirmReceipt = () => {
        setShowConfirmation(true);
    };

    const confirmReceipt = async () => {
        try {
            // Update to use tracking_id instead of trackingId
            const result = await completeDelivery(delivery.tracking_id);
            if (result.success) {
                setDeliveryCompleted(true);
                setShowConfirmation(false);
                onRefresh();

                // Redirect to confirmation page after a delay
                setTimeout(() => {
                    navigate(`/delivery-confirmed/${delivery.tracking_id}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
        }
    };

    const cancelConfirmation = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="space-y-6">
            <DeliveryStatusHeader
                delivery={delivery}
                estimatedTime={estimatedTime}
            />

            {(delivery.status === 'in_progress' && deliveryCompleted) && (
                <Alert variant="success">
                    <AlertTitle className="font-bold">Delivery Confirmed!</AlertTitle>
                    <AlertDescription>
                        This delivery has been successfully completed. Thank you for using TrackAm!
                    </AlertDescription>
                </Alert>
            )}

            {/* Real-time connection indicator */}
            {isConnected && delivery.status === 'in_progress' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-2 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-sm text-green-700">Real-time tracking active</p>
                </div>
            )}

            <div className="rounded-lg overflow-hidden border h-[400px]">
                <TrackingMap
                    riderLocation={riderLocation}
                    destinationLocation={delivery.customer.location}
                    isTracking={delivery.status === 'in_progress'}
                    height="400px"
                />
            </div>

            {/* Distance Information */}
            {distance !== null && delivery.status === 'in_progress' && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium">Distance to You</h3>
                                <p className="text-2xl font-bold text-secondary">{distance.toFixed(1)} km</p>
                            </div>
                            {estimatedTime && (
                                <div className="text-right">
                                    <h3 className="text-sm font-medium">Estimated Arrival</h3>
                                    <p className="text-2xl font-bold text-primary">{estimatedTime}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Package Details with confirmation button */}
            <div className="relative">
                <PackageDetails delivery={delivery} />

                {showConfirmation && (
                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 z-10 rounded-lg backdrop-blur-sm">
                        <h3 className="font-bold text-lg mb-2">Confirm Package Receipt</h3>
                        <p className="text-center mb-6">
                            Are you sure you have received the package? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={cancelConfirmation}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmReceipt}
                                disabled={isLoading}
                            >
                                Yes, I Received It
                            </Button>
                        </div>
                    </div>
                )}

                {delivery.status === 'in_progress' && !deliveryCompleted && !showConfirmation && (
                    <div className="mt-4">
                        <Button
                            variant="accent"
                            className="w-full"
                            onClick={handleConfirmReceipt}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Package Received'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-medium">Need Help?</h3>
                    <p className="text-sm text-gray-600">Contact our support team</p>
                </div>
                <a
                    href="tel:+2348001234567"
                    className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                >
                    Call Support
                </a>
            </div>
        </div>
    );
};

export default EnhancedTrackingView;
