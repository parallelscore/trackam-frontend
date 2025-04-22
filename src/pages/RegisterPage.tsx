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

interface RegisterFormData {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    accountType: 'vendor' | 'rider' | 'customer';
    agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register: registerUser, isAuthenticated } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<RegisterFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            accountType: 'vendor',
            agreeToTerms: false
        }
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/vendor');
        }
    }, [isAuthenticated, navigate]);

    const password = watch('password');

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);

        try {
            const success = await registerUser({
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: data.password,
                role: data.accountType
            });

            if (success) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto px-4 py-12">
                <Card className="shadow-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-secondary">Create Account</CardTitle>
                        <CardDescription>
                            Join TrackAm to manage and track your deliveries
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <FormItem>
                                <FormLabel htmlFor="fullName">Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        id="fullName"
                                        placeholder="Enter your full name"
                                        {...register('fullName', {
                                            required: 'Full name is required'
                                        })}
                                    />
                                </FormControl>
                                {errors.fullName && (
                                    <FormErrorMessage>{errors.fullName.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <FormItem>
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                    />
                                </FormControl>
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

                            <FormItem>
                                <FormLabel htmlFor="accountType">Account Type</FormLabel>
                                <FormControl>
                                    <select
                                        id="accountType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        {...register('accountType', {
                                            required: 'Please select an account type'
                                        })}
                                    >
                                        <option value="vendor">Vendor</option>
                                        <option value="rider">Rider</option>
                                        <option value="customer">Customer</option>
                                    </select>
                                </FormControl>
                                {errors.accountType && (
                                    <FormErrorMessage>{errors.accountType.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <FormItem>
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <FormControl>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a password"
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters'
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                message: 'Password must include uppercase, lowercase, number and special character'
                                            }
                                        })}
                                    />
                                </FormControl>
                                {errors.password && (
                                    <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                                )}
                            </FormItem>

                            <FormItem>
                                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        {...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                            validate: value => value === password || 'Passwords do not match'
                                        })}
                                    />
                                </FormControl>
                                {errors.confirmPassword && (
                                    <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
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
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
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

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">or register with</span>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => toast.error('Google registration not implemented yet')}
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => toast.error('WhatsApp registration not implemented yet')}
                            >
                                <svg className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                </svg>
                                WhatsApp
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default RegisterPage;