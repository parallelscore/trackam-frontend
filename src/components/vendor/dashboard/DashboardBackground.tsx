// src/components/vendor/dashboard/DashboardBackground.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { backgroundFloat, backgroundRotate } from '../../ui/animations';

const DashboardBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Clean white/off-white gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-slate-50/30" />

      {/* More visible animated gradient overlays with subtle green accents */}
      <motion.div
        {...backgroundFloat}
        className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-gradient-to-r from-green-100/30 to-emerald-100/30 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 40, 0],
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.25, 0.1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[15%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/20 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.3, 0.12]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] left-[60%] w-72 h-72 rounded-full bg-gradient-to-r from-teal-100/25 to-green-100/25 blur-3xl"
      />

      {/* Visible animated geometric patterns */}
      <motion.div
        {...backgroundRotate}
        className="absolute top-[15%] left-[5%] w-40 h-40 border-2 border-green-200/30 rounded-full"
      />

      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 1.4, 1],
          opacity: [0.06, 0.18, 0.06]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[25%] right-[10%] w-32 h-32 border-3 border-emerald-200/25 rounded-lg transform rotate-45"
      />

      {/* Additional floating shapes */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          rotate: [0, 180, 360],
          opacity: [0.08, 0.2, 0.08]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[60%] left-[20%] w-16 h-16 bg-gradient-to-br from-green-300/15 to-emerald-300/15 rounded-full"
      />

      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.25, 0.1]
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[40%] right-[30%] w-20 h-20 bg-teal-200/15 rounded-lg transform rotate-12"
      />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='7' r='1'/%3E%3Ccircle cx='35' cy='7' r='1'/%3E%3Ccircle cx='49' cy='7' r='1'/%3E%3Ccircle cx='7' cy='21' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='21' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='7' cy='35' r='1'/%3E%3Ccircle cx='21' cy='35' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='35' r='1'/%3E%3Ccircle cx='7' cy='49' r='1'/%3E%3Ccircle cx='21' cy='49' r='1'/%3E%3Ccircle cx='35' cy='49' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Animated wave pattern */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(16, 185, 129, 0.05) 2px, rgba(16, 185, 129, 0.05) 4px)`,
          backgroundSize: "30px 30px"
        }}
      />
    </div>
  );
};

export default DashboardBackground;