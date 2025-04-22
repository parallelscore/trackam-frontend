import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DeliveryProvider } from './context/DeliveryContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import VendorDashboard from './pages/VendorDashboard';
import RiderPage from './pages/RiderPage';
import TrackingPage from './pages/TrackingPage';
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

                        {/* Rider routes */}
                        <Route path="/rider/:trackingId" element={<RiderPage />} />

                        {/* Customer tracking routes */}
                        <Route path="/track" element={<TrackSearchPage />} />
                        <Route path="/track/:trackingId" element={<TrackingPage />} />

                        {/* Fallback route */}
                        <Route path="*" element={<HomePage />} />
                    </Routes>
                </Router>
            </DeliveryProvider>
        </AuthProvider>
    );
}

export default App;