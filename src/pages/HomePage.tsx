import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Layout from '../components/common/Layout';
import TrackingForm from '../components/common/TrackingForm';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ErrorTestingPanel } from '../components/common/ErrorTestingPanel';
import { 
    fadeInUp, 
    staggerContainer, 
    slideInLeft, 
    slideInRight,
    hoverScale,
    cardHover
} from '../components/ui/animations';

// Counter component for animated numbers
const AnimatedCounter = ({ end, duration = 2, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView && !hasAnimated) {
            setHasAnimated(true);
            let startTime;
            const startCount = 0;

            const updateCount = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

                setCount(Math.floor(progress * (end - startCount) + startCount));

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                }
            };

            requestAnimationFrame(updateCount);
        }
    }, [isInView, end, duration, hasAnimated]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// Floating Action Buttons component
const FloatingActionButtons = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {/* Scroll to top button */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.1 }}
            >
                <motion.button
                    onClick={scrollToTop}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white border border-gray-200 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    title="Scroll to top"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </motion.button>
            </motion.div>

            {/* Quick track button (mobile only) */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="md:hidden"
            >
                <Link to="/track">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-gradient-to-r from-primary to-accent p-4 rounded-full shadow-lg"
                        title="Track package"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </motion.div>
                </Link>
            </motion.div>
        </div>
    );
};

const HomePage: React.FC = () => {
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const statsRef = useRef(null);
    const timelineRef = useRef(null);
    const testimonialsRef = useRef(null);

    const heroInView = useInView(heroRef, { once: true });
    const featuresInView = useInView(featuresRef, { once: true });
    const statsInView = useInView(statsRef, { once: true });
    const timelineInView = useInView(timelineRef, { once: true });
    const testimonialsInView = useInView(testimonialsRef, { once: true });

    const testimonials = [
        {
            name: "Adebayo Ogundimu",
            business: "Lagos Electronics",
            content: "TrackAm has revolutionized our delivery process. Customers love the real-time tracking!",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
        },
        {
            name: "Fatima Al-Hassan",
            business: "Abuja Fashion House",
            content: "The WhatsApp integration is genius. No apps to download, just seamless tracking.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
        },
        {
            name: "Chinedu Okwu",
            business: "Port Harcourt Logistics",
            content: "Our riders love how easy it is to use. Customer satisfaction has increased by 40%!",
            rating: 5,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
        }
    ];

    const timelineSteps = [
        {
            step: "1",
            title: "Create Delivery",
            description: "Vendor creates a new delivery and assigns it to a rider with package details",
            icon: "📦",
            color: "from-primary to-primary/80" // Primary color (matching 1st metric)
        },
        {
            step: "2",
            title: "Rider Accepts",
            description: "Rider receives WhatsApp notification and accepts delivery with OTP verification",
            icon: "🚴‍♂️",
            color: "from-accent to-accent/80" // Accent color (matching 2nd metric)
        },
        {
            step: "3",
            title: "Real-time Tracking",
            description: "Customer tracks delivery progress in real-time via WhatsApp link with live location",
            icon: "📍",
            color: "from-secondary to-secondary/80" // Secondary color (matching 3rd metric)
        },
        {
            step: "4",
            title: "Delivery Complete",
            description: "Customer confirms receipt and all parties get automatic notification of completion",
            icon: "✅",
            color: "from-primary to-primary/80" // Primary color again (matching 4th metric)
        }
    ];

    return (
        <Layout>
            <ErrorTestingPanel />
            <FloatingActionButtons />

            {/* Enhanced Hero Section */}
            <div className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='7' r='1'/%3E%3Ccircle cx='35' cy='7' r='1'/%3E%3Ccircle cx='49' cy='7' r='1'/%3E%3Ccircle cx='7' cy='21' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='21' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='7' cy='35' r='1'/%3E%3Ccircle cx='21' cy='35' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='35' r='1'/%3E%3Ccircle cx='7' cy='49' r='1'/%3E%3Ccircle cx='21' cy='49' r='1'/%3E%3Ccircle cx='35' cy='49' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
                    <motion.div
                        ref={heroRef}
                        initial="hidden"
                        animate={heroInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <motion.div variants={slideInLeft} className="space-y-6">
                            <motion.div
                                variants={fadeInUp}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm"
                            >
                                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                                Now serving 500+ businesses across Nigeria
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl md:text-6xl font-bold leading-tight"
                            >
                                Real-time Delivery
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-300">
                  {" "}Tracking
                </span>
                                <br />for Nigerian Businesses
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-xl text-white/80 leading-relaxed"
                            >
                                Connect vendors, riders, and customers with WhatsApp-integrated tracking.
                                No app downloads required. Just simple, reliable delivery management.
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row gap-4 pt-4"
                            >
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        asChild
                                        className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg shadow-xl"
                                    >
                                        <Link to="/vendor">Start Tracking Deliveries</Link>
                                    </Button>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-6 text-lg backdrop-blur-sm"
                                    >
                                        <Link to="/track">Track A Package</Link>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            variants={slideInRight}
                            className="hidden lg:block relative"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 1, -1, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl"></div>
                                <div className="relative">
                                    <TrackingForm />
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Floating elements */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-20 right-10 w-12 h-12 bg-accent/20 rounded-full backdrop-blur-sm hidden lg:block"
                />
                <motion.div
                    animate={{
                        y: [0, 15, 0],
                        x: [0, 10, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-20 left-10 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm hidden lg:block"
                />
            </div>

            {/* Stats Section */}
            <motion.div
                ref={statsRef}
                initial="hidden"
                animate={statsInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="py-16 bg-white border-b"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-secondary">Trusted by Nigerian Businesses</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Join hundreds of companies revolutionizing their delivery operations
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        <motion.div variants={fadeInUp} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                                <AnimatedCounter end={500} suffix="+" />
                            </div>
                            <div className="text-gray-600">Active Businesses</div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                                <AnimatedCounter end={15000} suffix="+" />
                            </div>
                            <div className="text-gray-600">Deliveries Tracked</div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
                                <AnimatedCounter end={98} suffix="%" />
                            </div>
                            <div className="text-gray-600">Success Rate</div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                                <AnimatedCounter end={1200} suffix="+" />
                            </div>
                            <div className="text-gray-600">Active Riders</div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Enhanced Timeline Section with rider icon and improved background */}
            <motion.div
                ref={timelineRef}
                initial="hidden"
                animate={timelineInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="py-20 relative overflow-hidden"
                style={{ background: "linear-gradient(to bottom right, #f8fafc, #f0f9ff)" }}
            >
                {/* Enhanced Network/Map Background Effect - Increased opacity and size */}
                <div className="absolute inset-0 overflow-hidden">
                    <svg 
                        className="absolute w-full h-full opacity-25" /* Increased opacity from 0.10 to 0.25 */
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 800"
                        preserveAspectRatio="xMidYMid slice" /* Added to ensure proper scaling */
                    >
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.7" className="text-secondary/50" />
                            </pattern>
                            
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" /> {/* Increased blur effect */}
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* Grid background - slightly darker */}
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* Delivery route points and lines - using theme colors */}
                        <g filter="url(#glow)">
                            <circle cx="200" cy="150" r="4" className="fill-primary" /> {/* Increased size and using theme colors */}
                            <circle cx="600" cy="100" r="4" className="fill-accent" />
                            <circle cx="1000" cy="200" r="4" className="fill-secondary" />
                            <circle cx="1200" cy="400" r="4" className="fill-primary" />
                            <circle cx="900" cy="600" r="4" className="fill-accent" />
                            <circle cx="400" cy="500" r="4" className="fill-secondary" />
                            <circle cx="300" cy="300" r="4" className="fill-primary" />
                            
                            <path d="M200,150 L600,100 L1000,200 L1200,400 L900,600 L400,500 L300,300 Z" 
                                  stroke="currentColor" 
                                  className="text-secondary"
                                  strokeWidth="1.5" 
                                  fill="none" 
                                  strokeDasharray="8,8" 
                                  opacity="0.6" />
                                  
                            {/* Additional connecting lines to create more route paths */}
                            <path d="M200,150 C400,50 800,300 1000,200" 
                                  stroke="currentColor" 
                                  className="text-accent"
                                  strokeWidth="1.5" 
                                  fill="none" 
                                  strokeDasharray="5,10" 
                                  opacity="0.4" />
                                  
                            <path d="M300,300 C500,450 700,350 900,600" 
                                  stroke="currentColor" 
                                  className="text-primary"
                                  strokeWidth="1.5" 
                                  fill="none" 
                                  strokeDasharray="4,6" 
                                  opacity="0.5" />
                        </g>
                        
                        {/* Animated floating points - using theme colors and more visible */}
                        <g>
                            <motion.circle 
                                cx="700" 
                                cy="300" 
                                r="3" 
                                className="fill-primary"
                                animate={{ y: [-15, 15, -15] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.circle 
                                cx="500" 
                                cy="200" 
                                r="3" 
                                className="fill-accent"
                                animate={{ y: [-20, 20, -20] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.circle 
                                cx="800" 
                                cy="500" 
                                r="3" 
                                className="fill-secondary"
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                            {/* Additional animated points */}
                            <motion.circle 
                                cx="400" 
                                cy="300" 
                                r="3" 
                                className="fill-primary"
                                animate={{ y: [-8, 8, -8], x: [-5, 5, -5] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.circle 
                                cx="1100" 
                                cy="250" 
                                r="3" 
                                className="fill-accent"
                                animate={{ y: [-12, 12, -12], x: [8, -8, 8] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </g>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary">How TrackAm Works</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            Our streamlined 4-step process makes delivery tracking effortless for everyone
                        </p>
                    </motion.div>

                    {/* Desktop: Horizontal Timeline */}
                    <div className="hidden md:block">
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute top-20 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>

                            {/* Animated Rider Icon */}
                            <motion.div
                                animate={{ left: ["0%", "100%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                                className="absolute top-16 h-8 w-8 z-30"
                                style={{ left: "0%" }}
                            >
                                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"> {/* Changed to primary color */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                    </svg>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-4 gap-8">
                                {timelineSteps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{ y: -10, scale: 1.02 }}
                                        className="relative"
                                    >
                                        {/* Step Circle */}
                                        <div className="relative z-10 flex justify-center mb-6">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                                className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-xl border-4 border-white`}
                                            >
                                                <span className="text-2xl text-white">{step.icon}</span>
                                            </motion.div>
                                        </div>

                                        {/* Step Card */}
                                        <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-transparent hover:border-primary group">
                                            <CardContent className="p-6">
                                                <div className="text-center">
                                                    <Badge className={`bg-gradient-to-r ${step.color} text-white px-3 py-1 mb-4 border-0`}>
                                                        Step {step.step}
                                                    </Badge>
                                                    <h3 className="text-lg font-bold text-secondary mb-3 group-hover:text-primary transition-colors">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Arrow to Next Step - Updated to use theme colors */}
                                        {index < timelineSteps.length - 1 && (
                                            <motion.div
                                                animate={{ x: [0, 10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                                                className="absolute top-16 -right-4 z-20 hidden lg:block"
                                            >
                                                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary">
                                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile: Vertical Timeline - Updated with theme colors */}
                    <div className="md:hidden">
                        <div className="relative max-w-md mx-auto">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-10 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>

                            {/* Animated Rider Icon for Mobile */}
                            <motion.div
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                                className="absolute left-8 w-6 h-6 z-30"
                                style={{ top: "0%" }}
                            >
                                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"> {/* Changed to primary color */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                    </svg>
                                </div>
                            </motion.div>

                            <div className="space-y-8">
                                {timelineSteps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        variants={fadeInUp}
                                        custom={index}
                                        className="relative flex items-start"
                                    >
                                        {/* Step Circle */}
                                        <div className="relative z-10 flex-shrink-0">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-xl border-4 border-white`}
                                            >
                                                <span className="text-2xl text-white">{step.icon}</span>
                                            </motion.div>
                                        </div>

                                        {/* Step Card */}
                                        <div className="ml-6 flex-1">
                                            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                                                <CardContent className="p-4">
                                                    <Badge className={`bg-gradient-to-r ${step.color} text-white px-3 py-1 mb-3 border-0`}>
                                                        Step {step.step}
                                                    </Badge>
                                                    <h3 className="text-lg font-bold text-secondary mb-2">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Arrow to Next Step */}
                                        {index < timelineSteps.length - 1 && (
                                            <motion.div
                                                animate={{ y: [0, 10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                                                className="absolute left-8 -bottom-4 z-20"
                                            >
                                                <div className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary">
                                                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Features Section */}
            <motion.div
                ref={featuresRef}
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="py-20 bg-white"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary">
                            Why Choose TrackAm?
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            Built specifically for the Nigerian market with features that matter to local businesses
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: "📱",
                                title: "WhatsApp Integration",
                                description: "No app downloads needed. Everything works through WhatsApp - the platform Nigerians already use daily.",
                                features: ["Instant notifications", "QR code sharing", "Real-time updates"]
                            },
                            {
                                icon: "🚴‍♂️",
                                title: "Smart Rider Management",
                                description: "OTP verification, battery-optimized tracking, and automatic route optimization for efficient deliveries.",
                                features: ["OTP security", "Battery saving mode", "Route optimization"]
                            },
                            {
                                icon: "📊",
                                title: "Business Analytics",
                                description: "Track performance, monitor delivery times, and get insights to improve your operations.",
                                features: ["Performance metrics", "Delivery analytics", "Customer insights"]
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="group"
                            >
                                <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:border-primary/20">
                                    <CardContent className="p-8">
                                        <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {feature.features.map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Testimonials Section */}
            <motion.div
                ref={testimonialsRef}
                initial="hidden"
                animate={testimonialsInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="py-20 bg-gradient-to-br from-primary/5 to-accent/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary">
                            What Our Customers Say
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Real feedback from businesses using TrackAm across Nigeria
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="group"
                            >
                                <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                                    <CardContent className="p-8">
                                        {/* Stars */}
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                                </svg>
                                            ))}
                                        </div>

                                        {/* Quote */}
                                        <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                                            "{testimonial.content}"
                                        </blockquote>

                                        {/* Author */}
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <div className="font-semibold text-secondary">
                                                    {testimonial.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {testimonial.business}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Enhanced CTA Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="relative bg-gradient-to-r from-secondary via-primary to-accent text-white overflow-hidden"
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v20h40V20H20z'/%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
                    <motion.div variants={fadeInUp} className="text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to Transform Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300">
                {" "}Delivery Operations?
              </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
                            Join hundreds of Nigerian businesses using TrackAm to improve their delivery experience and customer satisfaction.
                        </p>
                        <motion.div
                            variants={staggerContainer}
                            className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
                        >
                            <motion.div
                                variants={fadeInUp}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    asChild
                                    className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg shadow-xl"
                                >
                                    <Link to="/vendor">Get Started As Vendor</Link>
                                </Button>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    asChild
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 border-white/30 px-8 py-6 text-lg backdrop-blur-sm"
                                >
                                    <Link to="/register">Create Account</Link>
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="text-center text-white/60">
                            <p className="text-sm">
                                ✨ No setup fees • 📱 WhatsApp integration • 🚀 Start in minutes
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Floating shapes */}
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full hidden lg:block"
                />
                <motion.div
                    animate={{
                        rotate: [360, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-lg hidden lg:block"
                />
            </motion.div>

            {/* Mobile Tracking Form */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="lg:hidden bg-white py-8 px-4 border-t"
            >
                <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-center mb-4 text-secondary">
                        Track Your Package
                    </h3>
                    <TrackingForm />
                </div>
            </motion.div>
        </Layout>
    );
};

export default HomePage;
