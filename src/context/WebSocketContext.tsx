import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import websocketService from '../services/websocketService';

interface WebSocketContextType {
  connectToDelivery: (tracking_id: string) => void;
  disconnectFromDelivery: () => void;
  isConnected: boolean;
  lastMessage: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  // Handle connection and cleanup
  useEffect(() => {
    if (!trackingId) {
      return;
    }

    const websocketUrl = websocketService.getDeliveryTrackingUrl(trackingId);
    if (!websocketUrl) {
      return;
    }

    const websocket = new WebSocket(websocketUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connection established');
    };

    websocket.onmessage = (event) => {
      setLastMessage(event.data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');
    };

    setWs(websocket);

    // Clean up on unmount
    return () => {
      websocket.close();
      setWs(null);
      setIsConnected(false);
      setLastMessage(null);
    };
  }, [trackingId]);

  const connectToDelivery = useCallback((tracking_id: string) => {
    if (tracking_id) {
      setTrackingId(tracking_id);
    }
  }, []);

  const disconnectFromDelivery = useCallback(() => {
    if (ws) {
      ws.close();
    }
    setTrackingId(null);
    setWs(null);
    setIsConnected(false);
    setLastMessage(null);
  }, [ws]);

  const value = useMemo(() => ({
    connectToDelivery,
    disconnectFromDelivery,
    isConnected,
    lastMessage,
  }), [connectToDelivery, disconnectFromDelivery, isConnected, lastMessage]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
