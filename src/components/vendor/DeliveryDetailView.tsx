// src/components/vendor/DeliveryDetailView.tsx
import React from 'react';
import { Delivery } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getStatusColor, getStatusText, formatDateTime } from '@/utils/utils.ts';
import WhatsAppShare from './WhatsAppShare';
import TrackingMap from '../map/TrackingMap';

interface DeliveryDetailViewProps {
    delivery: Delivery;
    onClose: () => void;
}

const DeliveryDetailView: React.FC<DeliveryDetailViewProps> = ({ delivery, onClose }) => {
    // Determine if a delivery can be canceled (only if not completed or already canceled)
    const canCancel = delivery.status !== 'completed' && delivery.status !== 'cancelled';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-secondary">Delivery Details</h2>
                <Button variant="outline" onClick={onClose}>
                    Back to List
                </Button>
            </div>

            {/* Status Card */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Tracking ID: {delivery.trackingId}</CardTitle>
                        <Badge className={getStatusColor(delivery.status)}>
                            {getStatusText(delivery.status)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-0">
                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="font-medium">{formatDateTime(delivery.createdAt)}</p>
                        </div>

                        {delivery.status === 'completed' && (
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="font-medium">{formatDateTime(delivery.updatedAt)}</p>
                            </div>
                        )}

                        {delivery.status === 'cancelled' && (
                            <div>
                                <p className="text-sm text-gray-500">Cancelled</p>
                                <p className="font-medium">{formatDateTime(delivery.updatedAt)}</p>
                            </div>
                        )}

                        {delivery.estimatedDeliveryTime && (
                            <div>
                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                <p className="font-medium">{formatDateTime(delivery.estimatedDeliveryTime)}</p>
                            </div>
                        )}
                    </div>

                    {delivery.status === 'in_progress' && (
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tracking Map */}
            {delivery.rider?.currentLocation && delivery.customer.location && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Live Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[300px]">
                        <TrackingMap
                            riderLocation={delivery.rider.currentLocation}
                            destinationLocation={delivery.customer.location}
                            isTracking={delivery.status === 'in_progress'}
                            height="300px"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Customer and Rider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{delivery.customer.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium">{delivery.customer.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Delivery Address</p>
                            <p className="font-medium">{delivery.customer.address}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Rider Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Rider Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {delivery.rider ? (
                            <>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{delivery.rider.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="font-medium">{delivery.rider.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">OTP</p>
                                    <p className="font-medium">{delivery.tracking.otp}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500">No rider assigned yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Package Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Package Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{delivery.package.description}</p>
                    </div>
                    {delivery.package.size && (
                        <div>
                            <p className="text-sm text-gray-500">Size</p>
                            <p className="font-medium capitalize">{delivery.package.size}</p>
                        </div>
                    )}
                    {delivery.package.specialInstructions && (
                        <div>
                            <p className="text-sm text-gray-500">Special Instructions</p>
                            <p className="font-medium">{delivery.package.specialInstructions}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* WhatsApp Sharing Component */}
            <WhatsAppShare delivery={delivery} />

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.open(`/track/${delivery.trackingId}`, '_blank')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            Track Package
                        </Button>

                        {canCancel && (
                            <Button variant="destructive">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Cancel Delivery
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => {
                                const url = `data:text/json;charset=utf-8,${encodeURIComponent(
                                    JSON.stringify(delivery, null, 2)
                                )}`;
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `delivery-${delivery.trackingId}.json`;
                                link.click();
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeliveryDetailView;