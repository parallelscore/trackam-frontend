// src/components/vendor/ActiveDeliveries.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { getStatusColor, getStatusText, formatDateTime, generateWhatsAppLink } from '@/utils/utils.ts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { OptimisticButton, OptimisticToast } from '../ui/optimistic';
import { Delivery, DeliveryFilters, DeliveryStatus } from '@/types';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/apiClient';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown, MoreHorizontal, RefreshCw, Share, Eye, Table2, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type ViewMode = 'table' | 'card';

// Enhanced animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const headerVariants = {
    hidden: { opacity: 0, x: -40, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: "easeOut"
        }
    }
};

const filtersVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            staggerChildren: 0.1
        }
    }
};

const tableVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3
        }
    }
};

const rowVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.98 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(16, 185, 129, 0)" },
    animate: {
        boxShadow: [
            "0 0 30px rgba(16, 185, 129, 0.1)",
            "0 0 60px rgba(16, 185, 129, 0.05)",
            "0 0 30px rgba(16, 185, 129, 0.1)"
        ],
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
};

const ActiveDeliveries: React.FC = () => {
    const { deliveries, totalPages, isLoading, fetchDeliveries } = useDelivery();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
    const [currentPageState, setCurrentPageState] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [isResending, setIsResending] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    
    // Optimistic UI state
    const [resendOptimisticState, setResendOptimisticState] = useState<Record<string, 'idle' | 'pending' | 'success' | 'error'>>({});
    const [optimisticToastMessage, setOptimisticToastMessage] = useState('');
    const [showOptimisticToast, setShowOptimisticToast] = useState(false);

    // Animation refs
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Effect to set the view mode based on screen size
    useEffect(() => {
        const handleResize = () => {
            setViewMode(window.innerWidth < 768 ? 'card' : 'table');
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Memoize the effect to prevent dependency array size changes
    const stableSearchTerm = searchTerm; // Always include even if empty
    const stableStatusFilter = statusFilter; // Always include
    const stableCurrentPage = currentPageState; // Always include

    useEffect(() => {
        const filters: DeliveryFilters = {
            page: stableCurrentPage,
            limit: 10,
            delivery_status: stableStatusFilter === 'all' ? undefined : stableStatusFilter,
            search: stableSearchTerm.trim() || undefined,
        };

        fetchDeliveries(filters);
    }, [stableStatusFilter, stableSearchTerm, stableCurrentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPageState(1);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value as DeliveryStatus | 'all');
        setCurrentPageState(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPageState(page);
    };

    const toggleRowExpansion = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleShareWithRider = (delivery: Delivery) => {
        if (delivery.rider) {
            const message = `Hello ${delivery.rider.name}, you have a delivery to make. Track it here: ${delivery.tracking.rider_link} - Your OTP is: ${delivery.tracking.otp}`;
            const whatsappLink = generateWhatsAppLink(delivery.rider.phone_number, message);
            window.open(whatsappLink, '_blank');
        }
    };

    const handleShareWithCustomer = (delivery: Delivery) => {
        const message = `Hello ${delivery.customer.name}, track your delivery here: ${delivery.tracking.customer_link}`;
        const whatsappLink = generateWhatsAppLink(delivery.customer.phone_number, message);
        window.open(whatsappLink, '_blank');
    };

    const handleTrackPackage = (trackingId: string) => {
        window.open(`/track/${trackingId}`, '_blank');
    };

    const handleResendNotifications = async (trackingId: string) => {
        setIsResending(trackingId);
        setResendOptimisticState(prev => ({ ...prev, [trackingId]: 'pending' }));
        setOptimisticToastMessage('Resending notifications...');
        setShowOptimisticToast(true);

        try {
            const result = await apiClient.post(`/deliveries/${trackingId}/resend-notifications`);

            if (result.success) {
                setResendOptimisticState(prev => ({ ...prev, [trackingId]: 'success' }));
                setOptimisticToastMessage('Notifications resent successfully!');
                toast.success('Notifications resent successfully');
            } else {
                setResendOptimisticState(prev => ({ ...prev, [trackingId]: 'error' }));
                setOptimisticToastMessage('Failed to resend notifications');
                toast.error(result.error || 'Failed to resend notifications');
            }
        } catch (error: any) {
            console.error('Error resending notifications:', error);
            setResendOptimisticState(prev => ({ ...prev, [trackingId]: 'error' }));
            setOptimisticToastMessage('Failed to resend notifications');
            toast.error('Failed to resend notifications');
        } finally {
            setIsResending(null);
            // Hide toast and reset optimistic state after a delay
            setTimeout(() => {
                setShowOptimisticToast(false);
                setResendOptimisticState(prev => ({ ...prev, [trackingId]: 'idle' }));
            }, 3000);
        }
    };

    // Enhanced status styling consistent with RecentDeliveries
    const getEnhancedStatusStyling = (status: string) => {
        const statusMap = {
            'created': {
                gradient: 'from-blue-500 to-indigo-600',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-200',
                glowColor: 'shadow-blue-500/20'
            },
            'assigned': {
                gradient: 'from-purple-500 to-violet-600',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-700',
                borderColor: 'border-purple-200',
                glowColor: 'shadow-purple-500/20'
            },
            'accepted': {
                gradient: 'from-cyan-500 to-blue-600',
                bgColor: 'bg-cyan-50',
                textColor: 'text-cyan-700',
                borderColor: 'border-cyan-200',
                glowColor: 'shadow-cyan-500/20'
            },
            'in_progress': {
                gradient: 'from-orange-500 to-amber-600',
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-700',
                borderColor: 'border-orange-200',
                glowColor: 'shadow-orange-500/20'
            },
            'completed': {
                gradient: 'from-emerald-500 to-green-600',
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-700',
                borderColor: 'border-emerald-200',
                glowColor: 'shadow-emerald-500/20'
            },
            'cancelled': {
                gradient: 'from-red-500 to-rose-600',
                bgColor: 'bg-red-50',
                textColor: 'text-red-700',
                borderColor: 'border-red-200',
                glowColor: 'shadow-red-500/20'
            }
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.created;
    };

    // Render Table View with enhanced glowing borders and consistent styling
    const renderTableView = () => {
        return (
            <motion.div
                variants={tableVariants}
                className="rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg bg-white/90 backdrop-blur-sm"
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-emerald-200/30">
                            <TableHead className="w-8 font-semibold text-emerald-700"></TableHead>
                            <TableHead className="w-8 font-semibold text-emerald-700"></TableHead>
                            <TableHead className="font-semibold text-emerald-700">Tracking ID</TableHead>
                            <TableHead className="font-semibold text-emerald-700">Status</TableHead>
                            <TableHead className="font-semibold text-emerald-700">Customer</TableHead>
                            <TableHead className="font-semibold text-emerald-700">Rider</TableHead>
                            <TableHead className="font-semibold text-emerald-700">Package</TableHead>
                            <TableHead className="font-semibold text-emerald-700">Date</TableHead>
                            <TableHead className="text-right font-semibold text-emerald-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {deliveries.map((delivery, index) => {
                                const statusStyle = getEnhancedStatusStyling(delivery.status);

                                return (
                                    <React.Fragment key={delivery.id}>
                                        <motion.tr
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: index * 0.03 }}
                                            className="group cursor-pointer border-l-4 border-transparent hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/30 hover:shadow-lg transition-all duration-300 relative before:absolute before:bottom-0 before:left-4 before:right-4 before:h-0.5 before:bg-gradient-to-r before:from-emerald-500 before:to-green-500 before:transform before:origin-left before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-500"
                                            onClick={() => toggleRowExpansion(delivery.id)}
                                            whileHover={{
                                                scale: 1.01,
                                                x: 4,
                                                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.1)"
                                            }}
                                        >
                                            <TableCell>
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="p-0 h-6 w-6 hover:bg-emerald-100 group-hover:scale-110 transition-transform duration-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleRowExpansion(delivery.id);
                                                        }}
                                                    >
                                                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expandedRows.has(delivery.id) ? 'rotate-180' : ''}`} />
                                                    </Button>
                                                </motion.div>
                                            </TableCell>
                                            <TableCell className="font-mono text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                                                {delivery.tracking_id}
                                            </TableCell>
                                            <TableCell>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Badge className={`${getStatusColor(delivery.status)} relative overflow-hidden group-hover:shadow-md transition-shadow duration-300`}>
                                                        <span className="flex items-center gap-1.5">
                                                            {getStatusText(delivery.status)}
                                                        </span>
                                                        {/* Badge glow effect */}
                                                        <motion.div
                                                            className={`absolute inset-0 bg-gradient-to-r ${statusStyle.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                                                            initial={false}
                                                        />
                                                    </Badge>
                                                </motion.div>
                                            </TableCell>
                                            <TableCell className="group-hover:text-emerald-700 transition-colors duration-300">{delivery.customer.name}</TableCell>
                                            <TableCell className="group-hover:text-emerald-700 transition-colors duration-300">
                                                {delivery.rider?.name || (
                                                    <span className="text-gray-400 italic">Not assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate group-hover:text-emerald-700 transition-colors duration-300" title={delivery.package.description}>
                                                {delivery.package.description}
                                            </TableCell>
                                            <TableCell className="text-gray-600 group-hover:text-emerald-600 transition-colors duration-300">
                                                {formatDateTime(delivery.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <motion.div
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 hover:bg-emerald-100 group-hover:border group-hover:border-emerald-200 transition-all duration-300"
                                                                disabled={isResending === delivery.tracking_id}
                                                            >
                                                                {isResending === delivery.tracking_id ? (
                                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </motion.div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/50">
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTrackPackage(delivery.tracking_id);
                                                        }}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Track Package</span>
                                                        </DropdownMenuItem>

                                                        {delivery.rider && (
                                                            <DropdownMenuItem onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShareWithRider(delivery);
                                                            }}>
                                                                <Share className="mr-2 h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Share with Rider</span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShareWithCustomer(delivery);
                                                        }}>
                                                            <Share className="mr-2 h-4 w-4 text-blue-600" />
                                                            <span className="text-blue-600">Share with Customer</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleResendNotifications(delivery.tracking_id);
                                                        }}>
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            <span>Resend Notifications</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>

                                        {/* Enhanced Expanded Row */}
                                        <AnimatePresence>
                                            {expandedRows.has(delivery.id) && (
                                                <motion.tr
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`${statusStyle.bgColor} border-l-4 ${statusStyle.borderColor}`}
                                                >
                                                    <TableCell colSpan={8} className="p-0">
                                                        <motion.div
                                                            className="p-6"
                                                            initial={{ y: -20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.1, duration: 0.3 }}
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                {/* Enhanced Customer Details */}
                                                                <motion.div
                                                                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                                                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                            </svg>
                                                                        </div>
                                                                        Customer Details
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 text-sm min-w-[60px]">Name:</span>
                                                                            <span className="text-gray-800">{delivery.customer.name}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 text-sm min-w-[60px]">Phone:</span>
                                                                            <span className="text-gray-800">{delivery.customer.phone_number}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 text-sm min-w-[60px]">Address:</span>
                                                                            <span className="text-gray-800 text-sm leading-relaxed">{delivery.customer.address}</span>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>

                                                                {/* Enhanced Rider Details */}
                                                                <motion.div
                                                                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-green-200 transition-all duration-300"
                                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                                                                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                                                            <span className="text-white text-sm">🚴‍♂️</span>
                                                                        </div>
                                                                        Rider Details
                                                                    </h4>
                                                                    {delivery.rider ? (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-gray-500 text-sm min-w-[60px]">Name:</span>
                                                                                <span className="text-gray-800">{delivery.rider.name}</span>
                                                                            </div>
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-gray-500 text-sm min-w-[60px]">Phone:</span>
                                                                                <span className="text-gray-800">{delivery.rider.phone_number}</span>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-gray-500 text-sm italic bg-gray-50 p-3 rounded-lg">
                                                                            No rider assigned yet. The delivery is waiting for rider assignment.
                                                                        </p>
                                                                    )}
                                                                </motion.div>

                                                                {/* Enhanced Package Details */}
                                                                <motion.div
                                                                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
                                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                                                                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                            </svg>
                                                                        </div>
                                                                        Package Details
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 text-sm min-w-[80px]">Description:</span>
                                                                            <span className="text-gray-800">{delivery.package.description}</span>
                                                                        </div>
                                                                        {delivery.package.size && (
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-gray-500 text-sm min-w-[80px]">Size:</span>
                                                                                <span className="text-gray-800 capitalize">{delivery.package.size}</span>
                                                                            </div>
                                                                        )}
                                                                        {delivery.package.special_instructions && (
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-gray-500 text-sm min-w-[80px]">Notes:</span>
                                                                                <span className="text-gray-800 text-sm leading-relaxed">{delivery.package.special_instructions}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        </motion.div>
                                                    </TableCell>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </motion.div>
        );
    };

    // Render Card View with enhanced glowing borders and consistent styling
    const renderCardView = () => {
        return (
            <motion.div
                variants={tableVariants}
                className="space-y-4"
            >
                <AnimatePresence>
                    {deliveries.map((delivery, index) => {
                        const statusStyle = getEnhancedStatusStyling(delivery.status);

                        return (
                            <motion.div
                                key={delivery.id}
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.03 }}
                                className="border border-gray-200/50 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-emerald-400 transition-all duration-300 relative group"
                                whileHover={{
                                    scale: 1.02,
                                    y: -4,
                                    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.1)"
                                }}
                            >
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/30 transition-all duration-300"
                                    onClick={() => toggleRowExpansion(delivery.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expandedRows.has(delivery.id) ? 'rotate-180' : ''}`} />
                                        </motion.div>
                                        <div>
                                            <span className="font-mono text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">{delivery.tracking_id}</span>
                                            <span className="text-xs text-gray-500 block md:inline md:ml-2 group-hover:text-emerald-600 transition-colors duration-300">{formatDateTime(delivery.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Badge className={`${getStatusColor(delivery.status)} relative overflow-hidden group-hover:shadow-md transition-shadow duration-300`}>
                                                <span className="flex items-center gap-1.5">
                                                    {getStatusText(delivery.status)}
                                                </span>
                                                {/* Badge glow effect */}
                                                <motion.div
                                                    className={`absolute inset-0 bg-gradient-to-r ${statusStyle.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                                                    initial={false}
                                                />
                                            </Badge>
                                        </motion.div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:bg-emerald-100 hover:border hover:border-emerald-200 transition-all duration-300"
                                                        disabled={isResending === delivery.tracking_id}
                                                    >
                                                        {isResending === delivery.tracking_id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/50">
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTrackPackage(delivery.tracking_id);
                                                }}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <span>Track Package</span>
                                                </DropdownMenuItem>

                                                {delivery.rider && (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShareWithRider(delivery);
                                                    }}>
                                                        <Share className="mr-2 h-4 w-4 text-green-600" />
                                                        <span className="text-green-600">Share with Rider</span>
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShareWithCustomer(delivery);
                                                }}>
                                                    <Share className="mr-2 h-4 w-4 text-blue-600" />
                                                    <span className="text-blue-600">Share with Customer</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResendNotifications(delivery.tracking_id);
                                                }}>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    <span>Resend Notifications</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Enhanced Card Expanded Content */}
                                <AnimatePresence>
                                    {expandedRows.has(delivery.id) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`${statusStyle.bgColor} border-t border-gray-200/50`}
                                        >
                                            <motion.div
                                                className="p-4"
                                                initial={{ y: -20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.1, duration: 0.3 }}
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    {/* Customer Section */}
                                                    <motion.div
                                                        className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            Customer
                                                        </h4>
                                                        <div className="space-y-1 text-sm">
                                                            <div><span className="text-gray-500">Name:</span> <span>{delivery.customer.name}</span></div>
                                                            <div><span className="text-gray-500">Phone:</span> <span>{delivery.customer.phone_number}</span></div>
                                                            <div><span className="text-gray-500">Address:</span> <span className="text-xs">{delivery.customer.address}</span></div>
                                                        </div>
                                                    </motion.div>

                                                    {/* Rider Section */}
                                                    <motion.div
                                                        className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-green-200 transition-all duration-300"
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                                                <span className="text-white text-xs">🚴‍♂️</span>
                                                            </div>
                                                            Rider
                                                        </h4>
                                                        {delivery.rider ? (
                                                            <div className="space-y-1 text-sm">
                                                                <div><span className="text-gray-500">Name:</span> <span>{delivery.rider.name}</span></div>
                                                                <div><span className="text-gray-500">Phone:</span> <span>{delivery.rider.phone_number}</span></div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 text-sm italic">No rider assigned</p>
                                                        )}
                                                    </motion.div>

                                                    {/* Package Section */}
                                                    <motion.div
                                                        className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                            </div>
                                                            Package
                                                        </h4>
                                                        <div className="space-y-1 text-sm">
                                                            <div><span className="text-gray-500">Item:</span> <span>{delivery.package.description}</span></div>
                                                            {delivery.package.size && (
                                                                <div><span className="text-gray-500">Size:</span> <span className="capitalize">{delivery.package.size}</span></div>
                                                            )}
                                                            {delivery.package.special_instructions && (
                                                                <div><span className="text-gray-500">Notes:</span> <span className="text-xs">{delivery.package.special_instructions}</span></div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Enhanced hover effect line */}
                                <motion.div
                                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                                    initial={false}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <motion.div
            ref={containerRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
        >
            {/* Enhanced Card with sophisticated design */}
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
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/3 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-700"
                        initial={false}
                    />

                    {/* Floating particles */}
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20"
                            style={{
                                left: `${8 + i * 10}%`,
                                top: `${12 + (i % 4) * 20}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                x: [0, 15, 0],
                                opacity: [0.2, 0.6, 0.2],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{
                                duration: 6 + i * 0.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.5
                            }}
                        />
                    ))}

                    {/* Enhanced Header */}
                    <CardHeader className="relative z-10 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <motion.div variants={headerVariants} className="flex items-center gap-3">
                                <motion.div
                                    className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                                    whileHover={{
                                        rotate: 15,
                                        scale: 1.15,
                                        boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)"
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </motion.div>

                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-800">
                                        Active Deliveries
                                    </CardTitle>
                                    <motion.p
                                        className="text-sm text-gray-500 mt-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                    >
                                        Manage and track all your deliveries
                                    </motion.p>
                                </div>
                            </motion.div>

                            {/* View Mode Toggle */}
                            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="hidden sm:block md:block lg:hidden">
                                <TabsList className="bg-white/80 backdrop-blur-sm">
                                    <TabsTrigger value="table" className="flex items-center gap-2">
                                        <Table2 className="h-4 w-4" />
                                        Table
                                    </TabsTrigger>
                                    <TabsTrigger value="card" className="flex items-center gap-2">
                                        <LayoutGrid className="h-4 w-4" />
                                        Cards
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>

                    {/* Enhanced Filters */}
                    <CardContent className="relative z-10 pt-0">
                        <motion.div variants={filtersVariants} className="mb-6 space-y-4">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                <motion.div
                                    className="flex-1"
                                    whileFocus={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Input
                                        placeholder="Search by ID, customer or rider name"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-emerald-300 focus:ring-emerald-200"
                                    />
                                </motion.div>

                                <motion.div
                                    className="w-full md:w-48"
                                    whileFocus={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-200/50 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus:border-emerald-300"
                                        value={statusFilter}
                                        onChange={handleStatusFilterChange}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="created">Created</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Searching...
                                            </span>
                                        ) : (
                                            'Search'
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </motion.div>

                        {/* Enhanced Content */}
                        <AnimatePresence>
                            {isLoading && deliveries.length === 0 ? (
                                <motion.div
                                    key="loading"
                                    variants={loadingVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex justify-center items-center h-64"
                                >
                                    <div className="relative">
                                        <motion.div
                                            className="w-16 h-16 border-4 border-emerald-200 rounded-full"
                                            animate={{
                                                rotate: 360,
                                                borderColor: [
                                                    "rgba(16, 185, 129, 0.2)",
                                                    "rgba(16, 185, 129, 0.8)",
                                                    "rgba(16, 185, 129, 0.2)"
                                                ]
                                            }}
                                            transition={{
                                                rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                                                borderColor: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-1 left-1 w-14 h-14 border-4 border-transparent border-t-emerald-500 rounded-full"
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        />
                                        <motion.p
                                            className="text-emerald-600 font-medium mt-4 text-center"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            Loading deliveries...
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ) : deliveries.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    variants={loadingVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="text-center p-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50"
                                >
                                    <motion.div
                                        className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </motion.div>
                                    <p className="text-gray-500 font-medium text-lg mb-2">No deliveries found</p>
                                    <p className="text-gray-400 text-sm">Your deliveries will appear here once you create them</p>
                                </motion.div>
                            ) : (
                                <motion.div key="content" className="relative">
                                    {/* Loading overlay for pagination */}
                                    {isLoading && deliveries.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"
                                        >
                                            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-xl px-6 py-3 shadow-lg border border-gray-200/50">
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span className="text-emerald-600 font-medium text-sm">Loading...</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {viewMode === 'table' ? renderTableView() : renderCardView()}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Enhanced Pagination - Improved styling */}
                        {totalPages > 1 && (
                            <motion.div
                                className="flex justify-center mt-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <div className="flex items-center space-x-2 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200/50">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPageState - 1)}
                                            disabled={currentPageState === 1 || isLoading}
                                            className="bg-white/80 hover:bg-emerald-50 border-gray-200/50 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 transition-all duration-300"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </Button>
                                    </motion.div>

                                    <div className="flex items-center space-x-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                            const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPageState - 2)) + i;
                                            if (pageNumber > totalPages) return null;

                                            return (
                                                <motion.button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-300 ${
                                                        currentPageState === pageNumber
                                                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                                                            : 'bg-white/80 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200/50'
                                                    }`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {pageNumber}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPageState + 1)}
                                            disabled={currentPageState === totalPages || isLoading}
                                            className="bg-white/80 hover:bg-emerald-50 border-gray-200/50 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 transition-all duration-300"
                                        >
                                            Next
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Decorative Corner Elements */}
            <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [360, 180, 0]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            
            {/* Optimistic Toast */}
            <OptimisticToast
                show={showOptimisticToast}
                message={optimisticToastMessage}
                type={Object.values(resendOptimisticState).some(state => state === 'success') ? 'success' : 
                      Object.values(resendOptimisticState).some(state => state === 'error') ? 'error' : 'info'}
                onClose={() => setShowOptimisticToast(false)}
            />
        </motion.div>
    );
};

export default ActiveDeliveries;
