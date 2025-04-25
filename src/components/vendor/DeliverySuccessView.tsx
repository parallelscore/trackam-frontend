// src/components/vendor/DeliverySuccessView.tsx
import React from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import QRCode from 'react-qr-code';
import { generateWhatsAppLink } from '@/utils/utils.ts';
import { Delivery } from '@/types';
import { Badge } from '../ui/badge';

interface DeliverySuccessViewProps {
    delivery: Delivery;
    whatsappSent: boolean;
    onCreateAnother: () => void;
    onDone: () => void;
}

const DeliverySuccessView: React.FC<DeliverySuccessViewProps> = ({
                                                                     delivery,
                                                                     onCreateAnother,
                                                                     onDone
                                                                 }) => {
    // Generate correct URLs
    const baseUrl = window.location.origin;
    const customerTrackUrl = `${baseUrl}/track/${delivery.tracking_id}`;

    // WhatsApp message functions - note these now just generate the links without opening them
    const generateRiderWhatsAppLink = () => {
        if (!delivery.rider) return '#';

        const riderMessage = `Hello ${delivery.rider.name}, you have a new delivery request for ${delivery.customer.name}. 
Package: ${delivery.package.description}
Delivery Address: ${delivery.customer.address}
Click this link to accept or decline the delivery: ${baseUrl}/rider/accept/${delivery.tracking_id}
Your OTP code when you accept: ${delivery.tracking.otp}
Thank you!`;

        return generateWhatsAppLink(delivery.rider.phone_number, riderMessage);
    };

    const generateCustomerWhatsAppLink = () => {
        const customerMessage = `Hello ${delivery.customer.name}, your delivery for "${delivery.package.description}" has been created and a rider will be assigned soon.
You can track your delivery here: ${customerTrackUrl}
Thank you for using TrackAm!`;

        return generateWhatsAppLink(delivery.customer.phone_number, customerMessage);
    };

    return (
        <Card className="w-full max-w-3xl mx-auto border-green-200 shadow-md">
            <CardHeader className="bg-green-50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-green-800">
                        Delivery Created Successfully!
                    </CardTitle>
                    <Badge className="bg-green-600">New</Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                <div className="text-center">
                    <span className="text-lg font-semibold block">Tracking ID:</span>
                    <span className="text-3xl font-bold text-primary block mt-1">{delivery.tracking_id}</span>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 text-yellow-800 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <h3 className="font-semibold">Next Steps:</h3>
                    </div>
                    <ul className="ml-7 text-sm text-yellow-800 list-disc space-y-1">
                        <li>Share the delivery details with the rider via WhatsApp</li>
                        <li>Rider will accept or decline the delivery by clicking the link</li>
                        <li>Upon acceptance and OTP verification, customer will receive tracking information</li>
                        <li>Customer will confirm package delivery upon receipt</li>
                    </ul>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="text-center">
                        <h3 className="font-medium mb-3">Customer Tracking QR Code</h3>
                        <div className="bg-white p-3 rounded-md shadow-sm inline-block">
                            <QRCode value={customerTrackUrl} size={150} />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Scan to track delivery</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <a
                        href={generateRiderWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center font-medium transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                        Send to Rider via WhatsApp
                    </a>

                    <a
                        href={generateCustomerWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center font-medium transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                        Send to Customer via WhatsApp
                    </a>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mt-4 border">
                    <h3 className="font-medium mb-2">Delivery Status:</h3>
                    <div className="relative">
                        <div className="flex items-center mb-2">
                            <div className="z-10 flex items-center justify-center w-6 h-6 bg-primary rounded-full shrink-0">
                                <svg className="w-3.5 h-3.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                                </svg>
                            </div>
                            <div className="flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                        </div>
                        <div className="mt-3 sm:pr-8">
                            <h3 className="text-sm font-semibold text-gray-900">Created</h3>
                            <p className="text-xs text-gray-500">Delivery has been created and assigned to rider</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex items-center mb-2">
                            <div className="z-10 flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full shrink-0">
                                <span className="text-xs text-gray-600">2</span>
                            </div>
                            <div className="flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                        </div>
                        <div className="mt-3 sm:pr-8">
                            <h3 className="text-sm font-semibold text-gray-500">Rider Acceptance</h3>
                            <p className="text-xs text-gray-500">Waiting for rider to accept delivery</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex items-center mb-2">
                            <div className="z-10 flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full shrink-0">
                                <span className="text-xs text-gray-600">3</span>
                            </div>
                            <div className="flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                        </div>
                        <div className="mt-3 sm:pr-8">
                            <h3 className="text-sm font-semibold text-gray-500">In Progress</h3>
                            <p className="text-xs text-gray-500">Rider is on the way to deliver package</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex items-center mb-2">
                            <div className="z-10 flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full shrink-0">
                                <span className="text-xs text-gray-600">4</span>
                            </div>
                        </div>
                        <div className="mt-3 sm:pr-8">
                            <h3 className="text-sm font-semibold text-gray-500">Completed</h3>
                            <p className="text-xs text-gray-500">Package has been delivered and confirmed</p>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-center gap-4 p-6 bg-gray-50">
                <Button
                    onClick={onCreateAnother}
                    variant="outline"
                >
                    Create Another Delivery
                </Button>
                <Button
                    onClick={onDone}
                    className="px-6"
                >
                    Done
                </Button>
            </CardFooter>
        </Card>
    );
};

export default DeliverySuccessView;