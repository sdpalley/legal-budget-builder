import { useEffect, useState } from "react";
import { aiClient } from "../../ai/client.js";
import { normalizeRouting, PROVIDERS } from "../../ai/routing.js";
import { WORKFLOW_IDS, WORKFLOWS } from "../../ai/workflows.js";
import "./settings.css";

export default function AISettings({
  open,
  onClose,
  routing,
  onRoutingChange,
  client = aiClient,
}) {
  const [status, setStatus] = useState({});
  const [keys, setKeys] = useState({});
  const [models, setModels] = useState({});
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null);
  const normalized = normalizeRouting(routing);

  const refreshStatus = async () => {
    try {
      setStatus(await client.getCredentialStatus());
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    client.getCredentialStatus().then(
      (nextStatus) => {
        if (!cancelled) setStatus(nextStatus);
      },
      (error) => {
        if (!cancelled) setMessage({ tone: "error", text: error.message });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [client, open]);
  if (!open) return null;

  const act = async (id, operation, success) => {
    setBusy(id);
    setMessage(null);
    try {
      await operation();
      await refreshStatus();
      setMessage({ tone: "success", text: success });
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setBusy("");
    }
  };

  const updateDefault = (field, value) => {
    const provider = field === "provider" ? value : normalized.default.provider;
    onRoutingChange?.(
      normalizeRouting({
        ...normalized,
        default: {
          ...normalized.default,
          [field]: value,
          ...(field === "provider"
            ? { model: PROVIDERS[provider].seedModel }
            : {}),
        },
      }),
    );
  };

  const updateWorkflow = (workflowId, field, value) => {
    const current = normalized.workflows[workflowId] || {
      inherit: true,
      ...normalized.default,
    };
    const next = { ...current, [field]: value };
    if (field === "provider") next.model = PROVIDERS[value].seedModel;
    onRoutingChange?.(
      normalizeRouting({
        ...normalized,
        workflows: { ...normalized.workflows, [workflowId]: next },
      }),
    );
  };

  return (
    <div className="settings-backdrop" role="presentation">
      <section
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-settings-title"
      >
        <header className="settings-panel__header">
          <div>
            <span>Application settings</span>
            <h1 id="ai-settings-title">AI providers & workflows</h1>
            <p>
              Keys stay in encrypted desktop storage. Choose a default model,
              then override individual workflows when useful.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI settings"
          >
            ×
          </button>
        </header>
        {client.mode === "browser-session" && (
          <div className="settings-message" data-tone="warning">
            Browser development mode keeps entered keys in memory for this tab,
            but provider requests are disabled. Launch the Electron app for
            secure AI use.
          </div>
        )}
        {message && (
          <div
            className="settings-message"
            data-tone={message.tone}
            role="status"
          >
            {message.text}
          </div>
        )}

        <section
          className="settings-section"
          aria-labelledby="provider-heading"
        >
          <div className="settings-section__heading">
            <span>1</span>
            <div>
              <h2 id="provider-heading">Provider credentials</h2>
              <p>The app never displays a saved key again.</p>
            </div>
          </div>
          <div className="provider-grid">
            {Object.entries(PROVIDERS).map(([id, provider]) => (
              <article className="provider-card" key={id}>
                <div className="provider-card__title">
                  <div>
                    <h3>{provider.label}</h3>
                    <span data-configured={Boolean(status[id])}>
                      {status[id] ? "Configured" : "Not configured"}
                    </span>
                  </div>
                </div>
                <label>
                  <span>{status[id] ? "Replace API key" : "API key"}</span>
                  <input
                    type="password"
                    autoComplete="off"
                    value={keys[id] || ""}
                    placeholder="Paste key"
                    onChange={(event) =>
                      setKeys((value) => ({
                        ...value,
                        [id]: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="provider-card__actions">
                  <button
                    type="button"
                    disabled={busy || !(keys[id] || "").trim()}
                    onClick={() =>
                      act(
                        `save-${id}`,
                        async () => {
                          await client.setCredential(id, keys[id]);
                          setKeys((value) => ({ ...value, [id]: "" }));
                        },
                        `${provider.label} key saved.`,
                      )
                    }
                  >
                    {busy === `save-${id}`
                      ? "Saving…"
                      : status[id]
                        ? "Replace"
                        : "Save key"}
                  </button>
                  <button
                    type="button"
                    disabled={busy || !status[id]}
                    onClick={() =>
                      act(
                        `test-${id}`,
                        () => client.testProvider(id),
                        `${provider.label} connection succeeded.`,
                      )
                    }
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    disabled={busy || !status[id]}
                    onClick={() =>
                      act(
                        `models-${id}`,
                        async () => {
                          const availableModels = await client.listModels(id);
                          setModels((value) => ({
                            ...value,
                            [id]: availableModels,
                          }));
                        },
                        `${provider.label} models refreshed.`,
                      )
                    }
                  >
                    Models
                  </button>
                  {status[id] && (
                    <button
                      type="button"
                      className="danger-link"
                      disabled={busy}
                      onClick={() =>
                        act(
                          `delete-${id}`,
                          () => client.deleteCredential(id),
                          `${provider.label} key removed.`,
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="settings-section" aria-labelledby="routing-heading">
          <div className="settings-section__heading">
            <span>2</span>
            <div>
              <h2 id="routing-heading">Workflow routing</h2>
              <p>
                Model catalogs change, so every model field also accepts a
                manual ID.
              </p>
            </div>
          </div>
          <div className="default-route">
            <strong>Default route</strong>
            <label>
              <span>Provider</span>
              <select
                value={normalized.default.provider}
                onChange={(event) =>
                  updateDefault("provider", event.target.value)
                }
              >
                {Object.entries(PROVIDERS).map(([id, provider]) => (
                  <option key={id} value={id}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </label>
            <ModelField
              provider={normalized.default.provider}
              value={normalized.default.model}
              models={models[normalized.default.provider]}
              onChange={(value) => updateDefault("model", value)}
            />
          </div>
          <div className="workflow-routes">
            {WORKFLOW_IDS.map((workflowId) => {
              const override = normalized.workflows[workflowId];
              const route = override || normalized.default;
              return (
                <div className="workflow-route" key={workflowId}>
                  <div>
                    <strong>{WORKFLOWS[workflowId].label}</strong>
                    <small>{WORKFLOWS[workflowId].description}</small>
                  </div>
                  <label className="inherit-toggle">
                    <input
                      type="checkbox"
                      checked={!override}
                      onChange={(event) =>
                        updateWorkflow(
                          workflowId,
                          "inherit",
                          event.target.checked,
                        )
                      }
                    />
                    <span>Use default</span>
                  </label>
                  <label>
                    <span>Provider</span>
                    <select
                      disabled={!override}
                      value={route.provider}
                      onChange={(event) =>
                        updateWorkflow(
                          workflowId,
                          "provider",
                          event.target.value,
                        )
                      }
                    >
                      {Object.entries(PROVIDERS).map(([id, provider]) => (
                        <option key={id} value={id}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <ModelField
                    disabled={!override}
                    provider={route.provider}
                    value={route.model}
                    models={models[route.provider]}
                    onChange={(value) =>
                      updateWorkflow(workflowId, "model", value)
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </div>
  );
}

function ModelField({
  provider,
  value,
  models = [],
  onChange,
  disabled = false,
}) {
  const listId = `models-${provider}`;
  return (
    <label>
      <span>Model</span>
      <input
        disabled={disabled}
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </datalist>
    </label>
  );
}
