// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import consentRoutes from "./routes/consent.js";
import orchestratorRoutes from "./routes/orchestrator.js";
import calendarRoutes from "./routes/calendar.js";

dotenv.config();
const app = express();

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log("[REQ]", req.method, req.originalUrl);
  next();
});

// Middleware
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// -----------------------------
// Conditionally import optional routes (workflows, activity)
// -----------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDir = path.join(__dirname, "routes");

let workflowsRoutes;
let activityRoutes;

if (fs.existsSync(path.join(routesDir, "workflows.js"))) {
  // dynamic import so missing file doesn't crash at startup
  workflowsRoutes = (await import("./routes/workflows.js")).default;
  console.log("[BOOT] Loaded routes/workflows.js");
} else {
  console.warn("[BOOT] routes/workflows.js not found — using fallback router");
  const r = express.Router();
  r.get("/", (req, res) => res.status(501).json({ error: "not_implemented", path: "/api/workflows" }));
  workflowsRoutes = r;
}

if (fs.existsSync(path.join(routesDir, "activity.js"))) {
  activityRoutes = (await import("./routes/activity.js")).default;
  console.log("[BOOT] Loaded routes/activity.js");
} else {
  console.warn("[BOOT] routes/activity.js not found — using fallback router");
  const r = express.Router();
  r.get("/", (req, res) => res.status(501).json({ error: "not_implemented", path: "/api/activity" }));
  activityRoutes = r;
}

// -----------------------------
// API routes (must be mounted BEFORE static file serving)
// -----------------------------
app.use("/api/consents", consentRoutes);
app.use("/api/orchestrator", orchestratorRoutes);
app.use("/api/calendar", calendarRoutes);

// optional /api/workflows and /api/activity (safe fallback above)
app.use("/api/workflows", workflowsRoutes);
app.use("/api/activity", activityRoutes);

// If an unknown /api/* path hits, return 404 JSON (prevents index.html from being served)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "api_not_found", path: req.originalUrl });
});

// -----------------------------
// Serve frontend build (only in production or if FRONTEND_DIST=true)
// -----------------------------
const serveFrontend = process.env.NODE_ENV === "production" || process.env.SERVE_FRONTEND === "true";

if (serveFrontend) {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    // If request is an API call we already returned 404 above
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  // helpful dev message
  app.get("/", (req, res) => {
    res.send(
      `<html><body><h3>Backend running. Frontend served by Vite (dev) at http://localhost:5173</h3></body></html>`
    );
  });
}

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT} (serveFrontend=${serveFrontend})`));
