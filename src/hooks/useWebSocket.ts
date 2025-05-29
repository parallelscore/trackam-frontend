import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebSocketOptions {
    url: string;
    autoConnect?: boolean;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    heartbeatInterval?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
    onMessage?: (data: any) => void;
}

interface UseWebSocketResult {
    isConnected: boolean;
    send: (data: any) => void;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
    lastMessage: string | null;
    disconnect: () => void;
    connect: () => void;
}

const useWebSocket = (options: UseWebSocketOptions): UseWebSocketResult => {
    const {
        url,
        autoConnect = true,
        reconnectAttempts = 5,
        reconnectInterval = 5000,
        heartbeatInterval = 30000,
        onConnect,
        onDisconnect,
        onError,
        onMessage,
    } = options;

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    // Use refs for values that shouldn't trigger re-renders
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef<number>(0);
    const reconnectTimerRef = useRef<number | null>(null);
    const heartbeatTimerRef = useRef<number | null>(null);
    const isManuallyDisconnectedRef = useRef<boolean>(false);
    const connectCallbackRef = useRef(onConnect);
    const disconnectCallbackRef = useRef(onDisconnect);
    const errorCallbackRef = useRef(onError);
    const messageCallbackRef = useRef(onMessage);
    const urlRef = useRef(url);

    // Update callback refs when the callbacks change
    useEffect(() => {
        connectCallbackRef.current = onConnect;
        disconnectCallbackRef.current = onDisconnect;
        errorCallbackRef.current = onError;
        messageCallbackRef.current = onMessage;
        urlRef.current = url;
    }, [onConnect, onDisconnect, onError, onMessage, url]);

    // Clear all timers
    const clearTimers = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
    }, []);

    // Start heartbeat to keep connection alive
    const startHeartbeat = useCallback(() => {
        clearTimers();

        heartbeatTimerRef.current = window.setInterval(() => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                try {
                    socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                } catch (error) {
                    console.warn('Failed to send heartbeat:', error);
                }
            }
        }, heartbeatInterval);
    }, [heartbeatInterval, clearTimers]);

    // Disconnect function
    const disconnect = useCallback(() => {
        isManuallyDisconnectedRef.current = true;
        clearTimers();

        if (socketRef.current) {
            // Close with code 1000 (normal closure)
            socketRef.current.close(1000, 'Manual disconnect');
            socketRef.current = null;
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
    }, [clearTimers]);

    // Create socket connection
    const createSocketConnection = useCallback(() => {
        try {
            // Validate URL before attempting connection
            if (!urlRef.current || urlRef.current.trim() === '') {
                console.warn("Cannot create WebSocket: URL is empty");
                setConnectionStatus('error');
                return;
            }

            // Don't create new connection if one already exists and is connecting/open
            if (socketRef.current &&
                (socketRef.current.readyState === WebSocket.CONNECTING ||
                    socketRef.current.readyState === WebSocket.OPEN)) {
                return;
            }

            // Clean up any existing socket
            if (socketRef.current) {
                socketRef.current.close();
            }

            setConnectionStatus('connecting');
            console.log('Creating WebSocket connection to:', urlRef.current);

            const socket = new WebSocket(urlRef.current);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('WebSocket connected successfully');
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectCountRef.current = 0;
                isManuallyDisconnectedRef.current = false;

                // Start heartbeat
                startHeartbeat();

                if (connectCallbackRef.current) {
                    connectCallbackRef.current();
                }
            };

            socket.onclose = (event) => {
                console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);

                setIsConnected(false);
                clearTimers();

                if (disconnectCallbackRef.current) {
                    disconnectCallbackRef.current();
                }

                // Only attempt to reconnect if not manually disconnected
                if (!isManuallyDisconnectedRef.current) {
                    if (reconnectCountRef.current < reconnectAttempts) {
                        setConnectionStatus('reconnecting');
                        reconnectCountRef.current += 1;

                        const delay = Math.min(reconnectInterval * Math.pow(1.5, reconnectCountRef.current - 1), 30000);
                        console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts}) in ${delay}ms...`);

                        reconnectTimerRef.current = window.setTimeout(() => {
                            createSocketConnection();
                        }, delay);
                    } else {
                        console.warn(`Max reconnect attempts reached (${reconnectAttempts})`);
                        setConnectionStatus('error');
                    }
                } else {
                    setConnectionStatus('disconnected');
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
                try {
                    const data = JSON.parse(event.data);

                    // Handle built-in message types
                    if (data.type === 'pong') {
                        // Heartbeat response - connection is alive
                        return;
                    }

                    setLastMessage(event.data);

                    if (messageCallbackRef.current) {
                        messageCallbackRef.current(data);
                    }
                } catch (error) {
                    console.warn('Failed to parse WebSocket message:', error);
                    setLastMessage(event.data);
                }
            };

        } catch (err) {
            console.error('Error creating WebSocket:', err);
            setConnectionStatus('error');
        }
    }, [reconnectAttempts, reconnectInterval, startHeartbeat, clearTimers]);

    // Connect function
    const connect = useCallback(() => {
        isManuallyDisconnectedRef.current = false;
        createSocketConnection();
    }, [createSocketConnection]);

    // Initialize connection
    useEffect(() => {
        if (autoConnect && url && url.trim() !== '') {
            connect();
        }

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, [autoConnect, url, connect, disconnect]);

    // Handle URL changes
    useEffect(() => {
        if (isConnected && urlRef.current !== url) {
            console.log('WebSocket URL changed, reconnecting...');
            disconnect();
            setTimeout(() => {
                if (!isManuallyDisconnectedRef.current) {
                    connect();
                }
            }, 1000);
        }
    }, [url, isConnected, connect, disconnect]);

    // Send message function
    const send = useCallback((data: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                socketRef.current.send(message);
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                return false;
            }
        } else {
            console.warn('Cannot send message: WebSocket is not connected (state:',
                socketRef.current?.readyState || 'null', ')');
            return false;
        }
    }, []);

    return {
        isConnected,
        send,
        connectionStatus,
        lastMessage,
        disconnect,
        connect,
    };
};

export default useWebSocket;