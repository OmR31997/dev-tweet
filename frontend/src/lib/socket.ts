"use client";

import { getSocketUrl } from "@/config/env";
import { setSocketConnected } from "@/lib/socket-state";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Connect (or reconnect) the singleton socket with the given access token. */
export function connectSocket(token: string): Socket {
  if (socket) {
    socket.disconnect();
  }
  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
  });
  socket.on("connect", () => setSocketConnected(true));
  socket.on("disconnect", () => setSocketConnected(false));
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  setSocketConnected(false);
}
