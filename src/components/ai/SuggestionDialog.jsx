import { useEffect, useRef } from "react";
import "./ai.css";

function renderSuggestion(value) {
  if (typeof value === "string") return <p>{value}</p>;
  if (Array.isArray(value))
    return (
      <ul>
        {value.map((item, index) => (
          <li key={item.id || item.taskId || index}>
            {typeof item === "string"
              ? item
              : item.summary ||
                item.message ||
                item.name ||
                JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  if (value && typeof value === "object")
    return (
      <dl>
        {Object.entries(value).map(([key, item]) => (
          <div key={key}>
            <dt>{key.replaceAll("_", " ")}</dt>
            <dd>
              {typeof item === "string" || typeof item === "number"
                ? item
                : renderSuggestion(item)}
            </dd>
          </div>
        ))}
      </dl>
    );
  return <p>No suggestion was returned.</p>;
}

export default function SuggestionDialog({
  open,
  title = "Review AI suggestion",
  result,
  onApply,
  onDismiss,
}) {
  const applyRef = useRef(null);
  useEffect(() => {
    if (open) applyRef.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="ai-dialog-backdrop" role="presentation">
      <section
        className="ai-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-suggestion-title"
      >
        <div className="ai-dialog__heading">
          <div>
            <span className="ai-eyebrow">AI-assisted draft</span>
            <h2 id="ai-suggestion-title">{title}</h2>
          </div>
        </div>
        <p>
          Nothing has changed yet. Review the proposal and apply it only if it
          fits this budget.
        </p>
        <div className="ai-suggestion-preview">{renderSuggestion(result)}</div>
        <div className="ai-dialog__actions">
          <button
            type="button"
            className="ai-button ai-button--secondary"
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <button
            ref={applyRef}
            type="button"
            className="ai-button ai-button--primary"
            onClick={onApply}
          >
            Apply suggestion
          </button>
        </div>
      </section>
    </div>
  );
}
