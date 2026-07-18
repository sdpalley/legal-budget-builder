const { parseJsonText, promptMessages, requestJson } = require("./base.cjs");

const API_ROOT = "https://api.openai.com/v1";

function headers(apiKey) {
  return {
    authorization: `Bearer ${apiKey}`,
    "content-type": "application/json",
  };
}

async function listModels({ apiKey, fetchImpl = fetch, signal }) {
  const data = await requestJson(fetchImpl, `${API_ROOT}/models`, {
    headers: headers(apiKey),
    signal,
  });
  return (Array.isArray(data.data) ? data.data : [])
    .map((model) => ({ id: model.id, name: model.id }))
    .filter((model) => typeof model.id === "string")
    .sort((a, b) => a.id.localeCompare(b.id));
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
  const data = await requestJson(fetchImpl, `${API_ROOT}/responses`, {
    method: "POST",
    headers: headers(apiKey),
    signal,
    body: JSON.stringify({
      model,
      input: messages,
      store: false,
      max_output_tokens: 4096,
      text: {
        format: {
          type: "json_schema",
          name: "legal_budget_result",
          strict: true,
          schema,
        },
      },
    }),
  });
  if (typeof data.output_text === "string")
    return {
      result: parseJsonText(data.output_text),
      usage: data.usage || null,
    };
  const content = (Array.isArray(data.output) ? data.output : []).flatMap(
    (item) => item.content || [],
  );
  const refusal = content.find((item) => item.type === "refusal");
  if (refusal) {
    const { ProviderError } = require("./base.cjs");
    throw new ProviderError(
      "refusal",
      "The selected OpenAI model declined this request.",
    );
  }
  const output = content.find((item) => item.type === "output_text");
  return { result: parseJsonText(output?.text), usage: data.usage || null };
}

module.exports = { generate, listModels };
