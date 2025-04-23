import React, { useState, useEffect } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { getStatusColor, getStatusText, formatDateTime, generateWhatsAppLink } from '@/utils/utils.ts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Delivery } from '@/types';

const ActiveDeliveries: React.FC = () => {
    const { deliveries, totalDeliveries, currentPage, totalPages, isLoading, fetchDeliveries } = useDelivery();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPageState, setCurrentPageState] = useState(1);

    // Effect to load deliveries when filters change
    useEffect(() => {
        loadDeliveries();
    }, [statusFilter, currentPageState]);

    // Function to load deliveries with current filters
    const loadDeliveries = async () => {
        const filters: any = {
            page: currentPageState,
            limit: 10,
        };

        if (statusFilter !== 'all') {
            filters.status = statusFilter;
        }

        if (searchTerm) {
            filters.search = searchTerm;
        }

        await fetchDeliveries(filters);
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPageState(1); // Reset to first page
        loadDeliveries();
    };

    // Handle status filter change
    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPageState(1); // Reset to first page
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPageState(page);
    };

    // Generate WhatsApp message for rider
    const handleShareWithRider = (delivery: Delivery) => {
        if (delivery.rider) {
            const message = `Hello ${delivery.rider.name}, you have a delivery to make. Track it here: ${delivery.tracking.riderLink} - Your OTP is: ${delivery.tracking.otp}`;
            const whatsappLink = generateWhatsAppLink(delivery.rider.phoneNumber, message);
            window.open(whatsappLink, '_blank');
        }
    };

    // Generate WhatsApp message for customer
    const handleShareWithCustomer = (delivery: Delivery) => {
        const message = `Hello ${delivery.customer.name}, track your delivery here: ${delivery.tracking.customerLink}`;
        const whatsappLink = generateWhatsAppLink(delivery.customer.phoneNumber, message);
        window.open(whatsappLink, '_blank');
    };

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
                                <div className="flex flex-col md:flex-row justify-between gap-2">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">
                                                Tracking ID: {delivery.trackingId}
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
                                                <span className="text-gray-600">Phone:</span> {delivery.customer.phoneNumber}
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
                                            Created: {formatDateTime(delivery.createdAt)}
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0">
                                        {delivery.rider && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleShareWithRider(delivery)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                </svg>
                                                Rider
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                            onClick={() => handleShareWithCustomer(delivery)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            </svg>
                                            Customer
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`/track/${delivery.trackingId}`, '_blank')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 12h20" />
                                                <path d="M12 2v20" />
                                                <circle cx="12" cy="12" r="10" />
                                                <circle cx="12" cy="12" r="4" />
                                            </svg>
                                            Track
                                        </Button>
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
