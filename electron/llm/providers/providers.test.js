import { describe, expect, it, vi } from "vitest";
import openai from "./openai.cjs";
import anthropic from "./anthropic.cjs";
import openrouter from "./openrouter.cjs";

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => null },
  json: vi.fn(async () => body),
});

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["narrative"],
  properties: { narrative: { type: "string", minLength: 1 } },
};

describe("AI provider adapters", () => {
  it("lists and generates structured output with OpenAI Responses", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ data: [{ id: "gpt-z" }, { id: "gpt-a" }] }))
      .mockResolvedValueOnce(response({ output_text: '{"narrative":"Draft"}', usage: { total_tokens: 12 } }));
    await expect(openai.listModels({ apiKey: "openai-secret", fetchImpl })).resolves.toEqual([
      { id: "gpt-a", name: "gpt-a" },
      { id: "gpt-z", name: "gpt-z" },
    ]);
    await expect(openai.generate({ apiKey: "openai-secret", model: "gpt-a", system: "Draft", payload: {}, schema, fetchImpl })).resolves.toEqual({ result: { narrative: "Draft" }, usage: { total_tokens: 12 } });
    const [url, options] = fetchImpl.mock.calls[1];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(options.headers.authorization).toBe("Bearer openai-secret");
    expect(JSON.parse(options.body)).toMatchObject({ store: false, text: { format: { type: "json_schema", strict: true } } });
  });

  it("uses Anthropic Messages and removes unsupported schema constraints", async () => {
    const fetchImpl = vi.fn(async () => response({ content: [{ type: "text", text: '{"narrative":"Claude draft"}' }] }));
    await expect(anthropic.generate({ apiKey: "anthropic-secret", model: "claude", system: "Draft", payload: {}, schema, fetchImpl })).resolves.toMatchObject({ result: { narrative: "Claude draft" } });
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(options.headers["x-api-key"]).toBe("anthropic-secret");
    const body = JSON.parse(options.body);
    expect(body.output_config.format.type).toBe("json_schema");
    expect(body.output_config.format.schema.properties.narrative.minLength).toBeUndefined();
  });

  it("uses OpenRouter structured chat completions and required parameters", async () => {
    const fetchImpl = vi.fn(async () => response({ choices: [{ message: { content: '{"narrative":"Router draft"}' } }] }));
    await openrouter.generate({ apiKey: "router-secret", model: "vendor/model", system: "Draft", payload: {}, schema, fetchImpl });
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    const body = JSON.parse(options.body);
    expect(body.provider.require_parameters).toBe(true);
    expect(body.response_format.json_schema.strict).toBe(true);
  });

  it("normalizes auth errors without including provider response bodies", async () => {
    const fetchImpl = vi.fn(async () => response({ error: { message: "secret echoed" } }, 401));
    await expect(openai.listModels({ apiKey: "do-not-leak", fetchImpl })).rejects.toMatchObject({ category: "invalid_key", message: "The AI provider rejected the request (401)." });
  });

  it("normalizes network failures", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("network contains key"); });
    await expect(openrouter.listModels({ apiKey: "do-not-leak", fetchImpl })).rejects.toMatchObject({ category: "network", message: "The AI provider could not be reached." });
  });
});
