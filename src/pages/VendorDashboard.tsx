import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import Layout from '../components/common/Layout';
import CreateDeliveryForm from '../components/vendor/CreateDeliveryForm';
import ActiveDeliveries from '../components/vendor/ActiveDeliveries';
import DashboardStats from '../components/vendor/DashboardStats';
import RecentDeliveries from '../components/vendor/RecentDeliveries';
import DeliveryMetrics from '../components/vendor/DeliveryMetrics';
import TopRiders from '../components/vendor/TopRiders';
import DashboardAnalytics from '../components/vendor/DashboardAnalytics';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
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
    const headerInView = useInView(headerRef, { once: true });
    const statsInView = useInView(statsRef, { once: true });
    const analyticsInView = useInView(analyticsRef, { once: true });

    // Get current path to determine if we're already on create delivery page
    const isCreateDeliveryPage = location.pathname.includes('/vendor') && activeTab === 'create';

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

    return (
        <Layout>
            {/* Enhanced Background Pattern with warm gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-accent/5 to-primary/8 -z-10 overflow-hidden">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.025'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='7' r='1'/%3E%3Ccircle cx='35' cy='7' r='1'/%3E%3Ccircle cx='49' cy='7' r='1'/%3E%3Ccircle cx='7' cy='21' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='21' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='7' cy='35' r='1'/%3E%3Ccircle cx='21' cy='35' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='35' r='1'/%3E%3Ccircle cx='7' cy='49' r='1'/%3E%3Ccircle cx='21' cy='49' r='1'/%3E%3Ccircle cx='35' cy='49' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
                
                {/* Added subtle animated gradient orbs */}
                <motion.div
                    animate={{
                        x: [0, 10, 0],
                        y: [0, -15, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[20%] right-[25%] w-64 h-64 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 blur-3xl"
                />
                
                <motion.div
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[15%] left-[20%] w-80 h-80 rounded-full bg-gradient-to-r from-accent/10 to-secondary/10 blur-3xl"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Dashboard Header with enhanced warm styling */}
                <motion.div 
                    ref={headerRef}
                    initial="hidden"
                    animate={headerInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-r from-secondary/90 via-secondary/85 to-primary/90 rounded-2xl shadow-lg overflow-hidden">
                        <div className="relative p-6 md:p-8">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='7' r='1'/%3E%3Ccircle cx='35' cy='7' r='1'/%3E%3Ccircle cx='49' cy='7' r='1'/%3E%3Ccircle cx='7' cy='21' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='21' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='7' cy='35' r='1'/%3E%3Ccircle cx='21' cy='35' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='35' r='1'/%3E%3Ccircle cx='7' cy='49' r='1'/%3E%3Ccircle cx='21' cy='49' r='1'/%3E%3Ccircle cx='35' cy='49' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                }} />
                            </div>

                            {/* Enhanced Floating elements with warmer effects */}
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0],
                                    opacity: [0.7, 0.9, 0.7]
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-8 right-8 w-12 h-12 bg-accent/30 rounded-full backdrop-blur-sm hidden lg:block"
                            />
                            
                            <motion.div
                                animate={{
                                    x: [0, 10, 0],
                                    y: [0, -5, 0],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute bottom-6 left-12 w-8 h-8 bg-primary/30 rounded-full backdrop-blur-sm hidden lg:block"
                            />
                            
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                                <motion.div variants={slideInLeft}>
                                    <motion.div
                                        variants={fadeInUp}
                                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/90 mb-3"
                                    >
                                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                                        Dashboard Overview
                                    </motion.div>
                                    
                                    <motion.h1 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white">
                                        Vendor Dashboard
                                    </motion.h1>
                                    
                                    <motion.p variants={fadeInUp} className="text-white/80 mt-2">
                                        Welcome back, {user?.first_name || user?.business_name || 'Vendor'}
                                    </motion.p>
                                </motion.div>

                                {/* Only show the button if not already on create delivery page */}
                                {!isCreateDeliveryPage && (
                                    <motion.div variants={slideInRight} className="mt-4 md:mt-0">
                                        <motion.div 
                                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }} 
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                onClick={() => handleTabChange('create')}
                                                className="bg-white hover:bg-white/90 text-secondary font-medium px-6 py-6 shadow-lg"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                Create New Delivery
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Navigation - Enhanced with warm color animations */}
                <div className="mb-8">
                    <motion.div 
                        className="flex flex-wrap bg-white rounded-xl shadow-md p-1 border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                        >
                            <Button
                                variant={activeTab === 'overview' ? "default" : "ghost"}
                                className={`w-full py-3 ${
                                    activeTab === 'overview'
                                        ? 'bg-gradient-to-r from-secondary/90 to-primary/90 text-white shadow-md'
                                        : 'text-gray-600 hover:text-secondary'
                                } rounded-lg transition-all duration-300`}
                                onClick={() => handleTabChange('overview')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                </svg>
                                Overview
                            </Button>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                        >
                            <Button
                                variant={activeTab === 'deliveries' ? "default" : "ghost"}
                                className={`w-full py-3 ${
                                    activeTab === 'deliveries'
                                        ? 'bg-gradient-to-r from-secondary/90 to-primary/90 text-white shadow-md'
                                        : 'text-gray-600 hover:text-secondary'
                                } rounded-lg transition-all duration-300`}
                                onClick={() => handleTabChange('deliveries')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                </svg>
                                All Deliveries
                            </Button>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                        >
                            <Button
                                variant={activeTab === 'create' ? "default" : "ghost"}
                                className={`w-full py-3 ${
                                    activeTab === 'create'
                                        ? 'bg-gradient-to-r from-secondary/90 to-primary/90 text-white shadow-md'
                                        : 'text-gray-600 hover:text-secondary'
                                } rounded-lg transition-all duration-300`}
                                onClick={() => handleTabChange('create')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Create Delivery
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Dashboard Content with improved animations */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="mt-6"
                    >
                        {activeTab === 'overview' && (
                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="space-y-8"
                            >
                                {/* Statistics Cards with improved warm animations */}
                                <motion.div 
                                    ref={statsRef}
                                    variants={fadeInUp}
                                    className="overflow-visible"
                                >
                                    <DashboardStats period="all" />
                                </motion.div>

                                {/* Delivery Analytics Chart with enhanced styling */}
                                <motion.div 
                                    ref={analyticsRef}
                                    variants={fadeInUp}
                                    className="overflow-visible"
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/40 via-primary/40 to-accent/40 rounded-t-lg"></div>
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-semibold text-secondary mb-6 flex items-center">
                                                <span className="bg-secondary/10 p-2 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </span>
                                                Delivery Analytics
                                            </h3>
                                            <DashboardAnalytics />
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Delivery Metrics with enhanced styling */}
                                <motion.div 
                                    variants={fadeInUp}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/40 via-primary/40 to-secondary/40 rounded-t-lg"></div>
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-semibold text-secondary mb-6 flex items-center">
                                                <span className="bg-accent/10 p-2 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </span>
                                                Weekly Performance Metrics
                                            </h3>
                                            <DeliveryMetrics period="week" />
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Top Riders and Recent Deliveries */}
                                <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Top Riders */}
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-t-lg"></div>
                                            <CardContent className="p-6">
                                                <h3 className="text-xl font-semibold text-secondary mb-6 flex items-center">
                                                    <span className="bg-primary/10 p-2 rounded-lg mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </span>
                                                    Top Performing Riders
                                                </h3>
                                                <TopRiders />
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Recent Deliveries */}
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/40 to-accent/40 rounded-t-lg"></div>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-xl font-semibold text-secondary flex items-center">
                                                        <span className="bg-secondary/10 p-2 rounded-lg mr-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </span>
                                                        Recent Deliveries
                                                    </h3>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleTabChange('deliveries')}
                                                            size="sm"
                                                            className="border-secondary/20 text-secondary hover:bg-secondary/10"
                                                        >
                                                            View All
                                                        </Button>
                                                    </motion.div>
                                                </div>

                                                <RecentDeliveries
                                                    deliveries={recentDeliveries}
                                                    isLoading={deliveriesLoading}
                                                />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeTab === 'deliveries' && (
                            <Card className="shadow-lg border border-gray-100">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary/40 via-primary/40 to-accent/40 rounded-t-lg"></div>
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-6">
                                        <Badge className="bg-secondary/90 text-white border-0 mr-2">All</Badge>
                                        <h3 className="text-xl font-semibold text-secondary">Deliveries</h3>
                                    </div>
                                    <ActiveDeliveries />
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'create' && (
                            <Card className="shadow-lg border border-gray-100">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/40 via-secondary/40 to-primary/40 rounded-t-lg"></div>
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-6">
                                        <Badge className="bg-accent/90 text-white border-0 mr-2">New</Badge>
                                        <h3 className="text-xl font-semibold text-secondary">Create Delivery</h3>
                                    </div>
                                    <CreateDeliveryForm onSuccess={() => handleTabChange('overview')} />
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Enhanced Floating Action Button with warmer colors */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.3 }}
                    className="fixed bottom-6 right-6 z-50 md:hidden"
                >
                    <motion.button
                        whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTabChange('create')}
                        className="bg-gradient-to-r from-secondary/90 to-primary/90 text-white p-4 rounded-full shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </motion.button>
                </motion.div>
            </div>
        </Layout>
    );
};

export default VendorDashboard;
