import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebSocketOptions {
    url: string;
    autoConnect?: boolean;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

interface UseWebSocketResult {
    isConnected: boolean;
    send: (data: any) => void;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
}

const useWebSocket = (options: UseWebSocketOptions): UseWebSocketResult => {
    const {
        url,
        autoConnect = true,
        reconnectAttempts = 5,
        reconnectInterval = 5000,
        onConnect,
        onDisconnect,
    } = options;

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');

    // Use refs for values that shouldn't trigger re-renders
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef<number>(0);
    const reconnectTimerRef = useRef<number | null>(null);
    const connectCallbackRef = useRef(onConnect);
    const disconnectCallbackRef = useRef(onDisconnect);

    // Update callback refs when the callbacks change
    useEffect(() => {
        connectCallbackRef.current = onConnect;
        disconnectCallbackRef.current = onDisconnect;
    }, [onConnect, onDisconnect]);

    // Create socket connection
    const createSocketConnection = useCallback(() => {
        try {
            // Clean up any existing socket
            if (socketRef.current) {
                socketRef.current.close();
            }

            setConnectionStatus('connecting');
            const socket = new WebSocket(url);
            socketRef.current = socket;

            socket.onopen = () => {
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectCountRef.current = 0;

                if (connectCallbackRef.current) {
                    connectCallbackRef.current();
                }
            };

            socket.onclose = () => {
                setIsConnected(false);
                setConnectionStatus('disconnected');

                if (disconnectCallbackRef.current) {
                    disconnectCallbackRef.current();
                }

                // Handle reconnection
                if (reconnectCountRef.current < reconnectAttempts) {
                    setConnectionStatus('reconnecting');
                    reconnectCountRef.current += 1;

                    if (reconnectTimerRef.current) {
                        clearTimeout(reconnectTimerRef.current);
                    }

                    reconnectTimerRef.current = window.setTimeout(() => {
                        createSocketConnection();
                    }, reconnectInterval);
                }
            };

            socket.onerror = () => {
                setConnectionStatus('error');
            };

        } catch (err) {
            setConnectionStatus('error');
        }
    }, [url, reconnectAttempts, reconnectInterval]);

    // Initialize connection
    useEffect(() => {
        if (autoConnect) {
            createSocketConnection();
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }

            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
        };
    }, [createSocketConnection, autoConnect]);

    // Send message function
    const send = useCallback((data: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn('Cannot send message: Socket is not connected');
        }
    }, [isConnected]);

    return {
        isConnected,
        send,
        connectionStatus,
    };
};

export default useWebSocket;
