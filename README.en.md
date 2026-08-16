# dsh-projects

English · [简体中文](README.md)

Project-oriented Workspace and Session management for DeepSeek Harness.

> Status: `0.2.0-alpha.1`. Windows x64 with DSH Desktop 2.0.1 and DeepSeek Harness 0.1.0-rc.6 is the primary verification target. Native pickers on other platforms still need manual coverage.

## Highlights

- Searchable project picker above the new-session composer.
- Start without choosing a project; allocate `~/Documents/DSH-Default/YYYY-MM-DD/new-chat[-N]` automatically.
- Create a project with an independent display name and source directory.
- Prefer an OS directory chooser for local Desktop and local Web sessions, then fall back to the in-app browser.
- Project-grouped and flat sidebar layouts with a separate Recent section.
- Project/chat pinning, project favorites, and manual drag ordering.
- Hover summaries for projects and chats.
- Rename, open in the system file manager, archive chats, and remove project registrations.
- Search project names, chat titles, and—when DSH indexing is enabled—chat contents.
- Inspect archived chats. Restore depends on a future public DSH unarchive capability.
- DSH light and dark theme tokens.

The plugin projects DSH's native Workspace and Session data. It does not create a second project database, and uninstalling it does not delete folders or session logs.

## Local development install

```bash
dsh plugin --profile web add link:/path/to/dsh-projects
```

For DSH Desktop, use `--profile desktop`. Restart the selected profile after installation or upgrade.

## Directory picker options

The repository supports two deployment choices:

1. **Plugin native bridge (default):** ships with `dsh-projects` and does not replace Desktop. Its RPC endpoint accepts loopback pages only. Desktop uses Electron's OS chooser; ordinary local Web uses DSH's cross-platform native picker. Failures and remote pages fall back to the in-app browser.
2. **Patched Desktop build:** restores composition of DSH's official native picker, benefiting every compatible plugin that calls `ctx.workspaces.pickDirectory()`. See [native picker options](docs/native-picker-options.md) for the installer and upstream PR status.

“Local Web” means that the browser reaches DSH through `localhost`, `127.0.0.1`, or `::1` on the same computer. A remote browser never opens a chooser on the Host machine through this bridge.

## Development

```bash
npm install
npm run verify
npm pack --dry-run
```

See [compatibility](docs/compatibility.md) and [architecture](docs/architecture.md) for platform and data-boundary details.

## License

MIT. Codex, OpenAI, DeepSeek, and DeepSeek Harness names and trademarks belong to their respective owners and are referenced only for compatibility and design attribution.
