import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Layout from '../components/common/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '../components/ui/card';
import {
    Form,
    FormItem,
    FormControl,
    FormErrorMessage
} from '../components/ui/form';
import toast from 'react-hot-toast';

interface OtpVerificationFormData {
    otp: string;
}

const OtpVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<OtpVerificationFormData>({
        defaultValues: {
            otp: ''
        }
    });

    // Check if there's a phone number in session storage
    useEffect(() => {
        const storedPhone = sessionStorage.getItem('registrationPhone');
        if (!storedPhone) {
            // Redirect to registration if no phone number is found
            navigate('/register');
            toast.error('Please enter your phone number first');
            return;
        }

        setPhoneNumber(storedPhone);

        // Start countdown for OTP resend
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const onSubmit = async (data: OtpVerificationFormData) => {
        setIsSubmitting(true);

        try {
            // This would be replaced with an actual API call to verify OTP
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('OTP submitted:', data.otp);

            // Mock OTP validation (in a real app, this would be server-side)
            if (data.otp === '123456' || data.otp === '000000') {
                // Store registration success in session storage
                sessionStorage.setItem('otpVerified', 'true');

                toast.success('Phone number verified successfully!');
                navigate('/complete-profile');
            } else {
                toast.error('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error('Failed to verify OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setIsSubmitting(true);

        try {
            // This would be replaced with an actual API call to resend OTP
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reset countdown and disable resend button
            setCountdown(60);
            setCanResend(false);

            // Start countdown again
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            toast.success('OTP resent to your phone number.');
        } catch (error) {
            console.error('OTP resend error:', error);
            toast.error('Failed to resend OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format phone number for display
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';

        // If it starts with 0, replace with +234
        if (phone.startsWith('0')) {
            return '+234' + phone.substring(1);
        }

        // If it doesn't have a + but starts with 234, add +
        if (phone.startsWith('234')) {
            return '+' + phone;
        }

        return phone;
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto px-4 py-16">
                <Card className="shadow-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-secondary">Verify Phone Number</CardTitle>
                        <CardDescription>
                            Enter the 6-digit code sent to{' '}
                            {phoneNumber && <span className="font-semibold">{formatPhoneNumber(phoneNumber)}</span>}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <FormItem>
                                <FormControl>
                                    <Input
                                        id="otp"
                                        placeholder="Enter 6-digit OTP"
                                        className="text-center text-xl tracking-widest"
                                        maxLength={6}
                                        {...register('otp', {
                                            required: 'OTP is required',
                                            pattern: {
                                                value: /^[0-9]{6}$/,
                                                message: 'Please enter a valid 6-digit OTP'
                                            }
                                        })}
                                    />
                                </FormControl>
                                {errors.otp && (
                                    <FormErrorMessage>{errors.otp.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <div className="flex flex-col space-y-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                                </Button>

                                <div className="text-center text-sm">
                  <span className="text-gray-500">
                    Didn't receive a code?{' '}
                  </span>
                                    {canResend ? (
                                        <button
                                            type="button"
                                            className="text-primary hover:underline font-medium"
                                            onClick={handleResendOtp}
                                            disabled={isSubmitting}
                                        >
                                            Resend OTP
                                        </button>
                                    ) : (
                                        <span className="text-gray-500">
                      Resend in {countdown}s
                    </span>
                                    )}
                                </div>
                            </div>
                        </Form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 text-center">
                        <div className="text-sm text-gray-500">
                            By verifying your phone number, you agree to receive SMS notifications from TrackAm.
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default OtpVerificationPage;