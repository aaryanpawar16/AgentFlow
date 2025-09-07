// backend/services/api.ts
import fetch from "node-fetch";

/**
 * A small wrapper around fetch for backend services.
 * Use this to call external APIs (e.g. Google, Descope, etc.).
 */

export async function callExternalApi(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    const res = await fetch(url, options);
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const err: any = new Error(
        `External API error: ${res.status} ${res.statusText}`
      );
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.error("[External API Error]", err);
    throw err;
  }
}
