// src/components/map/LazyTrackingMap.tsx
import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { optimizedFadeIn } from '../../utils/performanceAnimations';

// Lazy load the heavy TrackingMap component
const TrackingMap = lazy(() => import('./TrackingMap'));

// Map loading skeleton
const MapLoadingSkeleton = () => (
  <motion.div
    variants={optimizedFadeIn}
    initial="hidden"
    animate="visible"
    className="w-full h-[400px] bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center"
  >
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
      <div className="text-green-700 font-medium">Loading map...</div>
      <div className="text-sm text-green-600">Preparing location tracking</div>
    </div>
  </motion.div>
);

interface LazyTrackingMapProps {
  [key: string]: any; // Forward all props to the actual TrackingMap
}

const LazyTrackingMap: React.FC<LazyTrackingMapProps> = (props) => {
  return (
    <Suspense fallback={<MapLoadingSkeleton />}>
      <TrackingMap {...props} />
    </Suspense>
  );
};

export default LazyTrackingMap;