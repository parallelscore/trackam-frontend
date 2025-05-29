import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebSocketOptions {
    url: string;
    autoConnect?: boolean;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

interface UseWebSocketResult {
    isConnected: boolean;
    send: (data: any) => void;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
    lastMessage: string | null;
}

const useWebSocket = (options: UseWebSocketOptions): UseWebSocketResult => {
    const {
        url,
        autoConnect = true,
        reconnectAttempts = 5,
        reconnectInterval = 5000,
        onConnect,
        onDisconnect,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    // Use refs for values that shouldn't trigger re-renders
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef<number>(0);
    const reconnectTimerRef = useRef<number | null>(null);
    const connectCallbackRef = useRef(onConnect);
    const disconnectCallbackRef = useRef(onDisconnect);
    const errorCallbackRef = useRef(onError);
    const urlRef = useRef(url);

    // Update callback refs when the callbacks change
    useEffect(() => {
        connectCallbackRef.current = onConnect;
        disconnectCallbackRef.current = onDisconnect;
        errorCallbackRef.current = onError;
        urlRef.current = url;
    }, [onConnect, onDisconnect, onError, url]);

    // Create socket connection
    const createSocketConnection = useCallback(() => {
        try {
            // Validate URL before attempting connection
            if (!urlRef.current || urlRef.current.trim() === '') {
                console.warn("Cannot create WebSocket: URL is empty");
                setConnectionStatus('error');
                return;
            }

            // Clean up any existing socket
            if (socketRef.current) {
                socketRef.current.close();
            }

            setConnectionStatus('connecting');
            const socket = new WebSocket(urlRef.current);
            socketRef.current = socket;

            socket.onopen = () => {
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectCountRef.current = 0;

                if (connectCallbackRef.current) {
                    connectCallbackRef.current();
                }
            };

            socket.onclose = (event) => {
                setIsConnected(false);
                setConnectionStatus('disconnected');

                if (disconnectCallbackRef.current) {
                    disconnectCallbackRef.current();
                }

                console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);

                // Handle reconnection
                if (reconnectCountRef.current < reconnectAttempts) {
                    setConnectionStatus('reconnecting');
                    reconnectCountRef.current += 1;

                    if (reconnectTimerRef.current) {
                        clearTimeout(reconnectTimerRef.current);
                    }

                    console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
                    reconnectTimerRef.current = window.setTimeout(() => {
                        createSocketConnection();
                    }, reconnectInterval);
                } else if (reconnectCountRef.current >= reconnectAttempts) {
                    console.warn(`Max reconnect attempts reached (${reconnectAttempts})`);
                    setConnectionStatus('error');
                }
            };

            socket.onerror = (event) => {
                console.error('WebSocket error:', event);
                setConnectionStatus('error');
                if (errorCallbackRef.current) {
                    errorCallbackRef.current(event);
                }
            };

            socket.onmessage = (event) => {
                setLastMessage(event.data);
            };

        } catch (err) {
            console.error('Error creating WebSocket:', err);
            setConnectionStatus('error');
        }
    }, [reconnectAttempts, reconnectInterval]);

    // Initialize connection
    useEffect(() => {
        if (autoConnect && url && url.trim() !== '') {
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
    }, [createSocketConnection, autoConnect, url]);

    // Send message function
    const send = useCallback((data: any) => {
        if (socketRef.current && isConnected) {
            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                socketRef.current.send(message);
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                return false;
            }
        } else {
            console.warn('Cannot send message: WebSocket is not connected');
            return false;
        }
    }, [isConnected]);

    return {
        isConnected,
        send,
        connectionStatus,
        lastMessage,
    };
};

export default useWebSocket;
