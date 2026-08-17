# Attention integration contract (draft)

`dsh-projects` can already present DSH's native Session summary states: waiting for approval, plan review, question, running, and completed-not-viewed. A future `dsh-attention-center` plugin may provide richer global workflows without being bundled into Projects.

Projects should expose three user-selected modes:

- **Off**: show only DSH-native status dots.
- **Compact**: add per-project counts without taking extra sidebar space. This is the default.
- **Expanded**: show a small read-only list grouped into waiting-for-you, running, and completed. It is built from DSH's native Session fields and clicking an item opens that Session.

A future standalone plugin owns richer global filtering, explicit read state, and cross-project workflows. Projects may consume a versioned read-only service and request a project filter, but it must not copy the Attention database or silently install another plugin. When that service is absent, the three native modes continue to work from official DSH fields.

The first optional service contract should contain only Session id, Workspace id, status, updated time, and a navigation callback. Notifications, remote control, and deletion are outside the initial contract.
