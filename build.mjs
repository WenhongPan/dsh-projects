import { mkdir } from "node:fs/promises";
import { build } from "esbuild";

await mkdir("dist", { recursive: true });

await build({
  entryPoints: ["src/client.cjs"],
  outfile: "dist/client.js",
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: ["es2022"],
  external: ["react", "react-dom"],
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-projects', factory: (require) => { var module = { exports: {} }; var exports = module.exports;"
  },
  footer: {
    js: "return module.exports; } });"
  }
});
