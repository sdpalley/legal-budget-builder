const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const {
  isSafeExternalUrl,
  isSameDocumentNavigation,
} = require("./navigation.cjs");

function openExternalIfSafe(url) {
  if (isSafeExternalUrl(url)) void shell.openExternal(url);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "Legal Budget Builder",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));

  // Keep all untrusted navigation outside the privileged application window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternalIfSafe(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (isSameDocumentNavigation(url, win.webContents.getURL())) return;
    event.preventDefault();
    openExternalIfSafe(url);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
