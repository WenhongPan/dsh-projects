# dsh-projects

English · [简体中文](README.md)

Project-oriented Workspace and Session management for DeepSeek Harness.

> Status: `0.1.0-alpha.1`. Manually used on Windows x64 with DSH Desktop 2.0.0 and DeepSeek Harness 0.1.0-rc.6. Other platforms are not verified yet.

## Highlights

- Searchable project picker above the new-session composer.
- Start without choosing a project; allocate `~/Documents/DSH-Default/YYYY-MM-DD/new-chat[-N]` automatically.
- Create a project with an independent display name and source directory.
- Fall back to an in-app directory browser when the native picker is unavailable.
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

## Development

```bash
npm install
npm run verify
npm pack --dry-run
```

See [compatibility](docs/compatibility.md) and [architecture](docs/architecture.md) for platform and data-boundary details.

## License

MIT. Codex, OpenAI, DeepSeek, and DeepSeek Harness names and trademarks belong to their respective owners and are referenced only for compatibility and design attribution.
