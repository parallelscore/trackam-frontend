import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

interface User {
    id?: string;
    phone_number?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    business_name?: string;
    profile_image_url?: string;
    is_phone_verified?: boolean;
    is_email_verified?: boolean;
}

interface AuthContextProps {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    requestLoginOTP: (phoneNumber: string) => Promise<boolean>;
    verifyLoginOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
    requestRegistrationOTP: (phoneNumber: string) => Promise<boolean>;
    verifyRegistrationOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
    completeProfile: (profileData: any) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setIsLoading(true);

                // Check if token exists
                if (authService.isAuthenticated()) {
                    const result = await authService.getCurrentUser();

                    if (result.success) {
                        setUser(result.data);
                        setIsAuthenticated(true);
                    } else {
                        // If getting current user fails, clear the token
                        authService.logout();
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                authService.logout();
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const requestLoginOTP = async (phoneNumber: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const result = await authService.requestLoginOTP(phoneNumber);

            if (result.success) {
                // If in development and OTP is in response, show it
                if (result.data.debug_otp) {
                    toast.success(`Development OTP: ${result.data.debug_otp}`);
                } else {
                    toast.success('OTP sent to your phone');
                }
                return true;
            }

            toast.error(result.error || 'Failed to send OTP');
            return false;
        } catch (error) {
            console.error('Login OTP request error:', error);
            toast.error('An unexpected error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyLoginOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const result = await authService.verifyLoginOTP(phoneNumber, otp);

            if (result.success) {
                // Fetch user data
                const userResult = await authService.getCurrentUser();

                if (userResult.success) {
                    setUser(userResult.data);
                    setIsAuthenticated(true);
                    toast.success('Login successful');
                    return true;
                }
            }

            toast.error(result.error || 'Invalid OTP');
            return false;
        } catch (error) {
            console.error('Login OTP verification error:', error);
            toast.error('An unexpected error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const requestRegistrationOTP = async (phoneNumber: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const result = await authService.requestRegistrationOTP(phoneNumber);

            if (result.success) {
                // If in development and OTP is in response, show it
                if (result.data.debug_otp) {
                    toast.success(`Development OTP: ${result.data.debug_otp}`);
                } else {
                    toast.success('OTP sent to your phone');
                }
                return true;
            }

            toast.error(result.error || 'Failed to send OTP');
            return false;
        } catch (error) {
            console.error('Registration OTP request error:', error);
            toast.error('An unexpected error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyRegistrationOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const result = await authService.verifyRegistrationOTP(phoneNumber, otp);

            if (result.success) {
                setIsAuthenticated(true);
                // We'll get user details during profile completion
                toast.success('Phone number verified');
                return true;
            }

            toast.error(result.error || 'Invalid OTP');
            return false;
        } catch (error) {
            console.error('Registration OTP verification error:', error);
            toast.error('An unexpected error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const completeProfile = async (profileData: any): Promise<boolean> => {
        setIsLoading(true);

        try {
            const result = await authService.completeProfile(profileData);

            if (result.success) {
                setUser(result.data);
                toast.success('Profile updated successfully');
                return true;
            }

            toast.error(result.error || 'Failed to update profile');
            return false;
        } catch (error) {
            console.error('Profile completion error:', error);
            toast.error('An unexpected error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        requestLoginOTP,
        verifyLoginOTP,
        requestRegistrationOTP,
        verifyRegistrationOTP,
        completeProfile,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};