import { motion } from 'framer-motion';

/**
 * LoadingFallback component
 * 
 * Displays a loading spinner and message when lazy-loaded components are being loaded
 */
const LoadingFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  );
};

export default LoadingFallback;