// PWA Update Prompt Component
// Handles service worker updates and offline status notifications

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { swManager, isOnline } from '../../utils/swRegistration';
import { devSafeSW } from '../../utils/devSafeServiceWorker';

interface PWAUpdatePromptProps {
  onUpdateAccepted?: () => void;
  onUpdateDismissed?: () => void;
}

const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  onUpdateAccepted,
  onUpdateDismissed
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(!isOnline());
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Only configure service worker callbacks in production
    const configureServiceWorker = async () => {
      if (!devSafeSW.shouldBeActive()) {
        console.log('PWA Update Prompt: Skipped in development mode');
        return;
      }

      swManager.config = {
        onUpdate: () => {
          setUpdateAvailable(true);
        },
        onSuccess: () => {
          console.log('Service worker registered successfully');
        },
        onOffline: () => {
          setIsOfflineMode(true);
          setShowOfflineBanner(true);
        },
        onOnline: () => {
          setIsOfflineMode(false);
          setShowOfflineBanner(false);
        }
      };

      // Register the service worker (will be skipped in dev)
      await devSafeSW.safeRegister();
    };

    configureServiceWorker();

    // Handle online/offline status changes
    const handleOnline = () => {
      setIsOfflineMode(false);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOfflineMode(true);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdateAccept = () => {
    swManager.activateWaitingWorker();
    setUpdateAvailable(false);
    onUpdateAccepted?.();
  };

  const handleUpdateDismiss = () => {
    setUpdateAvailable(false);
    onUpdateDismissed?.();
  };

  const dismissOfflineBanner = () => {
    setShowOfflineBanner(false);
  };

  const promptVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      y: 100,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  const bannerVariants = {
    hidden: {
      opacity: 0,
      y: -50
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">You're offline</p>
                  <p className="text-sm opacity-90">
                    Some features may be limited. TrackAm will sync when you're back online.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissOfflineBanner}
                  className="text-white hover:bg-orange-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Prompt */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            variants={promptVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-4 right-4 z-50 w-full max-w-sm"
          >
            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
              <div className="relative">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-5" />
                
                <div className="relative p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Update Available
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        A new version of TrackAm is ready with improvements and bug fixes.
                      </p>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleUpdateAccept}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                        >
                          Update Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUpdateDismiss}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Later
                        </Button>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleUpdateDismiss}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Status Indicator (mobile-friendly) */}
      <AnimatePresence>
        {isOfflineMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-4 left-4 z-40 lg:hidden"
          >
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAUpdatePrompt;