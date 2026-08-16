const assert = require("node:assert/strict");
const test = require("node:test");

const { unwrapNativeDirectoryResult } = require("../src/core/native-picker-result.cjs");

test("unwraps the Connection RPC success envelope without triggering a fallback", () => {
  assert.equal(
    unwrapNativeDirectoryResult({
      ok: true,
      value: { path: "C:\\Users\\panwe\\Desktop\\C语言学习" }
    }),
    "C:\\Users\\panwe\\Desktop\\C语言学习"
  );
});

test("preserves cancellation from the native picker", () => {
  assert.equal(unwrapNativeDirectoryResult({ ok: true, value: { path: null } }), null);
});

test("keeps compatibility with a direct directory result", () => {
  assert.equal(unwrapNativeDirectoryResult({ path: "/tmp/project" }), "/tmp/project");
});

test("surfaces RPC and malformed-result failures", () => {
  assert.throws(
    () => unwrapNativeDirectoryResult({ ok: false, error: { message: "picker unavailable" } }),
    /picker unavailable/
  );
  assert.throws(() => unwrapNativeDirectoryResult({ ok: true, value: {} }), /invalid success result/);
  assert.throws(() => unwrapNativeDirectoryResult(undefined), /invalid result/);
});
