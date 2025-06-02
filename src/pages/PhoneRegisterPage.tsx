import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
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
    const { requestRegistrationOTP, isAuthenticated } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<PhoneRegistrationFormData>({
        defaultValues: {
            phoneNumber: '',
            agreeToTerms: false
        }
    });

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
                            scale: [1, 1.2, 1],
                            rotate: [0, -5, 5, 0]
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-16 right-16 w-40 h-40 bg-accent/10 rounded-full blur-2xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 0.8, 1],
                            rotate: [0, 8, -8, 0]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 3
                        }}
                        className="absolute bottom-16 left-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
                    />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md relative z-10"
                >
                    <Card className="bg-white/80 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
                        {/* Gradient border effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl p-0.5">
                            <div className="bg-white rounded-xl h-full w-full" />
                        </div>

                        <div className="relative z-10">
                            <CardHeader className="text-center pb-6">
                                <motion.div
                                    variants={itemVariants}
                                    className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                                >
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
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
                                <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <motion.div variants={itemVariants}>
                                        <FormItem>
                                            <FormLabel htmlFor="phoneNumber" className="text-gray-700 font-medium">
                                                Phone Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="phoneNumber"
                                                    placeholder="Enter your phone number"
                                                    className="h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white"
                                                    {...register('phoneNumber', {
                                                        required: 'Phone number is required',
                                                        pattern: {
                                                            value: /^(\+?234|0)[789]\d{9}$/,
                                                            message: 'Enter a valid Nigerian phone number'
                                                        }
                                                    })}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-gray-500">
                                                Format: +2348012345678 or 08012345678
                                            </FormDescription>
                                            {errors.phoneNumber && (
                                                <FormErrorMessage className="flex items-center gap-2 mt-2">
                                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {errors.phoneNumber.message}
                                                </FormErrorMessage>
                                            )}
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
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
                                                {errors.agreeToTerms && (
                                                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {errors.agreeToTerms.message}
                                                    </p>
                                                )}
                                            </div>
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                            disabled={isSubmitting}
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
                                <motion.div variants={itemVariants} className="w-full text-center space-y-4">
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
                                            Secure & verified
                                        </div>
                                    </div>
                                </motion.div>
                            </CardFooter>
                        </div>

                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1.5 h-1.5 bg-accent/40 rounded-full"
                                    style={{
                                        left: `${15 + i * 18}%`,
                                        top: `${8 + i * 12}%`,
                                    }}
                                    animate={{
                                        y: [0, -30, 0],
                                        opacity: [0.4, 0.9, 0.4],
                                        scale: [1, 1.8, 1]
                                    }}
                                    transition={{
                                        duration: 4 + i * 0.6,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.3
                                    }}
                                />
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </Layout>
    );
};

export default PhoneRegisterPage;