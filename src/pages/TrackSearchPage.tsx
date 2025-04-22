import React from 'react';
import Layout from '../components/common/Layout';
import TrackingForm from '../components/common/TrackingForm';

const TrackSearchPage: React.FC = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-secondary">Track Your Package</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Enter your tracking ID to monitor your delivery in real-time
                    </p>
                </div>

                <TrackingForm />

                <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-secondary mb-4">How to Track Your Package</h2>

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="font-medium text-gray-900">Receive Your Tracking ID</h3>
                                <p className="text-gray-600">
                                    You should receive a tracking ID and link via WhatsApp or SMS from the vendor.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="font-medium text-gray-900">Enter Your Tracking ID</h3>
                                <p className="text-gray-600">
                                    Input the tracking ID into the form above and click "Track Now".
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="font-medium text-gray-900">View Real-Time Updates</h3>
                                <p className="text-gray-600">
                                    See the live location of your package and get estimated delivery times.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                    4
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="font-medium text-gray-900">Confirm Receipt</h3>
                                <p className="text-gray-600">
                                    Once you receive your package, confirm delivery through the tracking page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TrackSearchPage;