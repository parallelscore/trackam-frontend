import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1">
                        <div className="flex items-center">
                            <span className="text-xl font-bold">TrackAm</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-300">
                            Real-time delivery tracking for Nigerian businesses, powered by WhatsApp integration.
                        </p>
                    </div>

                    <div className="col-span-1">
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                            Services
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link to="/vendor" className="text-sm text-gray-300 hover:text-white">
                                    For Vendors
                                </Link>
                            </li>
                            <li>
                                <Link to="/rider" className="text-sm text-gray-300 hover:text-white">
                                    For Riders
                                </Link>
                            </li>
                            <li>
                                <Link to="/track" className="text-sm text-gray-300 hover:text-white">
                                    Track Package
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                            Resources
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link to="/about" className="text-sm text-gray-300 hover:text-white">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-sm text-gray-300 hover:text-white">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link to="/help" className="text-sm text-gray-300 hover:text-white">
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                            Contact
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <span className="text-sm text-gray-300">+234 800 123 4567</span>
                            </li>
                            <li className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span className="text-sm text-gray-300">info@trackam.com</span>
                            </li>
                            <li className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-300">Lagos, Nigeria</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-700 pt-8">
                    <p className="text-sm text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} TrackAm. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;