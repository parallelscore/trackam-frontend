import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';
import { optimizedFadeIn } from '../utils/performanceAnimations';

// Lazy loaded dashboard components for better performance
const CreateDeliveryForm = lazy(() => import('../components/vendor/CreateDeliveryForm'));
const ActiveDeliveries = lazy(() => import('../components/vendor/ActiveDeliveries'));
const DashboardBackground = lazy(() => import('../components/vendor/dashboard/DashboardBackground'));
const DashboardHeader = lazy(() => import('../components/vendor/dashboard/DashboardHeader'));
const DashboardNavigation = lazy(() => import('../components/vendor/dashboard/DashboardNavigation'));
const DashboardOverview = lazy(() => import('../components/vendor/dashboard/DashboardOverview'));
const FloatingActionButton = lazy(() => import('../components/vendor/dashboard/FloatingActionButton'));
import { USE_MOCK_SERVICE } from '../config/serviceConfig';

type TabType = 'overview' | 'deliveries' | 'create';

const VendorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const { deliveries, fetchDeliveries, isLoading: deliveriesLoading } = useDelivery();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Check authentication (bypass when using mock service)
    useEffect(() => {
        if (!authLoading && !isAuthenticated && !USE_MOCK_SERVICE) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Fetch initial data with a higher limit for the dashboard
    useEffect(() => {
        if (isAuthenticated || USE_MOCK_SERVICE) {
            fetchDeliveries({ limit: 100 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Get the most recent deliveries for the Recent Deliveries component
    const recentDeliveries = deliveries.slice(0, 3);

    // Handle tab change
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    return (
        <Layout>
            <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse" />}>
                {/* Enhanced Background */}
                <DashboardBackground />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <Suspense fallback={<div className="h-20 bg-white/50 rounded-lg animate-pulse" />}>
                        {/* Dashboard Header */}
                        <DashboardHeader 
                            user={user}
                            activeTab={activeTab}
                            onCreateDelivery={() => handleTabChange('create')}
                        />
                    </Suspense>

                    <Suspense fallback={<div className="h-16 bg-white/50 rounded-lg animate-pulse mt-6" />}>
                        {/* Dashboard Navigation */}
                        <DashboardNavigation 
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                        />
                    </Suspense>

                    {/* Dashboard Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={optimizedFadeIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="mt-6"
                        >
                            <Suspense fallback={<div className="h-96 bg-white/50 rounded-lg animate-pulse" />}>
                                {activeTab === 'overview' && (
                                    <DashboardOverview 
                                        recentDeliveries={recentDeliveries}
                                        isLoading={deliveriesLoading}
                                        onViewAllDeliveries={() => handleTabChange('deliveries')}
                                    />
                                )}

                                {activeTab === 'deliveries' && (
                                    <ActiveDeliveries />
                                )}

                                {activeTab === 'create' && (
                                    <CreateDeliveryForm onSuccess={() => handleTabChange('overview')} />
                                )}
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>

                    <Suspense fallback={<div className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full animate-pulse" />}>
                        {/* Floating Action Button */}
                        <FloatingActionButton 
                            onClick={() => handleTabChange('create')}
                            isVisible={activeTab !== 'create'}
                        />
                    </Suspense>
                </div>
            </Suspense>
        </Layout>
    );
};

export default VendorDashboard;