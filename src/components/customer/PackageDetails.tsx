import React, { useState } from 'react';
import { Delivery } from '@/types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { formatDateTime } from '@/utils/utils.ts';
import DeliveryConfirmation from './DeliveryConfirmation';
import DeliveryComplete from './DeliveryComplete';

interface EnhancedPackageDetailsProps {
    delivery: Delivery;
}

const PackageDetails: React.FC<EnhancedPackageDetailsProps> = ({ delivery }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(delivery.status === 'completed');
    const [showCompletionScreen, setShowCompletionScreen] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleConfirmReceipt = async () => {
        setShowConfirmation(true);
    };

    const handleConfirmationComplete = () => {
        setShowConfirmation(false);
        setIsConfirmed(true);
        setShowCompletionScreen(true);
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    const handleCloseCompletionScreen = () => {
        setShowCompletionScreen(false);
    };

    // If showing the confirmation modal
    if (showConfirmation) {
        return (
            <DeliveryConfirmation
                delivery={delivery}
                onConfirmed={handleConfirmationComplete}
                onCancel={handleCancelConfirmation}
            />
        );
    }

    // If showing the completion screen
    if (showCompletionScreen) {
        return (
            <DeliveryComplete
                delivery={delivery}
                onClose={handleCloseCompletionScreen}
            />
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className={`cursor-pointer ${isExpanded ? 'border-b' : ''}`} onClick={toggleExpand}>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Package Details</CardTitle>
                    <div className="text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <>
                    <CardContent className="space-y-4 py-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Tracking ID</h3>
                            <p className="font-bold">{delivery.trackingId}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Package Description</h3>
                            <p>{delivery.package.description}</p>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-600">Created</h3>
                                <p className="text-sm">{formatDateTime(delivery.createdAt)}</p>
                            </div>
                            {delivery.estimatedDeliveryTime && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">Estimated Delivery</h3>
                                    <p className="text-sm">{formatDateTime(delivery.estimatedDeliveryTime)}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Delivery Address</h3>
                            <p>{delivery.customer.address}</p>
                        </div>
                    </CardContent>

                    <CardFooter className="border-t flex justify-between bg-gray-50">
                        {!isConfirmed && delivery.status === 'in_progress' && (
                            <Button
                                variant="accent"
                                className="w-full"
                                onClick={handleConfirmReceipt}
                            >
                                Confirm Package Received
                            </Button>
                        )}

                        {isConfirmed && (
                            <div className="w-full text-center p-2 bg-green-50 text-green-700 rounded-md">
                                <div className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Package delivery confirmed!</span>
                                </div>
                            </div>
                        )}

                        {delivery.status !== 'in_progress' && !isConfirmed && (
                            <div className="w-full text-center p-2 bg-gray-100 text-gray-600 rounded-md">
                                {delivery.status === 'completed'
                                    ? 'This delivery has been completed.'
                                    : 'Waiting for delivery to start...'}
                            </div>
                        )}
                    </CardFooter>
                </>
            )}
        </Card>
    );
};

export default PackageDetails;