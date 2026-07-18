const { parseJsonText, promptMessages, requestJson } = require("./base.cjs");

const API_ROOT = "https://api.anthropic.com/v1";

function headers(apiKey) {
  return {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  };
}

function supportedSchema(value) {
  if (Array.isArray(value)) return value.map(supportedSchema);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !["minimum", "maximum", "minLength", "maxLength"].includes(key),
      )
      .map(([key, item]) => [key, supportedSchema(item)]),
  );
}

async function listModels({ apiKey, fetchImpl = fetch, signal }) {
  const data = await requestJson(fetchImpl, `${API_ROOT}/models?limit=1000`, {
    headers: headers(apiKey),
    signal,
  });
  return (Array.isArray(data.data) ? data.data : [])
    .map((model) => ({ id: model.id, name: model.display_name || model.id }))
    .filter((model) => typeof model.id === "string")
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function generate({
  apiKey,
  model,
  system,
  payload,
  schema,
  fetchImpl = fetch,
  signal,
}) {
  const messages = promptMessages(system, payload);
  const data = await requestJson(fetchImpl, `${API_ROOT}/messages`, {
    method: "POST",
    headers: headers(apiKey),
    signal,
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: messages[0].content,
      messages: [messages[1]],
      output_config: {
        format: { type: "json_schema", schema: supportedSchema(schema) },
      },
    }),
  });
  const refusal = (Array.isArray(data.content) ? data.content : []).find(
    (item) => item.type === "refusal",
  );
  if (refusal) {
    const { ProviderError } = require("./base.cjs");
    throw new ProviderError(
      "refusal",
      "The selected Claude model declined this request.",
    );
  }
  const text = (Array.isArray(data.content) ? data.content : []).find(
    (item) => item.type === "text",
  )?.text;
  return { result: parseJsonText(text), usage: data.usage || null };
}

module.exports = { generate, listModels, supportedSchema };
