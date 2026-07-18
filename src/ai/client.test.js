import { describe, expect, it, vi } from "vitest";
import { AIClientError, createAIClient } from "./client.js";

describe("renderer AI client", () => {
  it("unwraps the fixed desktop bridge", async () => {
    const bridge = {
      getCredentialStatus: vi.fn(async () => ({
        ok: true,
        data: { openai: true },
      })),
      setCredential: vi.fn(),
      deleteCredential: vi.fn(),
      testProvider: vi.fn(),
      listModels: vi.fn(),
      runWorkflow: vi.fn(),
    };
    const client = createAIClient(bridge);
    expect(client.mode).toBe("desktop-secure");
    await expect(client.getCredentialStatus()).resolves.toEqual({
      openai: true,
    });
  });

  it("normalizes bridge error envelopes", async () => {
    const bridge = {
      getCredentialStatus: vi.fn(async () => ({
        ok: false,
        error: { code: "network", message: "Offline" },
      })),
      setCredential: vi.fn(),
      deleteCredential: vi.fn(),
      testProvider: vi.fn(),
      listModels: vi.fn(),
      runWorkflow: vi.fn(),
    };
    await expect(createAIClient(bridge).getCredentialStatus()).rejects.toEqual(
      new AIClientError("network", "Offline"),
    );
  });

  it("keeps browser-development credentials only in memory and blocks requests", async () => {
    const client = createAIClient(null);
    await client.setCredential("anthropic", "session-key-value");
    expect((await client.getCredentialStatus()).anthropic).toBe(true);
    await expect(client.runWorkflow({})).rejects.toMatchObject({
      code: "desktop_required",
    });
    await client.deleteCredential("anthropic");
    expect((await client.getCredentialStatus()).anthropic).toBe(false);
  });
});
