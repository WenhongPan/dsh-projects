# Security policy

Please report path traversal, unintended file deletion, unauthorized filesystem access, or session-data exposure privately to the repository maintainer before opening a public issue.

The plugin does not execute model-generated commands itself. Filesystem and session operations go through DeepSeek Harness services and inherit the active Host permissions.

The native directory picker bridge is exposed through a generic DSH Connection channel with `authority: loopback`. The browser client calls it only for loopback page origins. It accepts no path input and can only return a path selected through an attended OS dialog. Remote pages fall back to the Host-side directory browser.

The optional SQLite search index contains data derived from chat content. Protect it like the original DSH session store.
