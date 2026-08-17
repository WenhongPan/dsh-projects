# dsh-projects

English · [简体中文](README.md)

> Turn DeepSeek Harness workspaces and sessions into searchable, organized projects.

[![Release](https://img.shields.io/github/v/release/WenhongPan/dsh-projects?include_prereleases&label=release)](https://github.com/WenhongPan/dsh-projects/releases/latest)
[![CI](https://github.com/WenhongPan/dsh-projects/actions/workflows/ci.yml/badge.svg)](https://github.com/WenhongPan/dsh-projects/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/WenhongPan/dsh-projects)](LICENSE)

![dsh-projects project picker, create-project dialog, and native Windows folder picker](docs/assets/demo.gif)

DSH makes it easy to enter a Workspace, but folder selection and a flat session list become difficult to navigate as your work grows. `dsh-projects` adds a project layer over DSH's native Workspace and Session data: select and create projects, organize the sidebar, search chats, and inspect archived work without copying or migrating existing sessions.

## At a glance

| Capability | What it gives you |
| --- | --- |
| Project entry | Search and switch projects above the composer, or start without choosing one |
| Project creation | Keep display names independent from folders and prefer the OS directory chooser locally |
| Sidebar | Group by project or use one list, with Recent, pinning, favorites, and drag ordering |
| Management | Rename, open in the file manager, archive chats, and remove project registrations |
| Global search | Search projects and chat titles; optionally include chat bodies through DSH indexing |
| Archive center | Inspect archived chats; restore depends on a public DSH unarchive API |
| Theme and data | Follow DSH light/dark themes and keep using DSH's own Workspace and Session data |

<p>
  <img src="docs/assets/picker.webp" alt="Searchable project picker" width="49%">
  <img src="docs/assets/create.webp" alt="Create a project" width="49%">
</p>

## Quick install

The current version is `0.2.0-alpha.2`. Windows x64 with DSH Desktop 2.0.1 and DeepSeek Harness 0.1.0-rc.6 is the primary verified environment.

### DSH Desktop

```powershell
dsh plugin --profile desktop add https://github.com/WenhongPan/dsh-projects/releases/download/v0.2.0-alpha.2/dsh-projects-0.2.0-alpha.2.tgz
```

### DSH Web UI

```bash
dsh plugin --profile web add https://github.com/WenhongPan/dsh-projects/releases/download/v0.2.0-alpha.2/dsh-projects-0.2.0-alpha.2.tgz
```

Fully quit and restart the selected DSH profile after installation or upgrade. Desktop and Web are separate profiles and must be installed independently.

Source install is also available:

```bash
git clone https://github.com/WenhongPan/dsh-projects.git
cd dsh-projects
npm install
npm run verify
dsh plugin --profile desktop add link:/absolute/path/to/dsh-projects
```

On Windows, a link path can be written as `link:C:/path/to/dsh-projects`.

## Native folder picking

The plugin includes its own native directory bridge, so regular users do not need to replace Desktop:

- DSH Desktop opens Electron's operating-system directory chooser.
- Local Web UI on the same machine delegates to DSH's official cross-platform native picker.
- Remote Web UI and failures fall back to DSH's in-app Host directory browser.

An optional **patched DSH Desktop** build is available in Releases for users who want every compatible plugin to receive a Desktop-level native picker. It is not required by `dsh-projects`. See [native picker options](docs/native-picker-options.md) for the trade-offs and checksum instructions.

![Native Windows directory chooser](docs/assets/native.webp)

## Chat without choosing a project

A regular chat receives an isolated task directory automatically:

```text
~/Documents/DSH-Default/YYYY-MM-DD/new-chat[-N]
```

Default tasks stay out of the Projects section but remain available in Recent. Each chat gets its own workspace instead of treating the whole Documents or home directory as writable.

## Compatibility

| Surface | Current status |
| --- | --- |
| DSH Desktop 2.0.1 / Windows x64 | ✅ Manually verified, including the native directory chooser |
| Local DSH Web UI / Windows | 🟡 Designed to work; more manual regression coverage is needed |
| DSH Desktop / macOS Apple Silicon | 🟡 CI passes; native picker and file-manager actions need manual coverage |
| Local Web UI / macOS and Linux | 🟡 CI passes; Host paths and local directory rules need manual coverage |
| Remote Web UI | ✅ Uses the Host-side in-app browser and never opens an OS dialog remotely |

See the full [compatibility matrix](docs/compatibility.md) and [architecture notes](docs/architecture.md). DeepSeek Harness is still a Developer Preview, so runtime upgrades may require compatibility work.

## Optional chat-body search

Project and chat-title search work by default. Chat-body search requires the DSH session index in the target profile's `cordis.patch.yml`:

```yaml
- id: session-query-sqlite
  config:
    path: !!js dshHomePath('session-search.sqlite')
    openAt: first-search
```

The index contains data derived from chat content and should receive the same privacy protection as the original sessions.

## Data and uninstalling

The plugin does not create a second project database, and uninstalling it does not delete folders or session logs. Grouping, ordering, pins, and favorites are browser-local display preferences stored in `localStorage`; clearing site data only resets those preferences.

## Development and feedback

```bash
npm install
npm run verify
npm pack --dry-run
```

This is an alpha release. Please open an [Issue](https://github.com/WenhongPan/dsh-projects/issues) for compatibility problems, ideas, and especially new platform test results. See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md) for contribution and release details.

## License

MIT
