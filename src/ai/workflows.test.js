import { describe, expect, it } from "vitest";
import {
  buildWorkflowPayload,
  validateWorkflowResult,
  WORKFLOW_IDS,
} from "./workflows.js";

describe("AI workflow contracts", () => {
  it("defines all requested workflows", () => {
    expect(WORKFLOW_IDS).toHaveLength(8);
    expect(WORKFLOW_IDS).toContain("scope_draft");
    expect(WORKFLOW_IDS).toContain("change_plan");
  });

  it("redacts identifying names and keeps only required budget context", () => {
    const payload = buildWorkflowPayload("budget_narrative", {
      clientName: "Secret Client",
      matterName: "Secret Matter",
      matterType: "Litigation",
      phases: [
        {
          id: "p1",
          name: "Discovery",
          tasks: [{ id: "t1", name: "Depositions", low: 10, high: 20 }],
        },
      ],
      totals: { low: 10, high: 20 },
      caveats: ["Two depositions assumed"],
    });
    expect(JSON.stringify(payload)).not.toContain("Secret");
    expect(payload.phases[0].tasks[0]).toEqual({
      id: "t1",
      name: "Depositions",
      low: 10,
      high: 20,
    });
  });

  it("uses the explicitly anonymized scope field", () => {
    const payload = buildWorkflowPayload("scope_draft", {
      description: "Do not send this",
      anonymizedScope: "Commercial contract dispute with two witnesses",
    });
    expect(payload.anonymizedScope).toContain("Commercial contract");
    expect(JSON.stringify(payload)).not.toContain("Do not send");
  });

  it("accepts valid estimates and rejects inverted ranges", () => {
    expect(
      validateWorkflowResult("task_estimate", {
        low: 100,
        high: 200,
        rationale: "Typical effort",
      }).valid,
    ).toBe(true);
    expect(
      validateWorkflowResult("task_estimate", {
        low: 300,
        high: 200,
        rationale: "No",
      }).valid,
    ).toBe(false);
  });

  it("rejects malformed batch and change-plan output", () => {
    expect(
      validateWorkflowResult("all_task_estimates", {
        suggestions: [{ taskId: "", low: 1, high: 2, rationale: "x" }],
      }).valid,
    ).toBe(false);
    expect(
      validateWorkflowResult("change_plan", {
        operations: [{ action: "execute", summary: "Delete everything" }],
      }).valid,
    ).toBe(false);
  });
});
