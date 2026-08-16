const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

test("browser bundle registers a DSH client module", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "dist", "client.js"), "utf8");
  let descriptor;
  const react = { createElement: () => null };
  const reactDom = { createPortal: () => null };
  const context = {
    console,
    window: {
      __ModuleLoader__: {
        load(value) { descriptor = value; }
      }
    }
  };
  vm.runInNewContext(source, context, { filename: "dist/client.js" });
  assert.equal(descriptor.id, "dsh-projects");
  const plugin = descriptor.factory((id) => {
    if (id === "react") return react;
    if (id === "react-dom") return reactDom;
    throw new Error(`unexpected module: ${id}`);
  });
  assert.equal(plugin.name, "dsh-projects");
  assert.equal(typeof plugin.apply, "function");
  assert.deepEqual(Array.from(plugin.inject), ["slots", "locale", "sessions", "workspaces", "connection"]);
});
