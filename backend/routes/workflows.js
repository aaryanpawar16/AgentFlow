// backend/routes/workflows.js
import express from "express";
import { workflows, addWorkflow } from "./_store.js";

const router = express.Router();

// Simple auth middleware (demo-token or any Bearer token allowed)
// NOTE: keep this light for demo; in prod use a real verifier
router.use((req, res, next) => {
  const headerAuth = (req.headers.authorization || "").trim();
  const queryToken = (req.query?.token || "").toString().trim();

  // Accept either Authorization header OR ?token=demo-token (for EventSource)
  if (!headerAuth && !queryToken) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // For dev/demo: allow any token but log it (or accept specific demo token)
  const effectiveToken = headerAuth.replace(/^Bearer\s+/i, "") || queryToken;
  console.log("[WORKFLOWS] auth token:", effectiveToken);

  // Attach a lightweight jwt-like object for handlers if needed
  req.jwt = { sub: effectiveToken === "demo-token" ? "demo-user" : effectiveToken };
  next();
});

// Keep a shared set of SSE clients and a single broadcast function
router._sseClients = router._sseClients || new Set();

/**
 * Safe send helper for SSE clients (wraps res.write)
 * payload should be a string (already JSON.stringify'd if needed)
 */
function safeSend(res, eventName, payload) {
  try {
    if (eventName) res.write(`event: ${eventName}\n`);
    res.write(`data: ${payload}\n\n`);
  } catch (e) {
    console.warn("SSE send failed:", e);
  }
}

// Broadcast convenience (single function)
router.broadcast = (payload) => {
  router._sseClients.forEach((sendFn) => {
    try {
      sendFn(payload);
    } catch (e) {
      console.warn("SSE client fn failed", e);
    }
  });
};

// GET /api/workflows  -> return array (newest-first)
router.get("/", (req, res) => {
  const sorted = workflows.slice().sort((a, b) => {
    const ta = Date.parse(a.ts || "") || 0;
    const tb = Date.parse(b.ts || "") || 0;
    return tb - ta;
  });
  res.json(sorted);
});

// POST /api/workflows  -> accept { id, user, result, ts? } and append
router.post("/", (req, res) => {
  const body = req.body || {};
  if (!body.id || !body.user || !body.result) {
    return res.status(400).json({ error: "invalid_payload", message: "id, user, result required" });
  }
  const wf = {
    id: body.id,
    user: body.user,
    result: body.result,
    ts: body.ts || new Date().toISOString(),
  };
  addWorkflow(wf);

  // Broadcast the new workflow as an object (stringified)
  try {
    router.broadcast(JSON.stringify({ type: "workflow", workflow: wf }));
  } catch (e) {
    console.warn("SSE broadcast failed:", e);
  }

  res.json({ status: "ok", workflow: wf });
});

// SSE stream for real-time clients.
// GET /api/workflows/stream  -> Server-Sent Events (text/event-stream)
router.get("/stream", (req, res) => {
  // If auth token provided as query param, allow it (EventSource can't send headers)
  const queryToken = (req.query?.token || "").toString().trim();
  const headerAuth = (req.headers.authorization || "").trim();

  if (!headerAuth && !queryToken) {
    // For SSE, respond with 401 and close
    res.status(401).json({ error: "missing_authorization" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // optional: suggest retry time (ms)
  res.write("retry: 3000\n\n");
  res.flushHeaders?.();

  // Keep-alive comment (ping) every 20s
  const keepAlive = setInterval(() => {
    try {
      res.write(":\n\n");
    } catch (e) {
      // it's ok — client may be gone
    }
  }, 20000);

  // send snapshot event immediately
  const snapshot = JSON.stringify(workflows.slice().sort((a, b) => (Date.parse(b.ts || "") - Date.parse(a.ts || ""))));
  safeSend(res, "workflows_snapshot", snapshot);

  // per-client send function (uses safeSend)
  const sendFn = (payload) => {
    safeSend(res, "workflow", payload);
  };

  // register client
  router._sseClients.add(sendFn);

  // cleanup on close
  req.on("close", () => {
    clearInterval(keepAlive);
    router._sseClients.delete(sendFn);
  });
});

export default router;
