import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface CompleteProfileFormData {
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    profileImage: FileList;
}

const CompleteProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const { completeProfile, isAuthenticated, isLoading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<CompleteProfileFormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            businessName: '',
            email: ''
        }
    });

    // Watch for profile image changes
    const profileImage = watch('profileImage');

    // Update profile image preview when file is selected
    useEffect(() => {
        if (profileImage && profileImage.length > 0) {
            const file = profileImage[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setProfileImageUrl(reader.result as string);
            };

            reader.readAsDataURL(file);
        }
    }, [profileImage]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/register');
            toast.error('Please complete the registration process');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const onSubmit = async (data: CompleteProfileFormData) => {
        setIsSubmitting(true);

        try {
            // In a real app, you would first upload the image to a server
            // and then use the returned URL in profile data
            let imageUrl = null;
            if (profileImageUrl) {
                // This is a placeholder for actual image upload logic
                // In a real app, you would have an API endpoint for image upload
                // and use the returned URL in profile data
                imageUrl = profileImageUrl;
            }

            // Complete profile
            const success = await completeProfile({
                first_name: data.firstName,
                last_name: data.lastName,
                business_name: data.businessName,
                email: data.email,
                profile_image_url: imageUrl,
            });

            if (success) {
                // Clear registration data from session storage
                sessionStorage.removeItem('registrationPhone');
                sessionStorage.removeItem('otpVerified');

                // Navigate to vendor dashboard
                navigate('/vendor');
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
            // Skip profile completion
            navigate('/vendor');

            // Clear registration data from session storage
            sessionStorage.removeItem('registrationPhone');
            sessionStorage.removeItem('otpVerified');
        } catch (error) {
            console.error('Skip profile error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Card className="shadow-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-secondary">Complete Your Profile</CardTitle>
                        <CardDescription>
                            Provide additional information to personalize your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative mb-4">
                                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-primary">
                                        {profileImageUrl ? (
                                            <img
                                                src={profileImageUrl}
                                                alt="Profile preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input
                                            id="profileImage"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            {...register('profileImage')}
                                        />
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500">Upload a profile picture</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItem>
                                    <FormLabel htmlFor="firstName">First Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="firstName"
                                            placeholder="Enter your first name"
                                            {...register('firstName', {
                                                required: 'First name is required'
                                            })}
                                        />
                                    </FormControl>
                                    {errors.firstName && (
                                        <FormErrorMessage>{errors.firstName.message}</FormErrorMessage>
                                    )}
                                </FormItem>

                                <FormItem>
                                    <FormLabel htmlFor="lastName">Last Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="lastName"
                                            placeholder="Enter your last name"
                                            {...register('lastName', {
                                                required: 'Last name is required'
                                            })}
                                        />
                                    </FormControl>
                                    {errors.lastName && (
                                        <FormErrorMessage>{errors.lastName.message}</FormErrorMessage>
                                    )}
                                </FormItem>
                            </div>

                            <FormItem>
                                <FormLabel htmlFor="businessName">Business Name</FormLabel>
                                <FormControl>
                                    <Input
                                        id="businessName"
                                        placeholder="Enter your business name"
                                        {...register('businessName', {
                                            required: 'Business name is required'
                                        })}
                                    />
                                </FormControl>
                                {errors.businessName && (
                                    <FormErrorMessage>{errors.businessName.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <FormItem>
                                <FormLabel htmlFor="email">Email Address</FormLabel>
                                <FormControl>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                    />
                                </FormControl>
                                <FormDescription>
                                    We'll send a verification link to this email
                                </FormDescription>
                                {errors.email && (
                                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="md:w-1/3"
                                    onClick={handleSkip}
                                    disabled={isSubmitting}
                                >
                                    Skip for Now
                                </Button>
                                <Button
                                    type="submit"
                                    className="md:w-2/3"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Completing Profile...' : 'Complete Profile'}
                                </Button>
                            </div>
                        </Form>
                    </CardContent>

                    <CardFooter className="flex flex-col text-center">
                        <p className="text-sm text-gray-500">
                            You can always update your profile information later from your account settings.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default CompleteProfilePage;
