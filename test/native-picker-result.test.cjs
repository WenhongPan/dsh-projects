const assert = require("node:assert/strict");
const test = require("node:test");

const { unwrapNativeDirectoryResult } = require("../src/core/native-picker-result.cjs");

test("unwraps the Connection RPC success envelope without triggering a fallback", () => {
  assert.equal(
    unwrapNativeDirectoryResult({
      ok: true,
      value: { path: "C:\\Users\\Public\\Documents\\DSH-Demo\\Project-Atlas" }
    }),
    "C:\\Users\\Public\\Documents\\DSH-Demo\\Project-Atlas"
  );
});

test("preserves cancellation from the native picker", () => {
  assert.equal(unwrapNativeDirectoryResult({ ok: true, value: { path: null } }), null);
  assert.equal(unwrapNativeDirectoryResult(null), null);
});

test("keeps compatibility with a direct directory result", () => {
  assert.equal(unwrapNativeDirectoryResult({ path: "/tmp/project" }), "/tmp/project");
  assert.equal(unwrapNativeDirectoryResult("C:\\Users\\Public\\Documents\\DSH-Showcase\\Nova-Studio"), "C:\\Users\\Public\\Documents\\DSH-Showcase\\Nova-Studio");
});

test("surfaces RPC and malformed-result failures", () => {
  assert.throws(
    () => unwrapNativeDirectoryResult({ ok: false, error: { message: "picker unavailable" } }),
    /picker unavailable/
  );
  assert.throws(() => unwrapNativeDirectoryResult({ ok: true, value: {} }), /invalid success result/);
  assert.throws(() => unwrapNativeDirectoryResult(undefined), /invalid result/);
});
