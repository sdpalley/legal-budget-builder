import React from "react";

function formatMoney(value, currency) {
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SummaryRail({
  saveStatus = "Not saved yet",
  saveTone = "neutral",
  lowTotal,
  highTotal,
  currency = "USD",
  feeType = "Not selected",
  issueCount = 0,
  onReviewIssues,
  ariaLabel = "Budget summary",
}) {
  const issueText = `${issueCount} ${issueCount === 1 ? "issue" : "issues"}`;

  return (
    <aside className="workspace-summary-rail" aria-label={ariaLabel}>
      <div className="workspace-summary-rail__header">
        <div>
          <span className="workspace-summary-rail__eyebrow">At a glance</span>
          <h2>Budget summary</h2>
        </div>
        <span
          className="workspace-summary-rail__save-status"
          data-tone={saveTone}
          role="status"
        >
          <span aria-hidden="true" />
          {saveStatus}
        </span>
      </div>

      <dl className="workspace-summary-rail__details">
        <div className="workspace-summary-rail__range">
          <dt>Estimated range</dt>
          <dd>
            <span>{formatMoney(lowTotal, currency)}</span>
            <span aria-hidden="true">–</span>
            <span>{formatMoney(highTotal, currency)}</span>
          </dd>
        </div>
        <div>
          <dt>Fee structure</dt>
          <dd>{feeType}</dd>
        </div>
        <div>
          <dt>Needs attention</dt>
          <dd>
            {onReviewIssues ? (
              <button
                type="button"
                className="workspace-summary-rail__issues-button"
                onClick={onReviewIssues}
              >
                {issueText}
              </button>
            ) : (
              issueText
            )}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
