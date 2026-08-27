# dsh-projects 0.3.0-alpha.2

This compatibility release follows the DSH `0.1.1-rc.2` and DSH Desktop 2.0.3 environment changes without replacing the plugin's project model or migrating user data.

## Highlights

- Uses the official DSH Desktop Windows directory bridge when available.
- Retains the plugin loopback bridge for older Desktop and local Web installations.
- Falls back to DSH's stock Workspace picker and Host-side browser.
- Prevents cancellation or a direct string result from opening a second chooser.
- Replaces the broad prerelease peer caret with the explicit set of currently published previews, while CI verifies the `0.1.0-rc.6` and `0.1.1-rc.2` endpoints.
- Moves marketplace screenshot ordering into this repository through `screenshots.json`.

## Verification gates

- `npm run verify`
- `npm pack --dry-run`
- peer-range and exact-package checks against both supported DSH lines
- isolated DSH `0.1.1-rc.2` Web UI boot and plugin-surface smoke test
- DSH Desktop 2.0.3 manual pass for plugin loading, the official Windows picker, cancellation, and exact CJK/space path round-trip

The patched Desktop installer from earlier releases is superseded by the official Desktop implementation and is no longer recommended.
