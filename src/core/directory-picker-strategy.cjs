const { unwrapNativeDirectoryResult } = require("./native-picker-result.cjs");

async function callPicker(picker) {
  return unwrapNativeDirectoryResult(await picker());
}

/**
 * Prefer the Desktop-owned picker when it is available, retain the plugin Host
 * bridge for older local runtimes, and finally use DSH's Workspace picker.
 * A successful cancellation (`null`) is final and must not open another picker.
 */
async function pickProjectDirectory({
  desktopPicker,
  legacyPicker,
  workspacePicker,
  onFallback = () => {}
} = {}) {
  let lastFailure = null;
  for (const [source, picker] of [
    ["desktop", desktopPicker],
    ["legacy", legacyPicker]
  ]) {
    if (typeof picker !== "function") continue;
    try {
      return await callPicker(picker);
    } catch (reason) {
      lastFailure = reason;
      onFallback(source, reason);
    }
  }

  if (typeof workspacePicker === "function") {
    return callPicker(workspacePicker);
  }
  if (lastFailure) throw lastFailure;
  throw new Error("directory picker is unavailable");
}

module.exports = { pickProjectDirectory };
