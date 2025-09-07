// src/services/api.ts

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); // remove trailing slash if any

async function handleRes(res: Response) {
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err: any = new Error(`API error: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * Ensure consent
 * Backend route: /api/orchestrator/ensure-consent
 */
export async function ensureConsent(token: string, userSub: string, agentClientId: string) {
  const url = `${API_BASE}/api/orchestrator/ensure-consent`;
  console.log("[API] POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      userSub,
      agentClientId,
      requiredScopes: ["calendar:query"]
    })
  });

  return handleRes(res);
}

/**
 * Get calendar
 * Backend route: /api/calendar
 */
export async function getCalendar(token: string) {
  const url = `${API_BASE}/api/calendar`;
  console.log("[API] GET", url);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return handleRes(res);
}
