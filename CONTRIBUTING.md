# Contributing

Issues and focused pull requests are welcome. Because DeepSeek Harness is still in Developer Preview, every behavior change should state the exact DSH version used for verification.

## Local checks

```bash
npm install
npm run verify
```

For UI changes, also verify:

- dark and light themes;
- the stock Web UI and DSH Desktop when available;
- a narrow window and a normal desktop window;
- install, restart, disable, and uninstall behavior;
- that no file or session is deleted unless the user explicitly requested it.

Do not commit API keys, session databases, generated DSH profile files, or user-specific absolute paths.
