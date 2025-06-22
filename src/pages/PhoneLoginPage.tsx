import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    FormLabel,
    FormControl,
    FormErrorMessage
} from '../components/ui/form';
import { useAuth } from '../context/AuthContext';
import { PhoneValidator, VALIDATION_MESSAGES } from '../utils/validation';
import { PhoneSanitizer } from '../utils/sanitization';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ProgressBar, CircularProgress } from '../components/ui/progress';

interface PhoneLoginFormData {
    phoneNumber: string;
}

const PhoneLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const { requestLoginOTP, isAuthenticated } = useAuth();
    
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
    } = useForm<PhoneLoginFormData>({
        defaultValues: {
            phoneNumber: ''
        }
    });

    const phoneNumber = watch('phoneNumber');
    
    // Real-time phone validation
    const phoneValidation = phoneNumber ? PhoneValidator.validate(phoneNumber) : { isValid: false };
    const isValidPhone = phoneValidation.isValid;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/vendor');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data: PhoneLoginFormData) => {
        setIsSubmitting(true);
        setProgress(0);

        try {
            // Step 1: Validating phone number
            setProgressStep('Validating phone number...');
            setProgress(25);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Sanitize and validate phone number
            const sanitizedPhone = PhoneSanitizer.sanitize(data.phoneNumber);
            const validation = PhoneValidator.validate(sanitizedPhone);
            
            if (!validation.isValid) {
                console.error('Invalid phone number:', validation.error);
                setIsSubmitting(false);
                setProgress(0);
                setProgressStep('');
                return;
            }

            // Step 2: Preparing SMS
            setProgressStep('Preparing SMS...');
            setProgress(50);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Use the formatted phone number for API call
            const formattedPhone = PhoneValidator.formatForAPI(sanitizedPhone);
            
            // Step 3: Sending OTP
            setProgressStep('Sending OTP code...');
            setProgress(75);
            const success = await requestLoginOTP(formattedPhone);

            if (success) {
                // Step 4: Complete
                setProgressStep('Code sent successfully!');
                setProgress(100);
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Store the formatted phone number in session storage for the OTP verification page
                sessionStorage.setItem('loginPhone', formattedPhone);

                // Navigate to OTP verification page
                navigate('/verify-login-otp');
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
            setProgress(0);
            setProgressStep('');
        }
    };

    // Handle phone number input change with real-time sanitization
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = PhoneSanitizer.sanitize(e.target.value);
        setValue('phoneNumber', sanitized);
        trigger('phoneNumber');
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
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
                                        Welcome Back
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 text-lg">
                                        Sign in to your TrackAm vendor account
                                    </CardDescription>
                                </motion.div>
                            </CardHeader>

                            <CardContent className="px-8 pb-6">
                                <Form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <motion.div variants={itemVariants}>
                                        <FormItem className="text-center">
                                            <div className="flex items-center justify-center mb-2">
                                                <FormLabel htmlFor="phoneNumber" className="text-gray-700 font-medium">
                                                    Phone Number
                                                </FormLabel>
                                                <div className="relative inline-block ml-2">
                                                    <motion.button
                                                        type="button"
                                                        className="text-gray-500 hover:text-primary focus:outline-none transition-colors"
                                                        onMouseEnter={() => setShowTooltip(true)}
                                                        onMouseLeave={() => setShowTooltip(false)}
                                                        onClick={() => setShowTooltip(!showTooltip)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                                        </svg>
                                                    </motion.button>
                                                    
                                                    <AnimatePresence>
                                                        {showTooltip && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="absolute z-50 right-0 mt-2 w-56 p-3 bg-white rounded-lg shadow-lg border border-gray-100"
                                                            >
                                                                <div className="text-sm text-gray-600 font-medium mb-1">Accepted formats:</div>
                                                                <ul className="text-xs text-gray-500 space-y-1">
                                                                    <li className="flex items-center gap-1">
                                                                        <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
                                                                        <code>+2348012345678</code> (international)
                                                                    </li>
                                                                    <li className="flex items-center gap-1">
                                                                        <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
                                                                        <code>08012345678</code> (local)
                                                                    </li>
                                                                </ul>
                                                                <div className="absolute top-0 right-4 transform -translate-y-1/2 rotate-45 w-2 h-2 bg-white border-t border-l border-gray-100"></div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                            
                                            <div className="relative max-w-xs mx-auto">
                                                <FormControl>
                                                    <Input
                                                        id="phoneNumber"
                                                        placeholder="Enter your phone number"
                                                        className="h-16 text-center text-xl border-2 border-gray-200 focus:border-primary rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white"
                                                        {...register('phoneNumber', {
                                                            required: VALIDATION_MESSAGES.REQUIRED,
                                                            validate: (value: string) => {
                                                                const result = PhoneValidator.validate(value);
                                                                return result.isValid || result.error;
                                                            }
                                                        })}
                                                        onChange={handlePhoneChange}
                                                    />
                                                </FormControl>
                                            </div>
                                            
                                            {/* Phone validation status indicator */}
                                            {phoneNumber && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center justify-center mt-4 gap-2"
                                                >
                                                    {isValidPhone ? (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-green-700 font-medium">Valid Nigerian number</span>
                                                        </div>
                                                    ) : phoneValidation.error ? (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                                            <span className="text-sm text-amber-700">{phoneValidation.error}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <Info className="w-4 h-4 text-blue-600" />
                                                            <span className="text-sm text-blue-700">{VALIDATION_MESSAGES.PHONE_FORMAT_HINT}</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                            
                                            <AnimatePresence>
                                                {errors.phoneNumber && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center justify-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                                                    >
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                        <FormErrorMessage className="text-red-600 font-medium">
                                                            {errors.phoneNumber.message}
                                                        </FormErrorMessage>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex justify-center">
                                        <Button
                                            type="submit"
                                            className="w-full max-w-xs h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                            disabled={isSubmitting || !isValidPhone}
                                        >
                                            {/* Button background animation */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isSubmitting ? (
                                                    <>
                                                        <CircularProgress 
                                                            value={progress}
                                                            size={20}
                                                            color="white"
                                                            showValue={false}
                                                            className="text-white"
                                                        />
                                                        {progressStep || 'Sending Code...'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Send Login Code
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                        
                                        {/* Progress Bar */}
                                        <AnimatePresence>
                                            {isSubmitting && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="mt-4 space-y-2"
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
                                    </motion.div>
                                </Form>
                            </CardContent>

                            <CardFooter className="px-8 pb-8">
                                <motion.div variants={itemVariants} className="w-full text-center space-y-3">
                                    <div className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link
                                            to="/register"
                                            className="text-primary hover:text-accent transition-colors duration-300 font-semibold hover:underline"
                                        >
                                            Create vendor account
                                        </Link>
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

                        {/* Floating particles - match OTP page success animation style */}
                        <AnimatePresence>
                            {phoneNumber && isValidPhone && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {[...Array(4)].map((_, i) => (
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

export default PhoneLoginPage;
