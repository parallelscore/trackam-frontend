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

    return (
        <Layout>
            <div className="max-w-md mx-auto px-4 py-16">
                <Card className="shadow-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-secondary">Create Vendor Account</CardTitle>
                        <CardDescription>
                            Enter your phone number to register as a vendor
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <FormItem>
                                <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="Enter your phone number"
                                        {...register('phoneNumber', {
                                            required: 'Phone number is required',
                                            pattern: {
                                                value: /^(\+?234|0)[789]\d{9}$/,
                                                message: 'Enter a valid Nigerian phone number'
                                            }
                                        })}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Format: +2348012345678 or 08012345678
                                </FormDescription>
                                {errors.phoneNumber && (
                                    <FormErrorMessage>{errors.phoneNumber.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <FormItem className="flex items-start space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="agreeToTerms"
                                    className="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                                    {...register('agreeToTerms', {
                                        required: 'You must agree to the terms and conditions'
                                    })}
                                />
                                <div>
                                    <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                                        I agree to the
                                        <Link to="/terms" className="text-primary hover:underline ml-1">
                                            Terms of Service
                                        </Link>
                                        {' '}and{' '}
                                        <Link to="/privacy" className="text-primary hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                    {errors.agreeToTerms && (
                                        <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms.message}</p>
                                    )}
                                </div>
                            </FormItem>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending OTP...' : 'Continue'}
                            </Button>
                        </Form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 text-center">
                        <div className="text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default PhoneRegisterPage;