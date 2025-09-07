// backend/routes/workflows.js
import express from "express";
import { workflows, addWorkflow } from "./_store.js";

const router = express.Router();

// Simple auth middleware (demo-token or any Bearer token allowed)
router.use((req, res, next) => {
  const auth = (req.headers.authorization || "").trim();
  if (!auth) {
    return res.status(401).json({ error: "unauthorized" });
  }
  // for demo allow any token, but we keep it logged
  console.log("[WORKFLOWS] auth:", auth);
  next();
});

// GET /api/workflows  -> return array (newest-first)
router.get("/", (req, res) => {
  // ensure a stable newest-first order
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

  // If we have attached SSE clients, broadcast — we expose a broadcast function below
  if (router.broadcast) {
    try {
      router.broadcast(JSON.stringify(wf));
    } catch (e) {
      console.warn("SSE broadcast failed:", e);
    }
  }

  res.json({ status: "ok", workflow: wf });
});

// SSE stream for real-time clients.
// GET /api/workflows/stream  -> Server-Sent Events (text/event-stream)
router.get("/stream", (req, res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Send a ping comment every 20s to keep connection alive (some proxies close idle connections)
  const keepAlive = setInterval(() => res.write(":\n\n"), 20000);

  // send the current list snapshot right away (as an event named "snapshot")
  const snapshot = JSON.stringify(workflows.slice().sort((a, b) => (Date.parse(b.ts || "") - Date.parse(a.ts || ""))));
  res.write(`event: snapshot\n`);
  res.write(`data: ${snapshot}\n\n`);

  // Register this client's send function into router.clients
  const sendFn = (payload) => {
    // send `workflow` event
    res.write(`event: workflow\n`);
    res.write(`data: ${payload}\n\n`);
  };

  // attach to router for broadcasts
  router._sseClients = router._sseClients || new Set();
  router._sseClients.add(sendFn);

  // expose convenience broadcast function
  router.broadcast = (payload) => {
    router._sseClients?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.warn("SSE client fn failed", e);
      }
    });
  };

  // on client close, cleanup
  req.on("close", () => {
    clearInterval(keepAlive);
    router._sseClients?.delete(sendFn);
  });
});

export default router;
