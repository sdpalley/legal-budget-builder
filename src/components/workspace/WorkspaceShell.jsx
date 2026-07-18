import React from "react";

import StageRail from "./StageRail.jsx";
import SummaryRail from "./SummaryRail.jsx";
import "./workspace.css";

export default function WorkspaceShell({
  productName = "Legal Budget Builder",
  eyebrow,
  title,
  description,
  headerActions,
  stages,
  activeStageId,
  onStageChange,
  summary,
  children,
  footer,
  mainId = "budget-workspace-main",
}) {
  return (
    <div className="workspace-shell">
      <header className="workspace-shell__header">
        <div className="workspace-shell__brand" aria-label={productName}>
          <svg aria-hidden="true" viewBox="0 0 32 32">
            <path d="M7 5.5h18v21H7z" />
            <path d="M11 11h10M11 16h10M11 21h6" />
          </svg>
          <span>{productName}</span>
        </div>
        {headerActions ? (
          <div className="workspace-shell__header-actions">{headerActions}</div>
        ) : null}
      </header>

      <div className="workspace-shell__layout">
        <StageRail
          stages={stages}
          activeStageId={activeStageId}
          onStageChange={onStageChange}
        />

        <main className="workspace-shell__main" id={mainId} tabIndex="-1">
          <header className="workspace-shell__page-header">
            {eyebrow ? (
              <span className="workspace-shell__eyebrow">{eyebrow}</span>
            ) : null}
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </header>
          <div className="workspace-shell__content">{children}</div>
          {footer ? (
            <footer className="workspace-shell__footer">{footer}</footer>
          ) : null}
        </main>

        <SummaryRail {...summary} />
      </div>
    </div>
  );
}
