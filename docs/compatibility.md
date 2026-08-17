# Compatibility

The table separates automated source coverage from actual user-interface verification. A green CI run does not prove that an operating-system dialog or file-manager integration behaves correctly.

| Surface | Host OS | Automated checks | Manual UI coverage | Status |
| --- | --- | --- | --- | --- |
| DSH Desktop 2.0.1 | Windows x64 | Node 20/22/24 | Project picker, project creation, exact workspace root, plugin bridge, Windows folder chooser | Verified alpha target |
| Local DSH Web UI | Windows | Node 20/22/24 | Partial | Expected; more regression coverage needed |
| DSH Desktop | macOS Apple Silicon | Node 20/22/24 | Not yet tested | Community testing requested |
| Local DSH Web UI | macOS | Node 20/22/24 | Not yet tested | Community testing requested |
| Local DSH Web UI | Linux | Node 20/22/24 | Not yet tested | Community testing requested |
| Remote DSH Web UI | Cross-platform | Node 20/22/24 | Host directory-browser fallback | Supported by design |

DSH Desktop currently publishes installers for Windows x64 and macOS Apple Silicon. Intel macOS and a packaged Linux Desktop are not claimed as supported here. The plugin's Host implementation has win32, darwin, and Linux branches, but only Windows has current end-to-end manual coverage.

## Feature behavior by surface

| Feature | Desktop / Windows | Local Web | Remote Web |
| --- | --- | --- | --- |
| Project picker and sidebar | Yes | Yes | Yes |
| No-project default task folders | Yes | Yes | Yes, on the Host |
| Plugin native bridge | Electron OS chooser | DSH native Host picker | Disabled |
| Fallback directory browser | Yes | Yes | Yes; authoritative |
| Open in file manager | Verified on Windows | Host-dependent | Host-dependent |
| Light/dark theme tokens | Verified on Windows | Expected | Expected |
| Chat-body search | Requires DSH session index | Same | Same |
| Restore archived chat | Blocked when DSH has no public unarchive API | Same | Same |

## Browser and remote boundaries

The plugin has Host and Web Client halves. The native bridge is registered through DSH Connection with loopback-only authority, and the client calls it only when `ctx.connection.isLoopback` is true. A remote browser therefore cannot make the Host display a native directory dialog.

In remote Web UI, project paths always refer to the filesystem of the machine running DSH Host, not the browser device. Browser-local display preferences do not automatically synchronize between origins, browsers, or profiles.

## Version policy

`0.2.0-alpha.2` targets DeepSeek Harness `0.1.0-rc.6` and DSH Desktop 2.0.1. Compatibility with later Developer Preview builds is recorded only after tests and, for OS integrations, manual verification.
