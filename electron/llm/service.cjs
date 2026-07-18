const openai = require("./providers/openai.cjs");
const anthropic = require("./providers/anthropic.cjs");
const openrouter = require("./providers/openrouter.cjs");
const { ProviderError } = require("./providers/base.cjs");
const { WORKFLOWS, validateResult } = require("./workflows.cjs");

const DEFAULT_PROVIDERS = { openai, anthropic, openrouter };

class LLMServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "LLMServiceError";
    this.code = code;
  }
}

function createLLMService({
  credentialStore,
  providers = DEFAULT_PROVIDERS,
  fetchImpl = fetch,
  timeoutMs = 60_000,
}) {
  if (!credentialStore) throw new Error("A credential store is required.");

  function adapter(provider) {
    if (!Object.hasOwn(providers, provider))
      throw new LLMServiceError(
        "invalid_provider",
        "That AI provider is not supported.",
      );
    return providers[provider];
  }

  async function withTimeout(operation) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await operation(controller.signal);
    } finally {
      clearTimeout(timer);
    }
  }

  async function keyFor(provider) {
    try {
      return await credentialStore.get(provider);
    } catch (error) {
      throw new LLMServiceError(
        error.code || "credential_error",
        error.message || "The API key is unavailable.",
      );
    }
  }

  function normalizeError(error) {
    if (error instanceof LLMServiceError) return error;
    if (error instanceof ProviderError)
      return new LLMServiceError(error.category, error.message);
    return new LLMServiceError(
      "unexpected",
      "The AI request could not be completed.",
    );
  }

  return {
    async listModels(provider) {
      const providerAdapter = adapter(provider);
      const apiKey = await keyFor(provider);
      try {
        return await withTimeout((signal) =>
          providerAdapter.listModels({ apiKey, fetchImpl, signal }),
        );
      } catch (error) {
        throw normalizeError(error);
      }
    },

    async testProvider(provider) {
      const models = await this.listModels(provider);
      return { connected: true, modelCount: models.length };
    },

    async run({ workflowId, provider, model, payload }) {
      const contract = WORKFLOWS[workflowId];
      if (!contract)
        throw new LLMServiceError(
          "invalid_workflow",
          "That AI workflow is not supported.",
        );
      const providerAdapter = adapter(provider);
      if (typeof model !== "string" || !model.trim() || model.length > 300) {
        throw new LLMServiceError("invalid_model", "Choose a valid model.");
      }
      if (
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload) ||
        JSON.stringify(payload).length > 120_000
      ) {
        throw new LLMServiceError(
          "invalid_payload",
          "The AI request data is invalid or too large.",
        );
      }
      const apiKey = await keyFor(provider);
      try {
        const response = await withTimeout((signal) =>
          providerAdapter.generate({
            apiKey,
            model: model.trim(),
            system: contract.system,
            payload,
            schema: contract.schema,
            fetchImpl,
            signal,
          }),
        );
        if (!validateResult(workflowId, response.result)) {
          throw new LLMServiceError(
            "invalid_response",
            "The AI provider returned a result that could not be safely applied.",
          );
        }
        return {
          workflowId,
          provider,
          model: model.trim(),
          result: response.result,
          usage: response.usage || null,
        };
      } catch (error) {
        throw normalizeError(error);
      }
    },
  };
}

module.exports = { LLMServiceError, createLLMService };
