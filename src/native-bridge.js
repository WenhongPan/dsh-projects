/** Loopback-only native directory picker bridge for dsh-projects. */

import { allocateDefaultWorkspace } from "./default-workspace-host.js";
import { stat } from "node:fs/promises";

const BRIDGE_CHANNEL = "/dsh-projects";
const PICK_DIRECTORY_ENDPOINT = "pickDirectory";
const ALLOCATE_DEFAULT_WORKSPACE_ENDPOINT = "allocateDefaultWorkspace";
const SUPPORTED_PLATFORMS = new Set(["win32", "darwin", "linux"]);

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isElectronRuntime(versions = process.versions) {
  return typeof versions?.electron === "string" && versions.electron.length > 0;
}

async function existingDirectory(path, inspect = stat) {
  if (!path) return false;
  try {
    return (await inspect(path)).isDirectory();
  } catch {
    return false;
  }
}

async function pickWithElectron(signal, loadElectron = () => import("electron"), request = {}) {
  if (signal.aborted) throw new Error("native directory picker aborted");
  const { app, BrowserWindow, dialog } = await loadElectron();
  const fallbackLocation = request.startLocation === "home" ? "home" : "desktop";
  const fallbackPath = app?.getPath?.(fallbackLocation) ?? "";
  const requested = typeof request.defaultPath === "string" ? request.defaultPath : "";
  const defaultPath = await existingDirectory(requested, request.inspectPath)
    ? requested
    : fallbackPath;
  const options = {
    title: "Select Project Root",
    properties: ["openDirectory", "createDirectory"],
    ...(defaultPath ? { defaultPath } : {})
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

async function pickNativeDirectory(signal, internals = {}, request = {}) {
  const platform = internals.platform ?? process.platform;
  if (!SUPPORTED_PLATFORMS.has(platform)) {
    throw new Error(`native directory picker is unsupported on ${platform}`);
  }
  const electron = internals.electron ?? isElectronRuntime(internals.versions);
  return electron
    ? pickWithElectron(signal, internals.loadElectron, { defaultPath: request.defaultPath, startLocation: request.startLocation, inspectPath: internals.inspectPath })
    : pickWithDshNative(signal, internals.loadNativePicker);
}

function validPickerPayload(payload) {
  if (!isPlainObject(payload)) return false;
  const keys = Object.keys(payload);
  return keys.every((key) => key === "defaultPath" || key === "startLocation")
    && (payload.defaultPath === undefined || typeof payload.defaultPath === "string")
    && (payload.startLocation === undefined || payload.startLocation === "desktop" || payload.startLocation === "home");
}

function createNativeBridgeHandler(internals = {}) {
  return async (endpoint, payload, signal) => {
    try {
      if (endpoint !== PICK_DIRECTORY_ENDPOINT && endpoint !== ALLOCATE_DEFAULT_WORKSPACE_ENDPOINT) {
        throw new Error(`dsh-projects: unknown native bridge endpoint ${JSON.stringify(endpoint)}`);
      }
      if (!validPickerPayload(payload)) {
        throw new Error("dsh-projects: bridge payload may only contain defaultPath and a desktop/home startLocation");
      }
      if (endpoint === PICK_DIRECTORY_ENDPOINT) {
        const path = await pickNativeDirectory(signal, internals, payload);
        return { ok: true, value: { path } };
      }
      if (endpoint === ALLOCATE_DEFAULT_WORKSPACE_ENDPOINT) {
        return {
          ok: true,
          value: await allocateDefaultWorkspace(internals.defaultWorkspace)
        };
      }
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
  ALLOCATE_DEFAULT_WORKSPACE_ENDPOINT,
  BRIDGE_CHANNEL,
  PICK_DIRECTORY_ENDPOINT,
  createNativeBridgeHandler,
  existingDirectory,
  isElectronRuntime,
  pickNativeDirectory,
  pickWithDshNative,
  pickWithElectron,
  registerNativeBridge
};
