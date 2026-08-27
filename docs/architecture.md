# Architecture

## Data ownership

- DSH Workspace owns the project record and source path.
- DSH Session owns chat history and the session working directory.
- DSH Workspace order and session order remain authoritative where public APIs exist.
- Browser `localStorage` contains presentation preferences such as pins, favorites, and flat-list order. The opt-in multi-folder layer additionally stores a versionable manifest containing a group label, member Workspace IDs, and one primary Workspace ID; it stores no paths or chat content.

Removing the plugin therefore restores the stock DSH surfaces without deleting project folders or session logs.

## Optional multi-folder composition

`src/core/project-groups.cjs` composes several existing DSH Workspaces into one browser-visible project. It never mutates the source Workspaces: Session IDs are deduplicated for display, a new Session is started in the explicit primary Workspace, and dissolving a group only removes its local manifest. A Workspace can belong to at most one group. Groups with fewer than two available Workspaces are ignored, and a missing primary is repaired to the first available member. Manual DSH Workspace reordering is disabled for composed rows because a virtual group has no DSH Workspace ID. The manifest has `schemaVersion: 1`; the pre-release array format is migrated automatically, while an unknown future version is preserved but not interpreted by an older client.

## Runtime halves

`src/index.js` registers a generic Connection RPC channel at `/dsh-projects`. The channel uses `authority: loopback` and owns two endpoints: the legacy-compatible `pickDirectory` endpoint accepts only an optional `defaultPath` string and `desktop`/`home` start location, while `allocateDefaultWorkspace` uses an empty payload and atomically creates a dated ordinary-chat directory. `src/client.cjs` contributes the project picker and sidebar UI. `build.mjs` bundles the browser source and wraps it for the DSH module loader as `dist/client.js`.

At selection time the client first checks DSH Desktop's official `window.__DSH_DESKTOP_PICK_DIRECTORY__` capability. If it is absent or throws, `src/core/directory-picker-strategy.cjs` tries the plugin's loopback Host bridge and finally the stock Workspace picker. A returned `null` is a successful cancellation, not a failure, so no second chooser opens. Inside older Electron runtimes, the compatibility bridge calls `dialog.showOpenDialog()` in the existing main process. In an ordinary local Web Host it delegates to `@deepseek-ai/dsh-host-directory-picker-native`. Non-loopback pages never call the plugin bridge and use the Host-side Workspace browser.

## Default chats

Starting without a selected project creates an ordinary DSH Workspace backed by a generated directory:

```text
home/
  Documents/
    DSH-Default/
      YYYY-MM-DD/
        new-chat/
        new-chat-2/
```

Generated Workspaces are hidden from the project list and their sessions appear under Recent. On Desktop and local loopback Web, allocation runs on the Host with Node filesystem APIs, so it does not depend on whether the composed directory picker serves `native` or `browse`. Remote Web uses the Workspace browse capability on its Host. Directory creation is retried to handle concurrent allocation.

## Compatibility boundaries

The public plugin must not patch files inside DSH or another plugin's `node_modules`. The native bridge is an optional, narrowly scoped Host capability and does not replace DSH's `directoryPicker` service. Missing capabilities should degrade visibly. In particular, archive restore must use a future public DSH API rather than redefining `archiveSession` semantics.
