import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AISettings from "./AISettings.jsx";

function client() {
  return {
    mode: "desktop-secure",
    getCredentialStatus: vi.fn(async () => ({
      openai: false,
      anthropic: false,
      openrouter: false,
    })),
    setCredential: vi.fn(async () => ({ configured: true })),
    deleteCredential: vi.fn(),
    testProvider: vi.fn(),
    listModels: vi.fn(async () => []),
    runWorkflow: vi.fn(),
  };
}

describe("AI settings", () => {
  it("stores a provider key and clears the field", async () => {
    const user = userEvent.setup();
    const api = client();
    render(
      <AISettings
        open
        onClose={() => {}}
        routing={{}}
        onRoutingChange={() => {}}
        client={api}
      />,
    );
    const fields = await screen.findAllByLabelText("API key");
    await user.type(fields[0], "openai-secret-key");
    await user.click(screen.getAllByRole("button", { name: "Save key" })[0]);
    await waitFor(() =>
      expect(api.setCredential).toHaveBeenCalledWith(
        "openai",
        "openai-secret-key",
      ),
    );
    expect(fields[0]).toHaveValue("");
    expect(screen.getByText("OpenAI key saved.")).toBeInTheDocument();
  });

  it("changes the default provider and model route", async () => {
    const user = userEvent.setup();
    const onRoutingChange = vi.fn();
    render(
      <AISettings
        open
        onClose={() => {}}
        routing={{}}
        onRoutingChange={onRoutingChange}
        client={client()}
      />,
    );
    const providers = await screen.findAllByLabelText("Provider");
    await user.selectOptions(providers[0], "anthropic");
    expect(onRoutingChange).toHaveBeenCalledWith(
      expect.objectContaining({
        default: { provider: "anthropic", model: "claude-sonnet-4-6" },
      }),
    );
  });
});
