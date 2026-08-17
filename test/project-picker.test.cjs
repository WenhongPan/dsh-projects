const assert = require("node:assert/strict");
const test = require("node:test");
const { initialProjectIndex, nextProjectIndex } = require("../src/core/project-picker.cjs");

const projects = [
  { workspaceId: "alpha" },
  { workspaceId: "beta" },
  { workspaceId: "gamma" }
];

test("selects the current project when the picker opens", () => {
  assert.equal(initialProjectIndex(projects, "beta"), 1);
  assert.equal(initialProjectIndex(projects, "missing"), 0);
  assert.equal(initialProjectIndex([], "missing"), -1);
});

test("moves the keyboard selection with wraparound", () => {
  assert.equal(nextProjectIndex(0, 1, 3), 1);
  assert.equal(nextProjectIndex(2, 1, 3), 0);
  assert.equal(nextProjectIndex(0, -1, 3), 2);
  assert.equal(nextProjectIndex(-1, 1, 3), 0);
  assert.equal(nextProjectIndex(-1, -1, 3), 2);
  assert.equal(nextProjectIndex(0, 1, 0), -1);
});
