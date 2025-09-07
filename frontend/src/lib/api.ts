// src/lib/api.ts
export const LOCAL_STORAGE_TOKEN_KEY = "agentflow_auth_token";
export const DEMO_TOKEN = "demo-token"; // change to env var if you prefer
export const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:4000";

/**
 * Returns the Authorization header value based on saved token,
 * falling back to DEMO_TOKEN.
 */
function tokenHeaderValue() {
  try {
    const t = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    return `Bearer ${t || DEMO_TOKEN}`;
  } catch {
    return `Bearer ${DEMO_TOKEN}`;
  }
}

/**
 * Centralized fetch wrapper that resolves path -> absolute URL,
 * attaches common headers, parses JSON and throws helpful errors.
 */
export async function apiFetch<T = any>(path: string, opts: RequestInit = {}) {
  const url = path.startsWith("http://") || path.startsWith("https://") ? path : `${API_BASE}${path}`;

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: tokenHeaderValue(),
  };

  const merged: RequestInit = {
    ...opts,
    headers: { ...defaultHeaders, ...(opts.headers as Record<string, string> | undefined) },
    credentials: "include",
  };

  const res = await fetch(url, merged);
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    // try parse JSON error for better message
    try {
      if (ct.includes("application/json")) {
        const parsed = JSON.parse(text);
        const msg = parsed?.message || parsed?.error || JSON.stringify(parsed);
        console.error(`[apiFetch] HTTP ${res.status} ${url}`, msg);
        throw new Error(msg || `HTTP ${res.status} ${res.statusText}`);
      }
    } catch {
      // fallthrough
    }
    console.error(`[apiFetch] HTTP ${res.status} ${url}`, text);
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      console.error("[apiFetch] JSON parse error for", url, "body:", text);
      throw e;
    }
  }

  console.error("[apiFetch] Expected JSON but got non-JSON response for", url, "body:", text);
  throw new Error("Invalid JSON response");
}
