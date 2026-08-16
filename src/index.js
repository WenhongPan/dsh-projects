/**
 * dsh-projects host half.
 *
 * The plugin deliberately stores no parallel project database. Its browser
 * surface projects DSH's Workspace and Session services into a Codex-like UI,
 * so disabling the plugin immediately restores the stock workspace interface.
 */
const name = "dsh-projects";

function apply() {}

export { apply, name };
