// backend/services/consentVault.js
import Database from "better-sqlite3";

const db = new Database("consent.db");

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS consent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    agentId TEXT NOT NULL,
    scope TEXT NOT NULL,
    grantedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

/**
 * Record a new consent for a user/agent/scope
 */
function recordConsent(userId, agentId, scope) {
  try {
    return db
      .prepare("INSERT INTO consent (userId, agentId, scope) VALUES (?, ?, ?)")
      .run(userId, agentId, scope);
  } catch (err) {
    console.error("Error recording consent:", err.message);
    return null;
  }
}

/**
 * List all consents for a specific user
 */
function listConsentsForUser(userId) {
  try {
    return db
      .prepare("SELECT * FROM consent WHERE userId = ? ORDER BY grantedAt DESC")
      .all(userId);
  } catch (err) {
    console.error("Error fetching consents:", err.message);
    return [];
  }
}

/**
 * Replay consent (return all scopes for specific agent)
 */
function replayConsent(userId, agentId) {
  try {
    const rows = db
      .prepare("SELECT scope FROM consent WHERE userId = ? AND agentId = ?")
      .all(userId, agentId);
    return rows.map((r) => r.scope);
  } catch (err) {
    console.error("Error replaying consent:", err.message);
    return [];
  }
}

/**
 * Check if a specific consent exists
 * If demo-user → auto-grant missing consent.
 */
function consentAllows(userId, agentId, scope) {
  try {
    const row = db
      .prepare(
        "SELECT 1 FROM consent WHERE userId = ? AND agentId = ? AND scope = ? LIMIT 1"
      )
      .get(userId, agentId, scope);

    if (row) return true;

    // DEMO MODE: auto-grant for demo-user
    if (userId === "demo-user") {
      console.log(`🔑 Auto-granting scope "${scope}" for demo-user`);
      recordConsent(userId, agentId, scope);
      return true;
    }

    return false;
  } catch (err) {
    console.error("Error checking consent:", err.message);
    return false;
  }
}

/**
 * Get the latest consent record for a user/agent
 */
function getLatestConsent(userId, agentId) {
  try {
    return db
      .prepare(
        "SELECT * FROM consent WHERE userId = ? AND agentId = ? ORDER BY grantedAt DESC LIMIT 1"
      )
      .get(userId, agentId);
  } catch (err) {
    console.error("Error fetching latest consent:", err.message);
    return null;
  }
}

/**
 * Revoke (delete) consent for a user/agent/scope
 */
function deleteConsent(userId, agentId, scope) {
  try {
    return db
      .prepare(
        "DELETE FROM consent WHERE userId = ? AND agentId = ? AND scope = ?"
      )
      .run(userId, agentId, scope);
  } catch (err) {
    console.error("Error deleting consent:", err.message);
    return null;
  }
}

// ✅ Export all functions
export {
  recordConsent,
  listConsentsForUser,
  replayConsent,
  consentAllows,
  getLatestConsent,
  deleteConsent,
};
