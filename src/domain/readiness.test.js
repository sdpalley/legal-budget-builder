import { describe, expect, it } from "vitest";

import { reviewBudget } from "./readiness.js";

const base = {
  matter: { name: "Sample matter", client: "" },
  timekeepers: [{ id: "partner", name: "Pat", title: "Partner", rate: 900 }],
  phases: [
    {
      id: "phase",
      name: "Discovery",
      selected: true,
      tasks: [
        {
          id: "task",
          name: "Document review",
          selected: true,
          low: 1000,
          high: 2000,
          tkBreakdown: null,
        },
      ],
    },
  ],
};

describe("budget readiness review", () => {
  it("returns no issues for an identifiable, costed budget", () => {
    expect(reviewBudget(base)).toEqual([]);
  });

  it("blocks export when no selected work has a cost", () => {
    const issues = reviewBudget({
      ...base,
      matter: { name: "", client: "" },
      phases: [
        {
          ...base.phases[0],
          tasks: [{ ...base.phases[0].tasks[0], low: "", high: "" }],
        },
      ],
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "matter-title",
          severity: "warning",
          step: 1,
        }),
        expect.objectContaining({
          id: "zero-ranges",
          severity: "warning",
          step: 3,
        }),
        expect.objectContaining({
          id: "costed-task",
          severity: "error",
          step: 3,
        }),
      ]),
    );
  });

  it("flags inverted ranges and missing rates as blocking errors", () => {
    const issues = reviewBudget({
      ...base,
      timekeepers: [{ ...base.timekeepers[0], rate: "" }],
      phases: [
        {
          ...base.phases[0],
          tasks: [
            {
              ...base.phases[0].tasks[0],
              tkBreakdown: [{ tkId: "partner", hoursLow: 10, hoursHigh: 2 }],
            },
          ],
        },
      ],
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ severity: "error", step: 1 }),
        expect.objectContaining({ severity: "error", step: 3 }),
      ]),
    );
  });
});
