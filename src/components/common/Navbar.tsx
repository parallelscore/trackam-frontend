import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils.ts';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsProfileMenuOpen(false);
    };

    // Close the menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest('#mobile-menu') && !target.closest('#menu-button')) {
                setIsMobileMenuOpen(false);
            }
            if (isProfileMenuOpen && !target.closest('#profile-menu') && !target.closest('#profile-button')) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen, isProfileMenuOpen]);

    // Close menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
    }, [location]);

    return (
        <nav className="bg-white shadow-sm relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center">
                                <span className="text-primary font-bold text-xl">TrackAm</span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className={cn(
                                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                                    isActive('/')
                                        ? "border-primary text-secondary"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                )}
                            >
                                Home
                            </Link>
                            <Link
                                to="/vendor"
                                className={cn(
                                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                                    isActive('/vendor')
                                        ? "border-primary text-secondary"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                )}
                            >
                                Vendor
                            </Link>
                            <Link
                                to="/track"
                                className={cn(
                                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                                    isActive('/track')
                                        ? "border-primary text-secondary"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                )}
                            >
                                Track Package
                            </Link>
                        </div>
                    </div>

                    {/* Desktop menu - right side */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {isAuthenticated ? (
                            <div className="ml-3 relative">
                                <button
                                    id="profile-button"
                                    type="button"
                                    className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    aria-expanded={isProfileMenuOpen}
                                    onClick={toggleProfileMenu}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                                        {user?.first_name?.charAt(0) || 'U'}
                                    </div>
                                </button>

                                {/* Profile dropdown */}
                                {isProfileMenuOpen && (
                                    <div
                                        id="profile-menu"
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    >
                                        <div className="px-4 py-2 text-xs text-gray-500">
                                            Signed in as
                                        </div>
                                        <div className="px-4 py-2 border-b text-sm font-medium text-gray-700">
                                            {user?.email}
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Your Profile
                                        </Link>

                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Settings
                                        </Link>

                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={handleLogout}
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="ml-3 relative">
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary text-white px-3 py-2 rounded-md text-sm font-medium ml-2"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        {isAuthenticated && (
                            <button
                                id="profile-button"
                                type="button"
                                className="bg-white p-1 mr-3 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                aria-expanded={isProfileMenuOpen}
                                onClick={toggleProfileMenu}
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                                    {user?.first_name?.charAt(0) || 'U'}
                                </div>
                            </button>
                        )}

                        <button
                            id="menu-button"
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                            onClick={toggleMobileMenu}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Mobile Menu */}
            {isMobileMenuOpen && (
                <div
                    id="mobile-menu"
                    className="sm:hidden absolute right-4 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style={{ top: "3.5rem" }}
                >
                    <div className="py-1 rounded-md bg-white shadow-xs">
                        <Link
                            to="/"
                            className={cn(
                                "block px-4 py-2 text-sm transition duration-150 ease-in-out",
                                isActive('/')
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/vendor"
                            className={cn(
                                "block px-4 py-2 text-sm transition duration-150 ease-in-out",
                                isActive('/vendor')
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Vendor
                        </Link>
                        <Link
                            to="/track"
                            className={cn(
                                "block px-4 py-2 text-sm transition duration-150 ease-in-out",
                                isActive('/track')
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Track Package
                        </Link>

                        {!isAuthenticated ? (
                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-2 text-sm text-primary font-medium hover:bg-gray-100"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Your Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Settings
                                </Link>
                                <button
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={handleLogout}
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Profile Menu */}
            {isProfileMenuOpen && (
                <div
                    id="profile-menu"
                    className="sm:hidden absolute right-4 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style={{ top: "3.5rem" }}
                >
                    <div className="px-4 py-2 text-xs text-gray-500">
                        Signed in as
                    </div>
                    <div className="px-4 py-2 border-b text-sm font-medium text-gray-700 truncate">
                        {user?.email}
                    </div>

                    <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                    >
                        Your Profile
                    </Link>

                    <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                    >
                        Settings
                    </Link>

                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;