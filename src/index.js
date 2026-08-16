/** dsh-projects host half. */
import { registerNativeBridge } from "./native-bridge.js";

const name = "dsh-projects";
const inject = ["connection"];

function apply(ctx) {
  registerNativeBridge(ctx);
}

export { apply, inject, name };
