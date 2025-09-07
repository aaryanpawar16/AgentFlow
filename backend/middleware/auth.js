// backend/middleware/auth.js
import descope from "../config/descope.js";
const DEMO_TOKEN = "demo-token";

export const requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth) return res.status(401).json({ error: "missing_authorization" });

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "bad_authorization_format" });

  const token = parts[1];
  if (token === DEMO_TOKEN) {
    req.jwt = { sub: "demo-user", scope: "calendar:query" };
    console.log("[AUTH] demo token used -> jwt:", req.jwt);
    return next();
  }
  if (typeof token !== "string") return res.status(401).json({ error: "invalid_token_format" });

  try {
    const validated = await descope.validateSession(token);
    req.jwt = validated?.token || validated?.payload || validated || {};
    console.log("[AUTH] validated session -> jwt:", req.jwt);
    return next();
  } catch (err) {
    console.warn("verifyJWT fallback: session validation failed. Error:", err?.message || err);
    return res.status(401).json({ error: "invalid_token", detail: err?.message || String(err) });
  }
};

// Export alias so existing imports of { verifyJWT } still work
export { requireAuth as verifyJWT };
