// src/components/ui/OptimizedImage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { optimizedFadeIn } from '../../utils/performanceAnimations';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  lazy?: boolean;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  lazy = true,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate placeholder for better UX
  const placeholderSrc = placeholder || `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        ${hasError ? 'Error loading image' : 'Loading...'}
      </text>
    </svg>
  `)}`;

  return (
    <motion.div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      variants={optimizedFadeIn}
      initial="hidden"
      animate="visible"
      style={{ width, height }}
    >
      {/* Placeholder or actual image */}
      {(!isInView || !isLoaded) && (
        <motion.img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <motion.img
          src={hasError ? placeholderSrc : src}
          alt={alt}
          className="w-full h-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

export default OptimizedImage;