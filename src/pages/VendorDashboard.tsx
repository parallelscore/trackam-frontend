import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Layout from '../components/common/Layout';
import CreateDeliveryForm from '../components/vendor/CreateDeliveryForm';
import ActiveDeliveries from '../components/vendor/ActiveDeliveries';
import DashboardStats from '../components/vendor/DashboardStats';
import RecentDeliveries from '../components/vendor/RecentDeliveries';
import DeliveryMetrics from '../components/vendor/DeliveryMetrics';
import TopRiders from '../components/vendor/TopRiders';
import DashboardAnalytics from '../components/vendor/DashboardAnalytics';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';

// Enhanced animation variants with a warmer feel
const fadeInUp = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
        }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1
        }
    }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -60, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 80
        }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 60, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 80
        }
    }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(255, 149, 0, 0)" },
    animate: {
        boxShadow: [
            "0 0 20px rgba(255, 149, 0, 0.3)",
            "0 0 40px rgba(255, 149, 0, 0.1)",
            "0 0 20px rgba(255, 149, 0, 0.3)"
        ],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
};

const VendorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const { deliveries, fetchDeliveries, isLoading: deliveriesLoading } = useDelivery();
    const [activeTab, setActiveTab] = useState<'overview' | 'deliveries' | 'create'>('overview');

    // Animation refs
    const headerRef = useRef(null);
    const statsRef = useRef(null);
    const analyticsRef = useRef(null);

    // InView hooks for animations
    const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

    // Check authentication
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Fetch initial data with a higher limit for the dashboard
    useEffect(() => {
        if (isAuthenticated) {
            fetchDeliveries({ limit: 100 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Get the most recent deliveries for the Recent Deliveries component
    const recentDeliveries = deliveries.slice(0, 3);

    // Handle tab change with animation
    const handleTabChange = (tab: 'overview' | 'deliveries' | 'create') => {
        setActiveTab(tab);
    };

    // Calculate the position and width for the active tab indicator
    const getTabIndicatorStyle = () => {
        const baseStyle = {
            position: 'absolute' as const,
            insetY: '0.5rem',
            height: 'calc(100% - 1rem)',
            background: 'linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129))',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.2)',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1
        };

        switch (activeTab) {
            case 'overview':
                return {
                    ...baseStyle,
                    left: '0.5rem',
                    width: 'calc(33.333% - 1rem)'
                };
            case 'deliveries':
                return {
                    ...baseStyle,
                    left: 'calc(33.333% + 0.5rem)',
                    width: 'calc(33.333% - 1rem)'
                };
            case 'create':
                return {
                    ...baseStyle,
                    left: 'calc(66.666% + 0.5rem)',
                    width: 'calc(33.333% - 1rem)'
                };
            default:
                return baseStyle;
        }
    };

    return (
        <Layout>
            {/* Enhanced Background with white/off-white base and visible animated elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Clean white/off-white gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

                {/* More visible animated gradient overlays with subtle green accents */}
                <motion.div
                    animate={{
                        x: [0, 120, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.35, 0.15]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-green-100/30 to-emerald-100/30 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/20 blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.12, 0.3, 0.12]
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[40%] left-[60%] w-72 h-72 rounded-full bg-gradient-to-r from-teal-100/25 to-green-100/25 blur-3xl"
                />

                {/* Visible animated geometric patterns */}
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.3, 1],
                        opacity: [0.08, 0.2, 0.08]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[15%] left-[5%] w-40 h-40 border-2 border-green-200/30 rounded-full"
                />

                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1, 1.4, 1],
                        opacity: [0.06, 0.18, 0.06]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-[25%] right-[10%] w-32 h-32 border-3 border-emerald-200/25 rounded-lg transform rotate-45"
                />

                {/* Additional floating shapes */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        rotate: [0, 180, 360],
                        opacity: [0.08, 0.2, 0.08]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[60%] left-[20%] w-16 h-16 bg-gradient-to-br from-green-300/15 to-emerald-300/15 rounded-full"
                />

                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        x: [0, -30, 0],
                        scale: [1, 1.5, 1],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 16,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[40%] right-[30%] w-20 h-20 bg-teal-200/15 rounded-lg transform rotate-12"
                />

                {/* Subtle dot pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='7' r='1'/%3E%3Ccircle cx='35' cy='7' r='1'/%3E%3Ccircle cx='49' cy='7' r='1'/%3E%3Ccircle cx='7' cy='21' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='21' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='7' cy='35' r='1'/%3E%3Ccircle cx='21' cy='35' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='35' r='1'/%3E%3Ccircle cx='7' cy='49' r='1'/%3E%3Ccircle cx='21' cy='49' r='1'/%3E%3Ccircle cx='35' cy='49' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                {/* Animated wave pattern */}
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(16, 185, 129, 0.05) 2px, rgba(16, 185, 129, 0.05) 4px)`,
                        backgroundSize: "30px 30px"
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Enhanced Dashboard Header with warm gradient and improved animations */}
                <motion.div
                    ref={headerRef}
                    initial="hidden"
                    animate={headerInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="mb-8"
                >
                    <motion.div
                        className="relative rounded-3xl shadow-2xl overflow-hidden"
                        variants={glowEffect}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Light, cool green gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500" />

                        {/* Overlay with subtle texture */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 via-emerald-500/75 to-teal-600/80" />

                        {/* Animated mesh gradient overlay */}
                        <motion.div
                            className="absolute inset-0 opacity-30"
                            animate={{
                                background: [
                                    "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)"
                                ]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <div className="relative p-8 md:p-12">
                            {/* Enhanced floating elements with warmer colors and better animations */}
                            <motion.div
                                animate={{
                                    y: [0, -15, 0],
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1],
                                    opacity: [0.4, 0.7, 0.4]
                                }}
                                transition={{
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-emerald-200/35 to-teal-200/35 rounded-2xl backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
                            />

                            <motion.div
                                animate={{
                                    x: [0, 15, 0],
                                    y: [0, -8, 0],
                                    scale: [1, 1.15, 1],
                                    opacity: [0.35, 0.6, 0.35]
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute bottom-8 left-12 w-12 h-12 bg-gradient-to-br from-green-200/35 to-emerald-200/35 rounded-full backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
                            />

                            {/* Additional floating shapes */}
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute top-1/2 right-1/4 w-8 h-8 border-2 border-white/30 rounded-lg backdrop-blur-sm hidden xl:block"
                            />

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                                <motion.div variants={slideInLeft}>
                                    <motion.div
                                        variants={fadeInUp}
                                        className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 text-sm text-white/95 mb-4 border border-white/20 shadow-lg"
                                    >
                                        <motion.span
                                            className="w-3 h-3 bg-emerald-200 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.7, 1, 0.7]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        <span className="font-medium">Dashboard Overview</span>
                                    </motion.div>

                                    <motion.h1
                                        variants={fadeInUp}
                                        className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg"
                                        style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                                    >
                                        Vendor Dashboard
                                    </motion.h1>

                                    <motion.p
                                        variants={fadeInUp}
                                        className="text-white/90 text-lg font-medium"
                                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
                                    >
                                        Welcome back, <span className="text-emerald-200 font-semibold">{user?.first_name || user?.business_name || 'Vendor'}</span> 👋
                                    </motion.p>
                                </motion.div>

                                {/* Enhanced CTA button with better animations - only show if not on create tab */}
                                {activeTab !== 'create' && (
                                    <motion.div variants={slideInRight} className="mt-6 md:mt-0">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                                                y: -2
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative group"
                                        >
                                            <Button
                                                onClick={() => handleTabChange('create')}
                                                className="bg-white hover:bg-emerald-50 text-green-600 font-semibold px-6 py-4 md:px-8 md:py-6 text-base md:text-lg shadow-xl border-0 rounded-xl transition-all duration-300 relative overflow-hidden group"
                                            >
                                                {/* Button background animation */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    initial={false}
                                                />

                                                <span className="relative z-10 flex items-center gap-3">
                                                    <motion.svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        whileHover={{ rotate: 90 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                    </motion.svg>
                                                    Create New Delivery
                                                </span>
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Fixed Navigation with proper tab indicators */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div className="relative">
                        <motion.div
                            className="relative flex bg-white/85 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-emerald-100/60"
                            whileHover={{ boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)" }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Fixed active tab indicator */}
                            <motion.div
                                style={getTabIndicatorStyle()}
                                layout
                                initial={false}
                            />

                            {/* Tab buttons with proper structure */}
                            <motion.div
                                className="flex-1 relative z-10"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="ghost"
                                    className={`w-full py-4 px-4 ${
                                        activeTab === 'overview'
                                            ? 'text-white font-semibold'
                                            : 'text-gray-600 hover:text-emerald-600 font-medium'
                                    } rounded-xl transition-all duration-300 border-0 bg-transparent`}
                                    onClick={() => handleTabChange('overview')}
                                >
                                    <motion.span
                                        className="flex items-center gap-2"
                                        animate={activeTab === 'overview' ? { scale: 1.05 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <motion.span
                                            animate={activeTab === 'overview' ? { rotate: [0, 10, 0] } : {}}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                            </svg>
                                        </motion.span>
                                        <span className="hidden sm:inline">Overview</span>
                                    </motion.span>
                                </Button>
                            </motion.div>

                            <motion.div
                                className="flex-1 relative z-10"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="ghost"
                                    className={`w-full py-4 px-4 ${
                                        activeTab === 'deliveries'
                                            ? 'text-white font-semibold'
                                            : 'text-gray-600 hover:text-emerald-600 font-medium'
                                    } rounded-xl transition-all duration-300 border-0 bg-transparent`}
                                    onClick={() => handleTabChange('deliveries')}
                                >
                                    <motion.span
                                        className="flex items-center gap-2"
                                        animate={activeTab === 'deliveries' ? { scale: 1.05 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <motion.span
                                            animate={activeTab === 'deliveries' ? { rotate: [0, 10, 0] } : {}}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                            </svg>
                                        </motion.span>
                                        <span className="hidden sm:inline">All Deliveries</span>
                                    </motion.span>
                                </Button>
                            </motion.div>

                            <motion.div
                                className="flex-1 relative z-10"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="ghost"
                                    className={`w-full py-4 px-4 ${
                                        activeTab === 'create'
                                            ? 'text-white font-semibold'
                                            : 'text-gray-600 hover:text-emerald-600 font-medium'
                                    } rounded-xl transition-all duration-300 border-0 bg-transparent`}
                                    onClick={() => handleTabChange('create')}
                                >
                                    <motion.span
                                        className="flex items-center gap-2"
                                        animate={activeTab === 'create' ? { scale: 1.05 } : { scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <motion.span
                                            animate={activeTab === 'create' ? { rotate: [0, 10, 0] } : {}}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                        </motion.span>
                                        <span className="hidden sm:inline">Create Delivery</span>
                                    </motion.span>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Enhanced Dashboard Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="mt-6"
                    >
                        {activeTab === 'overview' && (
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="space-y-8"
                            >
                                {/* Enhanced Statistics Cards */}
                                <motion.div
                                    ref={statsRef}
                                    variants={fadeInUp}
                                    className="overflow-visible"
                                >
                                    <DashboardStats period="all" />
                                </motion.div>

                                {/* Enhanced Analytics Chart */}
                                <motion.div
                                    ref={analyticsRef}
                                    variants={fadeInUp}
                                    className="overflow-visible"
                                >
                                    <DashboardAnalytics />
                                </motion.div>

                                {/* Enhanced Delivery Metrics */}
                                <motion.div
                                    variants={fadeInUp}
                                >
                                    <DeliveryMetrics period="week" />
                                </motion.div>

                                {/* Enhanced Two-Column Layout */}
                                <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Enhanced Top Riders */}
                                    <motion.div className="h-full">
                                        <TopRiders />
                                    </motion.div>

                                    {/* Enhanced Recent Deliveries */}
                                    <motion.div className="h-full">
                                        <RecentDeliveries
                                            deliveries={recentDeliveries}
                                            isLoading={deliveriesLoading}
                                            onViewAll={() => handleTabChange('deliveries')}
                                        />
                                    </motion.div>
                                </motion.div>

                            </motion.div>
                        )}

                        {activeTab === 'deliveries' && (
                            <ActiveDeliveries />
                        )}

                        {activeTab === 'create' && (
                            <CreateDeliveryForm onSuccess={() => handleTabChange('overview')} />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Enhanced Floating Action Button - Fixed to only show when NOT on create tab and on mobile */}
                {activeTab !== 'create' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0, rotate: 180 }}
                        transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
                        className="fixed bottom-8 right-8 z-50 md:hidden"
                    >
                        <motion.button
                            whileHover={{
                                scale: 1.1,
                                boxShadow: "0 15px 30px rgba(16, 185, 129, 0.25)",
                                y: -3
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTabChange('create')}
                            className="relative bg-gradient-to-br from-green-500 to-emerald-500 text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm overflow-hidden"
                            style={{
                                filter: "drop-shadow(0 8px 16px rgba(16, 185, 129, 0.2))"
                            }}
                        >
                            {/* Button glow effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 opacity-0"
                                whileHover={{ opacity: 0.3 }}
                                transition={{ duration: 0.3 }}
                            />

                            {/* Floating particles inside button */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white/40 rounded-full"
                                    style={{
                                        left: `${20 + i * 20}%`,
                                        top: `${15 + i * 15}%`,
                                    }}
                                    animate={{
                                        y: [0, -10, 0],
                                        opacity: [0.4, 0.8, 0.4],
                                        scale: [1, 1.5, 1]
                                    }}
                                    transition={{
                                        duration: 2 + i * 0.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.3
                                    }}
                                />
                            ))}

                            <motion.svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 md:h-6 md:w-6 relative z-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.3 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </motion.svg>
                        </motion.button>

                        {/* Floating action button label */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.5, duration: 0.4 }}
                            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg pointer-events-none"
                        >
                            Create Delivery
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-4 border-b-4 border-t-transparent border-b-transparent" />
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default VendorDashboard;