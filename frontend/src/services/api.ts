// src/services/api.ts

const API_BASE = import.meta.env.VITE_API_URL || "";

export async function ensureConsent(
  token: string,
  userSub: string,
  agentClientId: string
) {
  const res = await fetch(`${API_BASE}/orchestrator/ensure-consent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userSub,
      agentClientId,
      requiredScopes: ["calendar:query"],
    }),
  });

  if (!res.ok) throw new Error("Failed to check consent");
  return res.json();
}

export async function getCalendar(token: string) {
  const res = await fetch(`${API_BASE}/calendar-api`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch calendar data");
  return res.json();
}
