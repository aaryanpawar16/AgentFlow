// backend/routes/orchestrator.js
import express from "express";
import { z } from "zod";
const router = express.Router();

const CheckSchema = z.object({
  userSub: z.string(),
  agentClientId: z.string(),
  requiredScopes: z.array(z.string()).min(1)
});

// DEMO: Always grant consent
router.post("/ensure-consent", (req, res) => {
  const { userSub, agentClientId, requiredScopes } = req.body;

  // Auto-grant consent for demo-user
  if (userSub === "demo-user") {
    return res.json({ status: "ok", granted: requiredScopes });
  }

  // Otherwise check vault normally
  const check = consentAllows(userSub, agentClientId, requiredScopes);
  if (check.ok) return res.json({ status: "ok" });

  return res.json({
    status: "need_consent",
    reason: "missing",
    missing: requiredScopes
  });
});


// Optional: Latest consent for debugging
router.get("/latest/:userSub/:agentClientId", (req, res) => {
  res.json({
    latest: {
      grantedAt: new Date().toISOString(),
      grantedScopes: ["calendar:query"],
    },
  });
});

export default router;
