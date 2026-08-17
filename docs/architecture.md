# Architecture

## Data ownership

- DSH Workspace owns the project record and source path.
- DSH Session owns chat history and the session working directory.
- DSH Workspace order and session order remain authoritative where public APIs exist.
- Browser `localStorage` contains only presentation preferences such as pins, favorites, and flat-list order.

Removing the plugin therefore restores the stock DSH surfaces without deleting project folders or session logs.

## Runtime halves

`src/index.js` registers a generic Connection RPC channel at `/dsh-projects`. The channel uses `authority: loopback` and owns two empty-payload endpoints: `pickDirectory` returns a selected absolute Host path or `null`, while `allocateDefaultWorkspace` atomically creates a dated ordinary-chat directory. `src/client.cjs` contributes the project picker and sidebar UI. `build.mjs` bundles the browser source and wraps it for the DSH module loader as `dist/client.js`.

Inside Electron, the bridge calls `dialog.showOpenDialog()` in the existing main process. In an ordinary local Web Host it delegates to `@deepseek-ai/dsh-host-directory-picker-native`. Non-loopback pages never call the bridge; project selection falls back to the stock Workspace picker and then the plugin's directory browser.

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
