// src/components/vendor/dashboard/DashboardHeader.tsx
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '../../ui/button';
import { User } from '@/types';
import { 
  staggerContainer, 
  slideInLeft, 
  slideInRight, 
  fadeInUp, 
  glowEffect,
  hoverScale 
} from '../../ui/animations';

interface DashboardHeaderProps {
  user: User | null;
  activeTab: 'overview' | 'deliveries' | 'create';
  onCreateDelivery: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  activeTab, 
  onCreateDelivery 
}) => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={headerRef}
      initial="hidden"
      animate={headerInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="mb-8"
    >
      <motion.div
        className="relative rounded-3xl shadow-2xl overflow-hidden"
        variants={glowEffect}
        initial="initial"
        animate="animate"
      >
        {/* Light, cool green gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500" />

        {/* Overlay with subtle texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/80 via-emerald-500/75 to-teal-600/80" />

        {/* Animated mesh gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative p-8 md:p-12">
          {/* Enhanced floating elements */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-emerald-200/35 to-teal-200/35 rounded-2xl backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
          />

          <motion.div
            animate={{
              x: [0, 15, 0],
              y: [0, -8, 0],
              scale: [1, 1.15, 1],
              opacity: [0.35, 0.6, 0.35]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-8 left-12 w-12 h-12 bg-gradient-to-br from-green-200/35 to-emerald-200/35 rounded-full backdrop-blur-sm hidden lg:block border border-white/20 shadow-lg"
          />

          {/* Additional floating shapes */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/2 right-1/4 w-8 h-8 border-2 border-white/30 rounded-lg backdrop-blur-sm hidden xl:block"
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
            <motion.div variants={slideInLeft}>
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 text-sm text-white/95 mb-4 border border-white/20 shadow-lg"
              >
                <motion.span
                  className="w-3 h-3 bg-emerald-200 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="font-medium">Dashboard Overview</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg"
                style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
              >
                Vendor Dashboard
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-white/90 text-lg font-medium"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
              >
                Welcome back, <span className="text-emerald-200 font-semibold">
                  {user?.first_name || user?.business_name || 'Vendor'}
                </span> 👋
              </motion.p>
            </motion.div>

            {/* Enhanced CTA button - only show if not on create tab */}
            {activeTab !== 'create' && (
              <motion.div variants={slideInRight} className="mt-6 md:mt-0">
                <motion.div
                  {...hoverScale}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                    y: -2
                  }}
                  className="relative group"
                >
                  <Button
                    onClick={onCreateDelivery}
                    className="bg-white hover:bg-emerald-50 text-green-600 font-semibold px-6 py-4 md:px-8 md:py-6 text-base md:text-lg shadow-xl border-0 rounded-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Button background animation */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />

                    <span className="relative z-10 flex items-center gap-3">
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.3 }}
                      >
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </motion.svg>
                      Create New Delivery
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHeader;