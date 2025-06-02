import React, { useState } from 'react';
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
} from '../components/ui/card';
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormErrorMessage,
    FormDescription
} from '../components/ui/form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    phoneNumber: string;
    profileImage: FileList;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [isEmailVerified] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        watch
    } = useForm<ProfileFormData>({
        defaultValues: {
            firstName: user?.first_name || '',
            lastName: user?.last_name || '',
            businessName: user?.business_name || '',
            email: user?.email || '',
            phoneNumber: user?.phone_number || '',
        }
    });

    // Watch for profile image changes
    const profileImage = watch('profileImage');

    // Update profile image preview when file is selected
    React.useEffect(() => {
        if (profileImage && profileImage.length > 0) {
            const file = profileImage[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setProfileImageUrl(reader.result as string);
            };

            reader.readAsDataURL(file);
        } else if (user?.profile_image_url) {
            setProfileImageUrl(user.profile_image_url as string);
        }
    }, [profileImage, user]);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const onSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);

        try {
            // This would be replaced with an actual API call to update profile
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create updated user profile object
            const updatedProfile = {
                ...user,
                firstName: data.firstName,
                lastName: data.lastName,
                businessName: data.businessName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                // In a real app, you would upload the image to a server
                profileImage: profileImageUrl
            };

            console.log('Profile updated:', updatedProfile);

            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update your profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendVerificationEmail = async () => {
        try {
            // This would be replaced with an actual API call to send verification email
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Verification email sent. Please check your inbox.');
        } catch (error) {
            console.error('Email verification error:', error);
            toast.error('Failed to send verification email. Please try again.');
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
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

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex justify-center items-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
                    />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen py-12 px-4 relative">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 0.9, 1],
                            rotate: [0, -3, 3, 0]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 5
                        }}
                        className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl"
                    />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto relative z-10"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                            Account Settings
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Manage your profile information and account preferences
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Overview Card */}
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <Card className="bg-white/80 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative h-fit">
                                {/* Gradient border effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl p-0.5">
                                    <div className="bg-white rounded-xl h-full w-full" />
                                </div>

                                <div className="relative z-10 p-6">
                                    <div className="text-center">
                                        <div className="relative mb-6">
                                            <motion.div
                                                className="w-24 h-24 rounded-full mx-auto bg-gradient-to-r from-primary to-accent flex items-center justify-center overflow-hidden shadow-xl relative"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {profileImageUrl ? (
                                                    <img
                                                        src={profileImageUrl}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white text-2xl font-bold">
                                                        {user?.first_name?.charAt(0) || 'U'}
                                                    </span>
                                                )}

                                                {/* Upload overlay */}
                                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        {...register('profileImage')}
                                                    />
                                                </label>
                                            </motion.div>
                                        </div>

                                        <h3 className="text-xl font-bold text-secondary mb-1">
                                            {user?.first_name} {user?.last_name}
                                        </h3>
                                        <p className="text-gray-600 mb-2">{user?.business_name}</p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-gray-600">Phone Verified</span>
                                            </div>

                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                {isEmailVerified ? (
                                                    <>
                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-gray-600">Email Verified</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-gray-600">Email Pending</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Profile Form */}
                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <Card className="bg-white/80 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative">
                                {/* Gradient border effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl p-0.5">
                                    <div className="bg-white rounded-xl h-full w-full" />
                                </div>

                                <div className="relative z-10">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold text-secondary">
                                            Profile Information
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Update your personal and business information
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-6">
                                        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormItem>
                                                    <FormLabel htmlFor="firstName" className="text-gray-700 font-medium">
                                                        First Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            id="firstName"
                                                            placeholder="Enter your first name"
                                                            className="h-12 border-2 border-gray-200 focus:border-primary rounded-xl transition-all duration-300"
                                                            {...register('firstName', {
                                                                required: 'First name is required'
                                                            })}
                                                        />
                                                    </FormControl>
                                                    {errors.firstName && (
                                                        <FormErrorMessage className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {errors.firstName.message}
                                                        </FormErrorMessage>
                                                    )}
                                                </FormItem>

                                                <FormItem>
                                                    <FormLabel htmlFor="lastName" className="text-gray-700 font-medium">
                                                        Last Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            id="lastName"
                                                            placeholder="Enter your last name"
                                                            className="h-12 border-2 border-gray-200 focus:border-primary rounded-xl transition-all duration-300"
                                                            {...register('lastName', {
                                                                required: 'Last name is required'
                                                            })}
                                                        />
                                                    </FormControl>
                                                    {errors.lastName && (
                                                        <FormErrorMessage className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {errors.lastName.message}
                                                        </FormErrorMessage>
                                                    )}
                                                </FormItem>
                                            </div>

                                            <FormItem>
                                                <FormLabel htmlFor="businessName" className="text-gray-700 font-medium">
                                                    Business Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="businessName"
                                                        placeholder="Enter your business name"
                                                        className="h-12 border-2 border-gray-200 focus:border-primary rounded-xl transition-all duration-300"
                                                        {...register('businessName', {
                                                            required: 'Business name is required'
                                                        })}
                                                    />
                                                </FormControl>
                                                {errors.businessName && (
                                                    <FormErrorMessage className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {errors.businessName.message}
                                                    </FormErrorMessage>
                                                )}
                                            </FormItem>

                                            <FormItem>
                                                <FormLabel htmlFor="email" className="text-gray-700 font-medium">
                                                    Email Address
                                                </FormLabel>
                                                <div className="flex items-center space-x-3">
                                                    <FormControl className="flex-1">
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="Enter your email address"
                                                            className="h-12 border-2 border-gray-200 focus:border-primary rounded-xl transition-all duration-300"
                                                            {...register('email', {
                                                                required: 'Email is required',
                                                                pattern: {
                                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                    message: 'Invalid email address'
                                                                }
                                                            })}
                                                        />
                                                    </FormControl>

                                                    {isEmailVerified ? (
                                                        <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-3 rounded-xl">
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-12 px-6 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                                                            onClick={handleSendVerificationEmail}
                                                        >
                                                            Verify
                                                        </Button>
                                                    )}
                                                </div>
                                                {!isEmailVerified && (
                                                    <FormDescription className="text-amber-600 flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Please verify your email to access all features
                                                    </FormDescription>
                                                )}
                                                {errors.email && (
                                                    <FormErrorMessage className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {errors.email.message}
                                                    </FormErrorMessage>
                                                )}
                                            </FormItem>

                                            <FormItem>
                                                <FormLabel htmlFor="phoneNumber" className="text-gray-700 font-medium">
                                                    Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="phoneNumber"
                                                        placeholder="Enter your phone number"
                                                        disabled
                                                        className="h-12 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                                        {...register('phoneNumber')}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-gray-500 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Phone number cannot be changed. Contact support if needed.
                                                </FormDescription>
                                            </FormItem>

                                            <div className="flex justify-end pt-6">
                                                <Button
                                                    type="submit"
                                                    className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                                    disabled={isSubmitting || !isDirty}
                                                >
                                                    {/* Button background animation */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                    <span className="relative z-10 flex items-center gap-2">
                                                        {isSubmitting ? (
                                                            <>
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                                />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Save Changes
                                                            </>
                                                        )}
                                                    </span>
                                                </Button>
                                            </div>
                                        </Form>
                                    </CardContent>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Security Settings */}
                    <motion.div variants={itemVariants} className="mt-8">
                        <Card className="bg-white/80 backdrop-blur-xl shadow-xl border-0 overflow-hidden relative">
                            {/* Gradient border effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl p-0.5">
                                <div className="bg-white rounded-xl h-full w-full" />
                            </div>

                            <div className="relative z-10">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-secondary">
                                        Account Security
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Manage your account security settings
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <motion.div
                                            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">Password</h3>
                                                    <p className="text-sm text-gray-500">Change your account password</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                                            >
                                                Change Password
                                            </Button>
                                        </motion.div>

                                        <motion.div
                                            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                                            >
                                                Enable 2FA
                                            </Button>
                                        </motion.div>

                                        <motion.div
                                            className="flex justify-between items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-300 border border-red-200"
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
                                                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                Delete Account
                                            </Button>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default ProfilePage;