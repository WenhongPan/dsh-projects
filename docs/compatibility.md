# Compatibility

## Verified

| Surface | Host OS | Status |
| --- | --- | --- |
| DSH Desktop 2.0.0 | Windows x64 | Manually used; full regression suite pending |

## Expected but not yet verified

| Surface | Host OS | Notes |
| --- | --- | --- |
| DSH Desktop 2.0.0 | macOS Apple Silicon | Client UI should load; native picker and file-manager actions need testing |
| DSH Web UI | Windows | Install into the `web` profile separately |
| DSH Web UI | macOS | Host filesystem paths refer to the Mac running DSH |
| DSH Web UI | Linux | Default `~/Documents` behavior needs XDG/localized-directory testing |

DSH Desktop currently publishes installers for Windows x64 and macOS Apple Silicon. Intel macOS and packaged Linux Desktop are not claimed as supported here.

## Browser/remote behavior

The plugin is a DSH Web Client plugin. In a remote browser, project directories and native operations belong to the DSH Host machine. Browser-local display preferences do not automatically synchronize across origins or browser profiles.

## Version policy

The first alpha targets DeepSeek Harness `0.1.0-rc.6`. Future compatibility will be recorded here after verification. A green unit-test run does not by itself prove compatibility with a newer DSH runtime.
