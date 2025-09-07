// src/services/api.ts

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (window as any).__VITE_API_URL ||
  ""
).replace(/\/+$/, "");

console.log("[API_BASE]", API_BASE);

async function handleRes(res: Response) {
  const txt = await res.text();
  let data;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  if (!res.ok) {
    const err: any = new Error(`${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function ensureConsent(token: string, userSub: string, agentClientId: string) {
  const url = `${API_BASE}/api/orchestrator/ensure-consent`;
  console.log("[API] POST", url);
  return handleRes(await fetch(url, {
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
  }));
}

export async function getCalendar(token: string) {
  const url = `${API_BASE}/api/calendar`;
  console.log("[API] GET", url);
  return handleRes(await fetch(url, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  }));
}

export async function getWorkflows() {
  const url = `${API_BASE}/api/workflows`;
  console.log("[API] GET", url);
  return handleRes(await fetch(url));
}

export async function getActivity() {
  const url = `${API_BASE}/api/activity`;
  console.log("[API] GET", url);
  return handleRes(await fetch(url));
}
