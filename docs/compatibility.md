# Compatibility

The table separates automated source coverage from actual user-interface verification. A green CI run does not prove that an operating-system dialog or file-manager integration behaves correctly.

| Surface | Host OS | Automated checks | Manual UI coverage | Status |
| --- | --- | --- | --- | --- |
| DSH Desktop 2.0.1 | Windows x64 | Node 20/22/24 | Project picker, project creation, exact workspace root, legacy plugin bridge, Windows folder chooser | Verified legacy target |
| DSH Desktop 2.0.3 | Windows x64 | Node 20/22/24 | Plugin load, official Windows picker, cancellation, and exact CJK/space path round-trip to the creation surface | Verified picker integration |
| DSH 0.1.1-rc.2 local Web UI | Windows | Node 20/22/24 | Isolated profile boot, plugin module load, project picker, creation modal, search and archive entry | Verified compatibility smoke test |
| DSH Desktop | macOS Apple Silicon | Node 20/22/24 | Not yet tested | Community testing requested |
| Local DSH Web UI | macOS | Node 20/22/24 | Not yet tested | Community testing requested |
| Local DSH Web UI | Linux | Node 20/22/24 | Not yet tested | Community testing requested |
| Remote DSH Web UI | Cross-platform | Node 20/22/24 | Host directory-browser fallback | Supported by design |

DSH Desktop currently publishes installers for Windows x64 and macOS Apple Silicon. Intel macOS and a packaged Linux Desktop are not claimed as supported here. The plugin's Host implementation has win32, darwin, and Linux branches, but only Windows has current end-to-end manual coverage.

## Feature behavior by surface

| Feature | Desktop / Windows | Local Web | Remote Web |
| --- | --- | --- | --- |
| Project picker and sidebar | Yes | Yes | Yes |
| No-project default task folders | Host-side allocator | Host-side allocator | Workspace browse capability on the Host |
| Directory selection | Official Desktop bridge, then legacy Electron bridge | Plugin Host bridge, then stock Workspace picker | Stock Host directory browser |
| Fallback directory browser | Yes | Yes | Yes; authoritative |
| Open in file manager | Verified on Windows | Host-dependent | Host-dependent |
| Light/dark theme tokens | Verified on Windows | Expected | Expected |
| Chat-body search | Requires DSH session index | Same | Same |
| Restore archived chat | Blocked when DSH has no public unarchive API | Same | Same |

## Browser and remote boundaries

The plugin has Host and Web Client halves. DSH Desktop's official window bridge is checked first. The plugin compatibility bridge is registered through DSH Connection with loopback-only authority, and the client calls it only when `ctx.connection.isLoopback` is true. A remote browser therefore cannot make the Host display a native directory dialog.

In remote Web UI, project paths always refer to the filesystem of the machine running DSH Host, not the browser device. Browser-local display preferences do not automatically synchronize between origins, browsers, or profiles.

## Version policy

`0.3.0-alpha.2` accepts the currently published previews from DSH `0.1.0-rc.6` through `0.1.1-rc.2`, but only the rc.6 and rc.2 endpoints have dedicated dependency-line checks. The rc.2 Web Client surface has an isolated runtime smoke test. On Windows x64, DSH Desktop 2.0.3 has a manual pass for plugin loading, the official operating-system dialog, cancellation, and exact selected-path round-trip. macOS, Linux, intermediate preview builds, and later Developer Preview builds remain unverified until they receive their own tests and, for OS integrations, manual coverage.
