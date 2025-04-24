// src/components/customer/DeliveryComplete.tsx
import React from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Delivery } from '@/types';
import { formatDateTime } from '@/utils/utils.ts';
import { Badge } from '../ui/badge';

interface DeliveryCompleteProps {
    delivery: Delivery;
    onClose: () => void;
}

const DeliveryComplete: React.FC<DeliveryCompleteProps> = ({
                                                               delivery,
                                                               onClose
                                                           }) => {
    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center bg-green-50">
                <CardTitle className="text-xl text-green-800">Delivery Completed</CardTitle>
            </CardHeader>

            <CardContent className="p-6">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-lg mt-4">Package Delivered Successfully!</h3>
                    <p className="text-gray-600 mt-2">
                        Thank you for using TrackAm for your delivery needs.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-secondary">Delivery Details</h4>
                        <div className="mt-2 space-y-2">
                            <p className="flex justify-between">
                                <span className="text-gray-600">Tracking ID:</span>
                                <span className="font-medium">{delivery.trackingId}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <Badge className="bg-green-600">Completed</Badge>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Delivered On:</span>
                                <span className="font-medium">{formatDateTime(delivery.updatedAt)}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Rider:</span>
                                <span className="font-medium">{delivery.rider?.name || 'N/A'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-secondary">Package</h4>
                        <div className="mt-2 space-y-2">
                            <p className="flex justify-between">
                                <span className="text-gray-600">Description:</span>
                                <span className="font-medium">{delivery.package.description}</span>
                            </p>
                            {delivery.package.size && (
                                <p className="flex justify-between">
                                    <span className="text-gray-600">Size:</span>
                                    <span className="font-medium capitalize">{delivery.package.size}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-center p-6 bg-gray-50">
                <Button
                    className="bg-primary w-full"
                    onClick={onClose}
                >
                    Close
                </Button>
            </CardFooter>
        </Card>
    );
};

export default DeliveryComplete;