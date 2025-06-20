// src/components/vendor/dashboard/FloatingActionButton.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 180 }}
      transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
      className="fixed bottom-8 right-8 z-50 md:hidden"
    >
      <motion.button
        whileHover={{
          scale: 1.1,
          boxShadow: "0 15px 30px rgba(16, 185, 129, 0.25)",
          y: -3
        }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="relative bg-gradient-to-br from-green-500 to-emerald-500 text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm overflow-hidden"
        style={{
          filter: "drop-shadow(0 8px 16px rgba(16, 185, 129, 0.2))"
        }}
      >
        {/* Button glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 opacity-0"
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating particles inside button */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${20 + i * 20}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}

        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6 relative z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </motion.svg>
      </motion.button>

      {/* Floating action button label */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg pointer-events-none"
      >
        Create Delivery
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-4 border-b-4 border-t-transparent border-b-transparent" />
      </motion.div>
    </motion.div>
  );
};

export default FloatingActionButton;