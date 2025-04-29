import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DeliveryProvider } from './context/DeliveryContext';
import { RiderProvider } from './context/RiderContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import VendorDashboard from './pages/VendorDashboard';
import RiderAcceptPage from './pages/RiderAcceptPage';
import RiderPage from './pages/RiderPage';
import RiderCompletePage from './pages/RiderCompletePage';
import TrackingPage from './pages/TrackingPage';
import EnhancedTrackingPage from './pages/EnhancedTrackingPage';
import DeliveryConfirmedPage from './pages/DeliveryConfirmedPage';
import TrackSearchPage from './pages/TrackSearchPage';
import PhoneLoginPage from './pages/PhoneLoginPage';
import LoginOtpPage from './pages/LoginOtpPage';
import PhoneRegisterPage from './pages/PhoneRegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProfilePage from './pages/ProfilePage';

function App() {
    return (
        <AuthProvider>
            <DeliveryProvider>
                <RiderProvider>
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
                            <Route path="/enhanced-track/:trackingId" element={<EnhancedTrackingPage />} />
                            <Route path="/delivery-confirmed/:trackingId" element={<DeliveryConfirmedPage />} />

                            {/* Fallback route */}
                            <Route path="*" element={<HomePage />} />
                        </Routes>
                    </Router>
                </RiderProvider>
            </DeliveryProvider>
        </AuthProvider>
    );
}

export default App;