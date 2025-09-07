// src/main.tsx
// TEMP: Fetch/XHR tracer + Localhost -> Prod rewrite + runtime fallback
// --------------------------------------------------------------------
// This file contains short-lived debugging & emergency fixes to ensure the
// deployed site doesn't call localhost and to help trace any remaining callers.
// Remove the tracer and rewrite once the source is fixed and the bundle rebuilt.

/* ----------------- FETCH/XHR TRACER (diagnostic) ----------------- */
;(function () {
  try {
    const host = window.location.hostname || "";
    // Only enable tracer on your production frontend to avoid noisy logs locally
    if (!host.includes("agent-flow-two.vercel.app")) return;

    const origFetch = window.fetch.bind(window);
    window.fetch = async function (input: RequestInfo, init?: RequestInit) {
      try {
        const url = typeof input === "string" ? input : (input as Request).url;
        if (typeof url === "string" && url.includes("localhost")) {
          console.warn("[FETCH-TRACE] outgoing fetch to", url);
          console.warn("[FETCH-TRACE] stack:\n", new Error().stack);
        }
      } catch (e) {
        console.error("[FETCH-TRACE] inspect error", e);
      }
      return origFetch(input, init);
    };

    // XHR tracer
    (function () {
      const OrigXHR = window.XMLHttpRequest;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).XMLHttpRequest = function () {
        const xhr = new (OrigXHR as any)();
        const origOpen = xhr.open;
        xhr.open = function (method: any, url: string, ...rest: any[]) {
          try {
            if (typeof url === "string" && url.includes("localhost")) {
              console.warn("[XHR-TRACE] outgoing XHR to", url);
              console.warn("[XHR-TRACE] stack:\n", new Error().stack);
            }
          } catch (e) {}
          return origOpen.call(this, method, url, ...rest);
        };
        return xhr;
      } as unknown as typeof XMLHttpRequest;
    })();

    console.log("[FETCH-TRACE] installed fetch/xhr tracers");
  } catch (err) {
    // do not break app if tracer fails
    // eslint-disable-next-line no-console
    console.error("[FETCH-TRACE] install failed", err);
  }
})();

/* ------------- LOCALHOST -> PROD REWRITE (EMERGENCY) -------------- */
;(function () {
  try {
    const host = window.location.hostname || "";
    // Only enable on your deployed frontend host
    if (!host.includes("agent-flow-two.vercel.app")) return;

    const PROD = "https://agentflow-wc4t.onrender.com";
    const origFetch = window.fetch.bind(window);

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      try {
        const url = typeof input === "string" ? input : (input as Request).url;
        if (typeof url === "string" && url.includes("localhost:4000")) {
          const newUrl = url.replace(/https?:\/\/localhost:4000/, PROD);
          console.warn("[LOCALHOST-REWRITE] rewrite:", url, "->", newUrl);
          return origFetch(newUrl, init);
        }
      } catch (e) {
        // ignore rewrite errors and fall back to original fetch
      }
      return origFetch(input, init);
    };

    // XHR rewrite (for any legacy code using XHR)
    (function () {
      const OrigXHR = window.XMLHttpRequest;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).XMLHttpRequest = function () {
        const xhr = new (OrigXHR as any)();
        const origOpen = xhr.open;
        xhr.open = function (method: any, url: string, ...rest: any[]) {
          try {
            if (typeof url === "string" && url.includes("localhost:4000")) {
              const newUrl = url.replace(/https?:\/\/localhost:4000/, PROD);
              console.warn("[LOCALHOST-REWRITE-XHR] rewrite:", url, "->", newUrl);
              return origOpen.call(this, method, newUrl, ...rest);
            }
          } catch (e) {}
          return origOpen.call(this, method, url, ...rest);
        };
        return xhr;
      } as unknown as typeof XMLHttpRequest;
    })();

    console.log("[LOCALHOST-REWRITE] installed (temporary emergency patch)");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[LOCALHOST-REWRITE] failed", err);
  }
})();

/* ----------------- RUNTIME FALLBACK (existing) ----------------- */
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

/* ----------------- APP BOOTSTRAP ----------------- */
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
