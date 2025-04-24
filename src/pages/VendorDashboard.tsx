// src/pages/VendorDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';

// Interface for tracking loading states
interface LoadingStates {
    basic: boolean;
    stats: boolean;
    deliveries: boolean;
    analytics: boolean;
    riders: boolean;
}

const VendorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const { deliveries, fetchDeliveries, isLoading: deliveriesLoading } = useDelivery();
    const [activeTab, setActiveTab] = useState<'overview' | 'deliveries' | 'create'>('overview');

    // State to track loading of different dashboard sections
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({
        basic: true,
        stats: true,
        deliveries: true,
        analytics: true,
        riders: true
    });

    // Check authentication
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Progressive loading implementation
    useEffect(() => {
        if (isAuthenticated && loadingStates.basic) {
            // First, update basic loading state
            setLoadingStates(prev => ({ ...prev, basic: false }));

            // Stage 1: Load recent deliveries (small batch)
            const loadRecentDeliveries = async () => {
                try {
                    await fetchDeliveries({ limit: 5 });
                    setLoadingStates(prev => ({ ...prev, deliveries: false }));
                } catch (error) {
                    console.error('Error loading recent deliveries:', error);
                }
            };

            // Start loading recent deliveries immediately
            loadRecentDeliveries();

            // Stage 2: Load stats after a short delay
            setTimeout(() => {
                setLoadingStates(prev => ({ ...prev, stats: false }));
            }, 100);

            // Stage 3: Load analytics after a longer delay
            setTimeout(() => {
                setLoadingStates(prev => ({ ...prev, analytics: false }));
            }, 300);

            // Stage 4: Load riders last
            setTimeout(() => {
                setLoadingStates(prev => ({ ...prev, riders: false }));
            }, 500);
        }
    }, [isAuthenticated, loadingStates.basic, fetchDeliveries]);

    // Handle tab changes
    const handleTabChange = useCallback((tab: 'overview' | 'deliveries' | 'create') => {
        setActiveTab(tab);

        // When switching to deliveries tab, load all deliveries
        if (tab === 'deliveries') {
            fetchDeliveries();
        }
    }, [fetchDeliveries]);

    // Get the most recent deliveries for the Recent Deliveries component
    const recentDeliveries = deliveries.slice(0, 3);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Vendor Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back, {user?.first_name || user?.business_name || 'Vendor'}
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <Button
                            onClick={() => handleTabChange('create')}
                            className="bg-accent text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create New Delivery
                        </Button>
                    </div>
                </div>

                {/* Dashboard Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <Button
                        variant="ghost"
                        className={`py-2 px-4 -mb-px ${
                            activeTab === 'overview'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => handleTabChange('overview')}
                    >
                        Overview
                    </Button>
                    <Button
                        variant="ghost"
                        className={`py-2 px-4 -mb-px ${
                            activeTab === 'deliveries'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => handleTabChange('deliveries')}
                    >
                        All Deliveries
                    </Button>
                    <Button
                        variant="ghost"
                        className={`py-2 px-4 -mb-px ${
                            activeTab === 'create'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => handleTabChange('create')}
                    >
                        Create Delivery
                    </Button>
                </div>

                {/* Dashboard Content */}
                <div className="mt-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            {loadingStates.stats ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Card key={i}>
                                            <CardContent className="p-6">
                                                <div className="animate-pulse flex items-center">
                                                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                                                    <div className="ml-4 space-y-2 w-full">
                                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <DashboardStats period="all" />
                            )}

                            {/* Delivery Analytics Chart */}
                            {loadingStates.analytics ? (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                            <div className="h-64 bg-gray-200 rounded w-full"></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <DashboardAnalytics />
                            )}

                            {/* Delivery Metrics */}
                            {loadingStates.stats ? (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Card key={i}>
                                            <CardContent className="p-6">
                                                <div className="animate-pulse space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <DeliveryMetrics period="week" />
                            )}

                            {/* Top Riders and Recent Deliveries */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Riders */}
                                <div>
                                    {loadingStates.riders ? (
                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="animate-pulse space-y-4">
                                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                                    <div className="space-y-2">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="flex justify-between">
                                                                <div className="h-10 bg-gray-200 rounded w-2/3"></div>
                                                                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <TopRiders />
                                    )}
                                </div>

                                {/* Recent Deliveries */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold text-secondary">Recent Deliveries</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleTabChange('deliveries')}
                                            size="sm"
                                        >
                                            View All
                                        </Button>
                                    </div>

                                    <RecentDeliveries
                                        deliveries={recentDeliveries}
                                        isLoading={loadingStates.deliveries || deliveriesLoading}
                                    />
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-secondary mb-4">Quick Actions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            onClick={() => handleTabChange('create')}
                                            className="flex items-center justify-center gap-2 h-auto py-6"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Create New Delivery
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="flex items-center justify-center gap-2 h-auto py-6"
                                            onClick={() => window.open(`/track`, '_blank')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                            Track a Delivery
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="flex items-center justify-center gap-2 h-auto py-6"
                                            onClick={() => navigate('/profile')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                            Account Settings
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'deliveries' && (
                        <ActiveDeliveries />
                    )}

                    {activeTab === 'create' && (
                        <CreateDeliveryForm onSuccess={() => handleTabChange('overview')} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default VendorDashboard;