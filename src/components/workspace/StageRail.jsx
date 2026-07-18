import React from "react";

const DEFAULT_WORKSPACE_STAGES = [
  { id: "brief", label: "Brief" },
  { id: "scope", label: "Scope" },
  { id: "estimate", label: "Estimate" },
  { id: "review", label: "Review & Export" },
];

function StageStatusIcon({ status }) {
  if (status === "complete") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="m5 10 3 3 7-7" />
      </svg>
    );
  }

  if (status === "issues") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M10 5.5v5" />
        <circle cx="10" cy="14" r=".75" />
      </svg>
    );
  }

  return (
    <span aria-hidden="true" className="workspace-stage-rail__index-dot" />
  );
}

function getStageStatus(stage, isActive) {
  if (isActive) return "current";
  return stage.status || "upcoming";
}

function getStageAccessibleLabel(stage, index, status) {
  const details = [`Stage ${index + 1}: ${stage.label}`];

  if (status === "complete") details.push("complete");
  if (stage.issueCount > 0) {
    details.push(
      `${stage.issueCount} ${stage.issueCount === 1 ? "issue" : "issues"}`,
    );
  }

  return details.join(", ");
}

export default function StageRail({
  stages = DEFAULT_WORKSPACE_STAGES,
  activeStageId,
  onStageChange,
  ariaLabel = "Budget workflow",
}) {
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === activeStageId),
  );

  const chooseStage = (stage) => {
    if (!stage.disabled && stage.id !== activeStageId) {
      onStageChange?.(stage.id);
    }
  };

  return (
    <nav className="workspace-stage-rail" aria-label={ariaLabel}>
      <div className="workspace-stage-rail__heading">
        <span className="workspace-stage-rail__eyebrow">Budget workflow</span>
        <strong>
          Stage {activeIndex + 1} of {stages.length}
        </strong>
      </div>

      <label className="workspace-stage-rail__mobile-control">
        <span>Current stage</span>
        <select
          value={activeStageId}
          onChange={(event) => {
            const nextStage = stages.find(
              (stage) => stage.id === event.target.value,
            );
            if (nextStage) chooseStage(nextStage);
          }}
        >
          {stages.map((stage, index) => (
            <option key={stage.id} value={stage.id} disabled={stage.disabled}>
              {index + 1}. {stage.label}
              {stage.issueCount > 0
                ? ` (${stage.issueCount} ${stage.issueCount === 1 ? "issue" : "issues"})`
                : ""}
            </option>
          ))}
        </select>
      </label>

      <ol className="workspace-stage-rail__list">
        {stages.map((stage, index) => {
          const isActive = stage.id === activeStageId;
          const status = getStageStatus(stage, isActive);

          return (
            <li key={stage.id} data-status={status}>
              <button
                type="button"
                className="workspace-stage-rail__button"
                aria-current={isActive ? "step" : undefined}
                aria-label={getStageAccessibleLabel(stage, index, status)}
                disabled={stage.disabled}
                onClick={() => chooseStage(stage)}
              >
                <span className="workspace-stage-rail__marker">
                  <StageStatusIcon status={status} />
                </span>
                <span className="workspace-stage-rail__label">
                  <span>{stage.label}</span>
                  <small>
                    {stage.issueCount > 0
                      ? `${stage.issueCount} ${stage.issueCount === 1 ? "issue" : "issues"}`
                      : status === "complete"
                        ? "Complete"
                        : isActive
                          ? "In progress"
                          : "Not started"}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
