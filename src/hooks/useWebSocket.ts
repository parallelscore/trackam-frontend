import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '@/types';

interface UseWebSocketOptions {
    url: string;
    autoConnect?: boolean;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

interface UseWebSocketResult {
    socket: Socket | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    send: <T>(event: string, data: T) => void;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
    error: Error | null;
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

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');
    const [error, setError] = useState<Error | null>(null);

    const reconnectCount = useRef<number>(0);
    const reconnectTimerId = useRef<number | null>(null);

    // Create socket connection
    const createSocketConnection = useCallback(() => {
        try {
            setConnectionStatus('connecting');

            const socketInstance = io(url, {
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: reconnectAttempts,
                reconnectionDelay: reconnectInterval,
            });

            setSocket(socketInstance);

            // Set up event listeners
            socketInstance.on(SocketEvent.CONNECT, () => {
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectCount.current = 0;

                if (onConnect) {
                    onConnect();
                }
            });

            socketInstance.on(SocketEvent.DISCONNECT, () => {
                setIsConnected(false);
                setConnectionStatus('disconnected');

                if (onDisconnect) {
                    onDisconnect();
                }
            });

            socketInstance.on('connect_error', (err) => {
                setConnectionStatus('error');
                setError(err);

                // Manual reconnection logic
                if (reconnectCount.current < reconnectAttempts) {
                    setConnectionStatus('reconnecting');
                    reconnectCount.current += 1;

                    if (reconnectTimerId.current) {
                        clearTimeout(reconnectTimerId.current);
                    }

                    reconnectTimerId.current = window.setTimeout(() => {
                        socketInstance.connect();
                    }, reconnectInterval);
                }
            });

            // Connect if autoConnect is true
            if (autoConnect) {
                socketInstance.connect();
            }

            return socketInstance;
        } catch (err) {
            setConnectionStatus('error');
            setError(err instanceof Error ? err : new Error('Failed to create socket connection'));
            return null;
        }
    }, [url, autoConnect, reconnectAttempts, reconnectInterval, onConnect, onDisconnect]);

    // Initialize connection
    useEffect(() => {
        const socketInstance = createSocketConnection();

        // Cleanup on unmount
        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
                socketInstance.off();
            }

            if (reconnectTimerId.current) {
                clearTimeout(reconnectTimerId.current);
            }
        };
    }, [createSocketConnection]);

    // Connect method
    const connect = useCallback(() => {
        if (socket && !isConnected) {
            socket.connect();
        }
    }, [socket, isConnected]);

    // Disconnect method
    const disconnect = useCallback(() => {
        if (socket && isConnected) {
            socket.disconnect();
        }
    }, [socket, isConnected]);

    // Send message method
    const send = useCallback(<T>(event: string, data: T) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        } else {
            console.warn('Cannot send message: Socket is not connected');
        }
    }, [socket, isConnected]);

    return {
        socket,
        isConnected,
        connect,
        disconnect,
        send,
        connectionStatus,
        error,
    };
};

export default useWebSocket;