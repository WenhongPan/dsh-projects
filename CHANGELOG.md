# Changelog

All notable changes to this project will be documented here.

## Unreleased

- Add Arrow Up/Down and Enter navigation to the project picker, including active-option accessibility metadata.
- Add structured bug, compatibility, and feature-request forms plus a public product roadmap.

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
