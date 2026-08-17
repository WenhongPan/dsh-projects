# Advanced Projects RFC (draft)

This document records an opt-in extension. Phase 1 (local multi-folder grouping) is implemented; project instructions, project memory, prompt injection, and Session reassignment remain unimplemented. Basic mode and existing DSH data remain unchanged.

## Product boundary

Basic mode remains the default: one visible project is one DSH Workspace, DSH owns every Session, and the plugin stores only presentation preferences.

Advanced capabilities are enabled per project and must remain independent:

1. **Multi-folder grouping** associates several Workspaces with one project label. Implemented locally with a primary Workspace for new Sessions.
2. **Project instructions** optionally load an `AGENTS.md`-style file after an explicit preview and enable action.
3. **Project memory** optionally reads a `PROJECT.md`-style file; Agent write access requires a separate permission.
4. **Session reassignment** changes only project membership and never moves files implicitly.

Enabling grouping must not enable prompt injection or Agent writes. Every capability needs a visible state, reversible disable path, and exportable schema version.

## Compatibility requirements

- Detect an installed `dsh-project` or another owner of the same metadata before enabling Advanced mode.
- Offer import only after showing which files and Workspaces will be referenced.
- Never operate two project-memory injectors for the same Session.
- Preserve attribution and license notices for any reused MIT implementation.
- Uninstalling must leave DSH Workspaces, Sessions, and project files intact.

## Open questions

- Where should the manifest live so Desktop and Web profiles can share it safely?
- How should missing or renamed Workspace paths be repaired?
- Which DSH public hook can preview and enable instruction injection without patching another plugin?
- Can Advanced mode remain useful without becoming a second Workspace browser?

Further implementation must not begin until the remaining questions have testable answers and a migration fixture. Phase 1 avoids Host files and Agent hooks: its manifest is browser-local, contains Workspace IDs rather than absolute paths, and can be removed without mutating DSH data.
