const assert = require("node:assert/strict");
const test = require("node:test");
const { parentDirectory } = require("../src/core/picker-history.cjs");

test("remembers the parent of Windows, POSIX, and root-level folders", () => {
  assert.equal(parentDirectory("C:\\Users\\example\\Desktop\\demo"), "C:\\Users\\example\\Desktop");
  assert.equal(parentDirectory("C:\\demo"), "C:\\");
  assert.equal(parentDirectory("/Users/example/demo"), "/Users/example");
  assert.equal(parentDirectory("/demo"), "/");
  assert.equal(parentDirectory(""), "");
});
