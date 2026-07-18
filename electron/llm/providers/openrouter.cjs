const { parseJsonText, promptMessages, requestJson } = require("./base.cjs");

const API_ROOT = "https://openrouter.ai/api/v1";

function headers(apiKey) {
  return {
    authorization: `Bearer ${apiKey}`,
    "content-type": "application/json",
    "http-referer": "https://github.com/sdpalley/legal-budget-builder",
    "x-title": "Legal Budget Builder",
  };
}

async function listModels({ apiKey, fetchImpl = fetch, signal }) {
  const data = await requestJson(fetchImpl, `${API_ROOT}/models`, { headers: headers(apiKey), signal });
  return (Array.isArray(data.data) ? data.data : [])
    .map((model) => ({ id: model.id, name: model.name || model.id, supportedParameters: model.supported_parameters || [] }))
    .filter((model) => typeof model.id === "string")
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function generate({ apiKey, model, system, payload, schema, fetchImpl = fetch, signal }) {
  const data = await requestJson(fetchImpl, `${API_ROOT}/chat/completions`, {
    method: "POST",
    headers: headers(apiKey),
    signal,
    body: JSON.stringify({
      model,
      messages: promptMessages(system, payload),
      max_tokens: 4096,
      response_format: {
        type: "json_schema",
        json_schema: { name: "legal_budget_result", strict: true, schema },
      },
      provider: { require_parameters: true },
    }),
  });
  const message = data.choices?.[0]?.message;
  if (message?.refusal) {
    const { ProviderError } = require("./base.cjs");
    throw new ProviderError("refusal", "The selected OpenRouter model declined this request.");
  }
  return { result: parseJsonText(message?.content), usage: data.usage || null };
}

module.exports = { generate, listModels };

