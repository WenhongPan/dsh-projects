# Roadmap

`dsh-projects` is still an alpha. The immediate goal is dependable project and session organization on top of DSH's own Workspace and Session data, not a second project database.

## Stabilize first

- Verify install, upgrade, disable, and uninstall on DSH Desktop and the Web UI.
- Collect real macOS and Linux compatibility reports.
- Keep the native directory bridge aligned with upstream DSH interfaces.
- Improve diagnostics when optional chat-content search is unavailable.
- Restore archived sessions when the installed DSH version exposes a supported unarchive API.

## Next candidates

- Export and import sidebar preferences such as pins, favorites, and manual ordering.
- Add a compact project information view with its folder, task count, and recent activity.
- Improve keyboard navigation and screen-reader labels across menus and dialogs.
- Add compatibility checks for common sidebar, session, and directory-picker plugins.
- Offer an opt-in project template flow without creating or copying files unexpectedly.

## Later exploration

- Project-scoped session handoff summaries.
- Optional project tags and filters.
- Portable project metadata that can be shared without including chat content or local absolute paths.

## Non-goals

- Replacing DSH's Workspace or Session storage.
- Moving or deleting project files during import, removal, or uninstall.
- Hidden telemetry or uploading local project information.

Feature priorities will follow reproducible user reports rather than the length of this list. Open a feature request with the workflow that is currently difficult and the smallest behavior that would solve it.
