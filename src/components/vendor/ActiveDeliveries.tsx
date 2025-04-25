// src/components/vendor/ActiveDeliveries.tsx
import React, { useState, useEffect } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { getStatusColor, getStatusText, formatDateTime, generateWhatsAppLink } from '@/utils/utils.ts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Delivery, DeliveryFilters, DeliveryStatus } from '@/types';
import toast from 'react-hot-toast';
import axios from 'axios';
import { determineApiUrl } from '@/services/authService';
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

const ActiveDeliveries: React.FC = () => {
    const { deliveries, totalPages, isLoading, fetchDeliveries } = useDelivery();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
    const [currentPageState, setCurrentPageState] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [isResending, setIsResending] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');

    // Effect to set the view mode based on screen size
    useEffect(() => {
        const handleResize = () => {
            // If screen is smaller than 768px (md breakpoint), use card view
            // If screen is larger, use table view
            setViewMode(window.innerWidth < 768 ? 'card' : 'table');
        };

        // Set initial view mode
        handleResize();

        // Listen for window resize events
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const filters: DeliveryFilters = {
            page: currentPageState,
            limit: 10,
            delivery_status: statusFilter === 'all' ? undefined : statusFilter,
            search: searchTerm.trim() || undefined,
        };

        fetchDeliveries(filters);
    }, [statusFilter, searchTerm, currentPageState]);

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

        try {
            const apiUrl = determineApiUrl();
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${apiUrl}/deliveries/${trackingId}/resend-notifications`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Notifications resent successfully');
            } else {
                toast.error(response.data.message || 'Failed to resend notifications');
            }
        } catch (error: any) {
            console.error('Error resending notifications:', error);
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to resend notifications'
            );
        } finally {
            setIsResending(null);
        }
    };

    // Render Table View
    const renderTableView = () => {
        return (
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="w-8"></TableHead>
                            <TableHead>Tracking ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Rider</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveries.map((delivery) => (
                            <React.Fragment key={delivery.id}>
                                <TableRow
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleRowExpansion(delivery.id)}
                                >
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRowExpansion(delivery.id);
                                            }}
                                        >
                                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows.has(delivery.id) ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">{delivery.tracking_id}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(delivery.status)}>
                                            {getStatusText(delivery.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{delivery.customer.name}</TableCell>
                                    <TableCell>{delivery.rider?.name || 'Not assigned'}</TableCell>
                                    <TableCell className="max-w-[150px] truncate" title={delivery.package.description}>
                                        {delivery.package.description}
                                    </TableCell>
                                    <TableCell>{formatDateTime(delivery.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    disabled={isResending === delivery.tracking_id}
                                                >
                                                    {isResending === delivery.tracking_id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
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
                                </TableRow>

                                {expandedRows.has(delivery.id) && (
                                    <TableRow className="bg-gray-50/50">
                                        <TableCell colSpan={8} className="bg-gray-50/30">
                                            <div className="py-4 px-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Customer Details - In a styled container */}
                                                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                                    <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Customer Details
                                                    </h4>
                                                    <div className="text-sm space-y-2">
                                                        <div className="flex">
                                                            <span className="text-gray-500 w-20 flex-shrink-0">Phone:</span>
                                                            <span>{delivery.customer.phone_number}</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className="text-gray-500 w-20 flex-shrink-0">Address:</span>
                                                            <span>{delivery.customer.address}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rider Details - In a styled container */}
                                                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                                    <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                        </svg>
                                                        Rider Details
                                                    </h4>
                                                    {delivery.rider ? (
                                                        <div className="text-sm space-y-2">
                                                            <div className="flex">
                                                                <span className="text-gray-500 w-20 flex-shrink-0">Phone:</span>
                                                                <span>{delivery.rider.phone_number}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm italic">No rider assigned yet.</p>
                                                    )}
                                                </div>

                                                {/* Package Details - In a styled container */}
                                                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                                    <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                        Package Details
                                                    </h4>
                                                    <div className="text-sm space-y-2">
                                                        {delivery.package.size && (
                                                            <div className="flex">
                                                                <span className="text-gray-500 w-20 flex-shrink-0">Size:</span>
                                                                <span className="capitalize">{delivery.package.size}</span>
                                                            </div>
                                                        )}
                                                        {delivery.package.special_instructions && (
                                                            <div className="flex items-start">
                                                                <span className="text-gray-500 w-20 flex-shrink-0">Notes:</span>
                                                                <span>{delivery.package.special_instructions}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    // Render Card View - Updated to match second slide design with single action button
    const renderCardView = () => {
        return (
            <div className="space-y-4">
                {deliveries.map((delivery) => (
                    <div key={delivery.id} className="border rounded-lg overflow-hidden">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleRowExpansion(delivery.id)}
                        >
                            <div className="flex items-center gap-2">
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows.has(delivery.id) ? 'rotate-180' : ''}`} />
                                <div>
                                    <span className="font-medium">{delivery.tracking_id}</span>
                                    <span className="text-xs text-gray-500 block md:inline md:ml-2">{formatDateTime(delivery.created_at)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(delivery.status)}>
                                    {getStatusText(delivery.status)}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            disabled={isResending === delivery.tracking_id}
                                        >
                                            {isResending === delivery.tracking_id ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <MoreHorizontal className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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

                        {expandedRows.has(delivery.id) && (
                            <div className="p-4 border-t bg-gray-50/30">
                                {/* On tablets and larger screens, display sections horizontally */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Customer Section */}
                                    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                        <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Customer Details
                                        </h4>
                                        <div className="text-sm space-y-2">
                                            <div className="flex">
                                                <span className="text-gray-500 w-16 flex-shrink-0">Name:</span>
                                                <span>{delivery.customer.name}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-500 w-16 flex-shrink-0">Phone:</span>
                                                <span>{delivery.customer.phone_number}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="text-gray-500 w-16 flex-shrink-0">Address:</span>
                                                <span>{delivery.customer.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rider Section */}
                                    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                        <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Rider Details
                                        </h4>
                                        {delivery.rider ? (
                                            <div className="text-sm space-y-2">
                                                <div className="flex">
                                                    <span className="text-gray-500 w-16 flex-shrink-0">Name:</span>
                                                    <span>{delivery.rider.name}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="text-gray-500 w-16 flex-shrink-0">Phone:</span>
                                                    <span>{delivery.rider.phone_number}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">No rider assigned yet.</p>
                                        )}
                                    </div>

                                    {/* Package Section */}
                                    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                        <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            Package Details
                                        </h4>
                                        <div className="text-sm space-y-2">
                                            <div className="flex items-start">
                                                <span className="text-gray-500 w-16 flex-shrink-0">Description:</span>
                                                <span>{delivery.package.description}</span>
                                            </div>
                                            {delivery.package.size && (
                                                <div className="flex">
                                                    <span className="text-gray-500 w-16 flex-shrink-0">Size:</span>
                                                    <span className="capitalize">{delivery.package.size}</span>
                                                </div>
                                            )}
                                            {delivery.package.special_instructions && (
                                                <div className="flex items-start">
                                                    <span className="text-gray-500 w-16 flex-shrink-0">Notes:</span>
                                                    <span>{delivery.package.special_instructions}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* For special instructions that might be long, display them in a full-width section if needed */}
                                {delivery.package.special_instructions && delivery.package.special_instructions.length > 50 && (
                                    <div className="mt-4 bg-white p-3 rounded-md shadow-sm border border-gray-100 sm:col-span-3">
                                        <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Special Instructions
                                        </h4>
                                        <p className="text-sm">{delivery.package.special_instructions}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Active Deliveries</CardTitle>
                {/* Only show toggle on medium screens (tablets) where either view could be appropriate */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="hidden sm:block md:block lg:hidden">
                    <TabsList>
                        <TabsTrigger value="table" className="flex items-center">
                            <Table2 className="h-4 w-4 mr-2" />
                            Table
                        </TabsTrigger>
                        <TabsTrigger value="card" className="flex items-center">
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Cards
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>

            <CardContent>
                <div className="mb-6 space-y-4">
                    {/* Mobile View Toggle removed as view is now automatically determined by screen size */}

                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by ID, customer or rider name"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full"
                            />
                        </div>

                        <div className="w-full md:w-48">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                    </form>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : deliveries.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-md">
                        <p className="text-gray-500">No deliveries found</p>
                    </div>
                ) : (
                    <>
                        {/* View mode is primarily determined by screen width,
                        but can be manually overridden on medium-sized screens */}
                        {viewMode === 'table' ? renderTableView() : renderCardView()}
                    </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPageState - 1)}
                                disabled={currentPageState === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {currentPageState} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPageState + 1)}
                                disabled={currentPageState === totalPages || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ActiveDeliveries;