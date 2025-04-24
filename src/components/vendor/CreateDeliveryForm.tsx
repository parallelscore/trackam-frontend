// src/components/vendor/CreateDeliveryForm.tsx
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
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import DeliverySuccessView from './DeliverySuccessView';

interface CreateDeliveryFormProps {
    onSuccess?: () => void;
}

const CreateDeliveryForm: React.FC<CreateDeliveryFormProps> = ({ onSuccess }) => {
    const { createDelivery, isLoading } = useDelivery();
    const [createdDelivery, setCreatedDelivery] = useState<any>(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [whatsappSent, setWhatsappSent] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateDeliveryFormData>({
        defaultValues: {
            customer: {
                name: '',
                phoneNumber: '',
                address: ''
            },
            rider: {
                name: '',
                phoneNumber: ''
            },
            package: {
                description: '',
                size: undefined,
                specialInstructions: ''
            }
        }
    });

    const onSubmit = async (data: CreateDeliveryFormData) => {
        try {
            // Transform the data to match the backend schema
            const formattedData = {
                customer: {
                    name: data.customer.name,
                    phone_number: data.customer.phoneNumber,
                    address: data.customer.address,
                },
                rider: {
                    name: data.rider.name,
                    phone_number: data.rider.phoneNumber,
                },
                package: {
                    description: data.package.description,
                    size: data.package.size,
                    special_instructions: data.package.specialInstructions,
                }
            };

            // Submit to backend
            const delivery = await createDelivery(formattedData);

            if (delivery) {
                setCreatedDelivery(delivery);
                setFormSubmitted(true);
                reset();

                // Automatically send WhatsApp message to rider
                if (delivery.rider?.phoneNumber) {
                    sendWhatsAppToRider(delivery);
                }
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
        }
    };

    const sendWhatsAppToRider = (delivery: any) => {
        if (!delivery.rider) return;

        // Generate correct acceptance URL
        const baseUrl = window.location.origin;
        const riderAcceptUrl = `${baseUrl}/rider/accept/${delivery.trackingId}`;

        const riderMessage = `Hello ${delivery.rider.name}, you have a new delivery request for ${delivery.customer.name}. 

Package: ${delivery.package.description}
Delivery Address: ${delivery.customer.address}
    
Click this link to accept or decline the delivery: ${riderAcceptUrl}

Your OTP code when you accept: ${delivery.tracking.otp}

Thank you!`;

        const whatsappLink = generateWhatsAppLink(delivery.rider.phoneNumber, riderMessage);
        window.open(whatsappLink, '_blank');
        setWhatsappSent(true);
    };

    const handleCreateAnother = () => {
        setCreatedDelivery(null);
        setFormSubmitted(false);
        setWhatsappSent(false);
    };

    const handleDone = () => {
        if (onSuccess && typeof onSuccess === 'function') {
            onSuccess();
        } else {
            setCreatedDelivery(null);
            setFormSubmitted(false);
            setWhatsappSent(false);
        }
    };

    if (formSubmitted && createdDelivery) {
        return (
            <DeliverySuccessView
                delivery={createdDelivery}
                whatsappSent={whatsappSent}
                onCreateAnother={handleCreateAnother}
                onDone={handleDone}
            />
        );
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
                                    {...register('customer.phoneNumber', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^(\+?234|0)[789]\d{9}$/,
                                            message: 'Enter a valid Nigerian phone number'
                                        }
                                    })}
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
                                    {...register('rider.phoneNumber', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^(\+?234|0)[789]\d{9}$/,
                                            message: 'Enter a valid Nigerian phone number'
                                        }
                                    })}
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