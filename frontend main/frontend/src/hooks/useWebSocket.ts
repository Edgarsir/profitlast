import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinJobRoom = (jobId: string) => {
    if (socket) {
      socket.emit('join-job', jobId);
    }
  };

  const onProgress = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('progress', callback);
    }
  };

  const onError = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('error', callback);
    }
  };

  return {
    socket,
    connected,
    joinJobRoom,
    onProgress,
    onError,
  };
};