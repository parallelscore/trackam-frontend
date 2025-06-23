import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElement {
  size: 'sm' | 'md' | 'lg';
  color: 'primary' | 'accent' | 'secondary';
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  animation?: {
    duration?: number;
    delay?: number;
  };
}

interface AnimatedBackgroundProps {
  elements?: FloatingElement[];
  className?: string;
}

const defaultElements: FloatingElement[] = [
  {
    size: 'lg',
    color: 'primary',
    position: { top: '16px', right: '80px' },
    animation: { duration: 8, delay: 0 }
  },
  {
    size: 'md',
    color: 'accent',
    position: { bottom: '80px', left: '64px' },
    animation: { duration: 12, delay: 3 }
  },
  {
    size: 'sm',
    color: 'secondary',
    position: { top: '40%', right: '10%' },
    animation: { duration: 10, delay: 1.5 }
  },
  {
    size: 'md',
    color: 'primary',
    position: { bottom: '30%', left: '10%' },
    animation: { duration: 15, delay: 4 }
  }
];

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-28 h-28',
  lg: 'w-36 h-36'
};

const colorClasses = {
  primary: 'bg-primary/10',
  accent: 'bg-accent/10',
  secondary: 'bg-secondary/10'
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  elements = defaultElements,
  className = ""
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element, index) => (
        <motion.div
          key={index}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -8, 8, 0]
          }}
          transition={{
            duration: element.animation?.duration || 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.animation?.delay || 0
          }}
          className={`absolute ${sizeClasses[element.size]} ${colorClasses[element.color]} rounded-full blur-2xl`}
          style={element.position}
        />
      ))}
    </div>
  );
};