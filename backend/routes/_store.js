// backend/routes/_store.js
// Small in-memory store used by demo routes.
// NOTE: ephemeral; restarting server clears it.

export const workflows = [
  // example initial items (optional)
  { id: "wf_002", user: "demo-user", result: "success", ts: "2025-09-05T10:22:00Z" },
  { id: "wf_001", user: "demo-user", result: "success", ts: "2025-09-05T12:10:00Z" },
  { id: "wf_000", user: "demo-user", result: "consent_required", ts: "2025-09-05T11:45:00Z" },
];

// simple activity numbers for demo chart
export const activity = [6, 10, 14, 8, 12, 9];

/**
 * Add a workflow to the front of the list (maintain newest-first).
 * Returns the workflow object added.
 */
export function addWorkflow(workflow) {
  // ensure ts exists
  if (!workflow.ts) workflow.ts = new Date().toISOString();
  // avoid duplicate id - replace if exists
  const idx = workflows.findIndex((w) => w.id === workflow.id);
  if (idx !== -1) {
    workflows[idx] = workflow;
  } else {
    workflows.unshift(workflow);
  }
  // keep a reasonable length
  if (workflows.length > 200) workflows.length = 200;
  return workflow;
}

/**
 * Optional helper to push/pop activity values (for demo)
 */
export function pushActivity(value) {
  activity.push(value);
  if (activity.length > 12) activity.shift();
  return activity;
}
