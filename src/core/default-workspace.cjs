const DEFAULT_ROOT_KEY = "dsh-projects:default-root:v2";
const LEGACY_WORKSPACE_KEY = "dsh-projects:default-workspace-id:v1";

function normalizePath(value) {
  return String(value || "").replace(/[\\/]+$/, "").toLowerCase();
}

function localDateSegment(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function nextSessionFolderName(entries) {
  const names = new Set((entries || []).map((entry) => String(entry.name || "").toLowerCase()));
  let suffix = 1;
  while (names.has((suffix === 1 ? "new-chat" : `new-chat-${suffix}`).toLowerCase())) suffix += 1;
  return suffix === 1 ? "new-chat" : `new-chat-${suffix}`;
}

function isPathInside(path, root) {
  const normalized = normalizePath(path);
  const normalizedRoot = normalizePath(root);
  if (!normalized || !normalizedRoot) return false;
  return normalized === normalizedRoot
    || normalized.startsWith(`${normalizedRoot}\\`)
    || normalized.startsWith(`${normalizedRoot}/`);
}

function isPortableDefaultPath(path) {
  return /[\\/]documents[\\/]dsh-default[\\/]\d{4}-\d{2}-\d{2}[\\/]new-chat(?:-\d+)?$/i
    .test(String(path || ""));
}

function safeGet(storage, key) {
  try { return storage?.getItem(key) || ""; }
  catch { return ""; }
}

function safeSet(storage, key, value) {
  try { storage?.setItem(key, value); }
  catch {}
}

function createDefaultWorkspaceManager({
  workspaces,
  storage,
  now = () => new Date(),
  documentsDirectoryName = "Documents",
  rootDirectoryName = "DSH-Default",
  maxAttempts = 1000
}) {
  if (!workspaces) throw new TypeError("workspaces service is required");

  const ensureDirectory = async (parent, name) => {
    const listing = await workspaces.listDirectory(parent);
    const existing = (listing.entries || []).find(
      (entry) => String(entry.name || "").toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing.path;
    return workspaces.createDirectory(listing.path, name);
  };

  const resolveRoot = async () => {
    const home = await workspaces.listDirectory();
    const documents = await ensureDirectory(home.path, documentsDirectoryName);
    const root = await ensureDirectory(documents, rootDirectoryName);
    safeSet(storage, DEFAULT_ROOT_KEY, root);
    return root;
  };

  const allocateSessionRoot = async () => {
    const root = await resolveRoot();
    const dateRoot = await ensureDirectory(root, localDateSegment(now()));
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const listing = await workspaces.listDirectory(dateRoot);
      const name = nextSessionFolderName(listing.entries);
      try {
        return await workspaces.createDirectory(listing.path, name);
      } catch (reason) {
        if (attempt === maxAttempts - 1) throw reason;
      }
    }
    throw new Error("could not allocate a default task folder");
  };

  const isDefaultWorkspace = (workspace) => {
    if (!workspace) return false;
    const legacyId = safeGet(storage, LEGACY_WORKSPACE_KEY);
    const storedRoot = safeGet(storage, DEFAULT_ROOT_KEY);
    return Boolean(legacyId && workspace.workspaceId === legacyId)
      || isPathInside(workspace.path, storedRoot)
      || isPortableDefaultPath(workspace.path);
  };

  return { allocateSessionRoot, isDefaultWorkspace, resolveRoot };
}

module.exports = {
  DEFAULT_ROOT_KEY,
  LEGACY_WORKSPACE_KEY,
  createDefaultWorkspaceManager,
  isPathInside,
  isPortableDefaultPath,
  localDateSegment,
  nextSessionFolderName,
  normalizePath
};
