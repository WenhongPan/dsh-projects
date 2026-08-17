const assert = require("node:assert/strict");
const test = require("node:test");
const {
  composeProjectGroups,
  createProjectGroupManifest,
  normalizeProjectGroups,
  readProjectGroupManifest,
  removeProjectGroup,
  resolveProjectWorkspaceId,
  upsertProjectGroup
} = require("../src/core/project-groups.cjs");

const workspaces = [
  { workspaceId: "a", title: "App", path: "C:\\App", sessionIds: ["1", "2"] },
  { workspaceId: "b", title: "Docs", path: "C:\\Docs", sessionIds: ["2", "3"] },
  { workspaceId: "c", title: "Notes", path: "C:\\Notes", sessionIds: ["4"] }
];

test("composes a multi-folder project without copying workspace data", () => {
  const result = composeProjectGroups(workspaces, [{
    id: "product",
    title: "Product",
    primaryWorkspaceId: "b",
    memberWorkspaceIds: ["a", "b"]
  }]);
  assert.deepEqual(result.projects.map((project) => project.workspaceId), ["dshp-group:product", "c"]);
  assert.deepEqual(result.projects[0].sessionIds, ["1", "2", "3"]);
  assert.equal(result.projects[0].path, "C:\\Docs");
  assert.equal(resolveProjectWorkspaceId("dshp-group:product", result.projects), "b");
});

test("prevents one workspace from belonging to two advanced groups", () => {
  const groups = normalizeProjectGroups([
    { id: "first", title: "First", memberWorkspaceIds: ["a", "b"] },
    { id: "second", title: "Second", memberWorkspaceIds: ["b", "c"] }
  ], workspaces);
  assert.deepEqual(groups.map((group) => group.id), ["first"]);
});

test("rejects duplicate group ids even when their workspaces do not overlap", () => {
  const groups = normalizeProjectGroups([
    { id: "duplicate", title: "First", memberWorkspaceIds: ["a", "b"] },
    { id: "duplicate", title: "Second", memberWorkspaceIds: ["c", "d"] }
  ], [...workspaces, { workspaceId: "d", title: "Data", path: "C:\\Data", sessionIds: [] }]);
  assert.deepEqual(groups.map((group) => group.title), ["First"]);
});

test("drops invalid groups and safely repairs a missing primary", () => {
  const groups = normalizeProjectGroups([
    { id: "single", title: "Single", memberWorkspaceIds: ["a"] },
    { id: "valid", title: "Valid", primaryWorkspaceId: "missing", memberWorkspaceIds: ["a", "b", "missing"] }
  ], workspaces);
  assert.deepEqual(groups, [{ id: "valid", title: "Valid", primaryWorkspaceId: "a", memberWorkspaceIds: ["a", "b"] }]);
});

test("upserts and removes group manifests without touching workspaces", () => {
  const created = upsertProjectGroup([], { id: "g", title: "Group", primaryWorkspaceId: "a", memberWorkspaceIds: ["a", "b"] }, workspaces);
  const renamed = upsertProjectGroup(created, { ...created[0], title: "Renamed" }, workspaces);
  assert.equal(renamed[0].title, "Renamed");
  assert.deepEqual(removeProjectGroup(renamed, "g"), []);
  assert.equal(workspaces[0].title, "App");
});

test("migrates the alpha array format into a versioned manifest", () => {
  const legacy = [{ id: "g", title: "Group", memberWorkspaceIds: ["a", "b"] }];
  assert.deepEqual(readProjectGroupManifest(legacy), {
    schemaVersion: 1,
    groups: legacy,
    supported: true
  });
  assert.deepEqual(createProjectGroupManifest(legacy), readProjectGroupManifest(legacy));
});

test("preserves an unknown future manifest instead of downgrading it", () => {
  const future = { schemaVersion: 3, groups: [{ id: "future" }], metadata: { portable: true } };
  assert.deepEqual(readProjectGroupManifest(future), { ...future, supported: false });
});

test("covers the create, compose, repair, and dissolve lifecycle", () => {
  const created = upsertProjectGroup([], {
    id: "lifecycle",
    title: "Lifecycle",
    primaryWorkspaceId: "b",
    memberWorkspaceIds: ["a", "b", "c"]
  }, workspaces);
  const composed = composeProjectGroups(workspaces, created);
  assert.equal(resolveProjectWorkspaceId("dshp-group:lifecycle", composed.projects), "b");
  assert.deepEqual(composed.projects[0].sessionIds, ["1", "2", "3", "4"]);

  const afterPrimaryDisappears = composeProjectGroups(workspaces.filter((workspace) => workspace.workspaceId !== "b"), created);
  assert.equal(afterPrimaryDisappears.projects[0].primaryWorkspaceId, "a");
  assert.deepEqual(afterPrimaryDisappears.projects[0].memberWorkspaceIds, ["a", "c"]);

  const dissolved = composeProjectGroups(workspaces, removeProjectGroup(created, "lifecycle"));
  assert.deepEqual(dissolved.projects.map((project) => project.workspaceId), ["a", "b", "c"]);
  assert.deepEqual(dissolved.projects.map((project) => project.sessionIds), [["1", "2"], ["2", "3"], ["4"]]);
});

test("accepts the official WorkspaceView shape and preserves native workspace objects", () => {
  const officialViews = [
    {
      workspaceId: "official-a",
      title: "Official A",
      path: "C:\\Official-A",
      sessionIds: ["session-a"],
      createdAt: "2026-08-18T00:00:00.000Z",
      updatedAt: "2026-08-18T00:01:00.000Z"
    },
    {
      workspaceId: "official-b",
      title: "Official B",
      path: "C:\\Official-B",
      sessionIds: ["session-b"],
      createdAt: "2026-08-18T00:02:00.000Z",
      updatedAt: "2026-08-18T00:03:00.000Z"
    }
  ];
  const result = composeProjectGroups(officialViews, [{
    id: "official",
    title: "Official group",
    primaryWorkspaceId: "official-a",
    memberWorkspaceIds: ["official-a", "official-b"]
  }]);
  assert.equal(result.projects[0].memberWorkspaces[0], officialViews[0]);
  assert.equal(result.projects[0].memberWorkspaces[1], officialViews[1]);
  assert.deepEqual(result.projects[0].sessionIds, ["session-a", "session-b"]);
});
