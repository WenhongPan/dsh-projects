const assert = require("node:assert/strict");
const test = require("node:test");
const { attentionBuckets, attentionCount, sessionStateKind } = require("../src/core/session-state.cjs");

test("pending interaction outranks running and completion", () => {
  assert.equal(sessionStateKind({ pendingInteraction: "question", running: true, completed: true }), "attention");
  assert.equal(sessionStateKind({ running: true, completed: true }), "running");
  assert.equal(sessionStateKind({ completed: true }), "completed");
  assert.equal(sessionStateKind({}), null);
});

test("counts only sessions that need user attention", () => {
  assert.equal(attentionCount([
    { pendingInteraction: "approval" },
    { pendingInteraction: "plan-review" },
    { running: true },
    { completed: true }
  ]), 2);
});

test("groups actionable session summaries by priority and recent activity", () => {
  const buckets = attentionBuckets([
    { id: "done", completed: true, updatedAt: 1 },
    { id: "question-old", pendingInteraction: "question", updatedAt: 2 },
    { id: "running", running: true, updatedAt: 3 },
    { id: "question-new", pendingInteraction: "approval", updatedAt: 4 },
    { id: "idle", updatedAt: 5 }
  ]);
  assert.deepEqual(buckets.attention.map((item) => item.id), ["question-new", "question-old"]);
  assert.deepEqual(buckets.running.map((item) => item.id), ["running"]);
  assert.deepEqual(buckets.completed.map((item) => item.id), ["done"]);
});
