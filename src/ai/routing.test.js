import { describe, expect, it } from "vitest";
import { normalizeRouting, resolveRoute } from "./routing.js";

describe("AI routing", () => {
  it("uses a safe default for invalid configuration", () => {
    expect(normalizeRouting({ default: { provider: "unknown", model: "" } }).default).toEqual({ provider: "openai", model: "gpt-5.6" });
  });

  it("supports per-workflow provider and model overrides", () => {
    const route = resolveRoute("caveat_draft", {
      default: { provider: "openai", model: "gpt-default" },
      workflows: { caveat_draft: { inherit: false, provider: "anthropic", model: "claude-custom" } },
    });
    expect(route).toEqual({ inherit: false, provider: "anthropic", model: "claude-custom" });
  });

  it("inherits the global route by default", () => {
    expect(resolveRoute("scope_draft", { default: { provider: "openrouter", model: "vendor/model" } })).toEqual({ provider: "openrouter", model: "vendor/model" });
  });
});
