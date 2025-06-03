// src/components/vendor/CreateDeliveryForm.tsx - Enhanced Version
import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CreateDeliveryFormData, CustomerLocation } from '@/types';
import { useDelivery } from '../../context/DeliveryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Form,
    FormSection,
    FormItem,
    FormLabel,
    FormControl,
    FormErrorMessage,
} from '../ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import CustomerLocationInput from './CustomerLocationInput';
import DeliverySuccessView from './DeliverySuccessView';

interface CreateDeliveryFormProps {
    onSuccess?: () => void;
}

// Enhanced animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const headerVariants = {
    hidden: { opacity: 0, y: -30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: "easeOut"
        }
    }
};

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        x: -20,
        scale: 0.98
    },
    visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.05
        }
    }
};

const fieldVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.98 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

const submitButtonVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            delay: 0.3
        }
    }
};

const progressVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(16, 185, 129, 0)" },
    animate: {
        boxShadow: [
            "0 0 30px rgba(16, 185, 129, 0.1)",
            "0 0 60px rgba(16, 185, 129, 0.05)",
            "0 0 30px rgba(16, 185, 129, 0.1)"
        ],
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
};

const CreateDeliveryForm: React.FC<CreateDeliveryFormProps> = ({ onSuccess }) => {
    const { createDelivery, isLoading } = useDelivery();
    const [createdDelivery, setCreatedDelivery] = useState<any>(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [whatsappSent, setWhatsappSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Add state for customer location
    const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(null);

    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateDeliveryFormData>({
        defaultValues: {
            customer: {
                name: '',
                phoneNumber: '',
                address: ''
            },
            rider: {
                name: '',
                phoneNumber: ''
            },
            package: {
                description: '',
                size: undefined,
                specialInstructions: ''
            }
        }
    });

    // Watch the customer address field for the location component
    const customerAddress = watch('customer.address');

    const simulateProgressBar = async () => {
        setLoadingProgress(15);
        setLoadingText('Preparing delivery...');

        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingProgress(40);
        setLoadingText('Creating delivery...');

        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingProgress(75);
        setLoadingText('Setting up tracking...');
    };

    const onSubmit = async (data: CreateDeliveryFormData) => {
        try {
            setError(null);
            setIsSubmitting(true);

            simulateProgressBar();

            const formattedData = {
                customer: {
                    name: data.customer.name,
                    phone_number: data.customer.phoneNumber,
                    address: data.customer.address,
                    ...(customerLocation && { location: customerLocation })
                },
                rider: {
                    name: data.rider.name,
                    phone_number: data.rider.phoneNumber,
                },
                package: {
                    description: data.package.description,
                    size: data.package.size,
                    special_instructions: data.package.specialInstructions,
                }
            };

            const delivery = await createDelivery(formattedData);

            if (delivery) {
                setLoadingProgress(100);
                setLoadingText('Completing setup...');

                await new Promise(resolve => setTimeout(resolve, 400));

                setCreatedDelivery(delivery);
                setFormSubmitted(true);
                reset();
                setCustomerLocation(null);
            } else {
                setLoadingProgress(0);
                setError('Failed to create delivery. Please try again.');
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            setLoadingProgress(0);
            setError('Failed to create delivery. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateAnother = () => {
        setCreatedDelivery(null);
        setFormSubmitted(false);
        setWhatsappSent(false);
        setCustomerLocation(null);
    };

    const handleDone = () => {
        if (onSuccess && typeof onSuccess === 'function') {
            onSuccess();
        } else {
            setCreatedDelivery(null);
            setFormSubmitted(false);
            setWhatsappSent(false);
            setCustomerLocation(null);
        }
    };

    if (formSubmitted && createdDelivery) {
        return (
            <DeliverySuccessView
                delivery={createdDelivery}
                whatsappSent={whatsappSent}
                onCreateAnother={handleCreateAnother}
                onDone={handleDone}
            />
        );
    }

    return (
        <motion.div
            ref={containerRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative w-full max-w-4xl mx-auto"
        >
            {/* Enhanced Card with sophisticated design */}
            <motion.div
                className="relative overflow-hidden"
                variants={glowEffect}
                initial="initial"
                animate="animate"
                whileHover={{
                    scale: 1.01,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
            >
                <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
                    {/* Animated background gradient */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/3 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700"
                        initial={false}
                    />

                    {/* Floating particles */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20"
                            style={{
                                left: `${5 + i * 8}%`,
                                top: `${10 + (i % 5) * 18}%`,
                            }}
                            animate={{
                                y: [0, -25, 0],
                                x: [0, 12, 0],
                                opacity: [0.2, 0.6, 0.2],
                                scale: [1, 1.4, 1]
                            }}
                            transition={{
                                duration: 6 + i * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.4
                            }}
                        />
                    ))}

                    {/* Subtle animated pattern overlay */}
                    <motion.div
                        className="absolute inset-0 opacity-3"
                        animate={{
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                        }}
                        transition={{
                            duration: 40,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(16, 185, 129, 0.03) 5px, rgba(16, 185, 129, 0.03) 10px)`,
                            backgroundSize: "60px 60px"
                        }}
                    />

                    {/* Enhanced Header */}
                    <CardHeader className="relative z-10 text-center pb-4">
                        <motion.div variants={headerVariants} className="space-y-4">
                            <div className="flex justify-center">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl"
                                    whileHover={{
                                        rotate: 10,
                                        scale: 1.1,
                                        boxShadow: "0 12px 30px rgba(16, 185, 129, 0.4)"
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </motion.svg>
                                </motion.div>
                            </div>

                            <div>
                                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                                    Create New Delivery
                                </CardTitle>
                                <motion.p
                                    className="text-gray-500 text-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    Fill in the details to create a new delivery request
                                </motion.p>
                            </div>
                        </motion.div>
                    </CardHeader>

                    <CardContent className="relative z-10">
                        {/* Enhanced Error Display */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Enhanced Progress Bar */}
                        <AnimatePresence>
                            {isSubmitting && (
                                <motion.div
                                    variants={progressVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <motion.span
                                            className="text-sm font-semibold text-emerald-700"
                                            animate={{ opacity: [0.7, 1, 0.7] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            {loadingText}
                                        </motion.span>
                                        <span className="text-sm font-bold text-emerald-700">{loadingProgress}%</span>
                                    </div>
                                    <div className="w-full bg-emerald-200/50 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-sm relative overflow-hidden"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${loadingProgress}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        >
                                            {/* Progress bar shimmer effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                animate={{
                                                    x: ["-100%", "100%"]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                            {/* Enhanced Customer Information Section */}
                            <motion.div variants={sectionVariants}>
                                <FormSection title="Customer Information">
                                    <motion.div
                                        className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-200/30 space-y-6"
                                        whileHover={{ scale: 1.01, y: -2 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-blue-700">Customer Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <motion.div variants={fieldVariants}>
                                                <FormItem>
                                                    <FormLabel htmlFor="customer.name" className="text-gray-700 font-medium">
                                                        Customer Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{ scale: 1.02 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Input
                                                                id="customer.name"
                                                                placeholder="Enter customer name"
                                                                {...register('customer.name', { required: 'Customer name is required' })}
                                                                disabled={isSubmitting}
                                                                className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-200"
                                                            />
                                                        </motion.div>
                                                    </FormControl>
                                                    <AnimatePresence>
                                                        {errors.customer?.name && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                            >
                                                                <FormErrorMessage>{errors.customer.name.message}</FormErrorMessage>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </FormItem>
                                            </motion.div>

                                            <motion.div variants={fieldVariants}>
                                                <FormItem>
                                                    <FormLabel htmlFor="customer.phoneNumber" className="text-gray-700 font-medium">
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{ scale: 1.02 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Input
                                                                id="customer.phoneNumber"
                                                                placeholder="E.g. +2348012345678"
                                                                {...register('customer.phoneNumber', {
                                                                    required: 'Phone number is required',
                                                                    pattern: {
                                                                        value: /^(\+?234|0)[789]\d{9}$/,
                                                                        message: 'Enter a valid Nigerian phone number'
                                                                    }
                                                                })}
                                                                disabled={isSubmitting}
                                                                className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-200"
                                                            />
                                                        </motion.div>
                                                    </FormControl>
                                                    <AnimatePresence>
                                                        {errors.customer?.phoneNumber && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                            >
                                                                <FormErrorMessage>{errors.customer.phoneNumber.message}</FormErrorMessage>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </FormItem>
                                            </motion.div>
                                        </div>

                                        <motion.div variants={fieldVariants}>
                                            <FormItem>
                                                <FormLabel htmlFor="customer.address" className="text-gray-700 font-medium">
                                                    Delivery Address
                                                </FormLabel>
                                                <FormControl>
                                                    <motion.div
                                                        whileFocus={{ scale: 1.01 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Input
                                                            id="customer.address"
                                                            placeholder="Enter delivery address"
                                                            {...register('customer.address', { required: 'Delivery address is required' })}
                                                            disabled={isSubmitting}
                                                            className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 focus:ring-blue-200"
                                                        />
                                                    </motion.div>
                                                </FormControl>
                                                <AnimatePresence>
                                                    {errors.customer?.address && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                        >
                                                            <FormErrorMessage>{errors.customer.address.message}</FormErrorMessage>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </FormItem>
                                        </motion.div>

                                        {/* Enhanced Customer Location Input */}
                                        <motion.div variants={fieldVariants}>
                                            <CustomerLocationInput
                                                value={customerLocation}
                                                address={customerAddress || ''}
                                                onChange={setCustomerLocation}
                                                disabled={isSubmitting}
                                            />
                                        </motion.div>
                                    </motion.div>
                                </FormSection>
                            </motion.div>

                            {/* Enhanced Rider Information Section */}
                            <motion.div variants={sectionVariants}>
                                <FormSection title="Rider Information">
                                    <motion.div
                                        className="p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-xl border border-green-200/30 space-y-6"
                                        whileHover={{ scale: 1.01, y: -2 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-white text-lg">🚴‍♂️</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-green-700">Rider Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <motion.div variants={fieldVariants}>
                                                <FormItem>
                                                    <FormLabel htmlFor="rider.name" className="text-gray-700 font-medium">
                                                        Rider Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{ scale: 1.02 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Input
                                                                id="rider.name"
                                                                placeholder="Enter rider name"
                                                                {...register('rider.name', { required: 'Rider name is required' })}
                                                                disabled={isSubmitting}
                                                                className="bg-white/80 backdrop-blur-sm border-green-200/50 focus:border-green-400 focus:ring-green-200"
                                                            />
                                                        </motion.div>
                                                    </FormControl>
                                                    <AnimatePresence>
                                                        {errors.rider?.name && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                            >
                                                                <FormErrorMessage>{errors.rider.name.message}</FormErrorMessage>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </FormItem>
                                            </motion.div>

                                            <motion.div variants={fieldVariants}>
                                                <FormItem>
                                                    <FormLabel htmlFor="rider.phoneNumber" className="text-gray-700 font-medium">
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{ scale: 1.02 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Input
                                                                id="rider.phoneNumber"
                                                                placeholder="E.g. +2348012345678"
                                                                {...register('rider.phoneNumber', {
                                                                    required: 'Phone number is required',
                                                                    pattern: {
                                                                        value: /^(\+?234|0)[789]\d{9}$/,
                                                                        message: 'Enter a valid Nigerian phone number'
                                                                    }
                                                                })}
                                                                disabled={isSubmitting}
                                                                className="bg-white/80 backdrop-blur-sm border-green-200/50 focus:border-green-400 focus:ring-green-200"
                                                            />
                                                        </motion.div>
                                                    </FormControl>
                                                    <AnimatePresence>
                                                        {errors.rider?.phoneNumber && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                            >
                                                                <FormErrorMessage>{errors.rider.phoneNumber.message}</FormErrorMessage>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </FormItem>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </FormSection>
                            </motion.div>

                            {/* Enhanced Package Information Section */}
                            <motion.div variants={sectionVariants}>
                                <FormSection title="Package Information">
                                    <motion.div
                                        className="p-6 bg-gradient-to-r from-orange-50/50 to-amber-50/30 rounded-xl border border-orange-200/30 space-y-6"
                                        whileHover={{ scale: 1.01, y: -2 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-orange-700">Package Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <motion.div variants={fieldVariants}>
                                                <FormItem>
                                                    <FormLabel htmlFor="package.description" className="text-gray-700 font-medium">
                                                        Package Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{ scale: 1.02 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Input
                                                                id="package.description"
                                                                placeholder="Describe the package"
                                                                {...register('package.description', { required: 'Package description is required' })}
                                                                disabled={isSubmitting}
                                                                className="bg-white/80 backdrop-blur-sm border-orange-200/50 focus:border-orange-400 focus:ring-orange-200"
                                                            />
                                                        </motion.div>
                                                    </FormControl>
                                                    <AnimatePresence>
                                                        {errors.package?.description && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                            >
                                                                <FormErrorMessage>{errors.package.description.message}</FormErrorMessage>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </FormItem>
                                            </motion.div>

                                            <motion.div variants={fieldVariants}>
                                                <FormItem>
                                                    <FormLabel htmlFor="package.size" className="text-gray-700 font-medium">
                                                        Package Size
                                                    </FormLabel>
                                                    <FormControl>
                                                        <motion.div
                                                            whileFocus={{ scale: 1.02 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <select
                                                                id="package.size"
                                                                className="flex h-10 w-full rounded-md border border-orange-200/50 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 focus-visible:ring-offset-2 focus:border-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                                {...register('package.size')}
                                                                disabled={isSubmitting}
                                                            >
                                                                <option value="">Select Size (Optional)</option>
                                                                <option value="small">📦 Small</option>
                                                                <option value="medium">📦 Medium</option>
                                                                <option value="large">📦 Large</option>
                                                            </select>
                                                        </motion.div>
                                                    </FormControl>
                                                </FormItem>
                                            </motion.div>
                                        </div>

                                        <motion.div variants={fieldVariants}>
                                            <FormItem>
                                                <FormLabel htmlFor="package.specialInstructions" className="text-gray-700 font-medium">
                                                    Special Instructions
                                                </FormLabel>
                                                <FormControl>
                                                    <motion.div
                                                        whileFocus={{ scale: 1.01 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Input
                                                            id="package.specialInstructions"
                                                            placeholder="Any special instructions (Optional)"
                                                            {...register('package.specialInstructions')}
                                                            disabled={isSubmitting}
                                                            className="bg-white/80 backdrop-blur-sm border-orange-200/50 focus:border-orange-400 focus:ring-orange-200"
                                                        />
                                                    </motion.div>
                                                </FormControl>
                                            </FormItem>
                                        </motion.div>
                                    </motion.div>
                                </FormSection>
                            </motion.div>

                            {/* Enhanced Submit Button */}
                            <motion.div
                                variants={submitButtonVariants}
                                className="flex justify-center pt-8"
                            >
                                <motion.div
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 12px 30px rgba(16, 185, 129, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative"
                                >
                                    <Button
                                        type="submit"
                                        className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl border-0 rounded-xl transition-all duration-300 relative overflow-hidden"
                                        disabled={isSubmitting || isLoading}
                                        style={{
                                            filter: "drop-shadow(0 8px 20px rgba(16, 185, 129, 0.3))"
                                        }}
                                    >
                                        {/* Button background animation */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-20"
                                            animate={isSubmitting ? {
                                                opacity: [0, 0.3, 0]
                                            } : {}}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />

                                        <span className="relative z-10 flex items-center gap-3">
                                            {isSubmitting ? (
                                                <>
                                                    <motion.svg
                                                        className="w-6 h-6 text-white"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </motion.svg>
                                                    <motion.span
                                                        animate={{ opacity: [0.7, 1, 0.7] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        Creating Delivery...
                                                    </motion.span>
                                                </>
                                            ) : (
                                                <>
                                                    <motion.svg
                                                        className="w-6 h-6"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        whileHover={{ rotate: 90 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </motion.svg>
                                                    Create Delivery
                                                </>
                                            )}
                                        </span>

                                        {/* Button shine effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                                            animate={!isSubmitting ? {
                                                x: ["-100%", "100%"]
                                            } : {}}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 3,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Decorative Elements */}
            <motion.div
                className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.4, 1],
                    rotate: [360, 180, 0]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Form Tips */}
            <motion.div
                className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
            >
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-blue-700">Quick Tips</h4>
                        <ul className="text-xs text-blue-600 space-y-1">
                            <li>• Use the location capture feature for precise delivery addresses</li>
                            <li>• Double-check phone numbers to ensure successful notifications</li>
                            <li>• Add special instructions for fragile or urgent packages</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CreateDeliveryForm;