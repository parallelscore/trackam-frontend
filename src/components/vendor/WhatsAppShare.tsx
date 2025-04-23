// src/components/vendor/WhatsAppShare.tsx
import React, { useState } from 'react';
import { Delivery } from '@/types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { generateWhatsAppLink } from '@/utils/utils.ts';
import QRCode from 'react-qr-code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface WhatsAppShareProps {
    delivery: Delivery;
}

const WhatsAppShare: React.FC<WhatsAppShareProps> = ({ delivery }) => {
    const [activeTab, setActiveTab] = useState<'rider' | 'customer'>('rider');
    const [copied, setCopied] = useState<'rider' | 'customer' | null>(null);

    // Generate messages for rider and customer
    const riderMessage = `Hello ${delivery.rider?.name}, you have a new delivery to make for ${delivery.customer.name}. 

Use this link to track the delivery: ${delivery.tracking.riderLink}

Your OTP code is: ${delivery.tracking.otp}

Package: ${delivery.package.description}
Delivery Address: ${delivery.customer.address}

Thank you for your service!`;

    const customerMessage = `Hello ${delivery.customer.name}, 

Your delivery of "${delivery.package.description}" is on its way!

Track your delivery in real-time using this link: ${delivery.tracking.customerLink}

Your rider's name is ${delivery.rider?.name} and they will contact you when they're close.

Thank you for choosing our service!`;

    // Generate WhatsApp links
    const riderWhatsAppLink = delivery.rider ? generateWhatsAppLink(delivery.rider.phoneNumber, riderMessage) : '';
    const customerWhatsAppLink = generateWhatsAppLink(delivery.customer.phoneNumber, customerMessage);

    // Copy message to clipboard
    const copyToClipboard = (text: string, type: 'rider' | 'customer') => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    // Share via WhatsApp
    const shareViaWhatsApp = (link: string) => {
        window.open(link, '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Share Tracking Information</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="rider" className="w-full" onValueChange={(value) => setActiveTab(value as 'rider' | 'customer')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="rider">Share with Rider</TabsTrigger>
                        <TabsTrigger value="customer">Share with Customer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="rider">
                        {delivery.rider ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">{delivery.rider.name}</p>
                                        <p className="text-sm text-gray-600">{delivery.rider.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium mb-2">Tracking Link:</div>
                                        <div className="text-sm text-gray-700 break-all bg-gray-100 p-2 rounded">
                                            {delivery.tracking.riderLink}
                                        </div>

                                        <div className="mt-4">
                                            <div className="text-sm font-medium mb-2">OTP Code:</div>
                                            <div className="text-xl font-bold text-center bg-green-50 text-green-700 py-3 rounded border border-green-200">
                                                {delivery.tracking.otp}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-sm font-medium mb-2">Rider QR Code:</div>
                                        <div className="p-2 bg-white rounded">
                                            <QRCode value={delivery.tracking.riderLink} size={120} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-2 mt-2">
                                    <Button
                                        className="w-full md:w-1/2"
                                        variant="outline"
                                        onClick={() => copyToClipboard(riderMessage, 'rider')}
                                    >
                                        {copied === 'rider' ? 'Copied!' : 'Copy Message'}
                                    </Button>
                                    <Button
                                        className="w-full md:w-1/2 bg-green-600 hover:bg-green-700"
                                        onClick={() => shareViaWhatsApp(riderWhatsAppLink)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                        </svg>
                                        Share via WhatsApp
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 text-gray-500">
                                No rider information available for this delivery.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="customer">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium">{delivery.customer.name}</p>
                                    <p className="text-sm text-gray-600">{delivery.customer.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium mb-2">Tracking Link:</div>
                                    <div className="text-sm text-gray-700 break-all bg-gray-100 p-2 rounded">
                                        {delivery.tracking.customerLink}
                                    </div>

                                    <div className="mt-4">
                                        <div className="text-sm font-medium mb-2">Package:</div>
                                        <div className="text-sm p-2 bg-gray-50 rounded border border-gray-200">
                                            <p><span className="font-medium">Description:</span> {delivery.package.description}</p>
                                            {delivery.package.size && (
                                                <p className="mt-1"><span className="font-medium">Size:</span> {delivery.package.size}</p>
                                            )}
                                            {delivery.package.specialInstructions && (
                                                <p className="mt-1"><span className="font-medium">Instructions:</span> {delivery.package.specialInstructions}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-sm font-medium mb-2">Customer QR Code:</div>
                                    <div className="p-2 bg-white rounded">
                                        <QRCode value={delivery.tracking.customerLink} size={120} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2 mt-2">
                                <Button
                                    className="w-full md:w-1/2"
                                    variant="outline"
                                    onClick={() => copyToClipboard(customerMessage, 'customer')}
                                >
                                    {copied === 'customer' ? 'Copied!' : 'Copy Message'}
                                </Button>
                                <Button
                                    className="w-full md:w-1/2 bg-green-600 hover:bg-green-700"
                                    onClick={() => shareViaWhatsApp(customerWhatsAppLink)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    </svg>
                                    Share via WhatsApp
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default WhatsAppShare;