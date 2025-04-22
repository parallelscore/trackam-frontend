import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import CreateDeliveryForm from '../components/vendor/CreateDeliveryForm';
import ActiveDeliveries from '../components/vendor/ActiveDeliveries';
import { Button } from '../components/ui/button';

const VendorDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'deliveries' | 'create'>('deliveries');

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-secondary">Vendor Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your deliveries and dispatch riders in real-time
                    </p>
                </div>

                <div className="flex border-b border-gray-200 mb-6">
                    <Button
                        variant="ghost"
                        className={`py-2 px-4 -mb-px ${
                            activeTab === 'deliveries'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('deliveries')}
                    >
                        Active Deliveries
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
                        Create New Delivery
                    </Button>
                </div>

                <div className="mt-6">
                    {activeTab === 'deliveries' ? (
                        <ActiveDeliveries />
                    ) : (
                        <CreateDeliveryForm />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default VendorDashboard;