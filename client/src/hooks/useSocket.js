import { useEffect, useState } from 'react';
import socket, { pingServer } from '../services/socket';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id || null);
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setSocketId(socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      setSocketId(null);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Initial check
    if (socket.connected) {
      setIsConnected(true);
      setSocketId(socket.id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const triggerPing = async () => {
    try {
      const res = await pingServer();
      setLatency(res.latencyMs);
      return res;
    } catch (err) {
      console.warn('Ping error:', err);
      return null;
    }
  };

  return {
    socket,
    isConnected,
    socketId,
    latency,
    triggerPing,
  };
}
