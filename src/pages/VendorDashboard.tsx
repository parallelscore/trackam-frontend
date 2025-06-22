import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/common/Layout';
import CreateDeliveryForm from '../components/vendor/CreateDeliveryForm';
import ActiveDeliveries from '../components/vendor/ActiveDeliveries';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';

// Dashboard components
import DashboardBackground from '../components/vendor/dashboard/DashboardBackground';
import DashboardHeader from '../components/vendor/dashboard/DashboardHeader';
import DashboardNavigation from '../components/vendor/dashboard/DashboardNavigation';
import DashboardOverview from '../components/vendor/dashboard/DashboardOverview';
import FloatingActionButton from '../components/vendor/dashboard/FloatingActionButton';

// Animations
import { tabContentVariants } from '../components/ui/animations';
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
            {/* Enhanced Background */}
            <DashboardBackground />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Dashboard Header */}
                <DashboardHeader 
                    user={user}
                    activeTab={activeTab}
                    onCreateDelivery={() => handleTabChange('create')}
                />

                {/* Dashboard Navigation */}
                <DashboardNavigation 
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                {/* Dashboard Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={tabContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mt-6"
                    >
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
                    </motion.div>
                </AnimatePresence>

                {/* Floating Action Button */}
                <FloatingActionButton 
                    onClick={() => handleTabChange('create')}
                    isVisible={activeTab !== 'create'}
                />
            </div>
        </Layout>
    );
};

export default VendorDashboard;