// src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DeliveryProvider } from './context/DeliveryContext';
import { RiderProvider, useRider } from './context/RiderContext';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { checkLocationPermission, isGeolocationSupported, platforms } from './utils/riderUtils';

// Pages
import HomePage from './pages/HomePage';
import VendorDashboard from './pages/VendorDashboard';
import RiderAcceptPage from './pages/RiderAcceptPage';
import RiderPage from './pages/RiderPage';
import RiderCompletePage from './pages/RiderCompletePage';
import TrackingPage from './pages/TrackingPage';
import DeliveryConfirmedPage from './pages/DeliveryConfirmedPage';
import TrackSearchPage from './pages/TrackSearchPage';
import PhoneLoginPage from './pages/PhoneLoginPage';
import LoginOtpPage from './pages/LoginOtpPage';
import PhoneRegisterPage from './pages/PhoneRegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProfilePage from './pages/ProfilePage';

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

function App() {
    return (
        <AuthProvider>
            <DeliveryProvider>
                <WebSocketProvider>
                    <RiderProvider>
                        {/* Add our permission synchronizer component */}
                        <PermissionSynchronizer />

                        <Router>
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 5000,
                                    style: {
                                        background: '#FFFFFF',
                                        color: '#333333',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                    },
                                    success: {
                                        style: {
                                            border: '1px solid #0CAA41',
                                            borderLeft: '6px solid #0CAA41',
                                        },
                                    },
                                    error: {
                                        style: {
                                            border: '1px solid #FF0000',
                                            borderLeft: '6px solid #FF0000',
                                        },
                                    },
                                }}
                            />

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
                        </Router>
                    </RiderProvider>
                </WebSocketProvider>
            </DeliveryProvider>
        </AuthProvider>
    );
}

export default App;
