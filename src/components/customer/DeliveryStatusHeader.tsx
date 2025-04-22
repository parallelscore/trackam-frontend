import React from 'react';
import { Delivery } from '@/types';
import { Badge } from '../ui/badge';
import { getStatusColor, getStatusText } from '@/utils/utils.ts';

interface DeliveryStatusHeaderProps {
    delivery: Delivery;
    estimatedTime?: string;
}

const DeliveryStatusHeader: React.FC<DeliveryStatusHeaderProps> = ({
                                                                       delivery,
                                                                       estimatedTime
                                                                   }) => {
    const renderProgressBar = () => {
        const statuses = ['created', 'assigned', 'accepted', 'in_progress', 'completed'];
        const currentIndex = statuses.indexOf(delivery.status);

        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all ease-in-out duration-500"
                    style={{ width: `${Math.min(100, (currentIndex / (statuses.length - 1)) * 100)}%` }}
                ></div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-secondary">Delivery Status</h2>
                    <div className="mt-1">
                        <Badge className={getStatusColor(delivery.status)}>
                            {getStatusText(delivery.status)}
                        </Badge>
                    </div>
                </div>

                {delivery.rider && (
                    <div className="text-right">
                        <h3 className="text-sm font-medium text-gray-600">Delivery By</h3>
                        <p className="font-semibold">{delivery.rider.name}</p>
                        <p className="text-sm text-gray-600">{delivery.rider.phoneNumber}</p>
                    </div>
                )}
            </div>

            {renderProgressBar()}

            {estimatedTime && delivery.status === 'in_progress' && (
                <div className="mt-4 bg-green-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-medium text-green-800">Estimated Time of Arrival</h3>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-green-800">{estimatedTime}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryStatusHeader;