// src/components/vendor/ActiveDeliveries.tsx
import React, { useState, useEffect } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { getStatusColor, getStatusText, formatDateTime, generateWhatsAppLink } from '@/utils/utils.ts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Delivery, DeliveryFilters, DeliveryStatus } from '@/types';
import toast from 'react-hot-toast';
import axios from 'axios';
import { determineApiUrl } from '@/services/authService';

const ActiveDeliveries: React.FC = () => {
    const { deliveries, totalPages, isLoading, fetchDeliveries } = useDelivery();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
    const [currentPageState, setCurrentPageState] = useState(1);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const [isResending, setIsResending] = useState<string | null>(null); // Track which delivery is being resent

    // Effect to load deliveries when filters change
    useEffect(() => {
        const filters: DeliveryFilters = {
            page: currentPageState,
            limit: 10,
        };

        const selectedStatus: DeliveryStatus | undefined =
            statusFilter === 'all' ? undefined : statusFilter;

        if (selectedStatus) {
            filters.delivery_status = selectedStatus;
        }

        if (searchTerm.trim()) {
            filters.search = searchTerm.trim();
        }

        fetchDeliveries(filters);
    }, [statusFilter, searchTerm, currentPageState]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPageState(1);
    };

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    // Handle status filter change
    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value as DeliveryStatus | 'all');
        setCurrentPageState(1); // Reset to first page
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPageState(page);
    };

    // Generate WhatsApp message for rider
    const handleShareWithRider = (delivery: Delivery) => {
        if (delivery.rider) {
            const message = `Hello ${delivery.rider.name}, you have a delivery to make. Track it here: ${delivery.tracking.rider_link} - Your OTP is: ${delivery.tracking.otp}`;
            const whatsappLink = generateWhatsAppLink(delivery.rider.phone_number, message);
            window.open(whatsappLink, '_blank');
            setActiveActionMenu(null);
        }
    };

    // Generate WhatsApp message for customer
    const handleShareWithCustomer = (delivery: Delivery) => {
        const message = `Hello ${delivery.customer.name}, track your delivery here: ${delivery.tracking.customer_link}`;
        const whatsappLink = generateWhatsAppLink(delivery.customer.phone_number, message);
        window.open(whatsappLink, '_blank');
        setActiveActionMenu(null);
    };

    // Handle opening/closing action menu
    const toggleActionMenu = (id: string) => {
        if (activeActionMenu === id) {
            setActiveActionMenu(null);
        } else {
            setActiveActionMenu(id);
        }
    };

    // Track package
    const handleTrackPackage = (trackingId: string) => {
        window.open(`/track/${trackingId}`, '_blank');
        setActiveActionMenu(null);
    };

    // Resend notifications
    const handleResendNotifications = async (trackingId: string) => {
        setIsResending(trackingId);
        setActiveActionMenu(null);

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
                'Failed to resend notifications. Please try again.'
            );
        } finally {
            setIsResending(null);
        }
    };

    // Handle clicking outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeActionMenu && !(event.target as HTMLElement).closest('.action-menu')) {
                setActiveActionMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeActionMenu]);

    // Pagination component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        return (
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
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl">Active Deliveries</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="mb-6 space-y-2">
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
                    <div className="space-y-4">
                        {deliveries.map((delivery) => (
                            <div
                                key={delivery.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">
                                                Tracking ID: {delivery.tracking_id}
                                            </h3>
                                            <Badge className={getStatusColor(delivery.status)}>
                                                {getStatusText(delivery.status)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Customer:</span> {delivery.customer.name}
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Phone:</span> {delivery.customer.phone_number}
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Rider:</span> {delivery.rider?.name || 'Not assigned'}
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Package:</span> {delivery.package.description}
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="text-gray-600">Address:</span> {delivery.customer.address}
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            Created: {formatDateTime(delivery.created_at)}
                                        </div>
                                    </div>

                                    <div className="relative action-menu">
                                        <Button
                                            variant="outline"
                                            onClick={() => toggleActionMenu(delivery.id)}
                                            className="whitespace-nowrap"
                                            disabled={isResending === delivery.tracking_id}
                                        >
                                            {isResending === delivery.tracking_id ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    </svg>
                                                    Actions
                                                </>
                                            )}
                                        </Button>

                                        {activeActionMenu === delivery.id && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border">
                                                <button
                                                    onClick={() => handleTrackPackage(delivery.tracking_id)}
                                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                                    </svg>
                                                    Track Package
                                                </button>

                                                {delivery.rider && (
                                                    <button
                                                        onClick={() => handleShareWithRider(delivery)}
                                                        className="flex w-full items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                                    >
                                                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                        </svg>
                                                        Share with Rider
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleShareWithCustomer(delivery)}
                                                    className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                                >
                                                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                    </svg>
                                                    Share with Customer
                                                </button>

                                                <button
                                                    onClick={() => handleResendNotifications(delivery.tracking_id)}
                                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                    </svg>
                                                    Resend Notifications
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <Pagination />
            </CardContent>
        </Card>
    );
};

export default ActiveDeliveries;