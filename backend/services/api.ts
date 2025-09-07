// src/services/api.ts

const API_BASE = import.meta.env.VITE_API_URL || "";
export async function ensureConsent(token: string, userSub: string, agentClientId: string) {
  const res = await fetch("http://localhost:4000/orchestrator/ensure-consent", {
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

  return await res.json();
}

export async function getCalendar(token: string) {
  const res = await fetch("http://localhost:4000/calendar-api", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return await res.json();
}
