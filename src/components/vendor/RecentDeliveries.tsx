// src/components/vendor/RecentDeliveries.tsx
import React from 'react';
import { Delivery } from '@/types';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { getStatusColor, getStatusText, formatDateTime, generateWhatsAppLink } from '@/utils/utils.ts';

interface RecentDeliveriesProps {
    deliveries: Delivery[];
    isLoading: boolean;
}

const RecentDeliveries: React.FC<RecentDeliveriesProps> = ({ deliveries, isLoading }) => {
    // Generate WhatsApp message for rider
    const handleShareWithRider = (delivery: Delivery) => {
        if (delivery.rider) {
            const message = `Hello ${delivery.rider.name}, you have a delivery to make. Track it here: ${delivery.tracking.rider_link} - Your OTP is: ${delivery.tracking.otp}`;
            const whatsappLink = generateWhatsAppLink(delivery.rider.phone_number, message);
            window.open(whatsappLink, '_blank');
        }
    };

    // Generate WhatsApp message for customer
    // const handleShareWithCustomer = (delivery: Delivery) => {
    //     const message = `Hello ${delivery.customer.name}, track your delivery here: ${delivery.tracking.customerLink}`;
    //     const whatsappLink = generateWhatsAppLink(delivery.customer.phoneNumber, message);
    //     window.open(whatsappLink, '_blank');
    // };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col gap-2 animate-pulse">
                                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (deliveries.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No deliveries found</p>
                    <Button className="mt-4" variant="outline">Create Your First Delivery</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                    {deliveries.map((delivery) => (
                        <div key={delivery.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(delivery.status)}>
                                            {getStatusText(delivery.status)}
                                        </Badge>
                                        <span className="text-sm text-gray-500">ID: {delivery.tracking_id}</span>
                                    </div>
                                    <h3 className="font-medium">{delivery.package.description}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>{delivery.customer.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDateTime(delivery.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/track/${delivery.tracking_id}`, '_blank')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        Track
                                    </Button>

                                    {delivery.rider && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                            onClick={() => handleShareWithRider(delivery)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            </svg>
                                            Rider
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentDeliveries;