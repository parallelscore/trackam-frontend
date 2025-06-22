import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  fps: number;
  animationCount: number;
  memoryUsage: number;
  isLowPerformance: boolean;
}

const AnimationPerformanceMonitor: React.FC<{
  enabled?: boolean;
  showUI?: boolean;
}> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  showUI = process.env.NODE_ENV === 'development'
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    animationCount: 0,
    memoryUsage: 0,
    isLowPerformance: false
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // Get memory usage (if available)
        const memoryUsage = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : 0;

        // Count active animations by checking for elements with will-change
        const animatingElements = document.querySelectorAll('[style*="will-change"]');
        const animationCount = animatingElements.length;

        // Determine if performance is low
        const isLowPerformance = fps < 30 || animationCount > 10;

        setMetrics({
          fps,
          animationCount,
          memoryUsage,
          isLowPerformance
        });

        // Log warnings for low performance
        if (fps < 30) {
          console.warn(`⚠️ Low animation FPS: ${fps}fps`);
        }
        if (animationCount > 8) {
          console.warn(`⚠️ High animation count: ${animationCount} active animations`);
        }
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);

  // Auto-hide after 5 seconds of good performance
  useEffect(() => {
    if (!metrics.isLowPerformance && isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
    if (metrics.isLowPerformance) {
      setIsVisible(true);
    }
  }, [metrics.isLowPerformance, isVisible]);

  if (!enabled || !showUI) return null;

  const getPerformanceColor = () => {
    if (metrics.fps >= 50) return 'text-green-500';
    if (metrics.fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAnimationCountColor = () => {
    if (metrics.animationCount <= 4) return 'text-green-500';
    if (metrics.animationCount <= 8) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      {/* Performance toggle button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-black/80 text-white rounded-full p-2 backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Toggle Animation Performance Monitor"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.button>

      {/* Performance metrics panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-16 left-4 z-50 bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm font-mono text-sm min-w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Animation Performance</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className={getPerformanceColor()}>
                  {metrics.fps}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Active Animations:</span>
                <span className={getAnimationCountColor()}>
                  {metrics.animationCount}
                </span>
              </div>
              
              {metrics.memoryUsage > 0 && (
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className={metrics.memoryUsage > 100 ? 'text-yellow-500' : 'text-green-500'}>
                    {metrics.memoryUsage}MB
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={metrics.isLowPerformance ? 'text-red-500' : 'text-green-500'}>
                  {metrics.isLowPerformance ? 'Low Performance' : 'Good'}
                </span>
              </div>
            </div>

            {/* Performance tips */}
            {metrics.isLowPerformance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-gray-600 text-xs text-yellow-300"
              >
                <p>💡 Performance Tips:</p>
                <ul className="mt-1 space-y-1 text-gray-300">
                  {metrics.fps < 30 && (
                    <li>• Low FPS detected - reduce animation complexity</li>
                  )}
                  {metrics.animationCount > 8 && (
                    <li>• Too many animations - consider staggering or reducing count</li>
                  )}
                  {metrics.memoryUsage > 100 && (
                    <li>• High memory usage - check for animation memory leaks</li>
                  )}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance warning overlay */}
      <AnimatePresence>
        {metrics.isLowPerformance && metrics.fps < 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            ⚠️ Poor animation performance detected
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnimationPerformanceMonitor;