import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery } from '@/types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { formatDateTime } from '@/utils/utils';

interface DeliveryConfirmationProps {
    delivery: Delivery;
}

const DeliveryConfirmation: React.FC<DeliveryConfirmationProps> = ({ delivery }) => {
    const navigate = useNavigate();

    const handleTrackAnotherDelivery = () => {
        navigate('/track');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-secondary">Delivery Confirmed!</h1>
                <p className="text-gray-600 mt-2">
                    Thank you for confirming this delivery.
                </p>
            </div>

            <Card className="shadow-sm mb-6">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Tracking ID</h3>
                            <p className="font-bold">{delivery.tracking_id}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Package</h3>
                            <p>{delivery.package.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Delivery Date</h3>
                                <p>{formatDateTime(delivery.updated_at)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Delivered By</h3>
                                <p>{delivery.rider?.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-6">
                <p className="text-green-800">
                    A confirmation has been sent to the vendor.
                </p>
            </div>

            <div className="flex flex-col space-y-3">
                <Button
                    onClick={handleTrackAnotherDelivery}
                    variant="default"
                >
                    Track Another Delivery
                </Button>

                <Button
                    onClick={handleGoHome}
                    variant="outline"
                >
                    Return to Home
                </Button>
            </div>
        </div>
    );
};

export default DeliveryConfirmation;