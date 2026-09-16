/**
 * Preload script — exposes safe IPC bridge to renderer.
 * BrowserWindow loads `preload.cjs`. This ESM copy must expose the same keys
 * so a contributor cannot ship a desktop build that cannot list/read providers.
 */
import { contextBridge, ipcRenderer } from "electron";

function on(channel, cb) {
  const handler = (_event, value) => cb(Boolean(value));
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

contextBridge.exposeInMainWorld(
  "electron",
  Object.freeze({
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close: () => ipcRenderer.send("window-close"),
    isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
    appVersion: () => ipcRenderer.invoke("app-version"),
    appName: () => ipcRenderer.invoke("app-name"),
    providerRead: (request) => ipcRenderer.invoke("provider-read", request),
    providerMutate: (request) => ipcRenderer.invoke("provider-mutate", request),
    sshPlan: (request) => ipcRenderer.invoke("ssh-plan", request),
    workspaceGet: () => ipcRenderer.invoke("workspace-get"),
    workspaceSelect: () => ipcRenderer.invoke("workspace-select"),
    hardwareProfile: () => ipcRenderer.invoke("hardware-profile"),
    onMaximizeChange: (cb) => on("maximize-change", cb),
  }),
);
