// src/main.tsx
// Runtime fallback + dynamic app bootstrap
// -------------------------------------------------
// This file sets a temporary runtime fallback for VITE_API_URL
// if it wasn't baked at build time. It then dynamically loads
// the app so that api helpers can read window.__VITE_API_URL
// during module initialization.
//
// IMPORTANT: This is a temporary safety net. Prefer fixing
// VITE_API_URL in Vercel and rebuilding. Remove this fallback
// once deployments are correct.

(function () {
  const runtimeAny = (window as any);

  // If VITE_API_URL not baked in and fallback not set yet...
  if (!import.meta.env.VITE_API_URL && !runtimeAny.__VITE_API_URL) {
    const host = window.location.hostname || "";

    // Add host checks for any production frontends you use.
    if (host.includes("agent-flow-two.vercel.app")) {
      runtimeAny.__VITE_API_URL = "https://agentflow-wc4t.onrender.com";
      console.log("[RUNTIME-FALLBACK] __VITE_API_URL =", runtimeAny.__VITE_API_URL);
    }

    // You may add additional mappings if you use other frontends:
    // if (host.includes("some-other-host")) runtimeAny.__VITE_API_URL = "https://other-backend.example.com";
  }
})();

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

async function boot() {
  // Load global CSS and App dynamically so the runtime fallback is available
  // before any modules that import the API helpers are initialized.
  await import("./index.css");

  const { default: App } = await import("./App");

  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("Root element not found");
    return;
  }

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot().catch((err) => {
  console.error("Failed to boot app", err);
});
