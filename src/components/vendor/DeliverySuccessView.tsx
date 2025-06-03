// src/components/vendor/DeliverySuccessView.tsx
import React, { useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import QRCode from 'react-qr-code';
import { generateWhatsAppLink } from '@/utils/utils.ts';
import { Delivery } from '@/types';
import { Badge } from '../ui/badge';

interface DeliverySuccessViewProps {
    delivery: Delivery;
    whatsappSent: boolean;
    onCreateAnother: () => void;
    onDone: () => void;
}

// Enhanced animation variants
const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 60 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const headerVariants = {
    hidden: { opacity: 0, y: -40, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
};

const trackingIdVariants = {
    hidden: { opacity: 0, scale: 0.5, rotateX: -90 },
    visible: {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut",
            delay: 0.2
        }
    }
};

const qrCodeVariants = {
    hidden: { opacity: 0, scale: 0.3, rotate: -180 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            duration: 1,
            ease: "easeOut",
            delay: 0.4
        }
    }
};

const statusStepVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.9 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const buttonVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const pulseEffect = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(34, 197, 94, 0)" },
    animate: {
        boxShadow: [
            "0 0 20px rgba(34, 197, 94, 0.2)",
            "0 0 40px rgba(34, 197, 94, 0.1)",
            "0 0 20px rgba(34, 197, 94, 0.2)"
        ],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
};

const DeliverySuccessView: React.FC<DeliverySuccessViewProps> = ({
                                                                     delivery,
                                                                     onCreateAnother,
                                                                     onDone
                                                                 }) => {
    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Generate correct URLs
    const baseUrl = window.location.origin;
    const customerTrackUrl = `${baseUrl}/track/${delivery.tracking_id}`;

    // WhatsApp message function for rider only
    const generateRiderWhatsAppLink = () => {
        if (!delivery.rider) return '#';

        const riderMessage = `Hello ${delivery.rider.name}, you have a new delivery request for ${delivery.customer.name}. 
Package: ${delivery.package.description}
Delivery Address: ${delivery.customer.address}
Click this link to accept or decline the delivery: ${baseUrl}/rider/accept/${delivery.tracking_id}
Your OTP code when you accept: ${delivery.tracking.otp}
Thank you!`;

        return generateWhatsAppLink(delivery.rider.phone_number, riderMessage);
    };

    return (
        <motion.div
            ref={containerRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative w-full max-w-4xl mx-auto"
        >
            {/* Enhanced Success Card */}
            <motion.div
                className="relative overflow-hidden"
                variants={glowEffect}
                initial="initial"
                animate="animate"
                whileHover={{
                    scale: 1.01,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
            >
                <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
                    {/* Animated background gradient */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/3 to-teal-500/5 opacity-100"
                        initial={false}
                    />

                    {/* Success particles */}
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                left: `${10 + i * 6}%`,
                                top: `${15 + (i % 4) * 20}%`,
                                width: i % 3 === 0 ? '8px' : '4px',
                                height: i % 3 === 0 ? '8px' : '4px',
                                background: i % 2 === 0
                                    ? 'linear-gradient(45deg, #10B981, #34D399)'
                                    : 'linear-gradient(45deg, #F59E0B, #FBBF24)'
                            }}
                            animate={{
                                y: [0, -30, 0],
                                x: [0, 15, 0],
                                opacity: [0.3, 0.8, 0.3],
                                scale: [1, 1.5, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{
                                duration: 4 + i * 0.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.3
                            }}
                        />
                    ))}

                    {/* Confetti effect */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={`confetti-${i}`}
                            className="absolute w-2 h-6 opacity-60"
                            style={{
                                left: `${20 + i * 10}%`,
                                top: '10%',
                                background: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'][i % 5],
                                borderRadius: '2px'
                            }}
                            animate={{
                                y: [0, 300],
                                rotate: [0, 720],
                                opacity: [0.8, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: i * 0.2,
                                repeatDelay: 2
                            }}
                        />
                    ))}

                    {/* Enhanced Header */}
                    <CardHeader className="relative z-10 text-center pb-6">
                        <motion.div variants={headerVariants} className="space-y-4">
                            {/* Success Icon */}
                            <div className="flex justify-center">
                                <motion.div
                                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl"
                                    variants={pulseEffect}
                                    initial="initial"
                                    animate="animate"
                                    whileHover={{
                                        scale: 1.1,
                                        boxShadow: "0 15px 35px rgba(34, 197, 94, 0.4)"
                                    }}
                                    style={{
                                        filter: "drop-shadow(0 8px 25px rgba(34, 197, 94, 0.3))"
                                    }}
                                >
                                    <motion.svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, duration: 0.5, type: "spring", stiffness: 200 }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                </motion.div>
                            </div>

                            {/* Success Message */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-3">
                                    <CardTitle className="text-2xl font-bold text-green-800">
                                        Delivery Created Successfully!
                                    </CardTitle>
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg">
                                            New
                                        </Badge>
                                    </motion.div>
                                </div>
                                <motion.p
                                    className="text-gray-600 text-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                >
                                    Your delivery request has been processed and is ready for action
                                </motion.p>
                            </div>
                        </motion.div>
                    </CardHeader>

                    <CardContent className="relative z-10 space-y-8">
                        {/* Enhanced Tracking ID Display */}
                        <motion.div variants={trackingIdVariants} className="text-center">
                            <motion.div
                                className="inline-block p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200/50 shadow-lg"
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 12px 30px rgba(16, 185, 129, 0.2)"
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="text-sm font-semibold text-emerald-700 block mb-2">
                                    Tracking ID
                                </span>
                                <motion.span
                                    className="text-4xl font-bold text-emerald-800 font-mono tracking-wider"
                                    animate={{
                                        textShadow: [
                                            "0 0 0 rgba(16, 185, 129, 0)",
                                            "0 0 20px rgba(16, 185, 129, 0.3)",
                                            "0 0 0 rgba(16, 185, 129, 0)"
                                        ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    {delivery.tracking_id}
                                </motion.span>
                            </motion.div>
                        </motion.div>

                        {/* Enhanced Next Steps */}
                        <motion.div
                            className="p-6 bg-gradient-to-r from-amber-50/80 to-orange-50/60 rounded-2xl border border-amber-200/50 backdrop-blur-sm"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            whileHover={{ scale: 1.01, y: -2 }}
                        >
                            <div className="flex items-start gap-4">
                                <motion.div
                                    className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </motion.div>
                                <div className="space-y-3">
                                    <h3 className="font-bold text-amber-800 text-lg">Next Steps:</h3>
                                    <ul className="space-y-2 text-amber-700">
                                        <motion.li
                                            className="flex items-start gap-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8, duration: 0.4 }}
                                        >
                                            <span className="text-emerald-600 font-bold">1.</span>
                                            <span>Share the delivery details with the rider via WhatsApp</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start gap-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.0, duration: 0.4 }}
                                        >
                                            <span className="text-emerald-600 font-bold">2.</span>
                                            <span>Rider will accept or decline the delivery by clicking the link</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start gap-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.2, duration: 0.4 }}
                                        >
                                            <span className="text-emerald-600 font-bold">3.</span>
                                            <span>Upon acceptance and OTP verification, customer will automatically receive tracking information</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start gap-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.4, duration: 0.4 }}
                                        >
                                            <span className="text-emerald-600 font-bold">4.</span>
                                            <span>Customer will confirm package delivery upon receipt</span>
                                        </motion.li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Enhanced QR Code Section */}
                        <motion.div
                            variants={qrCodeVariants}
                            className="text-center"
                        >
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                                <motion.div
                                    className="text-center"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className="font-bold text-gray-700 mb-4 text-lg">Customer Tracking QR Code</h3>
                                    <motion.div
                                        className="bg-white p-6 rounded-2xl shadow-lg inline-block border-4 border-emerald-200/50"
                                        whileHover={{
                                            boxShadow: "0 15px 35px rgba(16, 185, 129, 0.2)",
                                            borderColor: "rgba(16, 185, 129, 0.3)"
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <QRCode
                                            value={customerTrackUrl}
                                            size={180}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        />
                                    </motion.div>
                                    <motion.p
                                        className="text-gray-500 mt-3 font-medium"
                                        animate={{ opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        📱 Scan to track delivery
                                    </motion.p>
                                </motion.div>

                                {/* Enhanced WhatsApp Action */}
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1, duration: 0.6 }}
                                >
                                    <h3 className="font-bold text-gray-700 mb-4 text-lg">Send to Rider</h3>
                                    <motion.a
                                        href={generateRiderWhatsAppLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 12px 30px rgba(34, 197, 94, 0.3)"
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-block"
                                    >
                                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-8 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-xl relative overflow-hidden">
                                            {/* WhatsApp button shine effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                                                animate={{
                                                    x: ["-100%", "100%"]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    repeatDelay: 3,
                                                    ease: "easeInOut"
                                                }}
                                            />

                                            <span className="flex items-center gap-3 relative z-10">
                                                <motion.svg
                                                    className="w-6 h-6"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                </motion.svg>
                                                Send to Rider via WhatsApp
                                            </span>
                                        </div>
                                    </motion.a>
                                </motion.div>
                            </div>
                        </motion.div>
                    </CardContent>

                    {/* Enhanced Footer */}
                    <CardFooter className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 p-8 bg-gradient-to-r from-gray-50/50 to-slate-50/30">
                        <motion.div
                            variants={buttonVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={onCreateAnother}
                                variant="outline"
                                className="w-full sm:w-auto px-8 py-3 bg-white/80 hover:bg-emerald-50 border-emerald-200/50 hover:border-emerald-300 text-emerald-700 font-semibold transition-all duration-300"
                            >
                                <span className="flex items-center gap-2">
                                    <motion.svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                    Done
                                </span>
                            </Button>
                        </motion.div>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* Enhanced Floating Success Elements */}
            <motion.div
                className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-sm"
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360],
                    opacity: [0.6, 1, 0.6]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute -bottom-6 -left-6 w-10 h-10 bg-gradient-to-br from-emerald-400/30 to-green-400/30 rounded-full blur-sm"
                animate={{
                    scale: [1, 1.4, 1],
                    rotate: [360, 180, 0],
                    opacity: [0.6, 1, 0.6]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Floating success badges */}
            <motion.div
                className="absolute top-10 left-10 text-2xl"
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                🎉
            </motion.div>

            <motion.div
                className="absolute top-20 right-20 text-2xl"
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, -10, 10, 0]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            >
                ✨
            </motion.div>

            <motion.div
                className="absolute bottom-20 left-20 text-2xl"
                animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            >
                🎯
            </motion.div>
        </motion.div>
    );
};

export default DeliverySuccessView;
