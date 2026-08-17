import assert from "node:assert/strict";
import test from "node:test";

import {
  allocateDefaultWorkspace
} from "../src/default-workspace-host.js";

test("host allocator creates a dated default workspace without directory-picker browse", async () => {
  const created = [];
  const mkdir = async (path, options) => {
    created.push({ path, options });
    if (path.endsWith("new-chat")) {
      const error = new Error("already exists");
      error.code = "EEXIST";
      throw error;
    }
  };

  const allocation = await allocateDefaultWorkspace({
    home: "/home/demo",
    now: () => new Date(2026, 7, 17, 12, 0),
    join: (...parts) => parts.join("/"),
    mkdir
  });

  assert.deepEqual(allocation, {
    path: "/home/demo/Documents/DSH-Default/2026-08-17/new-chat-2",
    root: "/home/demo/Documents/DSH-Default"
  });
  assert.deepEqual(created[0], {
    path: "/home/demo/Documents/DSH-Default/2026-08-17",
    options: { recursive: true }
  });
  assert.deepEqual(created[2], {
    path: "/home/demo/Documents/DSH-Default/2026-08-17/new-chat-2",
    options: { recursive: false }
  });
});
