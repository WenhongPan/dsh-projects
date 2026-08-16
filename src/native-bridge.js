/** Loopback-only native directory picker bridge for dsh-projects. */

const BRIDGE_CHANNEL = "/dsh-projects";
const PICK_DIRECTORY_ENDPOINT = "pickDirectory";
const SUPPORTED_PLATFORMS = new Set(["win32", "darwin", "linux"]);

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isElectronRuntime(versions = process.versions) {
  return typeof versions?.electron === "string" && versions.electron.length > 0;
}

async function pickWithElectron(signal, loadElectron = () => import("electron")) {
  if (signal.aborted) throw new Error("native directory picker aborted");
  const { BrowserWindow, dialog } = await loadElectron();
  const options = {
    title: "Select Project Root",
    properties: ["openDirectory", "createDirectory"]
  };
  const parent = BrowserWindow?.getFocusedWindow?.() ?? null;
  const result = parent
    ? await dialog.showOpenDialog(parent, options)
    : await dialog.showOpenDialog(options);
  if (signal.aborted) throw new Error("native directory picker aborted");
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0] ?? null;
}

async function pickWithDshNative(signal, loadNativePicker = () => import("@deepseek-ai/dsh-host-directory-picker-native")) {
  const { pickNativeDirectory } = await loadNativePicker();
  if (typeof pickNativeDirectory !== "function") {
    throw new Error("DSH native directory picker is unavailable");
  }
  return pickNativeDirectory(signal);
}

async function pickNativeDirectory(signal, internals = {}) {
  const platform = internals.platform ?? process.platform;
  if (!SUPPORTED_PLATFORMS.has(platform)) {
    throw new Error(`native directory picker is unsupported on ${platform}`);
  }
  const electron = internals.electron ?? isElectronRuntime(internals.versions);
  return electron
    ? pickWithElectron(signal, internals.loadElectron)
    : pickWithDshNative(signal, internals.loadNativePicker);
}

function createNativeBridgeHandler(internals = {}) {
  return async (endpoint, payload, signal) => {
    if (endpoint !== PICK_DIRECTORY_ENDPOINT) {
      throw new Error(`dsh-projects: unknown native bridge endpoint ${JSON.stringify(endpoint)}`);
    }
    if (!isPlainObject(payload) || Object.keys(payload).length !== 0) {
      throw new Error("dsh-projects: pickDirectory payload must be an empty object");
    }
    try {
      const path = await pickNativeDirectory(signal, internals);
      return { ok: true, value: { path } };
    } catch (reason) {
      return {
        ok: false,
        error: {
          code: "internal",
          message: reason instanceof Error ? reason.message : String(reason),
          details: {}
        }
      };
    }
  };
}

function registerNativeBridge(ctx, internals = {}) {
  return ctx.connection.rpc.handle(
    BRIDGE_CHANNEL,
    createNativeBridgeHandler(internals),
    { authority: "loopback" }
  );
}

export {
  BRIDGE_CHANNEL,
  PICK_DIRECTORY_ENDPOINT,
  createNativeBridgeHandler,
  isElectronRuntime,
  pickNativeDirectory,
  pickWithDshNative,
  pickWithElectron,
  registerNativeBridge
};
