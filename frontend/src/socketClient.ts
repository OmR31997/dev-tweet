import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

function resolveSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) return apiUrl;
  return window.location.origin;
}

export function connectSocket(token: string): Socket {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }
  socket = io(resolveSocketUrl(), {
    auth: { token },
    autoConnect: true,
    reconnection: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function onSocketEvent<T = unknown>(event: string, handler: (payload: T) => void): () => void {
  const s = socket;
  if (!s) return () => {};
  s.on(event, handler);
  return () => {
    s.off(event, handler);
  };
}

export function emitSocketEvent<T = unknown>(event: string, payload: T): void {
  socket?.emit(event, payload);
}
