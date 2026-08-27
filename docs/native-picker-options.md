# Native directory picker strategy

`dsh-projects` uses a capability chain so one package can work across new Desktop releases, older local installations, and Web UI.

## 1. Official DSH Desktop bridge

DSH Desktop 2.0.3 introduced a Desktop-owned Windows picker exposed as `window.__DSH_DESKTOP_PICK_DIRECTORY__`. The plugin checks this capability at click time and uses it first. A selected absolute path or `null` cancellation is final and is never followed by another chooser.

The official implementation is tracked in [DSH Desktop PR #246](https://github.com/anywhere-labs/dsh-desktop/pull/246).

## 2. Plugin compatibility bridge

When the Desktop-owned capability is absent, the package retains its loopback-only Host bridge:

- DSH Desktop: dynamically imports Electron in the existing main process and calls `dialog.showOpenDialog()`.
- Local `dsh web`: delegates to `@deepseek-ai/dsh-host-directory-picker-native`.
- Remote Web: does not call this bridge.

The RPC channel uses DSH Connection's loopback authority. Its picker request accepts only a validated start location and an optional remembered parent directory.

## 3. Stock Workspace picker and in-app browser

If both bridges are unavailable or fail, the plugin calls `ctx.workspaces.pickDirectory()`. When DSH exposes only the browse capability, project creation opens the existing Host-side in-app directory browser. This is also the authoritative behavior for remote Web UI.

## Historical patched Desktop build

The unsigned patched installer published with `v0.2.0-alpha.2` solved the missing Desktop capability before an official implementation existed. It has now been superseded and should not be installed on current Desktop releases. Its source and checksum remain available only for historical reproducibility:

- [v0.2.0-alpha.2 release](https://github.com/WenhongPan/dsh-projects/releases/tag/v0.2.0-alpha.2)
- [Historical patch source](https://github.com/WenhongPan/deepseek-harness-desktop/tree/agent/native-directory-picker)
- [Superseded upstream review #159](https://github.com/anywhere-labs/deepseek-harness-desktop/pull/159)

Do not replace a current official Desktop installation with this historical build.
