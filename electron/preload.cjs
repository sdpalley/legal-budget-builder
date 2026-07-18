const { contextBridge, ipcRenderer } = require("electron");

// Keep these fixed channel names inline because sandboxed preload scripts may
// only require Electron's limited built-in module set.
const CHANNELS = Object.freeze({
  status: "legal-budget-ai:credentials:status",
  setCredential: "legal-budget-ai:credentials:set",
  deleteCredential: "legal-budget-ai:credentials:delete",
  testProvider: "legal-budget-ai:provider:test",
  listModels: "legal-budget-ai:provider:models",
  run: "legal-budget-ai:workflow:run",
});

const invoke = (channel, input) => ipcRenderer.invoke(channel, input);

contextBridge.exposeInMainWorld(
  "legalBudgetAI",
  Object.freeze({
    getCredentialStatus: () => invoke(CHANNELS.status),
    setCredential: (provider, credential) =>
      invoke(CHANNELS.setCredential, { provider, credential }),
    deleteCredential: (provider) =>
      invoke(CHANNELS.deleteCredential, { provider }),
    testProvider: (provider) => invoke(CHANNELS.testProvider, { provider }),
    listModels: (provider) => invoke(CHANNELS.listModels, { provider }),
    runWorkflow: (request) => invoke(CHANNELS.run, request),
  }),
);
