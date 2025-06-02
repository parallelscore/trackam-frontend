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
    FormLabel,
    FormControl,
    FormErrorMessage,
    FormDescription
} from '../components/ui/form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PhoneRegistrationFormData {
    phoneNumber: string;
    agreeToTerms: boolean;
}

const PhoneRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const { requestRegistrationOTP, isAuthenticated } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<PhoneRegistrationFormData>({
        defaultValues: {
            phoneNumber: '',
            agreeToTerms: false
        }
    });

    const phoneNumber = watch('phoneNumber');
    const agreeToTerms = watch('agreeToTerms');

    // Check if phone number matches Nigerian format
    const isValidPhone = phoneNumber ? /^(\+?234|0)[789]\d{9}$/.test(phoneNumber) : false;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/vendor');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data: PhoneRegistrationFormData) => {
        setIsSubmitting(true);

        try {
            // Request OTP
            const success = await requestRegistrationOTP(data.phoneNumber);

            if (success) {
                // Store the phone number in session storage for the OTP verification page
                sessionStorage.setItem('registrationPhone', data.phoneNumber);

                // Navigate to OTP verification page
                navigate('/verify-otp');
            }
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                            scale: [1, 1.3, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-10 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 0.7, 1],
                            rotate: [0, -15, 15, 0]
                        }}
                        transition={{
                            duration: 14,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className="absolute bottom-10 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-2xl"
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
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                    </motion.div>

                                    {/* Pulsing rings */}
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl border-2 border-primary/30"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl border-2 border-accent/30"
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                                        Join TrackAm
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 text-lg">
                                        Create your vendor account and start tracking deliveries
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
                                                            required: 'Phone number is required',
                                                            pattern: {
                                                                value: /^(\+?234|0)[789]\d{9}$/,
                                                                message: 'Enter a valid Nigerian phone number'
                                                            }
                                                        })}
                                                    />
                                                </FormControl>
                                            </div>

                                            {/* Phone validation progress indicators */}
                                            {phoneNumber && (
                                                <div className="flex justify-center mt-4 space-x-2">
                                                    {[...Array(10)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                                i < phoneNumber.replace(/[^0-9]/g, '').slice(-10).length
                                                                    ? isValidPhone ? 'bg-primary shadow-lg' : 'bg-amber-500'
                                                                    : 'bg-gray-200'
                                                            }`}
                                                            animate={i < phoneNumber.replace(/[^0-9]/g, '').slice(-10).length ? { scale: [1, 1.2, 1] } : {}}
                                                            transition={{ duration: 0.2 }}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <AnimatePresence>
                                                {errors.phoneNumber && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center justify-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                                                    >
                                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <FormErrorMessage>
                                                            {errors.phoneNumber.message}
                                                        </FormErrorMessage>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="max-w-xs mx-auto">
                                        <FormItem className="flex items-start space-x-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="agreeToTerms"
                                                className="h-5 w-5 mt-0.5 rounded border-2 border-gray-300 text-primary focus:ring-primary focus:ring-2 transition-all duration-200"
                                                {...register('agreeToTerms', {
                                                    required: 'You must agree to the terms and conditions'
                                                })}
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                                                    I agree to the{' '}
                                                    <Link
                                                        to="/terms"
                                                        className="text-primary hover:text-accent transition-colors duration-300 font-medium hover:underline"
                                                    >
                                                        Terms of Service
                                                    </Link>
                                                    {' '}and{' '}
                                                    <Link
                                                        to="/privacy"
                                                        className="text-primary hover:text-accent transition-colors duration-300 font-medium hover:underline"
                                                    >
                                                        Privacy Policy
                                                    </Link>
                                                </label>
                                                <AnimatePresence>
                                                    {errors.agreeToTerms && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -5 }}
                                                            className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {errors.agreeToTerms.message}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex justify-center">
                                        <Button
                                            type="submit"
                                            className="w-full max-w-xs h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                            disabled={isSubmitting || !isValidPhone || !agreeToTerms}
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
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                        Create Account
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    </motion.div>
                                </Form>
                            </CardContent>

                            <CardFooter className="px-8 pb-8">
                                <motion.div variants={itemVariants} className="w-full text-center space-y-3">
                                    <div className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                            to="/login"
                                            className="text-primary hover:text-accent transition-colors duration-300 font-semibold hover:underline"
                                        >
                                            Sign in
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Free to join
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Code expires in 10 minutes
                                        </div>
                                    </div>
                                </motion.div>
                            </CardFooter>
                        </div>

                        {/* Floating particles - match the verification page animation style */}
                        <AnimatePresence>
                            {phoneNumber && isValidPhone && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 bg-primary/60 rounded-full"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                            }}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -50]
                                            }}
                                            transition={{
                                                duration: 2,
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

export default PhoneRegisterPage;
