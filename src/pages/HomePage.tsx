import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import TrackingForm from '../components/common/TrackingForm';
import { Button } from '../components/ui/button';

const HomePage: React.FC = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                Real-time Delivery Tracking for Nigerian Businesses
                            </h1>
                            <p className="text-xl text-white/80">
                                Connect vendors, riders, and customers with WhatsApp-integrated tracking. No app downloads required.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button
                                    asChild
                                    className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg"
                                >
                                    <Link to="/vendor">Vendor Dashboard</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-6 text-lg"
                                >
                                    <Link to="/track">Track A Package</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-xl transform -rotate-6"></div>
                                <div className="relative bg-white p-6 rounded-xl shadow-xl">
                                    <TrackingForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 md:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-secondary">How TrackAm Works</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            Streamline your logistics operations with our WhatsApp-integrated tracking system.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-secondary mb-2">For Vendors</h3>
                            <p className="text-gray-600">
                                Create deliveries, assign riders, and manage your operations from a single dashboard. Share tracking links via WhatsApp instantly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-secondary mb-2">For Riders</h3>
                            <p className="text-gray-600">
                                Accept deliveries with a simple OTP verification. Track locations in real-time with battery optimization for longer trips.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-secondary mb-2">For Customers</h3>
                            <p className="text-gray-600">
                                Track deliveries in real-time with a simple WhatsApp link. No app installation required. Confirm receipt with one click.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Delivery Operations?</h2>
                        <p className="text-xl text-white/80 mb-8">
                            Join hundreds of Nigerian businesses using TrackAm to improve their delivery experience.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                asChild
                                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg"
                            >
                                <Link to="/vendor">Get Started As Vendor</Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="bg-primary/20 hover:bg-primary/30 border-white/30 px-8 py-6 text-lg"
                            >
                                <Link to="/register">Create Account</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tracking Form (only visible on mobile) */}
            <div className="md:hidden bg-white py-8 px-4">
                <div className="max-w-md mx-auto">
                    <TrackingForm />
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;