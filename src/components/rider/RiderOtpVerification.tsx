// src/components/rider/RiderOtpVerification.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { OtpVerificationFormData } from '@/types';
import { useRider } from '../../context/RiderContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Form, FormItem, FormControl, FormErrorMessage } from '../ui/form';

interface RiderOtpVerificationProps {
    trackingId: string;
    onVerified: () => void;
}

// Enhanced animation variants matching LoginOtpPage
const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const RiderOtpVerification: React.FC<RiderOtpVerificationProps> = ({ trackingId, onVerified }) => {
    const { verifyOTP, startTracking, isLoading, locationPermissionGranted, notifyCustomer } = useRider();
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [notifyingCustomer, setNotifyingCustomer] = useState(false);

    // Log the tracking ID when the component mounts to ensure it's available
    useEffect(() => {
        console.log('RiderOtpVerification initialized with tracking ID:', trackingId);

        // Validate tracking ID right away
        if (!trackingId) {
            console.error('Missing tracking ID in OTP verification component');
            setVerificationError('Missing tracking ID. Please try again.');
        }
    }, [trackingId]);

    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<OtpVerificationFormData>({
        defaultValues: {
            tracking_id: trackingId,
            otp: '',
        },
    });

    const otpValue = watch('otp');

    // Ensure tracking_id is updated in the form if it changes
    useEffect(() => {
        setValue('tracking_id', trackingId);
    }, [trackingId, setValue]);

    const onSubmit = async (data: OtpVerificationFormData) => {
        setVerificationError(null);

        // No need to check for location permission - it should already be granted
        // from the acceptance page and stored in the context
        if (!locationPermissionGranted) {
            console.warn("Location permission not granted before OTP verification - flow may be incorrect");
            // We still continue with OTP verification since permission should have been granted earlier
        }

        // Validate tracking ID exists before submitting
        if (!trackingId) {
            const errorMsg = 'Missing tracking ID. Cannot verify OTP.';
            console.error(errorMsg);
            setVerificationError(errorMsg);
            return;
        }

        try {
            // Make sure tracking_id is set correctly
            const otpData = {
                tracking_id: trackingId, // Use the prop directly instead of form value
                otp: data.otp
            };

            // Log before submitting to verify data
            console.log('Submitting OTP verification with data:', otpData);

            // First, verify the OTP
            const otpResult = await verifyOTP(otpData);
            console.log('OTP verification result:', otpResult);

            console.log('trackingId:', trackingId);

            if (otpResult.success) {
                // OTP is verified, now start tracking
                const trackingResult = await startTracking(trackingId);

                if (trackingResult.success) {
                    // Notify customer about the delivery via backend API
                    setNotifyingCustomer(true);
                    await notifyCustomer(trackingId);
                    // setNotifyingCustomer(false);

                    onVerified();
                } else {
                    setVerificationError(trackingResult.message ?? 'Failed to start tracking. Please try again.');
                }
            } else {
                setVerificationError(otpResult.message ?? 'Verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setVerificationError('An unexpected error occurred. Please try again.');
        }
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
        <div className="w-full max-w-md mx-auto relative">
            {/* Background decorative elements matching the green theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -8, 8, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-16 right-20 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 0.8, 1],
                        rotate: [0, 12, -12, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3
                    }}
                    className="absolute bottom-20 left-16 w-28 h-28 bg-green-500/10 rounded-full blur-2xl"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full relative z-10"
            >
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                    {/* Enhanced gradient border effect - green theme */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-xl p-0.5">
                        <div className="bg-white rounded-xl h-full w-full" />
                    </div>

                    <div className="relative z-10">
                        <CardHeader className="text-center pb-6">
                            <motion.div
                                variants={itemVariants}
                                className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, -5, 5, 0]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </motion.div>

                                {/* Enhanced pulsing rings - green theme */}
                                <motion.div
                                    className="absolute inset-0 rounded-3xl border-2 border-emerald-400/40"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-3xl border-2 border-green-400/40"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-emerald-600 bg-clip-text text-transparent mb-2">
                                    Verify OTP
                                </CardTitle>
                                <CardDescription className="text-gray-600 text-lg px-4">
                                    Enter the One-Time Password (OTP) sent to your phone to verify this delivery.
                                </CardDescription>
                                <CardDescription className="text-sm text-gray-500 mt-2 px-4">
                                    The OTP was included in the WhatsApp message you received.
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="px-8 pb-6">
                            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Hidden field for tracking_id */}
                                <input
                                    type="hidden"
                                    {...register('tracking_id')}
                                    value={trackingId}
                                />

                                <motion.div variants={itemVariants}>
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="Enter 6-digit OTP"
                                                className="text-center text-2xl tracking-widest h-16 rounded-xl border-2 border-gray-200 focus:border-emerald-500 transition-all duration-300 bg-gray-50 focus:bg-white font-mono"
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

                                        {/* Enhanced progress indicators - green theme */}
                                        <div className="flex justify-center mt-4 space-x-2">
                                            {[...Array(6)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                        i < (otpValue?.length || 0)
                                                            ? 'bg-emerald-500 shadow-lg'
                                                            : 'bg-gray-200'
                                                    }`}
                                                    animate={i < (otpValue?.length || 0) ? { scale: [1, 1.2, 1] } : {}}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {errors.otp && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="flex items-center justify-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                                                >
                                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <FormErrorMessage className="text-center">
                                                        {errors.otp.message}
                                                    </FormErrorMessage>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {verificationError && (
                                            <AnimatePresence>
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="flex items-center justify-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                                                >
                                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-red-600 text-sm text-center">
                                                        {verificationError}
                                                    </span>
                                                </motion.div>
                                            </AnimatePresence>
                                        )}
                                    </FormItem>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                        disabled={isLoading || notifyingCustomer || !otpValue || otpValue.length !== 6}
                                    >
                                        {/* Enhanced button background animation - green theme */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {isLoading || notifyingCustomer ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                    />
                                                    {notifyingCustomer ? 'Notifying Customer...' : 'Verifying...'}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Verify OTP
                                                </>
                                            )}
                                        </span>
                                    </Button>

                                    <div className="text-center text-sm">
                                        <span className="text-gray-500">Didn't receive OTP? </span>
                                        {!resendDisabled ? (
                                            <motion.button
                                                type="button"
                                                className="text-emerald-600 hover:text-green-600 font-semibold hover:underline transition-colors duration-300"
                                                onClick={handleResendOTP}
                                                disabled={isLoading}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Resend OTP
                                            </motion.button>
                                        ) : (
                                            <span className="text-gray-500">
                                                Resend in {countdown}s
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </Form>
                        </CardContent>

                        <CardFooter className="px-8 pb-8">
                            <motion.div variants={itemVariants} className="w-full text-center space-y-3">
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Your OTP will expire in 10 minutes
                                </div>

                                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Secure verification
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        OTP protected
                                    </div>
                                </div>
                            </motion.div>
                        </CardFooter>
                    </div>

                    {/* Enhanced floating success particles - green theme */}
                    <AnimatePresence>
                        {otpValue && otpValue.length === 6 && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 bg-emerald-400/60 rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                        }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                            y: [0, -40]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            ease: "easeOut",
                                            delay: i * 0.1
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
};

export default RiderOtpVerification;