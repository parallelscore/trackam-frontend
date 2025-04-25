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
                                                                     whatsappSent,
                                                                     onCreateAnother,
                                                                     onDone
                                                                 }) => {
    // Safely access properties with optional chaining
    const riderName = delivery.rider?.name || 'Rider';
    const riderPhone = delivery.rider?.phone_number || '';
    const customerName = delivery.customer?.name || 'Customer';
    const customerPhone = delivery.customer?.phone_number || '';

    // Generate correct URLs - update for rider acceptance
    const baseUrl = window.location.origin;
    const riderAcceptUrl = `${baseUrl}/rider/accept/${delivery.tracking_id}`;
    const customerTrackUrl = `${baseUrl}/track/${delivery.tracking_id}`;
    const otp = delivery.tracking?.otp || '';

    // Create WhatsApp messages
    const riderWhatsAppMessage = `Hello ${riderName}, you have a new delivery request for ${customerName}. 

Package: ${delivery.package.description}
Delivery Address: ${delivery.customer.address}
    
Click this link to accept or decline the delivery: ${riderAcceptUrl}

Your OTP code when you accept: ${otp}

Thank you!`;

    const customerWhatsAppMessage = `Hello ${customerName}, your delivery for "${delivery.package.description}" has been created and a rider will be assigned soon.

You can track your delivery here: ${customerTrackUrl}

Thank you for using TrackAm!`;

    const riderWhatsAppLink = generateWhatsAppLink(riderPhone, riderWhatsAppMessage);
    const customerWhatsAppLink = generateWhatsAppLink(customerPhone, customerWhatsAppMessage);

    const sendWhatsAppToRider = () => {
        window.open(riderWhatsAppLink, '_blank');
    };

    const sendWhatsAppToCustomer = () => {
        window.open(customerWhatsAppLink, '_blank');
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
                    <div className="flex items-center space-x-2 text-yellow-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <h3 className="font-semibold">Next Steps:</h3>
                    </div>
                    <ul className="ml-7 mt-2 text-sm text-yellow-800 list-disc space-y-1">
                        <li>A WhatsApp message {whatsappSent ? 'has been' : 'will be'} sent to the rider with delivery details and the acceptance link</li>
                        <li>Rider will accept or decline the delivery by clicking the link</li>
                        <li>Upon acceptance and OTP verification, customer will receive tracking information</li>
                        <li>Customer will confirm package delivery upon receipt</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Rider Information</h3>
                        <p><span className="font-medium">Name:</span> {riderName}</p>
                        <p><span className="font-medium">Phone:</span> {riderPhone}</p>
                        <p><span className="font-medium">OTP:</span> <span className="font-bold">{otp}</span></p>

                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Rider Accept/Decline QR Code:</h4>
                            <div className="flex justify-center">
                                {riderAcceptUrl && <QRCode value={riderAcceptUrl} size={120} />}
                            </div>
                            <p className="text-xs text-center mt-2 text-gray-500">Scan to access acceptance page</p>
                        </div>

                        <div className="mt-4">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={sendWhatsAppToRider}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                </svg>
                                {whatsappSent ? 'Resend to Rider via WhatsApp' : 'Send to Rider via WhatsApp'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Customer Information</h3>
                        <p><span className="font-medium">Name:</span> {customerName}</p>
                        <p><span className="font-medium">Phone:</span> {customerPhone}</p>
                        <p><span className="font-medium">Address:</span> {delivery.customer?.address || ''}</p>

                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Package Details:</h4>
                            <p><span className="font-medium">Description:</span> {delivery.package?.description || ''}</p>
                            {delivery.package?.size && (
                                <p><span className="font-medium">Size:</span> {delivery.package.size}</p>
                            )}
                            {delivery.package?.special_instructions && (
                                <p><span className="font-medium">Instructions:</span> {delivery.package.special_instructions}</p>
                            )}
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Customer Tracking QR Code:</h4>
                            <div className="flex justify-center">
                                {customerTrackUrl && <QRCode value={customerTrackUrl} size={120} />}
                            </div>
                            <p className="text-xs text-center mt-2 text-gray-500">Customer tracking link</p>
                        </div>

                        <div className="mt-4">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={sendWhatsAppToCustomer}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                </svg>
                                Send to Customer via WhatsApp
                            </Button>
                        </div>
                    </div>
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