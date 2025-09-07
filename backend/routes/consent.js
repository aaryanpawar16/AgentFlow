import express from "express";
import { z } from "zod";
import { listConsentsForUser, recordConsent } from "../services/consentVault.js";
const router = express.Router();

const ConsentSchema = z.object({
  userSub: z.string(),
  agentClientId: z.string(),
  scopes: z.array(z.string()).min(1),
  version: z.number().int().positive(),
  expiresAt: z.string().optional(),
  verifiedAgent: z.boolean().optional(),
  txnId: z.string().optional()
});

router.get("/:userSub", (req, res) => {
  const data = listConsentsForUser(req.params.userSub);
  res.json({ consents: data });
});

router.post("/", (req, res) => {
  const parse = ConsentSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "bad_request", details: parse.error.flatten() });
  const id = recordConsent(parse.data);
  res.status(201).json({ id });
});

export default router;
