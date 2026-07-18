const CHANNELS = Object.freeze({
  status: "legal-budget-ai:credentials:status",
  setCredential: "legal-budget-ai:credentials:set",
  deleteCredential: "legal-budget-ai:credentials:delete",
  testProvider: "legal-budget-ai:provider:test",
  listModels: "legal-budget-ai:provider:models",
  run: "legal-budget-ai:workflow:run",
});

function envelope(operation) {
  return async (_event, input) => {
    try {
      return { ok: true, data: await operation(input) };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: typeof error?.code === "string" ? error.code : "unexpected",
          message:
            typeof error?.message === "string" && error.message.length <= 500
              ? error.message
              : "The AI operation could not be completed.",
        },
      };
    }
  };
}

function registerAIHandlers({ ipcMain, credentialStore, llmService }) {
  if (!ipcMain || !credentialStore || !llmService)
    throw new Error("AI IPC dependencies are required.");
  const handlers = {
    [CHANNELS.status]: envelope(() => credentialStore.status()),
    [CHANNELS.setCredential]: envelope((input) =>
      credentialStore.set(input?.provider, input?.credential),
    ),
    [CHANNELS.deleteCredential]: envelope((input) =>
      credentialStore.delete(input?.provider),
    ),
    [CHANNELS.testProvider]: envelope((input) =>
      llmService.testProvider(input?.provider),
    ),
    [CHANNELS.listModels]: envelope((input) =>
      llmService.listModels(input?.provider),
    ),
    [CHANNELS.run]: envelope((input) => llmService.run(input)),
  };
  for (const [channel, handler] of Object.entries(handlers))
    ipcMain.handle(channel, handler);
  return () => {
    for (const channel of Object.keys(handlers)) ipcMain.removeHandler(channel);
  };
}

module.exports = { CHANNELS, registerAIHandlers };
