// src/components/vendor/dashboard/DashboardOverview.tsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '../DashboardStats';
import DashboardAnalytics from '../DashboardAnalytics';
import DeliveryMetrics from '../DeliveryMetrics';
import TopRiders from '../TopRiders';
import RecentDeliveries from '../RecentDeliveries';
import { Delivery } from '@/types';
import { staggerContainer, fadeInUp } from '../../ui/animations';

interface DashboardOverviewProps {
  recentDeliveries: Delivery[];
  isLoading: boolean;
  onViewAllDeliveries: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  recentDeliveries,
  isLoading,
  onViewAllDeliveries
}) => {
  const statsRef = useRef(null);
  const analyticsRef = useRef(null);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Enhanced Statistics Cards */}
      <motion.div
        ref={statsRef}
        variants={fadeInUp}
        className="overflow-visible"
      >
        <DashboardStats period="all" />
      </motion.div>

      {/* Enhanced Analytics Chart */}
      <motion.div
        ref={analyticsRef}
        variants={fadeInUp}
        className="overflow-visible"
      >
        <DashboardAnalytics />
      </motion.div>

      {/* Enhanced Delivery Metrics */}
      <motion.div
        variants={fadeInUp}
      >
        <DeliveryMetrics period="week" />
      </motion.div>

      {/* Enhanced Two-Column Layout */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Top Riders */}
        <motion.div className="h-full">
          <TopRiders />
        </motion.div>

        {/* Enhanced Recent Deliveries */}
        <motion.div className="h-full">
          <RecentDeliveries
            deliveries={recentDeliveries}
            isLoading={isLoading}
            onViewAll={onViewAllDeliveries}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview;