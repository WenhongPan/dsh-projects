# Changelog

All notable changes to this project will be documented here.

## Unreleased

## 0.3.0-alpha.1 - 2026-08-18

- Add Arrow Up/Down and Enter navigation to the project picker, including active-option accessibility metadata.
- Add structured bug, compatibility, and feature-request forms plus a public product roadmap.
- Start the Desktop native directory chooser on the system Desktop, then remember the last selected folder's parent and safely fall back when it no longer exists.
- Group global-search results directly under their projects, keep unassigned chats under Recent, and highlight matching text.
- Show DSH-native waiting-for-input, running, and completed reminders in session rows, with per-project attention counts.
- Add Off, Compact, and Expanded attention-display modes; Expanded groups native waiting, running, and completed Sessions and opens them directly.
- Add an opt-in multi-folder project layer that groups existing DSH Workspaces, keeps one explicit primary Workspace for new Sessions, and dissolves without moving files or chats.
- Version the multi-folder manifest, migrate the pre-release array format, and preserve unknown future formats without interpreting or overwriting them.
- Keep DSH's existing session-fork action instead of adding a duplicate project-plugin menu item.
- Improve keyboard and screen-reader behavior for project menus and multi-folder dialogs, and reject corrupted duplicate group identifiers.

## 0.2.0-alpha.2 - 2026-08-17

- Fix the Desktop native picker opening a second fallback chooser after a folder was selected.
- Preserve the exact selected folder as the project workspace root.
- Fix ordinary-chat directory allocation when Desktop exposes a native-only directory picker.
- Add regression coverage for Connection RPC result envelopes and picker cancellation.

## 0.2.0-alpha.1 - 2026-08-17

- Add a loopback-only native directory picker bridge.
- Use Electron's OS chooser inside DSH Desktop without replacing the Desktop package.
- Use DSH's official cross-platform native picker for ordinary local Web hosts.
- Preserve the existing in-app directory browser as the remote and failure fallback.
- Document the alternative patched-Desktop distribution.

## 0.1.0-alpha.1 - 2026-08-17

- Initial public-alpha repository layout.
- Project picker and creation flow.
- Project-grouped and flat sidebar modes.
- Project/chat pinning, favorites, sorting, and drag ordering.
- Default no-project task directory allocation.
- Global project/title/content search integration.
- Archive center with an explicit DSH unarchive compatibility limitation.
- Light and dark theme support.
- Cross-platform path-allocation unit tests and reproducible browser bundle.
