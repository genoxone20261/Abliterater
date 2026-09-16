import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isAllowedExternalUrl, isAllowedAppNavigation } from "./policy.mjs";
import { providerRead, providerMutate } from "./provider-gateway.mjs";
import { buildSshPlan } from "./ssh-execution.mjs";
import { createWorkspaceStorage } from "./workspace-storage.mjs";
import { collectHardwareProfile } from "./hardware-profile.mjs";

export const MAIN_ERROR = {
  untrusted: "MAIN_UNTRUSTED",
  busy: "MAIN_PROVIDER_BUSY",
  hydrate: "MAIN_HYDRATE_TIMEOUT",
  smoke: "MAIN_SMOKE_FAILED",
};

const here = dirname(fileURLToPath(import.meta.url));
const root = app.isPackaged ? join(process.resourcesPath, "app") : join(here, "../..");
const smoke = process.argv.includes("--smoke-test");
let mainWindow;
let server;
let appUrl;

function trusted(event) {
  return (
    !!mainWindow &&
    event.sender === mainWindow.webContents &&
    event.senderFrame === mainWindow.webContents.mainFrame &&
    isAllowedAppNavigation(event.senderFrame.url, appUrl)
  );
}

app
  .whenReady()
  .then(async () => {
    if (smoke || process.argv.includes("--qa-hidden"))
      app.setPath("userData", join(app.getPath("temp"), `abliterater-smoke-${process.pid}`));
    const { startBuiltServer } = await import(
      pathToFileURL(join(root, "scripts/built-server.mjs")).href
    );
    const runtime = await startBuiltServer({ root, host: "127.0.0.1", port: 0 });
    server = runtime.server;
    appUrl = runtime.url;
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 900,
      minHeight: 600,
      frame: false,
      backgroundColor: "#0d0f13",
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        preload: join(here, "preload.cjs"),
      },
    });
    mainWindow.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) =>
      callback(false),
    );
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (!smoke && isAllowedExternalUrl(url)) void shell.openExternal(url).catch(console.error);
      return { action: "deny" };
    });
    mainWindow.webContents.on("will-navigate", (event, url) => {
      if (!isAllowedAppNavigation(url, appUrl)) event.preventDefault();
    });
    mainWindow.on("maximize", () => mainWindow.webContents.send("maximize-change", true));
    mainWindow.on("unmaximize", () => mainWindow.webContents.send("maximize-change", false));
    ipcMain.on("window-minimize", (event) => {
      if (trusted(event)) mainWindow.minimize();
    });
    ipcMain.on("window-maximize", (event) => {
      if (trusted(event)) {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
      }
    });
    ipcMain.on("window-close", (event) => {
      if (trusted(event)) mainWindow.close();
    });
    for (const [channel, handler] of Object.entries({
      "window-is-maximized": () => mainWindow.isMaximized(),
      "app-version": () => app.getVersion(),
      "app-name": () => app.getName(),
    }))
      ipcMain.handle(channel, (event) => {
        if (!trusted(event)) throw new Error(MAIN_ERROR.untrusted);
        return handler();
      });
    let providerBusy = false;
    ipcMain.handle("provider-read", async (event, request) => {
      if (!trusted(event)) throw new Error(MAIN_ERROR.untrusted);
      if (providerBusy) throw new Error(MAIN_ERROR.busy);
      providerBusy = true;
      try {
        return await providerRead(request);
      } finally {
        providerBusy = false;
      }
    });
    ipcMain.handle("provider-mutate", async (event, request) => {
      if (!trusted(event)) throw new Error(MAIN_ERROR.untrusted);
      if (providerBusy) throw new Error(MAIN_ERROR.busy);
      providerBusy = true;
      try {
        return await providerMutate(request);
      } finally {
        providerBusy = false;
      }
    });
    ipcMain.handle("ssh-plan", (event, request) => {
      if (!trusted(event)) throw new Error(MAIN_ERROR.untrusted);
      return buildSshPlan(request?.target, request?.packName);
    });
    const workspace = createWorkspaceStorage({
      settingsDir: app.getPath("userData"),
      defaultRoot: smoke
        ? join(app.getPath("userData"), "workspace")
        : join(
            process.platform === "win32"
              ? process.env.LOCALAPPDATA || app.getPath("appData")
              : app.getPath("appData"),
            "Abliterater",
            "workspace",
          ),
      repositoryRoot: root,
    });
    ipcMain.handle("workspace-get", (event) => {
      if (!trusted(event)) throw new Error(MAIN_ERROR.untrusted);
      return workspace.get();
    });
    ipcMain.handle("workspace-select", async (event) => {
      if (!trusted(event)) throw new Error(MAIN_ERROR.untrusted);
      const result = await dialog.showOpenDialog(mainWindow, {
        title: app.getLocale().toLowerCase().startsWith("ko") ? "작업 데이터 폴더" : "Workspace",
        properties: ["openDirectory", "createDirectory"],
      });
      if (result.canceled || !result.filePaths[0]) return null;
      return workspace.select(result.filePaths[0]);
    });
    ipcMain.handle("hardware-profile", (event) => {
      if (!trusted(event)) throw new Error(MAIN_ERROR.untrusted);
      return collectHardwareProfile();
    });
    await mainWindow.loadURL(appUrl);
    if (smoke) {
      const deadline = Date.now() + 30000;
      while (
        !(await mainWindow.webContents.executeJavaScript(
          'document.querySelector("#main")?.dataset.hydrated === "true"',
        ))
      ) {
        if (Date.now() > deadline) throw new Error(MAIN_ERROR.hydrate);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const result = await mainWindow.webContents.executeJavaScript(`(async () => {
      document.querySelector('[data-shortcut="save"]').click();
      await new Promise(resolve => setTimeout(resolve, 100));
      return { title:document.title, bridge:!!window.electron, version:await window.electron.appVersion(),
        workspace:await window.electron.workspaceGet(),
        hardware:await window.electron.hardwareProfile(),
        saved:JSON.parse(localStorage.getItem('ablit.configs.v1') || '[]').length > 0 };
    })()`);
      console.log(
        JSON.stringify({
          smoke: true,
          packaged: app.isPackaged,
          hidden: !mainWindow.isVisible(),
          ...result,
        }),
      );
      if (!result.bridge || !result.saved || !result.workspace?.writable || !result.hardware?.cpu)
        throw new Error(MAIN_ERROR.smoke);
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      server = undefined;
      app.exit(0);
    } else if (!process.argv.includes("--qa-hidden")) mainWindow.show();
  })
  .catch((error) => {
    console.error(error);
    app.exit(1);
  });
app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => {
  server?.closeAllConnections();
  server?.close();
});
