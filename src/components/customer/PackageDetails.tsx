import React, { useState } from 'react';
import { Delivery } from '@/types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { formatDateTime } from '@/utils/utils.ts';
import { useDelivery } from '../../context/DeliveryContext';

interface PackageDetailsProps {
    delivery: Delivery;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ delivery }) => {
    const { completeDelivery, isLoading } = useDelivery();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(delivery.status === 'completed');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleConfirmReceipt = async () => {
        setShowConfirmation(true);
    };

    const confirmReceipt = async () => {
        try {
            const result = await completeDelivery(delivery.trackingId);
            if (result.success) {
                setIsConfirmed(true);
                setShowConfirmation(false);
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
        }
    };

    const cancelConfirmation = () => {
        setShowConfirmation(false);
    };

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

                    {showConfirmation && (
                        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                            <h3 className="font-bold text-yellow-800 mb-2">Confirm Package Receipt</h3>
                            <p className="text-sm text-yellow-800 mb-4">
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
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                    onClick={confirmReceipt}
                                    disabled={isLoading}
                                >
                                    Yes, I Received It
                                </Button>
                            </div>
                        </div>
                    )}

                    <CardFooter className="border-t flex justify-between bg-gray-50">
                        {!isConfirmed && delivery.status === 'in_progress' && (
                            <Button
                                variant="accent"
                                className="w-full"
                                onClick={handleConfirmReceipt}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Confirm Package Received'}
                            </Button>
                        )}

                        {isConfirmed && (
                            <div className="w-full text-center p-2 bg-green-50 text-green-700 rounded-md">
                                Package delivery confirmed! Thank you.
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