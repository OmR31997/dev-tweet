"use client";

let socketConnected = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function setSocketConnected(connected: boolean) {
  if (socketConnected === connected) return;
  socketConnected = connected;
  notify();
}

export function isSocketConnected() {
  return socketConnected;
}

export function subscribeSocketState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
