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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Badge } from '../components/ui/badge';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { NameValidator, BusinessNameValidator, EmailValidator, VALIDATION_MESSAGES } from '../utils/validation';
import { NameSanitizer, BusinessNameSanitizer, EmailSanitizer } from '../utils/sanitization';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface CompleteProfileFormData {
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    profileImage: FileList;
}

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const slideInLeft = {
    hidden: { x: -50, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const CompleteProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImageUrl] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const totalSteps = 3;
    const { completeProfile, isAuthenticated, isLoading } = useAuth();
    const [showSkipDialog, setShowSkipDialog] = useState(false);
    const [isDragging, setIsDragging] = useState(false);


    const {
        register,
        handleSubmit,
        formState: { errors, isValid, dirtyFields },
        trigger,
        setValue,
        watch
    } = useForm<CompleteProfileFormData>({
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            businessName: '',
            email: ''
        }
    });

    // Watch form values for real-time validation
    const firstName = watch('firstName');
    const lastName = watch('lastName');
    const businessName = watch('businessName');
    const email = watch('email');

    // Real-time validation results
    const firstNameValidation = firstName ? NameValidator.validate(firstName, 'First name') : { isValid: false };
    const lastNameValidation = lastName ? NameValidator.validate(lastName, 'Last name') : { isValid: false };
    const businessNameValidation = businessName ? BusinessNameValidator.validate(businessName) : { isValid: false };
    const emailValidation = email ? EmailValidator.validate(email) : { isValid: false };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/register');
            toast.error('Please complete the registration process');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        setValue('profileImage', files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const onSubmit = async (data: CompleteProfileFormData) => {
        setIsSubmitting(true);

        try {
            // Sanitize and validate all inputs
            const sanitizedFirstName = NameSanitizer.sanitize(data.firstName);
            const sanitizedLastName = NameSanitizer.sanitize(data.lastName);
            const sanitizedBusinessName = BusinessNameSanitizer.sanitize(data.businessName);
            const sanitizedEmail = EmailSanitizer.sanitize(data.email);

            // Validate all fields
            const firstNameValidation = NameValidator.validate(sanitizedFirstName, 'First name');
            const lastNameValidation = NameValidator.validate(sanitizedLastName, 'Last name');
            const businessNameValidation = BusinessNameValidator.validate(sanitizedBusinessName);
            const emailValidation = EmailValidator.validate(sanitizedEmail);

            // Check if all validations pass
            if (!firstNameValidation.isValid) {
                toast.error(firstNameValidation.error || 'Invalid first name');
                setIsSubmitting(false);
                return;
            }
            if (!lastNameValidation.isValid) {
                toast.error(lastNameValidation.error || 'Invalid last name');
                setIsSubmitting(false);
                return;
            }
            if (!businessNameValidation.isValid) {
                toast.error(businessNameValidation.error || 'Invalid business name');
                setIsSubmitting(false);
                return;
            }
            if (!emailValidation.isValid) {
                toast.error(emailValidation.error || 'Invalid email address');
                setIsSubmitting(false);
                return;
            }

            // In a real app, you would first upload the image to a server
            // and then use the returned URL in profile data
            let imageUrl = null;
            if (profileImageUrl) {
                // This is a placeholder for actual image upload logic
                // In a real app, you would have an API endpoint for image upload
                // and use the returned URL in profile data
                imageUrl = profileImageUrl;
            }

            // Complete profile with sanitized data
            const success = await completeProfile({
                first_name: firstNameValidation.sanitizedValue || sanitizedFirstName,
                last_name: lastNameValidation.sanitizedValue || sanitizedLastName,
                business_name: businessNameValidation.sanitizedValue || sanitizedBusinessName,
                email: emailValidation.sanitizedValue || sanitizedEmail,
                profile_image_url: imageUrl,
            });

            if (success) {
                // Clear registration data from session storage
                sessionStorage.removeItem('registrationPhone');
                sessionStorage.removeItem('otpVerified');

                // Show success message
                toast.success('Profile completed successfully! Welcome to TrackAm! 🎉');

                // Navigate to vendor dashboard after a brief delay
                setTimeout(() => {
                    navigate('/vendor');
                }, 1500);
            }
        } catch (error) {
            console.error('Profile completion error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        setIsSubmitting(true);

        try {
            // Navigate to vendor dashboard
            navigate('/vendor');

            // Clear registration data from session storage
            sessionStorage.removeItem('registrationPhone');
            sessionStorage.removeItem('otpVerified');

            toast.success('Welcome to TrackAm! You can complete your profile later.');
        } catch (error) {
            console.error('Skip profile error:', error);
        } finally {
            setIsSubmitting(false);
            setShowSkipDialog(false);
        }
    };

    const nextStep = async () => {
        const currentStepFields = getFieldsForStep(step);
        const isCurrentStepValid = await trigger(currentStepFields);

        if (isCurrentStepValid) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    // Handle input changes with real-time sanitization
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = NameSanitizer.sanitize(e.target.value);
        setValue('firstName', sanitized);
        trigger('firstName');
    };

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = NameSanitizer.sanitize(e.target.value);
        setValue('lastName', sanitized);
        trigger('lastName');
    };

    const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = BusinessNameSanitizer.sanitize(e.target.value);
        setValue('businessName', sanitized);
        trigger('businessName');
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = EmailSanitizer.sanitize(e.target.value);
        setValue('email', sanitized);
        trigger('email');
    };

    const getFieldsForStep = (stepNumber: number): (keyof CompleteProfileFormData)[] => {
        switch (stepNumber) {
            case 1:
                return ['firstName', 'lastName'];
            case 2:
                return ['businessName'];
            case 3:
                return ['email'];
            default:
                return [];
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 relative">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute"></div>
                                <div className="w-12 h-12 border-4 border-accent border-b-transparent rounded-full animate-spin absolute top-2 left-2" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
                            </div>
                            <p className="text-lg font-medium text-secondary mt-4">Loading your profile...</p>
                            <p className="text-sm text-gray-500">Please wait a moment</p>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    const progressPercentage = (step / totalSteps) * 100;

    return (
        <Layout>
            {/* Background with animated elements */}
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 relative overflow-hidden">
                {/* Animated background elements */}
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-20 right-20 w-32 h-32 border border-primary/10 rounded-full hidden lg:block"
                />
                <motion.div
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full hidden lg:block"
                />

                <div className="max-w-2xl mx-auto px-4 py-8 lg:py-16 relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <motion.div variants={fadeInUp} className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Almost there!
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-secondary mb-2">
                                Complete Your Profile
                            </h1>
                            <p className="text-lg text-gray-600">
                                Tell us about yourself and your business to personalize your TrackAm experience
                            </p>
                        </motion.div>

                        {/* Progress Bar */}
                        <motion.div variants={fadeInUp} className="w-full">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-medium text-gray-500">
                                    Step {step} of {totalSteps}
                                </span>
                                <span className="text-sm font-medium text-primary">
                                    {Math.round(progressPercentage)}% Complete
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>

                        {/* Main Card */}
                        <motion.div variants={scaleIn}>
                            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="text-center pb-6">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {step === 1 && (
                                            <>
                                                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <CardTitle className="text-2xl text-secondary">Personal Information</CardTitle>
                                                <CardDescription className="text-base">
                                                    Let's start with your basic details
                                                </CardDescription>
                                            </>
                                        )}
                                        {step === 2 && (
                                            <>
                                                <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <CardTitle className="text-2xl text-secondary">Business Details</CardTitle>
                                                <CardDescription className="text-base">
                                                    Tell us about your business
                                                </CardDescription>
                                            </>
                                        )}
                                        {step === 3 && (
                                            <>
                                                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <CardTitle className="text-2xl text-secondary">Contact & Profile</CardTitle>
                                                <CardDescription className="text-base">
                                                    Finalize your profile setup
                                                </CardDescription>
                                            </>
                                        )}
                                    </motion.div>
                                </CardHeader>

                                <CardContent className="px-6 lg:px-8">
                                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <AnimatePresence mode="wait">
                                            {step === 1 && (
                                                <motion.div
                                                    key="step1"
                                                    variants={staggerContainer}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -50 }}
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                                >
                                                    <motion.div variants={slideInLeft}>
                                                        <FormItem>
                                                            <FormLabel htmlFor="firstName" className="text-base font-medium">
                                                                First Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    id="firstName"
                                                                    placeholder="Enter your first name"
                                                                    className="h-12 text-lg border-2 focus:border-primary transition-colors"
                                                                    aria-required="true"
                                                                    aria-invalid={errors.firstName ? "true" : "false"}
                                                                    {...register('firstName', {
                                                                        required: VALIDATION_MESSAGES.REQUIRED,
                                                                        validate: (value: string) => {
                                                                            const result = NameValidator.validate(value, 'First name');
                                                                            return result.isValid || result.error;
                                                                        }
                                                                    })}
                                                                    onChange={handleFirstNameChange}
                                                                />
                                                            </FormControl>

                                                            {/* Real-time validation feedback */}
                                                            {firstName && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="flex items-center justify-start mt-2 gap-2"
                                                                >
                                                                    {firstNameValidation.isValid ? (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                                            <span className="text-sm text-green-700 font-medium">Valid name</span>
                                                                        </div>
                                                                    ) : firstNameValidation.error ? (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                                                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                                                            <span className="text-sm text-amber-700">{firstNameValidation.error}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                                                                            <Info className="w-4 h-4 text-blue-600" />
                                                                            <span className="text-sm text-blue-700">Enter your first name</span>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}

                                                            {errors.firstName && (
                                                                <FormErrorMessage role="alert" className="mt-2">{errors.firstName.message}</FormErrorMessage>
                                                            )}
                                                        </FormItem>
                                                    </motion.div>

                                                    <motion.div variants={slideInLeft}>
                                                        <FormItem>
                                                            <FormLabel htmlFor="lastName" className="text-base font-medium">
                                                                Last Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    id="lastName"
                                                                    placeholder="Enter your last name"
                                                                    className="h-12 text-lg border-2 focus:border-primary transition-colors"
                                                                    aria-required="true"
                                                                    aria-invalid={errors.lastName ? "true" : "false"}
                                                                    {...register('lastName', {
                                                                        required: VALIDATION_MESSAGES.REQUIRED,
                                                                        validate: (value: string) => {
                                                                            const result = NameValidator.validate(value, 'Last name');
                                                                            return result.isValid || result.error;
                                                                        }
                                                                    })}
                                                                    onChange={handleLastNameChange}
                                                                />
                                                            </FormControl>

                                                            {/* Real-time validation feedback */}
                                                            {lastName && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="flex items-center justify-start mt-2 gap-2"
                                                                >
                                                                    {lastNameValidation.isValid ? (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                                            <span className="text-sm text-green-700 font-medium">Valid name</span>
                                                                        </div>
                                                                    ) : lastNameValidation.error ? (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                                                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                                                            <span className="text-sm text-amber-700">{lastNameValidation.error}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                                                                            <Info className="w-4 h-4 text-blue-600" />
                                                                            <span className="text-sm text-blue-700">Enter your last name</span>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}

                                                            {errors.lastName && (
                                                                <FormErrorMessage role="alert" className="mt-2">{errors.lastName.message}</FormErrorMessage>
                                                            )}
                                                        </FormItem>
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {step === 2 && (
                                                <motion.div
                                                    key="step2"
                                                    variants={fadeInUp}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -50 }}
                                                >
                                                    <FormItem>
                                                        <div className="flex items-center justify-between">
                                                            <FormLabel htmlFor="businessName" className="text-base font-medium">
                                                                Business Name
                                                            </FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="text-gray-400 hover:text-gray-600 cursor-help">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="bg-secondary text-white p-2">
                                                                        <p>This name will appear on customer notifications</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <FormControl>
                                                            <Input
                                                                id="businessName"
                                                                placeholder="Enter your business name"
                                                                className="h-12 text-lg border-2 focus:border-primary transition-colors"
                                                                aria-required="true"
                                                                aria-invalid={errors.businessName ? "true" : "false"}
                                                                {...register('businessName', {
                                                                    required: VALIDATION_MESSAGES.REQUIRED,
                                                                    validate: (value: string) => {
                                                                        const result = BusinessNameValidator.validate(value);
                                                                        return result.isValid || result.error;
                                                                    }
                                                                })}
                                                                onChange={handleBusinessNameChange}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            This will be displayed on your delivery notifications
                                                        </FormDescription>

                                                        {/* Real-time validation feedback */}
                                                        {businessName && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="flex items-center justify-start mt-2 gap-2"
                                                            >
                                                                {businessNameValidation.isValid ? (
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                                        <span className="text-sm text-green-700 font-medium">Professional business name</span>
                                                                    </div>
                                                                ) : businessNameValidation.error ? (
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                                                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                                                        <span className="text-sm text-amber-700">{businessNameValidation.error}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                                                                        <Info className="w-4 h-4 text-blue-600" />
                                                                        <span className="text-sm text-blue-700">Enter your business name</span>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}

                                                        {errors.businessName && (
                                                            <FormErrorMessage role="alert" className="mt-2">{errors.businessName.message}</FormErrorMessage>
                                                        )}
                                                    </FormItem>
                                                </motion.div>
                                            )}

                                            {step === 3 && (
                                                <motion.div
                                                    key="step3"
                                                    variants={staggerContainer}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -50 }}
                                                    className="space-y-6"
                                                >
                                                    {/* Profile Image Upload with drag and drop */}
                                                    <motion.div variants={fadeInUp} className="flex flex-col items-center mb-6">
                                                        <div className="relative mb-4">
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                className={`h-32 w-32 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-xl ${
                                                                    isDragging ? 'bg-gradient-to-r from-primary/30 to-accent/30 ring-4 ring-primary/50' : 'bg-gradient-to-r from-primary/10 to-accent/10'
                                                                }`}
                                                                onDragOver={handleDragOver}
                                                                onDragLeave={handleDragLeave}
                                                                onDrop={handleDrop}
                                                                role="button"
                                                                aria-label="Upload profile image"
                                                                tabIndex={0}
                                                            >
                                                                {profileImageUrl ? (
                                                                    <motion.img
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        src={profileImageUrl}
                                                                        alt="Profile preview"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                        {isDragging && (
                                                                            <span className="text-xs text-primary mt-2 font-medium">Drop image</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                            <label
                                                                htmlFor="profileImage"
                                                                className="absolute bottom-0 right-0 bg-gradient-to-r from-primary to-accent text-white p-3 rounded-full cursor-pointer hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                <input
                                                                    id="profileImage"
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    aria-label="Upload profile picture"
                                                                    {...register('profileImage')}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className="text-sm text-gray-500 text-center">
                                                            Upload a profile picture (optional)
                                                            <br />
                                                            <span className="text-xs">Max size: 5MB</span>
                                                            <br />
                                                            <Badge variant="outline" className="mt-1 text-xs">Drag & Drop supported</Badge>
                                                        </div>
                                                    </motion.div>

                                                    {/* Email Input */}
                                                    <motion.div variants={fadeInUp}>
                                                        <FormItem>
                                                            <FormLabel htmlFor="email" className="text-base font-medium">
                                                                Email Address
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    id="email"
                                                                    type="email"
                                                                    placeholder="Enter your email address"
                                                                    className="h-12 text-lg border-2 focus:border-primary transition-colors"
                                                                    aria-required="true"
                                                                    aria-invalid={errors.email ? "true" : "false"}
                                                                    autoComplete="email"
                                                                    {...register('email', {
                                                                        required: VALIDATION_MESSAGES.REQUIRED,
                                                                        validate: (value: string) => {
                                                                            const result = EmailValidator.validate(value);
                                                                            return result.isValid || result.error;
                                                                        }
                                                                    })}
                                                                    onChange={handleEmailChange}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                We'll send a verification link to this email
                                                            </FormDescription>

                                                            {/* Real-time validation feedback */}
                                                            {email && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="flex items-center justify-start mt-2 gap-2"
                                                                >
                                                                    {emailValidation.isValid ? (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                                            <span className="text-sm text-green-700 font-medium">Valid email format</span>
                                                                        </div>
                                                                    ) : emailValidation.error ? (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                                                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                                                            <span className="text-sm text-amber-700">{emailValidation.error}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                                                                            <Info className="w-4 h-4 text-blue-600" />
                                                                            <span className="text-sm text-blue-700">Enter a valid email address</span>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}

                                                            {errors.email && (
                                                                <FormErrorMessage role="alert" className="mt-2">{errors.email.message}</FormErrorMessage>
                                                            )}
                                                        </FormItem>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Form>
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-4 px-6 lg:px-8 pb-8">
                                    {/* Navigation Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                                        <div className="flex gap-3">
                                            {step > 1 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={prevStep}
                                                        className="px-6 py-3 h-12 border-2 hover:border-primary"
                                                        disabled={isSubmitting}
                                                        aria-label="Go back to previous step"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                        Back
                                                    </Button>
                                                </motion.div>
                                            )}

                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowSkipDialog(true)}
                                                    className="px-6 py-3 h-12 border-2 hover:border-gray-300"
                                                    disabled={isSubmitting}
                                                    aria-label="Skip profile completion for now"
                                                >
                                                    Skip for Now
                                                </Button>
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {step < totalSteps ? (
                                                <Button
                                                    type="button"
                                                    onClick={nextStep}
                                                    className="w-full sm:w-auto px-8 py-3 h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium shadow-lg"
                                                    disabled={isSubmitting || !isValid}
                                                    aria-label={`Continue to step ${step + 1}`}
                                                >
                                                    Continue
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    onClick={handleSubmit(onSubmit)}
                                                    className="w-full sm:w-auto px-8 py-3 h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium shadow-lg"
                                                    disabled={isSubmitting || !isValid}
                                                    aria-label="Complete profile setup"
                                                >
                                                    {isSubmitting ? 'Completing...' : 'Complete Profile'}
                                                </Button>
                                            )}
                                        </motion.div>
                                    </div>

                                    {/* Steps Indicator */}
                                    <div className="flex justify-center space-x-2 pt-4" role="navigation" aria-label="Form steps">
                                        {[1, 2, 3].map((stepNumber) => (
                                            <motion.button
                                                key={stepNumber}
                                                type="button"
                                                onClick={() => stepNumber < step && setStep(stepNumber)}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                    stepNumber === step
                                                        ? 'bg-gradient-to-r from-primary to-accent scale-125'
                                                        : stepNumber < step
                                                            ? 'bg-primary/60 cursor-pointer'
                                                            : 'bg-gray-300'
                                                }`}
                                                whileHover={stepNumber < step ? { scale: 1.2 } : {}}
                                                aria-label={`Go to step ${stepNumber}`}
                                                aria-current={stepNumber === step ? "step" : undefined}
                                                disabled={stepNumber > step}
                                            />
                                        ))}
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>

                        {/* Footer Message */}
                        <motion.div variants={fadeInUp} className="text-center">
                            <p className="text-sm text-gray-500">
                                <span className="inline-flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Your information is secure and will only be used to personalize your TrackAm experience.
                                </span>
                                <br />
                                You can always update your profile information later from your account settings.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Skip Confirmation Dialog */}
            <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
                <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <DialogHeader className="text-center pb-2">
                        <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-secondary">
                            Skip Profile Completion?
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-600 mt-2">
                            You can complete your profile later, but having a complete profile helps customers recognize and trust your business.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/10">
                            <h4 className="font-semibold text-secondary mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Benefits of completing your profile:
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Builds customer trust and credibility</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Improves delivery communication</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Enhances your dashboard experience</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Helps customers identify your business</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowSkipDialog(false)}
                            className="flex-1 h-12 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                            Continue Setup
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSkip}
                            className="flex-1 h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white transition-all duration-200"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Skipping...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Skip Anyway
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default CompleteProfilePage;
