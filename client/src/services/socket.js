import { io } from 'socket.io-client';

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (typeof window !== 'undefined' && window.location.port !== '5173'
    ? window.location.origin
    : 'http://localhost:5000');

export const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export function pingServer() {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      return reject(new Error('Socket is not connected yet'));
    }

    const start = Date.now();
    socket.emit('client:ping', { timestamp: start }, (response) => {
      const latency = Date.now() - start;
      resolve({ ...response, latencyMs: latency });
    });

    // Timeout safety
    setTimeout(() => {
      reject(new Error('Ping response timed out'));
    }, 4000);
  });
}

export default socket;
