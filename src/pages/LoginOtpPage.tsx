import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useAuth } from '../context/AuthContext';
import { OTPValidator, VALIDATION_MESSAGES } from '../utils/validation';
import { OTPSanitizer } from '../utils/sanitization';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ProgressBar, CircularProgress } from '../components/ui/progress';

interface LoginOtpFormData {
    otp: string;
}

const LoginOtpPage: React.FC = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const { verifyLoginOTP, requestLoginOTP, isAuthenticated } = useAuth();
    
    // Progress state
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger
    } = useForm<LoginOtpFormData>({
        defaultValues: {
            otp: ''
        }
    });

    const otpValue = watch('otp');
    
    // Real-time OTP validation
    const otpValidation = otpValue ? OTPValidator.validate(otpValue) : { isValid: false };
    const isValidOtp = otpValidation.isValid;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/vendor');
        }
    }, [isAuthenticated, navigate]);

    // Check if there's a phone number in session storage
    useEffect(() => {
        const storedPhone = sessionStorage.getItem('loginPhone');
        if (!storedPhone) {
            // Redirect to login if no phone number is found
            navigate('/login');
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

    const onSubmit = async (data: LoginOtpFormData) => {
        if (!phoneNumber) return;

        setIsSubmitting(true);
        setProgress(0);

        try {
            // Step 1: Validating OTP
            setProgressStep('Validating OTP...');
            setProgress(25);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Sanitize and validate OTP
            const sanitizedOtp = OTPSanitizer.sanitize(data.otp);
            const validation = OTPValidator.validate(sanitizedOtp);
            
            if (!validation.isValid) {
                toast.error(validation.error || 'Invalid OTP format');
                setIsSubmitting(false);
                setProgress(0);
                setProgressStep('');
                return;
            }

            // Step 2: Verifying with server
            setProgressStep('Verifying with server...');
            setProgress(50);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Step 3: Authenticating user
            setProgressStep('Authenticating user...');
            setProgress(75);
            
            // Verify OTP with sanitized value
            const success = await verifyLoginOTP(phoneNumber, sanitizedOtp);

            if (success) {
                // Step 4: Complete
                setProgressStep('Login successful!');
                setProgress(100);
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Clear login data from session storage
                sessionStorage.removeItem('loginPhone');

                // Navigate to vendor dashboard
                navigate('/vendor');
                // Note: AuthContext already shows success toast, no need for duplicate
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error('Failed to verify OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
            setProgress(0);
            setProgressStep('');
        }
    };

    // Handle OTP input change with real-time sanitization
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = OTPSanitizer.sanitize(e.target.value);
        setValue('otp', sanitized);
        trigger('otp');
    };

    const handleResendOtp = async () => {
        if (!phoneNumber || !canResend) return;

        setIsSubmitting(true);

        try {
            // Resend OTP
            const success = await requestLoginOTP(phoneNumber);

            if (success) {
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
            }
        } catch (error) {
            console.error('OTP resend error:', error);
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

    // Animation variants
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

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
                {/* Background decorative elements */}
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
                        className="absolute top-16 right-20 w-36 h-36 bg-primary/10 rounded-full blur-2xl"
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
                        className="absolute bottom-20 left-16 w-28 h-28 bg-accent/10 rounded-full blur-2xl"
                    />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md relative z-10"
                >
                    <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                        {/* Gradient border effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl p-0.5">
                            <div className="bg-white rounded-xl h-full w-full" />
                        </div>

                        <div className="relative z-10">
                            <CardHeader className="text-center pb-6">
                                <motion.div
                                    variants={itemVariants}
                                    className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative"
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

                                    {/* Pulsing rings */}
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl border-2 border-primary/40"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl border-2 border-accent/40"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                                        Verify Login
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 text-lg px-4">
                                        Enter the 6-digit code sent to{' '}
                                        {phoneNumber && (
                                            <span className="font-semibold text-primary">
                                                {formatPhoneNumber(phoneNumber)}
                                            </span>
                                        )}
                                    </CardDescription>
                                </motion.div>
                            </CardHeader>

                            <CardContent className="px-8 pb-6">
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
                                                        required: VALIDATION_MESSAGES.OTP_REQUIRED,
                                                        validate: (value: string) => {
                                                            const result = OTPValidator.validate(value);
                                                            return result.isValid || result.error;
                                                        }
                                                    })}
                                                    onChange={handleOtpChange}
                                                />
                                            </FormControl>

                                            {/* OTP validation status */}
                                            {otpValue && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center justify-center mt-4 gap-2"
                                                >
                                                    {isValidOtp ? (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-green-700 font-medium">Valid OTP</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <span className="text-sm text-blue-700">
                                                                {otpValue.length}/6 digits entered
                                                            </span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* Progress indicators */}
                                            <div className="flex justify-center mt-4 space-x-2">
                                                {[...Array(6)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                            i < (otpValue?.length || 0)
                                                                ? isValidOtp ? 'bg-green-500 shadow-lg' : 'bg-primary shadow-lg'
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
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                        <FormErrorMessage className="text-center text-red-600 font-medium">
                                                            {errors.otp.message}
                                                        </FormErrorMessage>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                            disabled={isSubmitting || !otpValue || otpValue.length !== 6}
                                        >
                                            {/* Button background animation */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isSubmitting ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                        />
                                                        Signing In...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                        </svg>
                                                        Sign In
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                        
                                        {/* Progress Bar - Below the button */}
                                        <AnimatePresence>
                                            {isSubmitting && (
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
                                                    <div className="text-center text-sm text-gray-600">
                                                        {progressStep}
                                                    </div>
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
                                                    disabled={isSubmitting}
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
                            </CardContent>

                            <CardFooter className="px-8 pb-8">
                                <motion.div variants={itemVariants} className="w-full text-center space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Your login code will expire in 10 minutes
                                    </div>

                                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Secure login
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            OTP protected
                                        </div>
                                    </div>
                                </motion.div>
                            </CardFooter>
                        </div>

                        {/* Floating success particles */}
                        <AnimatePresence>
                            {otpValue && otpValue.length === 6 && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 bg-accent/60 rounded-full"
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
        </Layout>
    );
};

export default LoginOtpPage;