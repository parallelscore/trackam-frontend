import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleEffectProps {
  isVisible: boolean;
  particleCount?: number;
  color?: 'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  duration?: number;
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary/60',
  accent: 'bg-accent/60',
  secondary: 'bg-secondary/60',
  success: 'bg-green-500/60',
  warning: 'bg-yellow-500/60',
  error: 'bg-red-500/60'
};

const sizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3'
};

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  isVisible,
  particleCount = 6,
  color = 'primary',
  size = 'md',
  duration = 1.5,
  className = ""
}) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.1
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={`absolute ${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -40],
                x: [0, Math.random() * 20 - 10]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration,
                ease: "easeOut",
                delay: particle.delay
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};