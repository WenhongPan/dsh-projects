# dsh-projects v0.3.0-alpha.1

This alpha turns the original project sidebar into a more complete organization layer while continuing to use DeepSeek Harness Workspace and Session data.

## Highlights

- Group multiple existing Workspaces under one optional project and choose the primary Workspace used by new Sessions.
- Show native waiting-for-input, running, and completed states as Off, Compact, or Expanded attention summaries.
- Group global-search results directly by project and highlight matching project, title, and chat-body text.
- Remember the previous folder-picker location or start from Desktop, Home, or the current project's parent.
- Navigate the project picker with Arrow Up/Down and Enter, with improved dialog and menu accessibility.
- Preserve DSH's existing session-fork action instead of adding a competing duplicate.

## Install or upgrade

Desktop profile:

```powershell
dsh plugin --profile desktop add https://github.com/WenhongPan/dsh-projects/releases/download/v0.3.0-alpha.1/dsh-projects-0.3.0-alpha.1.tgz
```

Web profile:

```bash
dsh plugin --profile web add https://github.com/WenhongPan/dsh-projects/releases/download/v0.3.0-alpha.1/dsh-projects-0.3.0-alpha.1.tgz
```

Fully quit and restart the selected profile after upgrading.

## Validation

- Automated syntax, bundle, and unit tests on Node.js 20, 22, and 24 across Windows, macOS, and Linux.
- Manual DSH Desktop 2.0.1 validation on Windows x64 for dark/light themes, native folder picking, picker-location persistence, global chat-body search, archive inspection, attention-display settings, and the multi-folder editor.

## Known limits

- Restoring archived chats remains unavailable until the installed DSH version exposes a public unarchive API.
- macOS, Linux, and local Web UI paths pass CI but still need more community-reported manual compatibility results.
- Multi-folder projects store only local grouping metadata and do not move files or chats.

Please report private-path-free results through the repository's compatibility or bug forms.
