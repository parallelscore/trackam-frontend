// src/pages/VendorDashboard.tsx
import React, { useState, useEffect } from 'react';
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

const VendorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const { deliveries, fetchDeliveries, isLoading: deliveriesLoading } = useDelivery();
    const [activeTab, setActiveTab] = useState<'overview' | 'deliveries' | 'create'>('overview');

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
    const recentDeliveries = deliveries.slice(0, 5);

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
                            onClick={() => setActiveTab('create')}
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
                        onClick={() => setActiveTab('overview')}
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
                        onClick={() => setActiveTab('deliveries')}
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
                        onClick={() => setActiveTab('create')}
                    >
                        Create Delivery
                    </Button>
                </div>

                {/* Dashboard Content */}
                <div className="mt-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <DashboardStats period="all" />

                            {/* Delivery Analytics Chart */}
                            <DashboardAnalytics />

                            {/* Delivery Metrics */}
                            <DeliveryMetrics period="week" />

                            {/* Top Riders and Recent Deliveries */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Riders */}
                                <TopRiders />

                                {/* Recent Deliveries */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold text-secondary">Recent Deliveries</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab('deliveries')}
                                            size="sm"
                                        >
                                            View All
                                        </Button>
                                    </div>

                                    <RecentDeliveries
                                        deliveries={recentDeliveries}
                                        isLoading={deliveriesLoading}
                                    />
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-secondary mb-4">Quick Actions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            onClick={() => setActiveTab('create')}
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
                        <CreateDeliveryForm onSuccess={() => setActiveTab('overview')} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default VendorDashboard;