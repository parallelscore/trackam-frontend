// src/App.tsx
import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { DeliveryProvider } from './context/DeliveryContext';
import { RiderProvider, useRider } from './context/RiderContext';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { checkLocationPermission, isGeolocationSupported, platforms } from './utils/riderUtils';
import LoadingFallback from './components/common/LoadingFallback';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppError, ErrorType, logError } from './utils/errorHandling';
import './utils/errorTestingUtils'; // Load testing utilities in development

// Lazy-loaded Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const RiderAcceptPage = lazy(() => import('./pages/RiderAcceptPage'));
const RiderPage = lazy(() => import('./pages/RiderPage'));
const RiderCompletePage = lazy(() => import('./pages/RiderCompletePage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const DeliveryConfirmedPage = lazy(() => import('./pages/DeliveryConfirmedPage'));
const TrackSearchPage = lazy(() => import('./pages/TrackSearchPage'));
const PhoneLoginPage = lazy(() => import('./pages/PhoneLoginPage'));
const LoginOtpPage = lazy(() => import('./pages/LoginOtpPage'));
const PhoneRegisterPage = lazy(() => import('./pages/PhoneRegisterPage'));
const OtpVerificationPage = lazy(() => import('./pages/OtpVerificationPage'));
const CompleteProfilePage = lazy(() => import('./pages/CompleteProfilePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Permission synchronizer component
const PermissionSynchronizer = () => {
    const { setLocationPermissionGranted } = useRider();
    const [deviceType, setDeviceType] = useState<string>('unknown');

    // Detect device type on mount
    useEffect(() => {
        // Determine device type
        let detectedDevice: string;
        if (platforms.isIOS()) {
            detectedDevice = 'iOS';
        } else if (platforms.isAndroid()) {
            detectedDevice = 'Android';
        } else if (platforms.isMacOS()) {
            detectedDevice = 'macOS';
        } else if (platforms.isWindows()) {
            detectedDevice = 'Windows';
        } else if (platforms.isDesktop()) {
            detectedDevice = 'Desktop';
        } else {
            detectedDevice = 'Unknown';
        }

        setDeviceType(detectedDevice);

        // Log device detection for debugging
        console.log(`Device detected: ${detectedDevice}`);
    }, []);

    useEffect(() => {
        // First check if geolocation is supported at all
        if (!isGeolocationSupported()) {
            console.warn("Geolocation is not supported on this browser/device");
            setLocationPermissionGranted(false);
            return;
        }

        // Device-specific settings for permission checking
        const checkPermissionWithDeviceSettings = () => {
            // On the first mount, check if location permission is already granted
            checkLocationPermission((granted) => {
                console.log(`Initial location permission status: ${granted ? 'granted' : 'denied'}`);
                setLocationPermissionGranted(granted);
            }, {
                // Pass device-specific options
                enableHighAccuracy: !platforms.isDesktop(), // Higher accuracy for mobile
                timeout: platforms.isIOS() ? 20000 : 15000, // iOS needs more time
                maximumAge: 600000 // 10 minutes
            });
        };

        // Also set up a listener for permission changes
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
                // Update context when permission status changes
                setLocationPermissionGranted(permissionStatus.state === 'granted');

                // Listen for changes
                permissionStatus.onchange = () => {
                    console.log(`Permission status changed to: ${permissionStatus.state}`);
                    setLocationPermissionGranted(permissionStatus.state === 'granted');
                };
            }).catch(error => {
                console.warn("Could not set up permission listener:", error);
                // Fall back to our manual check
                checkPermissionWithDeviceSettings();
            });
        } else {
            // Permissions API not supported, rely on our manual checks
            console.log("Permissions API not supported, using manual checks");
        }
    }, [setLocationPermissionGranted, deviceType]);

    return null; // This component doesn't render anything
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        const error = new AppError(
            ErrorType.UNKNOWN_ERROR,
            event.reason?.message || 'Unhandled promise rejection',
            'Something went wrong. Please try refreshing the page.',
            { retryable: true }
        );
        logError(error, 'UnhandledPromiseRejection');
        event.preventDefault();
    });

    window.addEventListener('error', (event) => {
        const error = new AppError(
            ErrorType.UNKNOWN_ERROR,
            event.error?.message || event.message || 'Unhandled error',
            'Something went wrong. Please try refreshing the page.',
            { retryable: true }
        );
        logError(error, 'UnhandledError');
    });
}

function App() {
    return (
        <ErrorBoundary level="critical" showRetry={true}>
            <AuthProvider>
                <DeliveryProvider>
                    <WebSocketProvider>
                        <RiderProvider>
                            {/* Add our permission synchronizer component */}
                            <PermissionSynchronizer />

                            <Router>
                            {/* Enhanced Toaster with modern styling */}
                            <Toaster
                                position="bottom-right"
                                toastOptions={{
                                    duration: 5000,
                                    style: {
                                        background: '#FFFFFF',
                                        color: '#333333',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backdropFilter: 'blur(10px)',
                                    },
                                    success: {
                                        style: {
                                            background: 'linear-gradient(135deg, #0CAA41 0%, #0CAA41 100%)',
                                            color: '#FFFFFF',
                                            border: '1px solid #0CAA41',
                                            borderLeft: '6px solid #FFFFFF',
                                        },
                                        iconTheme: {
                                            primary: '#FFFFFF',
                                            secondary: '#0CAA41',
                                        },
                                    },
                                    error: {
                                        style: {
                                            background: 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)',
                                            color: '#FFFFFF',
                                            border: '1px solid #FF4444',
                                            borderLeft: '6px solid #FFFFFF',
                                        },
                                        iconTheme: {
                                            primary: '#FFFFFF',
                                            secondary: '#FF4444',
                                        },
                                    },
                                    loading: {
                                        style: {
                                            background: 'linear-gradient(135deg, #FF9500 0%, #FFB366 100%)',
                                            color: '#FFFFFF',
                                            border: '1px solid #FF9500',
                                            borderLeft: '6px solid #FFFFFF',
                                        },
                                        iconTheme: {
                                            primary: '#FFFFFF',
                                            secondary: '#FF9500',
                                        },
                                    },
                                }}
                            />

                            <AnimatePresence mode="wait">
                                <Suspense fallback={<LoadingFallback />}>
                                    <Routes>
                                        {/* Home page */}
                                        <Route path="/" element={<HomePage />} />

                                        {/* Authentication routes */}
                                        <Route path="/login" element={<PhoneLoginPage />} />
                                        <Route path="/verify-login-otp" element={<LoginOtpPage />} />
                                        <Route path="/register" element={<PhoneRegisterPage />} />
                                        <Route path="/verify-otp" element={<OtpVerificationPage />} />
                                        <Route path="/complete-profile" element={<CompleteProfilePage />} />
                                        <Route path="/profile" element={<ProfilePage />} />

                                        {/* Vendor routes */}
                                        <Route path="/vendor" element={<VendorDashboard />} />

                                        {/* Rider routes - more specific routes must come before general ones */}
                                        <Route path="/rider/accept/:tracking_id" element={<RiderAcceptPage />} />
                                        <Route path="/rider/complete/:trackingId" element={<RiderCompletePage />} />
                                        <Route path="/rider/:trackingId" element={<RiderPage />} />

                                        {/* Customer tracking routes */}
                                        <Route path="/track" element={<TrackSearchPage />} />
                                        <Route path="/track/:trackingId" element={<TrackingPage />} />
                                        <Route path="/delivery-confirmed/:trackingId" element={<DeliveryConfirmedPage />} />

                                        {/* Fallback route */}
                                        <Route path="*" element={<HomePage />} />
                                    </Routes>
                                </Suspense>
                            </AnimatePresence>
                        </Router>
                    </RiderProvider>
                </WebSocketProvider>
            </DeliveryProvider>
        </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
