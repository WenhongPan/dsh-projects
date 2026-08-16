const assert = require("node:assert/strict");
const test = require("node:test");
const {
  DEFAULT_ROOT_KEY,
  createDefaultWorkspaceManager,
  isPathInside,
  isPortableDefaultPath,
  localDateSegment,
  nextSessionFolderName
} = require("../src/core/default-workspace.cjs");

test("allocates stable local date segments", () => {
  assert.equal(localDateSegment(new Date(2026, 7, 17, 23, 59)), "2026-08-17");
});

test("allocates the first available new-chat suffix case-insensitively", () => {
  assert.equal(nextSessionFolderName([]), "new-chat");
  assert.equal(nextSessionFolderName([{ name: "NEW-CHAT" }, { name: "new-chat-2" }]), "new-chat-3");
});

test("recognizes Windows and POSIX descendants without prefix collisions", () => {
  assert.equal(isPathInside("C:\\Users\\me\\Documents\\DSH-Default\\x", "C:\\Users\\me\\Documents\\DSH-Default"), true);
  assert.equal(isPathInside("/home/me/Documents/DSH-Default/x", "/home/me/Documents/DSH-Default"), true);
  assert.equal(isPathInside("/home/me/Documents/DSH-Default-old/x", "/home/me/Documents/DSH-Default"), false);
});

test("recognizes generated default task paths on both separator styles", () => {
  assert.equal(isPortableDefaultPath("C:\\Users\\me\\Documents\\DSH-Default\\2026-08-17\\new-chat-2"), true);
  assert.equal(isPortableDefaultPath("/home/me/Documents/DSH-Default/2026-08-17/new-chat"), true);
  assert.equal(isPortableDefaultPath("/home/me/Documents/other/2026-08-17/new-chat"), false);
});

test("creates home/Documents/DSH-Default/date and stores the discovered root", async () => {
  const directories = new Map([
    ["", { path: "/home/me", entries: [] }],
    ["/home/me", { path: "/home/me", entries: [] }]
  ]);
  const storage = new Map();
  const workspaces = {
    async listDirectory(path = "") {
      return directories.get(path) || { path, entries: [] };
    },
    async createDirectory(parent, name) {
      const path = `${parent}/${name}`;
      const listing = directories.get(parent) || { path: parent, entries: [] };
      listing.entries.push({ name, path, directory: true });
      directories.set(parent, listing);
      directories.set(path, { path, entries: [] });
      return path;
    }
  };
  const manager = createDefaultWorkspaceManager({
    workspaces,
    storage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value)
    },
    now: () => new Date(2026, 7, 17, 12, 0)
  });

  assert.equal(
    await manager.allocateSessionRoot(),
    "/home/me/Documents/DSH-Default/2026-08-17/new-chat"
  );
  assert.equal(storage.get(DEFAULT_ROOT_KEY), "/home/me/Documents/DSH-Default");
});
