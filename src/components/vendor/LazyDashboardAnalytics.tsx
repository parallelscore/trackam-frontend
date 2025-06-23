// src/components/vendor/LazyDashboardAnalytics.tsx
import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { optimizedFadeIn } from '../../utils/performanceAnimations';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

// Lazy load the heavy DashboardAnalytics component with Recharts
const DashboardAnalytics = lazy(() => import('./DashboardAnalytics'));

// Chart loading skeleton
const ChartLoadingSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
    <CardHeader>
      <CardTitle className="text-gray-800">Delivery Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <motion.div
        variants={optimizedFadeIn}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Time range buttons skeleton */}
        <div className="flex space-x-2 mb-6">
          {['Week', 'Month', 'Year'].map((period) => (
            <div key={period} className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        
        {/* Chart area skeleton */}
        <div className="h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto"></div>
            <div className="text-gray-600 font-medium">Loading charts...</div>
            <div className="text-sm text-gray-500">Preparing analytics data</div>
          </div>
        </div>
        
        {/* Legend skeleton */}
        <div className="flex justify-center space-x-6 mt-4">
          {['Completed', 'In Progress', 'Cancelled'].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </motion.div>
    </CardContent>
  </Card>
);

interface LazyDashboardAnalyticsProps {
  [key: string]: any; // Forward all props to the actual DashboardAnalytics
}

const LazyDashboardAnalytics: React.FC<LazyDashboardAnalyticsProps> = (props) => {
  return (
    <Suspense fallback={<ChartLoadingSkeleton />}>
      <DashboardAnalytics {...props} />
    </Suspense>
  );
};

export default LazyDashboardAnalytics;