const SESSION_PROVIDERS = ["openai", "anthropic", "openrouter"];

export class AIClientError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AIClientError";
    this.code = code;
  }
}

function unwrap(response) {
  if (response?.ok) return response.data;
  throw new AIClientError(
    response?.error?.code || "unexpected",
    response?.error?.message || "The AI operation could not be completed.",
  );
}

export function createAIClient(bridge = globalThis.window?.legalBudgetAI) {
  if (bridge) {
    return {
      mode: "desktop-secure",
      getCredentialStatus: async () =>
        unwrap(await bridge.getCredentialStatus()),
      setCredential: async (provider, credential) =>
        unwrap(await bridge.setCredential(provider, credential)),
      deleteCredential: async (provider) =>
        unwrap(await bridge.deleteCredential(provider)),
      testProvider: async (provider) =>
        unwrap(await bridge.testProvider(provider)),
      listModels: async (provider) => unwrap(await bridge.listModels(provider)),
      runWorkflow: async (request) => unwrap(await bridge.runWorkflow(request)),
    };
  }

  // Vite's browser-only development surface has no secure main-process vault.
  // Keep entered values in this closure only and require Electron for requests.
  const sessionCredentials = new Map();
  const desktopRequired = async () => {
    throw new AIClientError(
      "desktop_required",
      "AI requests require the Electron desktop app so API keys stay outside the page.",
    );
  };
  return {
    mode: "browser-session",
    getCredentialStatus: async () =>
      Object.fromEntries(
        SESSION_PROVIDERS.map((provider) => [
          provider,
          sessionCredentials.has(provider),
        ]),
      ),
    setCredential: async (provider, credential) => {
      if (
        !SESSION_PROVIDERS.includes(provider) ||
        typeof credential !== "string" ||
        credential.trim().length < 8
      )
        throw new AIClientError("invalid_credential", "Enter a valid API key.");
      sessionCredentials.set(provider, credential.trim());
      return { configured: true };
    },
    deleteCredential: async (provider) => {
      sessionCredentials.delete(provider);
      return { configured: false };
    },
    testProvider: desktopRequired,
    listModels: desktopRequired,
    runWorkflow: desktopRequired,
  };
}

export const aiClient = createAIClient();
