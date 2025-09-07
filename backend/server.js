// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import consentRoutes from "./routes/consent.js";
import orchestratorRoutes from "./routes/orchestrator.js";
// NOTE: calendar import is now dynamic (see below)

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDir = path.join(__dirname, "routes");

// -----------------------------
// Dynamic routes (workflows, activity, calendar)
// -----------------------------
let workflowsRoutes;
let activityRoutes;
let calendarRoutes;

if (fs.existsSync(path.join(routesDir, "workflows.js"))) {
  workflowsRoutes = (await import("./routes/workflows.js")).default;
  console.log("[BOOT] Loaded routes/workflows.js");
} else {
  const r = express.Router();
  r.get("/", (req, res) => res.status(501).json({ error: "not_implemented", path: "/api/workflows" }));
  workflowsRoutes = r;
}

if (fs.existsSync(path.join(routesDir, "activity.js"))) {
  activityRoutes = (await import("./routes/activity.js")).default;
  console.log("[BOOT] Loaded routes/activity.js");
} else {
  const r = express.Router();
  r.get("/", (req, res) => res.status(501).json({ error: "not_implemented", path: "/api/activity" }));
  activityRoutes = r;
}

const calendarPathCorrect = path.join(routesDir, "calendar.js");
const calendarPathMisspelled = path.join(routesDir, "calender.js");

if (fs.existsSync(calendarPathCorrect)) {
  calendarRoutes = (await import("./routes/calendar.js")).default;
  console.log("[BOOT] Loaded routes/calendar.js");
} else if (fs.existsSync(calendarPathMisspelled)) {
  calendarRoutes = (await import("./routes/calender.js")).default;
  console.log("[BOOT] Loaded routes/calender.js (note: filename is 'calender.js')");
} else {
  const r = express.Router();
  r.get("/", (req, res) => res.status(501).json({ error: "not_implemented", path: "/api/calendar" }));
  r.post("/book", (req, res) => res.status(501).json({ error: "not_implemented", path: "/api/calendar/book" }));
  calendarRoutes = r;
}

// -----------------------------
// API routes
// -----------------------------
app.use("/api/consents", consentRoutes);
app.use("/api/orchestrator", orchestratorRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/workflows", workflowsRoutes);
app.use("/api/activity", activityRoutes);

// Catch-all for unknown /api/*
app.use("/api", (req, res) => {
  res.status(404).json({ error: "api_not_found", path: req.originalUrl });
});

// -----------------------------
// Serve frontend (index.html is in frontend/ not dist/)
// -----------------------------
const serveFrontend = process.env.NODE_ENV === "production" || process.env.SERVE_FRONTEND === "true";

if (serveFrontend) {
  const frontendPath = path.join(__dirname, "../frontend");

  // Serve static assets if any exist (CSS, JS, etc.)
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send(
      `<html><body><h3>Backend running. Frontend served by Vite (dev) at http://localhost:5173</h3></body></html>`
    );
  });
}

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT} (serveFrontend=${serveFrontend})`)
);
