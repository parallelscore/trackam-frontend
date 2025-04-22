import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const TrackingForm: React.FC = () => {
    const [trackingId, setTrackingId] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation
        if (!trackingId.trim()) {
            setError('Please enter a tracking ID');
            return;
        }

        // Navigate to tracking page
        navigate(`/track/${trackingId.trim()}`);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-center">Track Your Package</CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            placeholder="Enter your tracking ID"
                            value={trackingId}
                            onChange={(e) => {
                                setTrackingId(e.target.value);
                                setError('');
                            }}
                            className={`text-center text-lg ${error ? 'border-red-500' : ''}`}
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full">
                        Track Now
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default TrackingForm;