import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import WorkspaceShell from "./WorkspaceShell.jsx";

const stages = [
  { id: "brief", label: "Brief", status: "complete" },
  { id: "scope", label: "Scope" },
  { id: "estimate", label: "Estimate", status: "issues", issueCount: 2 },
  { id: "review", label: "Review & Export", disabled: true },
];

function renderWorkspace(overrides = {}) {
  const onStageChange = vi.fn();
  const onReviewIssues = vi.fn();

  render(
    <WorkspaceShell
      eyebrow="Litigation budget"
      title="Shape the scope"
      description="Select the phases and tasks included in this matter."
      stages={stages}
      activeStageId="scope"
      onStageChange={onStageChange}
      summary={{
        saveStatus: "Saved locally",
        saveTone: "success",
        lowTotal: 125000,
        highTotal: 185000,
        feeType: "Hourly with cap",
        issueCount: 2,
        onReviewIssues,
      }}
      headerActions={<button type="button">Settings</button>}
      footer={<button type="button">Continue</button>}
      {...overrides}
    >
      <section aria-labelledby="scope-details-heading">
        <h2 id="scope-details-heading">Scope details</h2>
      </section>
    </WorkspaceShell>,
  );

  return { onStageChange, onReviewIssues };
}

describe("WorkspaceShell", () => {
  it("provides named navigation, main, and summary landmarks", () => {
    renderWorkspace();

    expect(
      screen.getByRole("navigation", { name: "Budget workflow" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute(
      "id",
      "budget-workspace-main",
    );
    expect(
      screen.getByRole("complementary", { name: "Budget summary" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Shape the scope" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Scope details" }),
    ).toBeInTheDocument();
  });

  it("announces stage state and handles desktop or narrow navigation", async () => {
    const user = userEvent.setup();
    const { onStageChange } = renderWorkspace();

    expect(
      screen.getByRole("button", { name: "Stage 2: Scope" }),
    ).toHaveAttribute("aria-current", "step");
    expect(
      screen.getByRole("button", { name: "Stage 1: Brief, complete" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Stage 3: Estimate, 2 issues" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Stage 4: Review & Export" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Stage 3: Estimate, 2 issues" }),
    );
    expect(onStageChange).toHaveBeenLastCalledWith("estimate");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Current stage" }),
      "brief",
    );
    expect(onStageChange).toHaveBeenLastCalledWith("brief");
  });

  it("shows save, range, fee, and issue state with an issue action", async () => {
    const user = userEvent.setup();
    const { onReviewIssues } = renderWorkspace();

    expect(screen.getByRole("status")).toHaveTextContent("Saved locally");
    expect(screen.getByText("$125,000")).toBeInTheDocument();
    expect(screen.getByText("$185,000")).toBeInTheDocument();
    expect(screen.getByText("Hourly with cap")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2 issues" }));
    expect(onReviewIssues).toHaveBeenCalledOnce();
  });

  it("supports custom currency and a read-only issue summary", () => {
    renderWorkspace({
      summary: {
        saveStatus: "Saving paused",
        saveTone: "warning",
        lowTotal: 1000,
        highTotal: 2500,
        currency: "EUR",
        feeType: "Fixed fee",
        issueCount: 1,
      },
    });

    expect(screen.getByText("€1,000")).toBeInTheDocument();
    expect(screen.getByText("€2,500")).toBeInTheDocument();
    expect(screen.getByText("1 issue")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "1 issue" }),
    ).not.toBeInTheDocument();
  });
});
