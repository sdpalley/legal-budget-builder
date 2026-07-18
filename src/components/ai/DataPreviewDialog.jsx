import { useEffect, useRef } from "react";
import "./ai.css";

export default function DataPreviewDialog({
  open,
  provider,
  model,
  payload,
  onConfirm,
  onClose,
}) {
  const confirmRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    confirmRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="ai-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className="ai-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-data-title"
      >
        <div className="ai-dialog__heading">
          <div>
            <span className="ai-eyebrow">Privacy check</span>
            <h2 id="ai-data-title">Review data sent to AI</h2>
          </div>
          <button
            type="button"
            className="ai-icon-button"
            onClick={onClose}
            aria-label="Close data preview"
          >
            ×
          </button>
        </div>
        <p>
          This anonymized data will be sent to <strong>{provider}</strong> using{" "}
          <strong>{model}</strong>. Client and matter names are excluded.
          Confirm it contains no privileged, confidential, personal, or
          identifying details your policies prohibit sharing.
        </p>
        <pre className="ai-payload-preview">
          {JSON.stringify(payload, null, 2)}
        </pre>
        <div className="ai-dialog__actions">
          <button
            type="button"
            className="ai-button ai-button--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="ai-button ai-button--primary"
            onClick={onConfirm}
          >
            Send to {provider}
          </button>
        </div>
      </section>
    </div>
  );
}
