import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { OtpVerificationFormData } from '@/types';
import { useDelivery } from '../../context/DeliveryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Form, FormItem, FormLabel, FormControl, FormErrorMessage } from '../ui/form';

interface OtpVerificationProps {
    trackingId: string;
    onVerified: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ trackingId, onVerified }) => {
    const { verifyOTP, isLoading } = useDelivery();
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<OtpVerificationFormData>({
        defaultValues: {
            trackingId,
            otp: '',
        },
    });

    const onSubmit = async (data: OtpVerificationFormData) => {
        setVerificationError(null);

        try {
            const result = await verifyOTP(data);

            if (result.success) {
                onVerified();
            } else {
                setVerificationError(result.message || 'Verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setVerificationError('An unexpected error occurred. Please try again.');
        }
    };

    const handleResendOTP = () => {
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

export default OtpVerification;