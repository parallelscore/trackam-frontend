import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        services: [
            { to: "/rider", label: "For Riders", description: "Join our network" },
            { to: "/track", label: "Track Package", description: "Real-time tracking" }
        ],
        company: [
            { to: "/about", label: "About Us", description: "Our story" },
            { to: "/careers", label: "Careers", description: "Join our team" }
        ],
        support: [
            { to: "/faq", label: "FAQs", description: "Common questions" },
            { to: "/help", label: "Help Center", description: "Get support" }
        ],
        legal: [
            { to: "/privacy", label: "Privacy Policy", description: "Your privacy matters" },
            { to: "/terms", label: "Terms of Service", description: "Usage terms" }
        ]
    };

    const socialLinks = [
        {
            name: "Twitter",
            icon: "𝕏",
            href: "https://twitter.com/trackam",
            color: "hover:text-gray-900"
        },
        {
            name: "LinkedIn",
            icon: "💼",
            href: "https://linkedin.com/company/trackam",
            color: "hover:text-blue-600"
        },
        {
            name: "Instagram",
            icon: "📷",
            href: "https://instagram.com/trackam",
            color: "hover:text-pink-600"
        },
        {
            name: "WhatsApp",
            icon: "💬",
            href: "https://wa.me/2348001234567",
            color: "hover:text-green-600"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const linkHoverVariants = {
        hover: {
            x: 4,
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    return (
        <footer className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="footer-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#footer-grid)" />
                </svg>
            </div>

            {/* Floating Elements */}
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
                className="absolute top-10 right-20 w-16 h-16 bg-accent/20 rounded-full backdrop-blur-sm hidden lg:block"
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
                className="absolute bottom-32 left-20 w-12 h-12 bg-white/20 rounded-lg backdrop-blur-sm hidden lg:block"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Header Section */}
                    <motion.div variants={itemVariants} className="mb-12">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="max-w-2xl">
                                <div className="flex items-center mb-6">
                                    <motion.div
                                        className="w-12 h-12 bg-gradient-to-r from-accent to-orange-300 rounded-xl flex items-center justify-center mr-4 shadow-xl"
                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </motion.div>
                                    <span className="text-3xl font-bold">TrackAm</span>
                                </div>
                                <p className="text-xl text-white/80 leading-relaxed mb-6">
                                    Revolutionizing delivery tracking across Nigeria with WhatsApp-integrated solutions.
                                    Connecting vendors, riders, and customers for seamless delivery experiences.
                                </p>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <motion.div
                                        className="flex items-center gap-3 group"
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-white/60 text-xs">Email us</div>
                                            <div className="text-white font-medium">hello@trackam.ng</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Newsletter Signup */}
                            <motion.div
                                className="max-w-md w-full"
                                variants={itemVariants}
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <h3 className="text-lg font-semibold mb-3 text-white">Stay Updated</h3>
                                    <p className="text-white/70 text-sm mb-4">
                                        Get the latest updates on new features and delivery insights.
                                    </p>
                                    <div className="flex gap-3">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent backdrop-blur-sm"
                                        />
                                        <motion.button
                                            className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Subscribe
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Links Grid */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
                    >
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <motion.div
                                key={category}
                                variants={itemVariants}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-semibold text-white capitalize mb-6 relative">
                                    {category === 'services' ? 'Services' :
                                        category === 'company' ? 'Company' :
                                            category === 'support' ? 'Support' : 'Legal'}
                                    <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-accent to-orange-300 rounded-full"></div>
                                </h3>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <motion.li
                                            key={link.to}
                                            variants={linkHoverVariants}
                                            whileHover="hover"
                                        >
                                            <Link
                                                to={link.to}
                                                className="group block"
                                            >
                                                <div className="text-white/80 hover:text-white font-medium transition-colors duration-300 group-hover:text-accent">
                                                    {link.label}
                                                </div>
                                                <div className="text-white/50 text-xs mt-1 group-hover:text-white/70 transition-colors duration-300">
                                                    {link.description}
                                                </div>
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Bottom Section */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-white/20 pt-8"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                            {/* Copyright and Location */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                <div className="flex items-center gap-2 text-white/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">Lagos, Nigeria</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 bg-white/40 rounded-full"></div>
                                <p className="text-white/60 text-sm">
                                    &copy; {currentYear} TrackAm. All rights reserved.
                                </p>
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center gap-4">
                                <span className="text-white/60 text-sm hidden sm:block">Follow us:</span>
                                <div className="flex gap-3">
                                    {socialLinks.map((social) => (
                                        <motion.a
                                            key={social.name}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 ${social.color}`}
                                            whileHover={{
                                                scale: 1.1,
                                                y: -2,
                                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            title={social.name}
                                        >
                                            <span className="text-lg">{social.icon}</span>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-xs">
                                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                    <span>🔒 SSL Secured</span>
                                    <span>📱 WhatsApp Integrated</span>
                                    <span>🇳🇬 Made in Nigeria</span>
                                    <span>⚡ Real-time Tracking</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Powered by</span>
                                    <motion.span
                                        className="text-accent font-medium"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        TrackAm Technology
                                    </motion.span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-orange-300"></div>
        </footer>
    );
};

export default Footer;
