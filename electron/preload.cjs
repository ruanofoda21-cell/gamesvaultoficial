const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  openDownload: (url) => ipcRenderer.invoke("open-download", url),
  onDownloadProgress: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on("download-progress", handler);
    return () => ipcRenderer.removeListener("download-progress", handler);
  },
});
