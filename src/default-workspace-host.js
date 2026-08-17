/** Host-side allocator for chats that are not attached to a named project. */

import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

function localDateSegment(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

async function allocateDefaultWorkspace(internals = {}) {
  const home = internals.home ?? homedir();
  const now = internals.now?.() ?? new Date();
  const mkdirDirectory = internals.mkdir ?? mkdir;
  const joinPath = internals.join ?? join;
  const maxAttempts = internals.maxAttempts ?? 1000;
  const root = joinPath(home, "Documents", "DSH-Default");
  const dateRoot = joinPath(root, localDateSegment(now));

  await mkdirDirectory(dateRoot, { recursive: true });
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const name = attempt === 1 ? "new-chat" : `new-chat-${attempt}`;
    const path = joinPath(dateRoot, name);
    try {
      await mkdirDirectory(path, { recursive: false });
      return { path, root };
    } catch (reason) {
      if (reason?.code !== "EEXIST" || attempt === maxAttempts) throw reason;
    }
  }
  throw new Error("could not allocate a default task folder");
}

export {
  allocateDefaultWorkspace,
  localDateSegment
};
