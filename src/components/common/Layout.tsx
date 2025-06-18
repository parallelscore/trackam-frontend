import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    footerVariant?: 'full' | 'minimal' | 'auto';
}

const Layout: React.FC<LayoutProps> = ({ children, footerVariant = 'auto' }) => {
    const location = useLocation();

    // Determine if this is the home page
    const isHomePage = location.pathname === '/';

    // Determine footer variant
    const actualFooterVariant = footerVariant === 'auto'
        ? (isHomePage ? 'full' : 'minimal')
        : footerVariant;

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

    // Dynamic class for content spacing based on footer variant
    const getContentClasses = () => {
        const baseClasses = "relative";
        const spacingClasses = actualFooterVariant === 'minimal'
            ? "pb-8" // Less padding for minimal footer
            : "pb-4"; // Minimal padding for full footer

        return `${baseClasses} ${spacingClasses}`;
    };

    return (
        <>
            {/* Page wrapper with proper flexbox structure */}
            <div className={`min-h-screen flex flex-col ${isHomePage ? 'home-page' : 'non-home-page'}`}>

                {/* Navbar - Fixed and properly positioned */}
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-50 flex-shrink-0"
                >
                    <Navbar />
                </motion.header>

                {/* Main content area that grows to fill available space */}
                <motion.main
                    className={`flex-1 flex flex-col relative z-10 ${getPageBackgroundClass()}`}
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
                            className="flex-1 flex flex-col"
                        >
                            {/* Content container with proper spacing and navbar offset */}
                            <div className="flex-1 pt-16">
                                <div className={getContentClasses()}>
                                    {children}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.main>

                {/* Footer - Always at bottom */}
                <motion.footer
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 flex-shrink-0 mt-auto"
                >
                    <Footer variant={actualFooterVariant} />
                </motion.footer>
            </div>
        </>
    );
};

export default Layout;