const { app, BrowserWindow, ipcMain, safeStorage, shell } = require("electron");
const path = require("path");
const {
  isSafeExternalUrl,
  isSameDocumentNavigation,
} = require("./navigation.cjs");
const { createCredentialStore } = require("./llm/credentialStore.cjs");
const { registerAIHandlers } = require("./llm/ipc.cjs");
const { createLLMService } = require("./llm/service.cjs");

let disposeAIHandlers;

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
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
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
  const credentialStore = createCredentialStore({
    safeStorage,
    filePath: path.join(app.getPath("userData"), "llm-credentials.json"),
    fsPromises: require("fs").promises,
  });
  const llmService = createLLMService({ credentialStore });
  disposeAIHandlers = registerAIHandlers({
    ipcMain,
    credentialStore,
    llmService,
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (disposeAIHandlers) {
    disposeAIHandlers();
    disposeAIHandlers = undefined;
  }
});
