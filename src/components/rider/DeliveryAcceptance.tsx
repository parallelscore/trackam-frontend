import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { getStatusColor, getStatusText, formatDateTime } from '@/utils/utils';

interface DeliveryAcceptanceProps {
    delivery: Delivery;
    onAccept: () => Promise<void>;
    onDecline: () => void;
}

const DeliveryAcceptance: React.FC<DeliveryAcceptanceProps> = ({ delivery, onAccept, onDecline }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
    const [showDeclineConfirmation, setShowDeclineConfirmation] = useState(false);

    const handleAcceptClick = () => {
        setShowAcceptConfirmation(true);
    };

    const handleDeclineClick = () => {
        setShowDeclineConfirmation(true);
    };

    const handleConfirmAccept = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await onAccept();
            // Navigate to rider verification page
            navigate(`/rider/${delivery.trackingId}`);
        } catch (err) {
            console.error('Error accepting delivery:', err);
            setError('Failed to accept delivery. Please try again.');
        } finally {
            setIsLoading(false);
            setShowAcceptConfirmation(false);
        }
    };

    const handleConfirmDecline = () => {
        onDecline();
        setShowDeclineConfirmation(false);
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-2">
                <Badge className={getStatusColor(delivery.status)}>
                    {getStatusText(delivery.status)}
                </Badge>
                <h1 className="text-2xl font-bold text-secondary mt-2">New Delivery Request</h1>
                <p className="text-gray-600">
                    Review the details below and choose to accept or decline
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Package Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Description</h3>
                        <p className="font-medium">{delivery.package.description}</p>
                    </div>

                    {delivery.package.size && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Size</h3>
                            <p className="capitalize">{delivery.package.size}</p>
                        </div>
                    )}

                    {delivery.package.specialInstructions && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Special Instructions</h3>
                            <p className="italic">{delivery.package.specialInstructions}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Created</h3>
                        <p>{formatDateTime(delivery.createdAt)}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Name</h3>
                        <p className="font-medium">{delivery.customer.name}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Phone Number</h3>
                        <p>{delivery.customer.phoneNumber}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Delivery Address</h3>
                        <p>{delivery.customer.address}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Vendor Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Name</h3>
                        <p className="font-medium">{delivery.vendor.name}</p>
                    </div>
                </CardContent>
            </Card>

            {showAcceptConfirmation ? (
                <Card className="border-primary">
                    <CardContent className="pt-6">
                        <AlertTitle className="font-bold text-center mb-2">Confirm Acceptance</AlertTitle>
                        <AlertDescription className="text-center mb-4">
                            Are you sure you want to accept this delivery?
                        </AlertDescription>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowAcceptConfirmation(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleConfirmAccept}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Yes, Accept Delivery'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : showDeclineConfirmation ? (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <AlertTitle className="font-bold text-center mb-2">Confirm Decline</AlertTitle>
                        <AlertDescription className="text-center mb-4">
                            Are you sure you want to decline this delivery?
                        </AlertDescription>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowDeclineConfirmation(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleConfirmDecline}
                            >
                                Yes, Decline
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleDeclineClick}
                    >
                        Decline
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={handleAcceptClick}
                    >
                        Accept Delivery
                    </Button>
                </div>
            )}

            <div className="text-center text-sm text-gray-500">
                By accepting, you agree to deliver this package to the specified address in a timely manner.
            </div>
        </div>
    );
};

export default DeliveryAcceptance;