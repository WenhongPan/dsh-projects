const assert = require("node:assert/strict");
const test = require("node:test");

const { pickProjectDirectory } = require("../src/core/directory-picker-strategy.cjs");

test("prefers the Desktop-owned picker over legacy and Workspace pickers", async () => {
  let legacyCalls = 0;
  let workspaceCalls = 0;
  const selected = await pickProjectDirectory({
    desktopPicker: async () => "C:\\Projects\\alpha",
    legacyPicker: async () => { legacyCalls += 1; return { path: "C:\\legacy" }; },
    workspacePicker: async () => { workspaceCalls += 1; return "C:\\workspace"; }
  });
  assert.equal(selected, "C:\\Projects\\alpha");
  assert.equal(legacyCalls, 0);
  assert.equal(workspaceCalls, 0);
});

test("treats Desktop cancellation as final instead of opening another picker", async () => {
  let fallbackCalls = 0;
  const selected = await pickProjectDirectory({
    desktopPicker: async () => null,
    legacyPicker: async () => { fallbackCalls += 1; return "C:\\legacy"; },
    workspacePicker: async () => { fallbackCalls += 1; return "C:\\workspace"; }
  });
  assert.equal(selected, null);
  assert.equal(fallbackCalls, 0);
});

test("falls back through the legacy bridge to the Workspace picker", async () => {
  const fallbacks = [];
  const fromLegacy = await pickProjectDirectory({
    desktopPicker: async () => { throw new Error("desktop unavailable"); },
    legacyPicker: async () => ({ ok: true, value: { path: "D:\\科研\\项目" } }),
    workspacePicker: async () => "C:\\workspace",
    onFallback: (source) => fallbacks.push(source)
  });
  assert.equal(fromLegacy, "D:\\科研\\项目");
  assert.deepEqual(fallbacks, ["desktop"]);

  const fromWorkspace = await pickProjectDirectory({
    desktopPicker: null,
    legacyPicker: async () => { throw new Error("legacy unavailable"); },
    workspacePicker: async () => ({ path: "/srv/projects/alpha" }),
    onFallback: (source) => fallbacks.push(source)
  });
  assert.equal(fromWorkspace, "/srv/projects/alpha");
  assert.deepEqual(fallbacks, ["desktop", "legacy"]);
});

test("surfaces the final Workspace picker failure", async () => {
  await assert.rejects(
    pickProjectDirectory({
      desktopPicker: async () => { throw new Error("desktop unavailable"); },
      legacyPicker: async () => { throw new Error("legacy unavailable"); },
      workspacePicker: async () => { throw new Error("workspace unavailable"); }
    }),
    /workspace unavailable/
  );
});
