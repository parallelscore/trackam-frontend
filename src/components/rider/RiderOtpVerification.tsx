// src/components/rider/RiderOtpVerification.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { OtpVerificationFormData } from '@/types';
import { useRider } from '../../context/RiderContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Form, FormItem, FormLabel, FormControl, FormErrorMessage } from '../ui/form';
import { generateWhatsAppLink } from '@/utils/utils';
import { Delivery } from '@/types';

interface RiderOtpVerificationProps {
    trackingId: string;
    onVerified: () => void;
}

const RiderOtpVerification: React.FC<RiderOtpVerificationProps> = ({ trackingId, onVerified }) => {
    const { verifyOTP, startTracking, currentDelivery, isLoading, locationPermissionGranted } = useRider();
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const { register, handleSubmit, formState: { errors } } = useForm<OtpVerificationFormData>({
        defaultValues: {
            tracking_id: trackingId,
            otp: '',
        },
    });

    const onSubmit = async (data: OtpVerificationFormData) => {
        setVerificationError(null);

        // No need to check for location permission - it should already be granted
        // from the accept page and stored in the context

        if (!locationPermissionGranted) {
            console.warn("Location permission not granted before OTP verification - flow may be incorrect");
            // We still continue with OTP verification since permission should have been granted earlier
        }

        try {
            // Make sure tracking_id is set correctly
            const otpData = {
                ...data,
                tracking_id: trackingId, // Explicitly set tracking_id to ensure it's correct
            };

            // First, verify the OTP
            console.log('Verifying OTP with data:', otpData);
            const otpResult = await verifyOTP(otpData);
            console.log('OTP verification result:', otpResult);

            if (otpResult.success) {
                // OTP is verified, now start tracking
                const trackingResult = await startTracking(trackingId);

                if (trackingResult.success) {
                    // Notify customer about the delivery
                    if (currentDelivery?.customer) {
                        sendNotificationToCustomer(currentDelivery);
                    }

                    onVerified();
                } else {
                    setVerificationError(trackingResult.message || 'Failed to start tracking. Please try again.');
                }
            } else {
                setVerificationError(otpResult.message || 'Verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setVerificationError('An unexpected error occurred. Please try again.');
        }
    };

    const sendNotificationToCustomer = (delivery: Delivery) => {
        const customerMessage = `Hello ${delivery.customer.name}, your package "${delivery.package.description}" is now on its way! Your rider ${delivery.rider.name} has started the delivery. Track your package here: ${delivery.tracking.customer_link}`;

        const whatsappLink = generateWhatsAppLink(delivery.customer.phone_number, customerMessage);

        // Open WhatsApp in a new tab
        window.open(whatsappLink, '_blank');
    };

    const handleResendOTP = async () => {
        // This would typically make an API call to resend the OTP.
        // For now, we'll just simulate it with a countdown timer
        setResendDisabled(true);
        setCountdown(30);

        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown <= 1) {
                    clearInterval(timer);
                    setResendDisabled(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);

        // Future implementation would call an API endpoint
        // For now reset the error
        setVerificationError(null);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Verify OTP</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="mb-6">
                    <p className="text-center text-gray-600">
                        Enter the One-Time Password (OTP) sent to your phone to verify this delivery.
                    </p>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        The OTP was included in the WhatsApp message you received.
                    </p>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Hidden field for tracking_id */}
                    <input
                        type="hidden"
                        {...register('tracking_id')}
                        value={trackingId}
                    />

                    <FormItem>
                        <FormLabel htmlFor="otp">One-Time Password (OTP)</FormLabel>
                        <FormControl>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                                {...register('otp', {
                                    required: 'OTP is required',
                                    pattern: {
                                        value: /^[0-9]{6}$/,
                                        message: 'Please enter a valid 6-digit OTP',
                                    },
                                })}
                            />
                        </FormControl>
                        {errors.otp && (
                            <FormErrorMessage>{errors.otp.message}</FormErrorMessage>
                        )}
                    </FormItem>

                    {verificationError && (
                        <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-md text-sm text-center">
                            {verificationError}
                        </div>
                    )}

                    <div className="mt-6">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </div>
                </Form>
            </CardContent>

            <CardFooter className="justify-center border-t pt-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={resendDisabled}
                >
                    {resendDisabled
                        ? `Resend OTP in ${countdown} seconds`
                        : 'Didn\'t receive OTP? Resend'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RiderOtpVerification;