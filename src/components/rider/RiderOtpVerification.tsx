// src/components/rider/RiderOtpVerification.tsx - Updated with RiderContext
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { OtpVerificationFormData } from '@/types';
import { useRider } from '../../context/RiderContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Form, FormItem, FormLabel, FormControl, FormErrorMessage, FormDescription } from '../ui/form';
import { generateWhatsAppLink } from '@/utils/utils';

interface RiderOtpVerificationProps {
    trackingId: string;
    onVerified: () => void;
}

const RiderOtpVerification: React.FC<RiderOtpVerificationProps> = ({ trackingId, onVerified }) => {
    const { verifyOTP, startTracking, currentDelivery, isLoading } = useRider();
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<OtpVerificationFormData>({
        defaultValues: {
            trackingId,
            otp: '',
        },
    });

    useEffect(() => {
        // Check for location permission
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
                setLocationPermissionGranted(permissionStatus.state === 'granted');

                permissionStatus.onchange = () => {
                    setLocationPermissionGranted(permissionStatus.state === 'granted');
                };
            });
        }
    }, []);

    const onSubmit = async (data: OtpVerificationFormData) => {
        setVerificationError(null);

        if (!locationPermissionGranted) {
            setVerificationError("Location permission is required. Please enable location services and try again.");
            return;
        }

        try {
            // First verify the OTP
            console.log( 'Verifying OTP with data:', data);
            const otpResult = await verifyOTP(data);
            console.log( 'OTP verification result:', otpResult);

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

    const sendNotificationToCustomer = (delivery: any) => {
        const customerMessage = `Hello ${delivery.customer.name}, your package "${delivery.package.description}" is now on its way! Your rider ${delivery.rider.name} has started the delivery. Track your package here: ${delivery.tracking.customerLink}`;

        const whatsappLink = generateWhatsAppLink(delivery.customer.phoneNumber, customerMessage);

        // Open WhatsApp in a new tab
        window.open(whatsappLink, '_blank');
    };

    const handleRequestLocationPermission = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setLocationPermissionGranted(true);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setVerificationError('Location permission denied. Please enable location services in your browser settings.');
                }
            );
        } else {
            setVerificationError('Geolocation is not supported by this browser.');
        }
    };

    const handleResendOTP = async () => {
        // This would typically make an API call to resend the OTP
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
        // For now just reset the error
        setVerificationError(null);
    };

    if (!locationPermissionGranted) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Location Permission Required</CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="mb-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <p className="mt-4 text-gray-600">
                            We need your location to track this delivery. This allows customers to see your real-time location during delivery.
                        </p>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleRequestLocationPermission}
                    >
                        Enable Location Services
                    </Button>
                </CardContent>
            </Card>
        );
    }

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
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>
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