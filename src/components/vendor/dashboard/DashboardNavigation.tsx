// src/components/vendor/dashboard/DashboardNavigation.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { hoverScale } from '../../ui/animations';

type TabType = 'overview' | 'deliveries' | 'create';

interface DashboardNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  // Calculate the position and width for the active tab indicator
  const getTabIndicatorStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      insetY: '0.5rem',
      height: 'calc(100% - 1rem)',
      background: 'linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129))',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.2)',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1
    };

    switch (activeTab) {
      case 'overview':
        return {
          ...baseStyle,
          left: '0.5rem',
          width: 'calc(33.333% - 1rem)'
        };
      case 'deliveries':
        return {
          ...baseStyle,
          left: 'calc(33.333% + 0.5rem)',
          width: 'calc(33.333% - 1rem)'
        };
      case 'create':
        return {
          ...baseStyle,
          left: 'calc(66.666% + 0.5rem)',
          width: 'calc(33.333% - 1rem)'
        };
      default:
        return baseStyle;
    }
  };

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      )
    },
    {
      id: 'deliveries' as TabType,
      label: 'All Deliveries',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      )
    },
    {
      id: 'create' as TabType,
      label: 'Create Delivery',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="relative">
        <motion.div
          className="relative flex bg-white/85 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-emerald-100/60"
          whileHover={{ boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)" }}
          transition={{ duration: 0.3 }}
        >
          {/* Active tab indicator */}
          <motion.div
            style={getTabIndicatorStyle()}
            layout
            initial={false}
          />

          {/* Tab buttons */}
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className="flex-1 relative z-10"
              {...hoverScale}
            >
              <Button
                variant="ghost"
                className={`w-full py-4 px-4 ${
                  activeTab === tab.id
                    ? 'text-white font-semibold'
                    : 'text-gray-600 hover:text-emerald-600 font-medium'
                } rounded-xl transition-all duration-300 border-0 bg-transparent`}
                onClick={() => onTabChange(tab.id)}
              >
                <motion.span
                  className="flex items-center gap-2"
                  animate={activeTab === tab.id ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    animate={activeTab === tab.id ? { rotate: [0, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardNavigation;