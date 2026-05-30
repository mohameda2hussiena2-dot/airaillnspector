import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export function Heartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.id.startsWith('bypass-')) return;

    const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? window.location.origin : '');
    
    if (!socketUrl) {
      console.error('Backend URL is missing in VITE_API_URL environment variable. Real-time features disabled.');
      return;
    }

    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Connected to real-time sync server');
      socket.emit('login', user.id);
    });

    const interval = setInterval(() => {
      socket.emit('heartbeat', user.id);
    }, 30000); // 30s heartbeat

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [user]);

  return null;
}
