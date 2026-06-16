import { io } from 'socket.io-client';

// Replace with your actual server URL in environment variables
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Create a dummy socket for SSR to prevent build errors
const dummySocket = {
    on: () => { },
    emit: () => { },
    connect: () => { },
    disconnect: () => { },
    off: () => { },
};

export const socket = typeof window !== 'undefined' ? io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 15000,
}) : dummySocket as any;
