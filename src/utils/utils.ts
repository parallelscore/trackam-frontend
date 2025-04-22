import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phoneNumber: string): string {
    // Nigerian phone number format - assuming +234 format
    const cleaned = phoneNumber.replace(/\D/g, "");

    if (cleaned.length === 10) {
        return `+234${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
        return `+234${cleaned.substring(1)}`;
    } else if (cleaned.length === 13 && cleaned.startsWith("234")) {
        return `+${cleaned}`;
    }

    return phoneNumber;
}

export function generateTrackingId(): string {
    // Generate a 6-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    // Calculate distance between two points in km using Haversine formula
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export function estimateDeliveryTime(
    distanceKm: number,
    averageSpeedKmh: number = 25
): number {
    // Estimate delivery time in minutes based on distance and average speed
    // Default speed is 25 km/h (typical for urban delivery in Nigeria)
    const timeHours = distanceKm / averageSpeedKmh;
    return Math.ceil(timeHours * 60); // Convert to minutes and round up
}

export function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'created':
            return 'bg-blue-100 text-blue-800';
        case 'assigned':
            return 'bg-purple-100 text-purple-800';
        case 'accepted':
            return 'bg-yellow-100 text-yellow-800';
        case 'in_progress':
            return 'bg-accent text-accent-foreground';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getStatusText(status: string): string {
    switch (status.toLowerCase()) {
        case 'created':
            return 'Created';
        case 'assigned':
            return 'Assigned';
        case 'accepted':
            return 'Accepted';
        case 'in_progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status;
    }
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
    const formattedPhone = formatPhoneNumber(phoneNumber).replace('+', '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}
