import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import { Input } from '../components/ui/input';
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormErrorMessage
} from '../components/ui/form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneValidator, VALIDATION_MESSAGES } from '../utils/validation';
import { AlertCircle, UserPlus } from 'lucide-react';
import { ProgressBar } from '../components/ui/progress';
// New unified components
import { AuthFormCard, GradientButton, AnimatedBackground, ParticleEffect, StatusIndicator, CenteredContainer } from '../components/ui';
import { useProgressSteps, usePhoneForm, useAuthenticatedRedirect } from '../components/ui';
import { containerVariants, itemVariants } from '@/lib/animationVariants';

interface PhoneRegistrationFormData {
    phoneNumber: string;
    agreeToTerms: boolean;
}

const PhoneRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const { requestRegistrationOTP, isAuthenticated } = useAuth();
    
    // Use the new hooks
    const { progress, progressStep, isRunning, startProgress } = useProgressSteps();
    const { phoneNumber, register, handleSubmit, errors, isValid: isValidPhone, validationMessage, handlePhoneChange } = usePhoneForm();
    
    // Use the new auth redirect hook
    useAuthenticatedRedirect(isAuthenticated, '/vendor');

    const onSubmit = async (data: { phoneNumber: string }) => {
        if (!isValidPhone || !agreeToTerms) return;

        const progressSteps = [
            { label: 'Validating phone number...', progress: 25, duration: 200 },
            { label: 'Checking availability...', progress: 50, duration: 300 },
            { label: 'Creating account...', progress: 75, duration: 200 },
            { label: 'Account created successfully!', progress: 100, duration: 300 }
        ];

        try {
            await startProgress(progressSteps.slice(0, 3));
            
            const formattedPhone = PhoneValidator.formatForAPI(data.phoneNumber);
            const success = await requestRegistrationOTP(formattedPhone);

            if (success) {
                await startProgress(progressSteps.slice(3));
                sessionStorage.setItem('registrationPhone', formattedPhone);
                navigate('/verify-otp');
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    // Format phone validation message for StatusIndicator
    const getValidationStatus = () => {
        if (!phoneNumber) return null;
        if (isValidPhone) return { type: 'success' as const, message: 'Valid Nigerian number' };
        if (validationMessage) return { type: 'warning' as const, message: validationMessage };
        return { type: 'info' as const, message: VALIDATION_MESSAGES.PHONE_FORMAT_HINT };
    };

    const validationStatus = getValidationStatus();

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
                        icon={UserPlus}
                        title="Join TrackAm"
                        subtitle="Create your vendor account and start tracking deliveries"
                    >

                        <div className="px-8 pb-6">
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

                                            {validationStatus && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex justify-center mt-4"
                                                >
                                                    <StatusIndicator
                                                        type={validationStatus.type}
                                                        message={validationStatus.message}
                                                    />
                                                </motion.div>
                                            )}

                                            <AnimatePresence>
                                                {errors.phoneNumber && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
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

                                    <motion.div variants={itemVariants} className="max-w-xs mx-auto">
                                        <FormItem className="flex items-start space-x-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="agreeToTerms"
                                                className="h-5 w-5 mt-0.5 rounded border-2 border-gray-300 text-primary focus:ring-primary focus:ring-2 transition-all duration-200"
                                                checked={agreeToTerms}
                                                onChange={(e) => setAgreeToTerms(e.target.checked)}
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
                                                    {!agreeToTerms && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -5 }}
                                                            className="text-red-500 text-xs mt-2 flex items-center gap-1"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Please agree to the terms
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </FormItem>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex justify-center">
                                        <GradientButton
                                            type="submit"
                                            icon={UserPlus}
                                            isLoading={isRunning}
                                            progress={progress}
                                            progressStep={progressStep}
                                            disabled={!isValidPhone || !agreeToTerms}
                                            className="max-w-xs"
                                        >
                                            Create Account
                                        </GradientButton>
                                        
                                        <AnimatePresence>
                                            {isRunning && (
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                            </Form>
                        </div>

                        <div className="px-8 pb-8">
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
                        </div>
                        
                        <ParticleEffect
                            isVisible={phoneNumber ? isValidPhone : false}
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

export default PhoneRegisterPage;
