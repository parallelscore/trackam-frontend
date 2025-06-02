import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import TrackingForm from '../components/common/TrackingForm';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const TrackSearchPage: React.FC = () => {
    const trackingSteps = [
        {
            step: "1",
            title: "Receive Your Tracking ID",
            description: "You should receive a tracking ID and link via WhatsApp or SMS from the vendor."
        },
        {
            step: "2",
            title: "Enter Your Tracking ID",
            description: "Input the tracking ID into the form above and click \"Track Now\"."
        },
        {
            step: "3",
            title: "View Real-Time Updates",
            description: "See the live location of your package and get estimated delivery times."
        },
        {
            step: "4",
            title: "Confirm Receipt",
            description: "Once you receive your package, confirm delivery through the tracking page."
        }
    ];

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Header Section */}
                    <motion.div variants={fadeInUp} className="text-center">
                        <h1 className="text-3xl font-bold text-secondary mb-3">Track Your Package</h1>
                        <p className="text-lg text-gray-600">
                            Enter your tracking ID to monitor your delivery in real-time
                        </p>
                    </motion.div>

                    {/* Tracking Form */}
                    <motion.div variants={fadeInUp}>
                        <TrackingForm />
                    </motion.div>

                    {/* How to Track Steps */}
                    <motion.div variants={fadeInUp} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-secondary mb-4">How to Track Your Package</h2>

                        <div className="space-y-3">
                            {trackingSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    custom={index}
                                    whileHover={{ x: 4, scale: 1.01 }}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/60 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="flex-shrink-0">
                                        <motion.div
                                            className="w-7 h-7 bg-gradient-to-r from-primary to-accent text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300"
                                            whileHover={{ rotate: 5 }}
                                        >
                                            {step.step}
                                        </motion.div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                                    </div>

                                    {/* Subtle arrow that appears on hover */}
                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default TrackSearchPage;