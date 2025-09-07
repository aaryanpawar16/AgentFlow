// backend/routes/calendar.js
import express from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireScopes } from "../middleware/scopes.js";

// Import shared in-memory store + helper to add workflows
import { workflows, activity, addWorkflow } from "./_store.js";
// Import SSE broadcaster
import { broadcast } from "./_sse.js";

const router = express.Router();

/**
 * GET /api/calendar
 * Returns available slots
 */
router.get("/", verifyJWT, requireScopes(["calendar:query"]), (req, res) => {
  const sub = req.jwt.sub;

  res.json({
    status: "ok",
    subject: sub,
    slots: ["10:00", "11:30", "15:00"], // simple static list
  });
});

/**
 * POST /api/calendar/book
 * Books a slot, removes it from list, and creates a workflow entry
 */
router.post("/book", verifyJWT, requireScopes(["calendar:query"]), (req, res) => {
  const { slot } = req.body;
  if (!slot) {
    return res.status(400).json({ error: "missing_slot" });
  }

  // Build workflow with real timestamp
  const wf = {
    id: `wf_${Math.random().toString(36).slice(2, 7)}`,
    user: req?.jwt?.sub ?? "demo-user",
    result: "success",
    ts: new Date().toISOString(),
  };

  // Store workflow (use helper to keep behaviour consistent)
  try {
    addWorkflow(wf);
  } catch (e) {
    // fallback to direct push if helper fails for any reason
    workflows.unshift(wf);
    if (workflows.length > 20) workflows.pop();
  }

  // Broadcast created workflow to SSE clients (best-effort)
  try {
    broadcast(JSON.stringify(wf));
  } catch (e) {
    console.warn("broadcast failed from /api/calendar/book", e);
  }

  // Simulate activity update
  activity.shift();
  activity.push(Math.floor(Math.random() * 20) + 6);

  res.json({
    status: "ok",
    message: `Successfully booked ${slot}`,
    slots: ["11:30", "15:00"].filter((s) => s !== slot),
    workflow: wf,
    activity,
  });
});

export default router;
