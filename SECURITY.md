# Security policy

Please report path traversal, unintended file deletion, unauthorized filesystem access, or session-data exposure privately to the repository maintainer before opening a public issue.

The plugin does not execute model-generated commands itself. Filesystem and session operations go through DeepSeek Harness services and inherit the active Host permissions.

The optional SQLite search index contains data derived from chat content. Protect it like the original DSH session store.
