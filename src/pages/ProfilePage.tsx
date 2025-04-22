import React, { useState } from 'react';
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
    const [isEmailVerified, setIsEmailVerified] = useState(false);

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
        } else if (user?.profileImage) {
            setProfileImageUrl(user.profileImage as string);
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

    if (isLoading) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto px-4 py-12 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary">Account Settings</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your profile information and account preferences
                    </p>
                </div>

                <Card className="shadow-md mb-8">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Update your personal and business information
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
                                <p className="text-sm text-gray-500">Change profile picture</p>
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
                                <div className="flex items-center space-x-2">
                                    <FormControl className="flex-1">
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

                                    {isEmailVerified ? (
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Verified
                    </span>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSendVerificationEmail}
                                        >
                                            Verify
                                        </Button>
                                    )}
                                </div>
                                {!isEmailVerified && (
                                    <FormDescription>
                                        Please verify your email to access all features
                                    </FormDescription>
                                )}
                                {errors.email && (
                                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <FormItem>
                                <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="Enter your phone number"
                                        disabled // Phone number cannot be changed
                                        {...register('phoneNumber')}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Phone number cannot be changed. Contact support if you need to update it.
                                </FormDescription>
                            </FormItem>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    className="min-w-[120px]"
                                    disabled={isSubmitting || !isDirty}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Account Security</CardTitle>
                        <CardDescription>
                            Manage your account security settings
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-medium">Password</h3>
                                <p className="text-sm text-gray-500">Change your account password</p>
                            </div>
                            <Button variant="outline">Change Password</Button>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-medium">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                </div>
                                <Button variant="outline">Enable 2FA</Button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-medium text-red-600">Delete Account</h3>
                                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ProfilePage;