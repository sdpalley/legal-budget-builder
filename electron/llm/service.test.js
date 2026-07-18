import { describe, expect, it, vi } from "vitest";
import serviceModule from "./service.cjs";

const { createLLMService } = serviceModule;

function setup() {
  const credentialStore = { get: vi.fn(async () => "never-return-this-key") };
  const adapter = {
    listModels: vi.fn(async () => [{ id: "model", name: "Model" }]),
    generate: vi.fn(async () => ({
      result: { narrative: "Client-ready summary" },
      usage: { total_tokens: 4 },
    })),
  };
  const service = createLLMService({
    credentialStore,
    providers: { openai: adapter },
    fetchImpl: vi.fn(),
    timeoutMs: 100,
  });
  return { service, credentialStore, adapter };
}

describe("LLM service", () => {
  it("lists models without returning credentials", async () => {
    const { service, adapter } = setup();
    await expect(service.listModels("openai")).resolves.toEqual([
      { id: "model", name: "Model" },
    ]);
    expect(adapter.listModels).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "never-return-this-key" }),
    );
  });

  it("runs an allowlisted workflow and validates its result", async () => {
    const { service } = setup();
    await expect(
      service.run({
        workflowId: "budget_narrative",
        provider: "openai",
        model: "model",
        payload: { totals: { low: 1, high: 2 } },
      }),
    ).resolves.toMatchObject({
      workflowId: "budget_narrative",
      result: { narrative: "Client-ready summary" },
    });
  });

  it("rejects unknown workflows and providers before network work", async () => {
    const { service, credentialStore } = setup();
    await expect(
      service.run({
        workflowId: "raw_prompt",
        provider: "openai",
        model: "model",
        payload: {},
      }),
    ).rejects.toMatchObject({ code: "invalid_workflow" });
    await expect(service.listModels("unknown")).rejects.toMatchObject({
      code: "invalid_provider",
    });
    expect(credentialStore.get).not.toHaveBeenCalled();
  });

  it("rejects schema-invalid output", async () => {
    const { service, adapter } = setup();
    adapter.generate.mockResolvedValue({ result: { narrative: "" } });
    await expect(
      service.run({
        workflowId: "budget_narrative",
        provider: "openai",
        model: "model",
        payload: {},
      }),
    ).rejects.toMatchObject({ code: "invalid_response" });
  });

  it("does not include credentials in unexpected errors", async () => {
    const { service, adapter } = setup();
    adapter.listModels.mockRejectedValue(new Error("never-return-this-key"));
    await expect(service.listModels("openai")).rejects.toMatchObject({
      code: "unexpected",
      message: "The AI request could not be completed.",
    });
  });
});
