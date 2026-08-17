const PENDING_INTERACTIONS = new Set(["approval", "plan-review", "question"]);

function sessionStateKind(session) {
  if (PENDING_INTERACTIONS.has(session?.pendingInteraction)) return "attention";
  if (session?.running === true) return "running";
  if (session?.completed === true) return "completed";
  return null;
}

function attentionCount(sessions) {
  return (sessions || []).filter((session) => sessionStateKind(session) === "attention").length;
}

function attentionBuckets(sessions) {
  const buckets = { attention: [], running: [], completed: [] };
  for (const session of sessions || []) {
    const kind = sessionStateKind(session);
    if (kind) buckets[kind].push(session);
  }
  for (const list of Object.values(buckets)) {
    list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }
  return buckets;
}

module.exports = { attentionBuckets, attentionCount, sessionStateKind };
