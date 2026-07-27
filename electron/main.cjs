const { app, BrowserWindow, shell, Menu, ipcMain, session } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;
let mainWindow = null;

function attachDownloadHandler(ses) {
  if (ses.__gvDownloadHooked) return;
  ses.__gvDownloadHooked = true;
  ses.on("will-download", (_event, item) => {
    const filename = item.getFilename();
    const total = item.getTotalBytes();
    const send = (state, extra = {}) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("download-progress", {
          filename,
          total,
          received: item.getReceivedBytes(),
          state,
          ...extra,
        });
      }
    };
    send("started");
    item.on("updated", (_e, s) => send(s));
    item.once("done", (_e, state) => send("done", { finalState: state, savePath: item.getSavePath() }));
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#0a0a12",
    title: "Game Vault",
    icon: path.join(__dirname, "..", "public", "favicon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  Menu.setApplicationMenu(null);
  attachDownloadHandler(mainWindow.webContents.session);

  if (isDev) {
    mainWindow.loadURL("http://localhost:8080");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  // External links from the main window now stay handled by ipc/openDownload;
  // any remaining target=_blank falls back to the system browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}

function openDownloadWindow(url) {
  const child = new BrowserWindow({
    width: 1100,
    height: 780,
    parent: mainWindow || undefined,
    backgroundColor: "#0a0a12",
    title: "Download",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  attachDownloadHandler(child.webContents.session);
  // Child window's popups (many host sites open the real download in a new tab)
  // should trigger a download inside the child, not open the system browser.
  child.webContents.setWindowOpenHandler(({ url: popupUrl }) => {
    child.webContents.downloadURL(popupUrl);
    return { action: "deny" };
  });
  child.loadURL(url);
}

ipcMain.handle("open-download", (_e, url) => {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return false;
  openDownloadWindow(url);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
