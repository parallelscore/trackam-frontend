import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    // Page transition variants
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20,
        },
        in: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        out: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.3,
                ease: "easeIn"
            }
        }
    };

    // Background animation for different pages
    const getPageBackgroundClass = () => {
        if (location.pathname === '/') {
            return 'bg-gradient-to-br from-gray-50 via-white to-primary/5';
        } else if (location.pathname.startsWith('/vendor')) {
            return 'bg-gradient-to-br from-primary/5 via-white to-accent/5';
        } else if (location.pathname.startsWith('/track')) {
            return 'bg-gradient-to-br from-accent/5 via-white to-secondary/5';
        } else if (location.pathname.startsWith('/rider')) {
            return 'bg-gradient-to-br from-secondary/5 via-white to-primary/5';
        }
        return 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-50"
            >
                <Navbar />
            </motion.div>

            {/* Main content area with smooth transitions */}
            <motion.main
                className={`flex-grow relative z-10 ${getPageBackgroundClass()}`}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        className="relative"
                    >
                        {/* Content container with padding for fixed navbar */}
                        <div className="pt-16 min-h-screen">
                            {children}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.main>

            {/* Footer */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10"
            >
                <Footer />
            </motion.div>
        </div>
    );
};

export default Layout;