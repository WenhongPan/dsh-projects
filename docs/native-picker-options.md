# Native directory picker options

`dsh-projects` supports two independent ways to obtain an operating-system directory chooser.

## Option A: plugin native bridge

This is the default and is included in the plugin package.

- DSH Desktop: dynamically imports Electron in the existing main process and calls `dialog.showOpenDialog()`.
- Local `dsh web`: delegates to `@deepseek-ai/dsh-host-directory-picker-native`.
- Remote Web: does not call the bridge and uses the in-app Host directory browser.
- Failure: automatically falls back; project creation remains available.

The RPC channel uses DSH Connection's loopback authority. It accepts an empty request only, so a caller cannot submit or probe arbitrary paths through the bridge.

## Option B: patched DSH Desktop

DSH Desktop 2.0.1 pins the browse directory-picker pair on Windows after all user patches. The patched build replaces that Windows-only override with a Desktop-owned adapter over DSH's official native picker and client surface. The adapter starts the official dialog worker in Electron's Node subprocess mode and preserves the standard directory-picker seam, so every compatible plugin using `ctx.workspaces.pickDirectory()` benefits.

Use this option when you want the native chooser to be a Desktop-wide capability rather than a feature owned by `dsh-projects`.

- Patched installer and SHA-256: [v0.2.0-alpha.1 release](https://github.com/WenhongPan/dsh-projects/releases/tag/v0.2.0-alpha.1)
- Patch source: [WenhongPan/deepseek-harness-desktop branch](https://github.com/WenhongPan/deepseek-harness-desktop/tree/agent/native-directory-picker)
- Upstream review: [anywhere-labs/deepseek-harness-desktop#159](https://github.com/anywhere-labs/deepseek-harness-desktop/pull/159)

The installer is unsigned. Windows SmartScreen may therefore ask for confirmation; verify the published SHA-256 before running it.

The two options may coexist. `dsh-projects` tries its bridge first; if it is unavailable, it calls the standard Workspace picker.
