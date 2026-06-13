"use client";

import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

/** Connect (or reconnect) the singleton socket with the given access token. */
export function connectSocket(token: string): Socket {
  if (socket) {
    socket.disconnect();
  }
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
