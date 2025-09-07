// backend/routes/_sse.js
// tiny SSE client registry / broadcaster used across route modules

export const sseClients = new Set();

/**
 * Register a send function (fn should accept a string payload).
 * Returns an unregister function.
 */
export function registerClient(fn) {
  sseClients.add(fn);
  return () => sseClients.delete(fn);
}

/** Broadcast a string payload to all registered SSE clients (safe) */
export function broadcast(payload) {
  sseClients.forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      // ignore per-client errors so other clients still receive messages
      console.warn("SSE client send failed:", e);
    }
  });
}
