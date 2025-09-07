-- Consent Vault: one row per consent grant “version”
CREATE TABLE IF NOT EXISTS consents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_sub TEXT NOT NULL,
  agent_client_id TEXT NOT NULL,
  scopes TEXT NOT NULL,          -- space-delimited scopes
  version INTEGER NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,               -- optional ISO date
  verified_agent INTEGER DEFAULT 1,
  txn_id TEXT                    -- optional flow id / event id
);

-- Unique latest version per (user, agent, version)
CREATE INDEX IF NOT EXISTS idx_consents_user_agent ON consents(user_sub, agent_client_id);
