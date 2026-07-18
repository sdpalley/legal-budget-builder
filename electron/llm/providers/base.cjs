class ProviderError extends Error {
  constructor(category, message, status) {
    super(message);
    this.name = "ProviderError";
    this.category = category;
    this.status = status;
  }
}

function categoryForStatus(status) {
  if (status === 401) return "invalid_key";
  if (status === 403) return "permission";
  if (status === 404) return "model_unavailable";
  if (status === 408) return "timeout";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "provider_outage";
  return "provider_request";
}

async function requestJson(fetchImpl, url, options) {
  let response;
  try {
    response = await fetchImpl(url, options);
  } catch (error) {
    if (error?.name === "AbortError") throw new ProviderError("timeout", "The AI request timed out.");
    throw new ProviderError("network", "The AI provider could not be reached.");
  }
  if (!response.ok) {
    throw new ProviderError(
      categoryForStatus(response.status),
      `The AI provider rejected the request (${response.status}).`,
      response.status,
    );
  }
  const declaredLength = Number(response.headers?.get?.("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > 2_000_000) {
    throw new ProviderError("response_too_large", "The AI provider response was too large.");
  }
  try {
    return await response.json();
  } catch {
    throw new ProviderError("invalid_response", "The AI provider returned unreadable data.");
  }
}

function parseJsonText(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new ProviderError("invalid_response", "The AI provider returned no structured result.");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new ProviderError("invalid_response", "The AI provider returned invalid structured data.");
  }
}

function promptMessages(system, payload) {
  return [
    { role: "system", content: system },
    {
      role: "user",
      content: `Return only the requested structured result for this anonymized legal-budget input:\n${JSON.stringify(payload)}`,
    },
  ];
}

module.exports = { ProviderError, parseJsonText, promptMessages, requestJson };

