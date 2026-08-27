import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import semver from "semver";

const expected = process.argv[2];
if (!semver.valid(expected)) throw new Error(`invalid DSH version ${JSON.stringify(expected)}`);

const project = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const packages = [
  "@deepseek-ai/dsh-client-connection",
  "@deepseek-ai/dsh-client-locale",
  "@deepseek-ai/dsh-client-runtime",
  "@deepseek-ai/dsh-client-ui-conversation",
  "@deepseek-ai/dsh-client-ui-sidebar",
  "@deepseek-ai/dsh-client-ui-slots",
  "@deepseek-ai/dsh-client-ui-workspace",
  "@deepseek-ai/dsh-host-directory-picker-native"
];

for (const name of packages) {
  const range = project.peerDependencies?.[name];
  if (!semver.satisfies(expected, range, { includePrerelease: true })) {
    throw new Error(`${name} peer range ${JSON.stringify(range)} rejects ${expected}`);
  }
  const manifestPath = resolve("node_modules", ...name.split("/"), "package.json");
  const installed = JSON.parse(await readFile(manifestPath, "utf8")).version;
  if (installed !== expected) {
    throw new Error(`${name} resolved to ${installed}; expected ${expected}`);
  }
}

console.log(`DSH peer line ${expected}: ${packages.length} package contracts verified`);
