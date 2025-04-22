import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: 'vendor' | 'rider' | 'customer';
}

interface AuthContextProps {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
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
                // In a real app, you would validate the token with your backend
                const isAuth = localStorage.getItem('isAuthenticated') === 'true';

                if (isAuth) {
                    // Mock user data (would come from token or API in real app)
                    const userRole = localStorage.getItem('userRole') || 'vendor';
                    setUser({
                        id: '1',
                        name: 'Test User',
                        email: 'user@example.com',
                        role: userRole as 'vendor' | 'rider' | 'customer',
                    });
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userRole');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            // This would be an actual API call in a real app
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful login
            if (email && password) {
                const userRole = email.includes('vendor') ? 'vendor' :
                    email.includes('rider') ? 'rider' : 'customer';

                setUser({
                    id: '1',
                    name: 'Test User',
                    email,
                    role: userRole as 'vendor' | 'rider' | 'customer',
                });

                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', userRole);

                return true;
            }

            toast.error('Invalid credentials');
            return false;
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any): Promise<boolean> => {
        setIsLoading(true);

        try {
            // This would be an actual API call in a real app
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Just return success for the mock implementation
            toast.success('Registration successful! Please check your email to verify your account.');
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('You have been logged out');
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};