import { determineApiUrl } from './authService';

// Define base API URL from environment or determine dynamically
const API_URL = import.meta.env.VITE_API_URL || determineApiUrl();

// Convert API_URL to WebSocket URL format
const getWebSocketBaseUrl = () => {
  // Replace http:// with ws:// and https:// with wss://
  if (API_URL.startsWith('http://')) {
    return API_URL.replace('http://', 'ws://');
  } else if (API_URL.startsWith('https://')) {
    return API_URL.replace('https://', 'wss://');
  }
  // If no protocol is specified, assume it matches the current window protocol
  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${API_URL}`;
};

const websocketService = {
  getDeliveryTrackingUrl: (tracking_id: string): string => {
    if (!tracking_id) return '';
    
    const baseWsUrl = getWebSocketBaseUrl();
    // Ensure we don't have double slashes in the path
    const baseUrl = baseWsUrl.endsWith('/') ? baseWsUrl : `${baseWsUrl}/`;
    return `${baseUrl}ws/delivery/${tracking_id}`;
  }
};

export default websocketService;
