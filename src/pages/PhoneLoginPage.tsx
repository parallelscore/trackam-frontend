import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

interface PhoneLoginFormData {
    phoneNumber: string;
}

const PhoneLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isAuthenticated } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<PhoneLoginFormData>({
        defaultValues: {
            phoneNumber: ''
        }
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/vendor');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data: PhoneLoginFormData) => {
        setIsSubmitting(true);

        try {
            // This would be replaced with an actual API call to send OTP
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Phone submitted for login OTP:', data.phoneNumber);

            // Store the phone number in session storage for the OTP verification page
            sessionStorage.setItem('loginPhone', data.phoneNumber);

            toast.success('OTP sent to your phone number for login.');
            navigate('/verify-login-otp');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to send OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto px-4 py-16">
                <Card className="shadow-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-secondary">Sign In to TrackAm</CardTitle>
                        <CardDescription>
                            Enter your registered phone number to receive a login code
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <FormItem>
                                <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="Enter your registered phone number"
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

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending OTP...' : 'Send Login Code'}
                            </Button>
                        </Form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 text-center">
                        <div className="text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:underline font-medium">
                                Register as a Vendor
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default PhoneLoginPage;