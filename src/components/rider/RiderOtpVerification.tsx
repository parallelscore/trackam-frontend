// src/components/rider/RiderOtpVerification.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { OtpVerificationFormData } from '@/types';
import { useRider } from '../../context/RiderContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '../ui/card';
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormErrorMessage,
} from '../ui/form';
import { generateWhatsAppLink } from '@/utils/utils';

interface RiderOtpVerificationProps {
    trackingId: string;
    onVerified: () => void;
}

const RiderOtpVerification: React.FC<RiderOtpVerificationProps> = ({
                                                                       trackingId,
                                                                       onVerified,
                                                                   }) => {
    const { verifyOTP, startTracking, currentDelivery, isLoading } = useRider();

    const [verificationError, setVerificationError] = useState<string | null>(
        null,
    );
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [locationPermissionGranted, setLocationPermissionGranted] =
        useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<OtpVerificationFormData>({
        defaultValues: { otp: '' }, // tracking_id handled via setValue
    });

    /* ---------- side‑effects ---------- */

    /** keep the form’s tracking_id in sync with the prop */
    useEffect(() => {
        setValue('tracking_id', trackingId);
    }, [trackingId, setValue]);

    /** check location permission once & listen for changes */
    useEffect(() => {
        if (navigator.permissions) {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then((status) => {
                    setLocationPermissionGranted(status.state === 'granted');
                    status.onchange = () =>
                        setLocationPermissionGranted(status.state === 'granted');
                })
                .catch(() => {});
        }
    }, []);

    /* ---------- form submit ---------- */

    const onSubmit = async (data: OtpVerificationFormData) => {
        setVerificationError(null);

        if (!locationPermissionGranted) {
            setVerificationError(
                'Location permission is required. Please enable location services and try again.',
            );
            return;
        }

        try {
            const otpResult = await verifyOTP(data); // data now includes tracking_id

            if (!otpResult.success) {
                setVerificationError(otpResult.message || 'Verification failed.');
                return;
            }

            const trackingResult = await startTracking(trackingId);

            if (!trackingResult.success) {
                setVerificationError(
                    trackingResult.message || 'Failed to start tracking.',
                );
                return;
            }

            if (currentDelivery?.customer) {
                notifyCustomer(currentDelivery);
            }

            onVerified();
        } catch (err) {
            console.error('OTP verify error:', err);
            setVerificationError('Unexpected error. Please try again.');
        }
    };

    /* ---------- helpers ---------- */

    const notifyCustomer = (delivery: any) => {
        const msg = `Hello ${delivery.customer.name}, your package "${delivery.package.description}" is now on its way! Your rider ${delivery.rider.name} has started the delivery. Track it here: ${delivery.tracking.customerLink}`;
        window.open(generateWhatsAppLink(delivery.customer.phoneNumber, msg), '_blank');
    };

    const askLocationPermission = () => {
        navigator.geolocation?.getCurrentPosition(
            () => setLocationPermissionGranted(true),
            () =>
                setVerificationError(
                    'Location permission denied. Enable it in your browser settings.',
                ),
        );
    };

    const handleResendOTP = () => {
        setResendDisabled(true);
        setCountdown(30);
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(timer);
                    setResendDisabled(false);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        setVerificationError(null);
        // TODO: call API to resend OTP
    };

    /* ---------- UI ---------- */

    if (!locationPermissionGranted) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        Location Permission Required
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                    <p className="mb-6 text-gray-600">
                        We need your location to track this delivery in real‑time.
                    </p>
                    <Button className="w-full" onClick={askLocationPermission}>
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
                <p className="mb-6 text-center text-gray-600">
                    Enter the one‑time password sent to your phone.
                </p>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* hidden tracking_id keeps RHF aware of the field */}
                    <input
                        type="hidden"
                        {...register('tracking_id', { required: true })}
                        value={trackingId}
                        readOnly
                    />

                    <FormItem>
                        <FormLabel htmlFor="otp">OTP</FormLabel>
                        <FormControl>
                            <Input
                                id="otp"
                                placeholder="6‑digit code"
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                                {...register('otp', {
                                    required: 'OTP is required',
                                    pattern: {
                                        value: /^[0-9]{6}$/,
                                        message: 'Enter a valid 6‑digit code',
                                    },
                                })}
                            />
                        </FormControl>
                        {errors.otp && <FormErrorMessage>{errors.otp.message}</FormErrorMessage>}
                    </FormItem>

                    {verificationError && (
                        <div className="mt-4 rounded-md bg-red-50 p-2 text-center text-sm text-red-600">
                            {verificationError}
                        </div>
                    )}

                    <div className="mt-6">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Verifying…' : 'Verify OTP'}
                        </Button>
                    </div>
                </Form>
            </CardContent>

            <CardFooter className="justify-center border-t pt-4">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={resendDisabled}
                    onClick={handleResendOTP}
                >
                    {resendDisabled
                        ? `Resend OTP in ${countdown}s`
                        : "Didn't receive OTP? Resend"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RiderOtpVerification;
