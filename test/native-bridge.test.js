import assert from "node:assert/strict";
import test from "node:test";

import {
  BRIDGE_CHANNEL,
  createNativeBridgeHandler,
  isElectronRuntime,
  pickNativeDirectory,
  pickWithElectron,
  registerNativeBridge
} from "../src/native-bridge.js";

test("detects Electron only from a non-empty runtime version", () => {
  assert.equal(isElectronRuntime({ electron: "43.4.0" }), true);
  assert.equal(isElectronRuntime({ electron: "" }), false);
  assert.equal(isElectronRuntime({ node: "24.0.0" }), false);
});

test("Electron picker returns the selected directory and uses the focused window", async () => {
  const parent = {};
  let call;
  const path = await pickWithElectron(new AbortController().signal, async () => ({
    BrowserWindow: { getFocusedWindow: () => parent },
    dialog: {
      async showOpenDialog(...args) {
        call = args;
        return { canceled: false, filePaths: ["C:\\work\\project"] };
      }
    }
  }));
  assert.equal(path, "C:\\work\\project");
  assert.equal(call[0], parent);
  assert.deepEqual(call[1].properties, ["openDirectory", "createDirectory"]);
});

test("Electron picker maps cancellation to null", async () => {
  const path = await pickWithElectron(new AbortController().signal, async () => ({
    BrowserWindow: { getFocusedWindow: () => null },
    dialog: { showOpenDialog: async () => ({ canceled: true, filePaths: [] }) }
  }));
  assert.equal(path, null);
});

test("plain Node hosts delegate to the official cross-platform DSH picker", async () => {
  const signal = new AbortController().signal;
  const path = await pickNativeDirectory(signal, {
    platform: "win32",
    electron: false,
    loadNativePicker: async () => ({
      pickNativeDirectory(received) {
        assert.equal(received, signal);
        return "C:\\native";
      }
    })
  });
  assert.equal(path, "C:\\native");
});

test("bridge accepts only its empty pickDirectory request", async () => {
  const handler = createNativeBridgeHandler({
    platform: "darwin",
    electron: false,
    loadNativePicker: async () => ({ pickNativeDirectory: async () => "/tmp/project" })
  });
  assert.deepEqual(await handler("pickDirectory", {}, new AbortController().signal), {
    ok: true,
    value: { path: "/tmp/project" }
  });
  await assert.rejects(() => handler("other", {}, new AbortController().signal), /unknown native bridge endpoint/);
  await assert.rejects(() => handler("pickDirectory", { path: "/tmp" }, new AbortController().signal), /empty object/);
});

test("registers the bridge as a loopback-only RPC channel", () => {
  let registration;
  const dispose = () => {};
  const ctx = {
    connection: {
      rpc: {
        handle(channel, handler, options) {
          registration = { channel, handler, options };
          return dispose;
        }
      }
    }
  };
  assert.equal(registerNativeBridge(ctx), dispose);
  assert.equal(registration.channel, BRIDGE_CHANNEL);
  assert.deepEqual(registration.options, { authority: "loopback" });
  assert.equal(typeof registration.handler, "function");
});
