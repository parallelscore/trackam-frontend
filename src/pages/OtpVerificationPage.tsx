import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import { Input } from '../components/ui/input';
import { ProgressBar } from '../components/ui/progress';
import {
    Form,
    FormItem,
    FormControl,
    FormErrorMessage
} from '../components/ui/form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';
// New unified components
import { AuthFormCard, GradientButton, AnimatedBackground, ParticleEffect, CenteredContainer } from '../components/ui';
import { useProgressSteps, useAuthenticatedRedirect } from '../components/ui';
import { containerVariants, itemVariants } from '@/lib/animationVariants';

interface OtpVerificationFormData {
    otp: string;
}

const OtpVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const { verifyRegistrationOTP, requestRegistrationOTP, isAuthenticated } = useAuth();
    
    // Use the new hooks
    const { progress, progressStep, isRunning, startProgress } = useProgressSteps();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<OtpVerificationFormData>({
        defaultValues: {
            otp: ''
        }
    });

    const otpValue = watch('otp');

    // Use the new auth redirect hook
    useAuthenticatedRedirect(isAuthenticated, '/complete-profile');

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
        if (!phoneNumber) return;

        const progressSteps = [
            { label: 'Validating OTP...', progress: 25, duration: 300 },
            { label: 'Verifying with server...', progress: 50, duration: 400 },
            { label: 'Processing verification...', progress: 75, duration: 200 },
            { label: 'Verification successful!', progress: 100, duration: 300 }
        ];

        try {
            await startProgress(progressSteps.slice(0, 3));
            
            const success = await verifyRegistrationOTP(phoneNumber, data.otp);

            if (success) {
                await startProgress(progressSteps.slice(3));
                navigate('/complete-profile');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error('Failed to verify OTP. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        if (!phoneNumber || !canResend || isRunning) return;

        try {
            const success = await requestRegistrationOTP(phoneNumber);

            if (success) {
                setCountdown(60);
                setCanResend(false);

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
            }
        } catch (error) {
            console.error('OTP resend error:', error);
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
            <CenteredContainer>
                <AnimatedBackground />
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AuthFormCard
                        icon={CheckCircle2}
                        title="Verify Your Phone"
                        subtitle={`We've sent a 6-digit code to ${phoneNumber ? formatPhoneNumber(phoneNumber) : ''}`}
                    >

                        <div className="px-8 pb-6">
                            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <motion.div variants={itemVariants}>
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    id="otp"
                                                    placeholder="Enter 6-digit code"
                                                    className="text-center text-2xl tracking-widest h-16 rounded-xl border-2 border-gray-200 focus:border-primary transition-all duration-300 bg-gray-50 focus:bg-white font-mono"
                                                    maxLength={6}
                                                    {...register('otp', {
                                                        required: 'Verification code is required',
                                                        pattern: {
                                                            value: /^[0-9]{6}$/,
                                                            message: 'Please enter a valid 6-digit code'
                                                        }
                                                    })}
                                                />
                                            </FormControl>

                                            {/* Progress indicators */}
                                            <div className="flex justify-center mt-4 space-x-2">
                                                {[...Array(6)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                            i < (otpValue?.length || 0)
                                                                ? 'bg-primary shadow-lg'
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
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-4">
                                        <GradientButton
                                            type="submit"
                                            icon={CheckCircle2}
                                            isLoading={isRunning}
                                            progress={progress}
                                            progressStep={progressStep}
                                            loadingText="Verifying..."
                                            disabled={!otpValue || otpValue.length !== 6}
                                        >
                                            Verify Code
                                        </GradientButton>

                                        <AnimatePresence>
                                            {isRunning && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-2"
                                                >
                                                    <ProgressBar 
                                                        value={progress}
                                                        className="w-full max-w-xs mx-auto"
                                                        color="primary"
                                                        animated={true}
                                                        showLabel={false}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="text-center text-sm">
                                            <span className="text-gray-500">Didn't receive the code? </span>
                                            {canResend ? (
                                                <motion.button
                                                    type="button"
                                                    className="text-primary hover:text-accent font-semibold hover:underline transition-colors duration-300"
                                                    onClick={handleResendOtp}
                                                    disabled={isRunning}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Resend Code
                                                </motion.button>
                                            ) : (
                                                <span className="text-gray-500">
                                                    Resend in {countdown}s
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                            </Form>
                        </div>

                        <div className="px-8 pb-8">
                                <motion.div variants={itemVariants} className="w-full text-center space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Your code will expire in 10 minutes
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        By verifying, you agree to receive SMS notifications from TrackAm
                                    </div>
                                </motion.div>
                        </div>
                        
                        <ParticleEffect
                            isVisible={otpValue ? otpValue.length === 6 : false}
                            particleCount={8}
                            color="primary"
                            duration={2}
                        />
                    </AuthFormCard>
                </motion.div>
            </CenteredContainer>
        </Layout>
    );
};

export default OtpVerificationPage;