// backend/routes/activity.js
import express from "express";
import { activity, pushActivity } from "./_store.js";

const router = express.Router();

// Simple auth (demo-token or any Bearer token allowed)
router.use((req, res, next) => {
  const auth = (req.headers.authorization || "").trim();
  if (!auth) {
    return res.status(401).json({ error: "unauthorized" });
  }
  console.log("[ACTIVITY] auth:", auth);
  next();
});

// GET /api/activity -> return activity array
router.get("/", (req, res) => {
  res.json(activity);
});

// POST /api/activity -> push a new number
router.post("/", (req, res) => {
  const { value } = req.body || {};
  if (typeof value !== "number") {
    return res
      .status(400)
      .json({ error: "invalid_payload", message: "value must be a number" });
  }
  const updated = pushActivity(value);
  res.json({ status: "ok", activity: updated });
});

export default router;
