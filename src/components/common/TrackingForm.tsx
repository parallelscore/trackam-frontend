import React, {useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const TrackingForm: React.FC = () => {
    const [trackingId, setTrackingId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount for better UX
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simple validation
        if (!trackingId.trim()) {
            setError('Please enter a tracking ID');
            setIsLoading(false);
            return;
        }

        // Simulate API call delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        // Navigate to tracking page
        navigate(`/track/${trackingId.trim()}`);
        setIsLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase(); // Auto-uppercase for tracking IDs
        setTrackingId(value);
        setError('');
    };

    // Sample tracking IDs for demonstration
    const sampleTrackingIds = ['AMXHJK', 'LCAA30', 'TR0B749AO0'];

    const handleSampleClick = (sampleId: string) => {
        setTrackingId(sampleId);
        setError('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Animation variants
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    // Animation variants for the button
    const buttonVariants = {
        idle: {
            scale: 1,
            boxShadow: "0 4px 14px rgba(12, 170, 65, 0.3)"
        },
        hover: {
            scale: 1.02,
            boxShadow: "0 8px 25px rgba(12, 170, 65, 0.4)",
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
        }
    };

    const inputVariants = {
        focus: {
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(12, 170, 65, 0.1)",
            transition: { duration: 0.2 }
        },
        blur: {
            scale: 1,
            boxShadow: "0 0 0 0px rgba(12, 170, 65, 0)",
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-lg mx-auto"
        >

            <Card className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-lg shadow-2xl border-0 overflow-hidden relative">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-lg p-0.5">
                    <div className="bg-white rounded-lg h-full w-full" />
                </div>

                <div className="relative z-10">
                    <CardHeader>
                        <CardTitle className="text-center">Track Your Package</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Main Input */}
                                <motion.div
                                    variants={inputVariants}
                                    animate={isFocused ? "focus" : "blur"}
                                    className="relative"
                                >
                                    <Input
                                        ref={inputRef}
                                        placeholder="Enter tracking ID"
                                        value={trackingId}
                                        onChange={handleInputChange}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        className={`text-center text-lg h-14 rounded-xl border-2 transition-all duration-300 ${
                                            error
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-gray-200 focus:border-primary'
                                        } ${isFocused ? 'bg-primary/5' : 'bg-gray-50'}`}
                                        disabled={isLoading}
                                        maxLength={10}
                                    />

                                    {/* Character counter */}
                                    {trackingId && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute -bottom-6 right-2 text-xs text-gray-400"
                                        >
                                            {trackingId.length}/10
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-red-600 text-sm">{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Sample Tracking IDs */}
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 text-center">Try these sample tracking IDs:</p>
                                    <div className="flex gap-2 justify-center">
                                        {sampleTrackingIds.map((sampleId) => (
                                            <motion.button
                                                key={sampleId}
                                                type="button"
                                                onClick={() => handleSampleClick(sampleId)}
                                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-primary/10 text-gray-600 hover:text-primary rounded-full transition-all duration-200 border border-gray-200 hover:border-primary/30"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={isLoading}
                                            >
                                                {sampleId}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.div
                                variants={buttonVariants}
                                initial="idle"
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                    disabled={isLoading || !trackingId.trim()}
                                >
                                    {/* Button background animation */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                />
                                                Tracking...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Track Now
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </motion.div>
                        </form>

                        {/* Help Text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-xs text-gray-500">
                                Need help? Contact us via{' '}
                                <motion.a
                                    href="https://wa.me/2348001234567"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-accent transition-colors duration-300 font-medium"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    WhatsApp
                                </motion.a>
                            </p>
                        </motion.div>

                    </CardContent>
                </div>
                {/* Floating particles animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-primary/20 rounded-full"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${10 + i * 10}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{
                                duration: 3 + i * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>
            </Card>
        </motion.div>
    );
};

export default TrackingForm;