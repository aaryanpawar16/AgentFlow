// backend/middleware/scopes.js
/**
 * requireScopes(expectedScopes: string[])
 *
 * Accepts string scopes (space/comma-separated), arrays, or object claims.
 * Logs expected vs actual scopes and returns a clear 403 on missing ones.
 */

const TYPOS = {
  // map common typos to canonical
  "calender:query": "calendar:query",
};

function normalizeScopeInput(scopes) {
  if (!scopes) return [];
  if (Array.isArray(scopes)) return scopes.map((s) => String(s).trim().toLowerCase());
  if (typeof scopes === "string") {
    return scopes
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.toLowerCase());
  }
  if (typeof scopes === "object") {
    // handle object claim with keys/values
    const vals = [];
    for (const k of Object.keys(scopes)) {
      const v = scopes[k];
      if (Array.isArray(v)) vals.push(...v.map((s) => String(s).trim().toLowerCase()));
      else if (typeof v === "string") vals.push(...v.split(/[,\s]+/).map((s) => s.trim().toLowerCase()));
    }
    return vals.map((s) => TYPOS[s] || s);
  }
  return [];
}

export function requireScopes(expected = []) {
  const expectedNormalized = normalizeScopeInput(expected).map((s) => TYPOS[s] || s);

  return (req, res, next) => {
    const jwt = req.jwt || {};
    // possible scope claim names
    let actualRaw = jwt.scope ?? jwt.scopes ?? jwt.permissions ?? jwt.permissions_string ?? null;

    // if not found, try common shapes
    if (!actualRaw && typeof jwt === "object") {
      actualRaw = jwt.scope || jwt.scopes || jwt.permissions || jwt.scope_list || jwt.claims || null;
    }

    const actual = normalizeScopeInput(actualRaw).map((s) => TYPOS[s] || s);

    console.log("[SCOPES] expected:", expectedNormalized, "actual:", actual, "jwt:", jwt);

    const missing = expectedNormalized.filter((s) => !actual.includes(s));

    if (missing.length) {
      return res.status(403).json({
        error: "missing_scopes",
        missing,
        expected: expectedNormalized,
        actual,
      });
    }

    return next();
  };
}
