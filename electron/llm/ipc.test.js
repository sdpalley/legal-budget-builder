import { describe, expect, it, vi } from "vitest";
import ipcModule from "./ipc.cjs";

const { CHANNELS, registerAIHandlers } = ipcModule;

function setup() {
  const handlers = new Map();
  const ipcMain = {
    handle: vi.fn((channel, handler) => handlers.set(channel, handler)),
    removeHandler: vi.fn((channel) => handlers.delete(channel)),
  };
  const credentialStore = {
    status: vi.fn(async () => ({
      openai: true,
      anthropic: false,
      openrouter: false,
    })),
    set: vi.fn(async () => ({ configured: true })),
    delete: vi.fn(async () => ({ configured: false })),
  };
  const llmService = {
    testProvider: vi.fn(async () => ({ connected: true, modelCount: 2 })),
    listModels: vi.fn(async () => [{ id: "model", name: "Model" }]),
    run: vi.fn(async (input) => ({
      workflowId: input.workflowId,
      result: { narrative: "Draft" },
    })),
  };
  const cleanup = registerAIHandlers({ ipcMain, credentialStore, llmService });
  const invoke = (channel, input) => handlers.get(channel)(null, input);
  return { invoke, cleanup, ipcMain, credentialStore, llmService };
}

describe("AI IPC boundary", () => {
  it("registers only fixed channels and returns status envelopes", async () => {
    const { invoke, ipcMain } = setup();
    expect(ipcMain.handle).toHaveBeenCalledTimes(Object.keys(CHANNELS).length);
    await expect(invoke(CHANNELS.status)).resolves.toEqual({
      ok: true,
      data: { openai: true, anthropic: false, openrouter: false },
    });
  });

  it("passes credentials only into the credential store and never returns them", async () => {
    const { invoke, credentialStore } = setup();
    const result = await invoke(CHANNELS.setCredential, {
      provider: "openai",
      credential: "super-secret-key",
    });
    expect(credentialStore.set).toHaveBeenCalledWith(
      "openai",
      "super-secret-key",
    );
    expect(JSON.stringify(result)).not.toContain("super-secret-key");
  });

  it("sanitizes unexpected failures", async () => {
    const { invoke, llmService } = setup();
    llmService.listModels.mockRejectedValue({
      code: "network",
      message: "The provider could not be reached.",
    });
    await expect(
      invoke(CHANNELS.listModels, { provider: "openai" }),
    ).resolves.toEqual({
      ok: false,
      error: { code: "network", message: "The provider could not be reached." },
    });
  });

  it("removes every handler during cleanup", () => {
    const { cleanup, ipcMain } = setup();
    cleanup();
    expect(ipcMain.removeHandler).toHaveBeenCalledTimes(
      Object.keys(CHANNELS).length,
    );
  });
});
