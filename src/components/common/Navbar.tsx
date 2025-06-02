import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/utils.ts';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
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

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    // Animation variants
    const navVariants = {
        scrolled: {
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            transition: { duration: 0.3, ease: 'easeOut' }
        },
        top: {
            backdropFilter: 'blur(0px)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: { duration: 0.3, ease: 'easeOut' }
        }
    };

    const menuItemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2, ease: 'easeOut' }
        }
    };

    const dropdownVariants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: -10,
            transition: { duration: 0.2, ease: 'easeIn' }
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.2, ease: 'easeOut' }
        }
    };

    return (
        <motion.nav
            variants={navVariants}
            animate={scrolled ? 'scrolled' : 'top'}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <motion.div
                            className="flex-shrink-0 flex items-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link to="/" className="flex items-center group">
                                <motion.div
                                    className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                    whileHover={{ rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </motion.div>
                                <span className="text-secondary font-bold text-xl group-hover:text-primary transition-colors duration-300">
                                    TrackAm
                                </span>
                            </Link>
                        </motion.div>

                        {isAuthenticated && (
                            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-1">
                                {[
                                    { path: '/vendor', label: 'Vendor' },
                                    { path: '/track', label: 'Track Package' }
                                ].map((item) => (
                                    <motion.div
                                        key={item.path}
                                        whileHover={{ y: -2 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link
                                            to={item.path}
                                            className={cn(
                                                "relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                                                isActive(item.path)
                                                    ? "text-primary bg-primary/10"
                                                    : "text-gray-600 hover:text-primary hover:bg-primary/5"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                                {!isAuthenticated && (
                                    <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-1">
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Link
                                                to="/track"
                                                className="relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-all duration-300"
                                            >
                                                Track Package
                                            </Link>
                                        </motion.div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* Desktop menu - right side */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <motion.button
                                    id="profile-button"
                                    type="button"
                                    className="bg-gradient-to-r from-primary to-accent p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transition-shadow duration-300"
                                    aria-expanded={isProfileMenuOpen}
                                    onClick={toggleProfileMenu}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center font-semibold">
                                        {user?.first_name?.charAt(0) || 'U'}
                                    </div>
                                </motion.button>

                                {/* Profile dropdown */}
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            id="profile-menu"
                                            className="origin-top-right absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-xl ring-1 ring-black/5 border border-white/20 overflow-hidden"
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                        >
                                            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
                                                <div className="text-xs text-gray-500 mb-1">Signed in as</div>
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {user?.email}
                                                </div>
                                            </div>

                                            <div className="py-2">
                                                {[
                                                    { to: '/profile', label: 'Your Profile', icon: '👤' },
                                                    { to: '/settings', label: 'Settings', icon: '⚙️' }
                                                ].map((item) => (
                                                    <motion.div key={item.to} variants={menuItemVariants}>
                                                        <Link
                                                            to={item.to}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-primary transition-all duration-200"
                                                        >
                                                            <span className="mr-3">{item.icon}</span>
                                                            {item.label}
                                                        </Link>
                                                    </motion.div>
                                                ))}

                                                <div className="border-t border-gray-100 mt-2 pt-2">
                                                    <motion.button
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                                                        onClick={handleLogout}
                                                        variants={menuItemVariants}
                                                        whileHover={{ x: 4 }}
                                                    >
                                                        <span className="mr-3">🚪</span>
                                                        Sign out
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to="/login"
                                        className="text-gray-600 hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-primary/5"
                                    >
                                        Login
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to="/register"
                                        className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        Register
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <motion.button
                            id="menu-button"
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-300"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                            onClick={toggleMobileMenu}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="sr-only">Open main menu</span>
                            <motion.div
                                animate={isMobileMenuOpen ? "open" : "closed"}
                                className="w-6 h-6"
                            >
                                <motion.svg
                                    className="absolute w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    variants={{
                                        closed: { opacity: 1, rotate: 0 },
                                        open: { opacity: 0, rotate: 45 }
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </motion.svg>
                                <motion.svg
                                    className="absolute w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    variants={{
                                        closed: { opacity: 0, rotate: -45 },
                                        open: { opacity: 1, rotate: 0 }
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </motion.svg>
                            </motion.div>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menus */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        id="mobile-menu"
                        className="sm:hidden absolute right-4 mt-2 w-56 rounded-xl shadow-2xl bg-white/95 backdrop-blur-xl ring-1 ring-black/5 border border-white/20 overflow-hidden"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="py-2">
                            {(isAuthenticated ? [
                                { path: '/vendor', label: 'Vendor', icon: '🏪' },
                                { path: '/track', label: 'Track Package', icon: '📦' }
                            ] : [
                                { path: '/track', label: 'Track Package', icon: '📦' }
                            ]).map((item) => (
                                <motion.div key={item.path} variants={menuItemVariants}>
                                    <Link
                                        to={item.path}
                                        className={cn(
                                            "flex items-center px-4 py-2.5 text-sm transition-all duration-200",
                                            isActive(item.path)
                                                ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-medium border-r-2 border-primary"
                                                : "text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-primary"
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}

                            {!isAuthenticated && (
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <motion.div variants={menuItemVariants}>
                                        <Link
                                            to="/login"
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-primary transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span className="mr-3">🔑</span>
                                            Login
                                        </Link>
                                    </motion.div>
                                    <motion.div variants={menuItemVariants}>
                                        <Link
                                            to="/register"
                                            className="flex items-center px-4 py-2.5 text-sm text-primary font-medium hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span className="mr-3">✨</span>
                                            Register
                                        </Link>
                                    </motion.div>
                                </div>
                            )}

                            {isAuthenticated && (
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <motion.div variants={menuItemVariants}>
                                        <Link
                                            to="/profile"
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-primary transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span className="mr-3">👤</span>
                                            Your Profile
                                        </Link>
                                    </motion.div>
                                    <motion.div variants={menuItemVariants}>
                                        <Link
                                            to="/settings"
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:text-primary transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span className="mr-3">⚙️</span>
                                            Settings
                                        </Link>
                                    </motion.div>

                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <motion.button
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                                            onClick={handleLogout}
                                            variants={menuItemVariants}
                                        >
                                            <span className="mr-3">🚪</span>
                                            Sign out
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;