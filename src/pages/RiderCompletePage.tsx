import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useDelivery } from '../context/DeliveryContext';
import { useRider } from '../context/RiderContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatDateTime } from '../utils/utils';

const RiderCompletePage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const navigate = useNavigate();
    const { getDeliveryByTrackingId } = useDelivery();
    const { currentDelivery, setCurrentDelivery, isLoading } = useRider();
    const [loadingDelivery, setLoadingDelivery] = useState(true);

    useEffect(() => {
        const fetchDelivery = async () => {
            if (trackingId) {
                setLoadingDelivery(true);
                const delivery = await getDeliveryByTrackingId(trackingId);
                if (delivery) {
                    setCurrentDelivery(delivery);
                }
                setLoadingDelivery(false);
            }
        };

        // If we don't have current delivery or it's the wrong one, fetch it
        if (!currentDelivery || currentDelivery.tracking_id !== trackingId) {
            fetchDelivery();
        } else {
            setLoadingDelivery(false);
        }
    }, [trackingId, getDeliveryByTrackingId, currentDelivery, setCurrentDelivery]);

    const handleFindNewDelivery = () => {
        // This would typically navigate to a rider dashboard where they can see available deliveries
        // For now, just go to the home page
        navigate('/');
    };

    if (loadingDelivery || isLoading) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!currentDelivery) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-red-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="mt-2">Delivery not found</p>
                            </div>
                            <Button onClick={() => navigate('/')}>Return to Home</Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    // Check if delivery is actually completed
    if (currentDelivery.status !== 'completed') {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-yellow-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <p className="mt-2">This delivery is not completed yet</p>
                            </div>
                            <Button onClick={() => navigate(`/rider/${trackingId}`)}>Return to Tracking</Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-secondary">Delivery Completed!</h1>
                    <p className="text-gray-600 mt-2">
                        You have successfully delivered the package to the customer.
                    </p>
                </div>

                <Card className="shadow-md mb-6">
                    <CardHeader className="border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle>Delivery Summary</CardTitle>
                            <Badge className="bg-green-600">Completed</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Tracking ID</h3>
                            <p className="font-bold">{currentDelivery.tracking_id}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                            <p>{currentDelivery.customer.name}</p>
                            <p className="text-sm text-gray-500">{currentDelivery.customer.address}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Package</h3>
                            <p>{currentDelivery.package.description}</p>
                            {currentDelivery.package.size && (
                                <p className="text-sm text-gray-500">Size: {currentDelivery.package.size}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                                <p>{formatDateTime(currentDelivery.created_at)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                                <p>{formatDateTime(currentDelivery.updated_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Button
                        onClick={handleFindNewDelivery}
                        className="w-full max-w-xs bg-primary"
                    >
                        Find New Delivery
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

export default RiderCompletePage;