// src/components/vendor/CreateDeliveryForm.tsx - Enhanced Version
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateDeliveryFormData, CustomerLocation } from '@/types';
import { useDelivery } from '../../context/DeliveryContext';
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
import CustomerLocationInput from './CustomerLocationInput';
import DeliverySuccessView from './DeliverySuccessView';

interface CreateDeliveryFormProps {
    onSuccess?: () => void;
}

const CreateDeliveryForm: React.FC<CreateDeliveryFormProps> = ({ onSuccess }) => {
    const { createDelivery, isLoading } = useDelivery();
    const [createdDelivery, setCreatedDelivery] = useState<any>(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [whatsappSent, setWhatsappSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Add state for customer location
    const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateDeliveryFormData>({
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

    // Watch the customer address field for the location component
    const customerAddress = watch('customer.address');

    const simulateProgressBar = async () => {
        // Start with 15% progress immediately
        setLoadingProgress(15);
        setLoadingText('Preparing delivery...');

        // Increase progress to 40% after 0.5 seconds
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingProgress(40);
        setLoadingText('Creating delivery...');

        // Increase progress to 75% after 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingProgress(75);
        setLoadingText('Setting up tracking...');
    };

    const onSubmit = async (data: CreateDeliveryFormData) => {
        try {
            setError(null);
            setIsSubmitting(true);

            // Start the progress simulation
            simulateProgressBar();

            // Transform the data to match the backend schema
            const formattedData = {
                customer: {
                    name: data.customer.name,
                    phone_number: data.customer.phoneNumber,
                    address: data.customer.address,
                    // Include location if captured
                    ...(customerLocation && { location: customerLocation })
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
                // Finish the progress bar
                setLoadingProgress(100);
                setLoadingText('Completing setup...');

                // Wait a brief moment to show the progress bar completion
                await new Promise(resolve => setTimeout(resolve, 400));

                setCreatedDelivery(delivery);
                setFormSubmitted(true);
                reset();
                setCustomerLocation(null); // Reset location state

                // We no longer automatically send WhatsApp messages here
                // Just transition to the success view
            } else {
                setLoadingProgress(0);
                setError('Failed to create delivery. Please try again.');
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            setLoadingProgress(0);
            setError('Failed to create delivery. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateAnother = () => {
        setCreatedDelivery(null);
        setFormSubmitted(false);
        setWhatsappSent(false);
        setCustomerLocation(null); // Add this line
    };

    const handleDone = () => {
        if (onSuccess && typeof onSuccess === 'function') {
            onSuccess();
        } else {
            setCreatedDelivery(null);
            setFormSubmitted(false);
            setWhatsappSent(false);
            setCustomerLocation(null); // Add this line
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
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {isSubmitting && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{loadingText}</span>
                            <span className="text-sm font-medium text-gray-700">{loadingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            {errors.customer?.address && (
                                <FormErrorMessage>{errors.customer.address.message}</FormErrorMessage>
                            )}
                        </FormItem>

                        {/* Customer Location Capture Component */}
                        <CustomerLocationInput
                            value={customerLocation}
                            address={customerAddress || ''}
                            onChange={setCustomerLocation}
                            disabled={isSubmitting}
                        />
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                        </FormItem>
                    </FormSection>

                    <div className="flex justify-center pt-4">
                        <Button
                            type="submit"
                            className="px-8 py-6 text-lg"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                'Create Delivery'
                            )}
                        </Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
};

export default CreateDeliveryForm;