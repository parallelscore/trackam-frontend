import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateDeliveryFormData } from '@/types';
import { useDelivery } from '../../context/DeliveryContext';
import { generateWhatsAppLink } from '@/utils/utils.ts';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Form,
    FormSection,
    FormItem,
    FormLabel,
    FormControl,
    FormErrorMessage,
} from '../ui/form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import QRCode from 'react-qr-code';

const CreateDeliveryForm: React.FC = () => {
    const { createDelivery, isLoading } = useDelivery();
    const [createdDelivery, setCreatedDelivery] = useState<any>(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateDeliveryFormData>();

    const onSubmit = async (data: CreateDeliveryFormData) => {
        try {
            const delivery = await createDelivery(data);
            setCreatedDelivery(delivery);
            setFormSubmitted(true);
            reset();
        } catch (error) {
            console.error('Error creating delivery:', error);
        }
    };

    const handleCreateAnother = () => {
        setCreatedDelivery(null);
        setFormSubmitted(false);
    };

    const renderSuccessCard = () => {
        const riderWhatsAppMessage = `Hello ${createdDelivery.rider.name}, you have a new delivery. Use this link to start tracking: ${createdDelivery.tracking.riderLink} and your OTP is: ${createdDelivery.tracking.otp}`;
        const customerWhatsAppMessage = `Hello ${createdDelivery.customer.name}, your delivery is being processed. Track your package here: ${createdDelivery.tracking.customerLink}`;

        const riderWhatsAppLink = generateWhatsAppLink(createdDelivery.rider.phoneNumber, riderWhatsAppMessage);
        const customerWhatsAppLink = generateWhatsAppLink(createdDelivery.customer.phoneNumber, customerWhatsAppMessage);

        return (
            <Card className="w-full max-w-3xl mx-auto border-green-200 shadow-md">
                <CardHeader className="bg-green-50">
                    <CardTitle className="text-center text-green-800">
                        Delivery Created Successfully!
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <div className="text-center">
                        <span className="text-lg font-semibold block">Tracking ID:</span>
                        <span className="text-3xl font-bold text-primary block mt-1">{createdDelivery.trackingId}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Rider Information</h3>
                            <p><span className="font-medium">Name:</span> {createdDelivery.rider.name}</p>
                            <p><span className="font-medium">Phone:</span> {createdDelivery.rider.phoneNumber}</p>
                            <p><span className="font-medium">OTP:</span> <span className="font-bold">{createdDelivery.tracking.otp}</span></p>

                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Rider QR Code:</h4>
                                <div className="flex justify-center">
                                    <QRCode value={createdDelivery.tracking.riderLink} size={120} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <a
                                    href={riderWhatsAppLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-green-700 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                                    </svg>
                                    Share with Rider via WhatsApp
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Customer Information</h3>
                            <p><span className="font-medium">Name:</span> {createdDelivery.customer.name}</p>
                            <p><span className="font-medium">Phone:</span> {createdDelivery.customer.phoneNumber}</p>
                            <p><span className="font-medium">Address:</span> {createdDelivery.customer.address}</p>

                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Customer QR Code:</h4>
                                <div className="flex justify-center">
                                    <QRCode value={createdDelivery.tracking.customerLink} size={120} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <a
                                    href={customerWhatsAppLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-green-700 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                                    </svg>
                                    Share with Customer via WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-center p-6 bg-gray-50">
                    <Button
                        onClick={handleCreateAnother}
                        className="px-6"
                    >
                        Create Another Delivery
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    if (formSubmitted && createdDelivery) {
        return renderSuccessCard();
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="text-center text-xl">Create New Delivery</CardTitle>
            </CardHeader>

            <CardContent>
                <Form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    {/* Customer Information Section */}
                    <FormSection title="Customer Information">
                        <FormItem>
                            <FormLabel htmlFor="customer.name">Customer Name</FormLabel>
                            <FormControl>
                                <Input
                                    id="customer.name"
                                    placeholder="Enter customer name"
                                    {...register('customer.name', { required: 'Customer name is required' })}
                                />
                            </FormControl>
                            {errors.customer?.name && (
                                <FormErrorMessage>{errors.customer.name.message}</FormErrorMessage>
                            )}
                        </FormItem>

                        <FormItem>
                            <FormLabel htmlFor="customer.phoneNumber">Phone Number</FormLabel>
                            <FormControl>
                                <Input
                                    id="customer.phoneNumber"
                                    placeholder="E.g. +2348012345678"
                                    {...register('customer.phoneNumber', { required: 'Phone number is required' })}
                                />
                            </FormControl>
                            {errors.customer?.phoneNumber && (
                                <FormErrorMessage>{errors.customer.phoneNumber.message}</FormErrorMessage>
                            )}
                        </FormItem>

                        <FormItem>
                            <FormLabel htmlFor="customer.address">Delivery Address</FormLabel>
                            <FormControl>
                                <Input
                                    id="customer.address"
                                    placeholder="Enter delivery address"
                                    {...register('customer.address', { required: 'Delivery address is required' })}
                                />
                            </FormControl>
                            {errors.customer?.address && (
                                <FormErrorMessage>{errors.customer.address.message}</FormErrorMessage>
                            )}
                        </FormItem>
                    </FormSection>

                    {/* Rider Information Section */}
                    <FormSection title="Rider Information">
                        <FormItem>
                            <FormLabel htmlFor="rider.name">Rider Name</FormLabel>
                            <FormControl>
                                <Input
                                    id="rider.name"
                                    placeholder="Enter rider name"
                                    {...register('rider.name', { required: 'Rider name is required' })}
                                />
                            </FormControl>
                            {errors.rider?.name && (
                                <FormErrorMessage>{errors.rider.name.message}</FormErrorMessage>
                            )}
                        </FormItem>

                        <FormItem>
                            <FormLabel htmlFor="rider.phoneNumber">Phone Number</FormLabel>
                            <FormControl>
                                <Input
                                    id="rider.phoneNumber"
                                    placeholder="E.g. +2348012345678"
                                    {...register('rider.phoneNumber', { required: 'Phone number is required' })}
                                />
                            </FormControl>
                            {errors.rider?.phoneNumber && (
                                <FormErrorMessage>{errors.rider.phoneNumber.message}</FormErrorMessage>
                            )}
                        </FormItem>
                    </FormSection>

                    {/* Package Information Section */}
                    <FormSection title="Package Information">
                        <FormItem>
                            <FormLabel htmlFor="package.description">Package Description</FormLabel>
                            <FormControl>
                                <Input
                                    id="package.description"
                                    placeholder="Describe the package"
                                    {...register('package.description', { required: 'Package description is required' })}
                                />
                            </FormControl>
                            {errors.package?.description && (
                                <FormErrorMessage>{errors.package.description.message}</FormErrorMessage>
                            )}
                        </FormItem>

                        <FormItem>
                            <FormLabel htmlFor="package.size">Package Size</FormLabel>
                            <FormControl>
                                <select
                                    id="package.size"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register('package.size')}
                                >
                                    <option value="">Select Size (Optional)</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </FormControl>
                        </FormItem>

                        <FormItem>
                            <FormLabel htmlFor="package.specialInstructions">Special Instructions</FormLabel>
                            <FormControl>
                                <Input
                                    id="package.specialInstructions"
                                    placeholder="Any special instructions (Optional)"
                                    {...register('package.specialInstructions')}
                                />
                            </FormControl>
                        </FormItem>
                    </FormSection>

                    <div className="flex justify-center pt-4">
                        <Button
                            type="submit"
                            className="px-8 py-6 text-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Delivery'}
                        </Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
};

export default CreateDeliveryForm;