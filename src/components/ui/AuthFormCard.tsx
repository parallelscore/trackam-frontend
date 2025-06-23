import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AuthFormCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const AuthFormCard: React.FC<AuthFormCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  children,
  className = ""
}) => {
  return (
    <Card className={`bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl p-0.5">
        <div className="bg-white rounded-xl h-full w-full" />
      </div>
      
      <div className="relative z-10">
        <CardHeader className="text-center pb-6">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl opacity-20 animate-pulse" />
            <Icon className="w-10 h-10 text-white relative z-10" />
            
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-3xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-30 animate-ping" />
              <div className="absolute inset-2 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-20 animate-ping animation-delay-500" />
            </div>
          </motion.div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
            {title}
          </CardTitle>
          
          {subtitle && (
            <p className="text-gray-600 text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </CardHeader>
        
        {children}
      </div>
    </Card>
  );
};