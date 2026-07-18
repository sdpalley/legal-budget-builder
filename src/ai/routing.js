import { WORKFLOW_IDS } from "./workflows.js";

export const PROVIDERS = Object.freeze({
  openai: { label: "OpenAI", seedModel: "gpt-5.6" },
  anthropic: { label: "Anthropic Claude", seedModel: "claude-sonnet-4-6" },
  openrouter: { label: "OpenRouter", seedModel: "openai/gpt-5.6" },
});

export const DEFAULT_ROUTING = Object.freeze({
  default: { provider: "openai", model: PROVIDERS.openai.seedModel },
  workflows: {},
});

const validProvider = (value) => Object.hasOwn(PROVIDERS, value);

export function normalizeRouting(value = {}) {
  const requestedDefault = value.default || {};
  const defaultProvider = validProvider(requestedDefault.provider)
    ? requestedDefault.provider
    : DEFAULT_ROUTING.default.provider;
  const normalized = {
    default: {
      provider: defaultProvider,
      model:
        typeof requestedDefault.model === "string" &&
        requestedDefault.model.trim()
          ? requestedDefault.model.trim()
          : PROVIDERS[defaultProvider].seedModel,
    },
    workflows: {},
  };
  for (const workflowId of WORKFLOW_IDS) {
    const route = value.workflows?.[workflowId];
    if (!route || route.inherit !== false) continue;
    const provider = validProvider(route.provider)
      ? route.provider
      : defaultProvider;
    normalized.workflows[workflowId] = {
      inherit: false,
      provider,
      model:
        typeof route.model === "string" && route.model.trim()
          ? route.model.trim()
          : PROVIDERS[provider].seedModel,
    };
  }
  return normalized;
}

export function resolveRoute(workflowId, routing) {
  if (!WORKFLOW_IDS.includes(workflowId))
    throw new Error(`Unknown AI workflow: ${workflowId}`);
  const normalized = normalizeRouting(routing);
  return normalized.workflows[workflowId] || normalized.default;
}
