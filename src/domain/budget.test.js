import { describe, expect, it } from "vitest";

import {
  buildMonthlyProjection,
  calculateBudgetTotals,
  calculatePhaseCost,
  calculateTaskCost,
} from "./budget.js";

const timekeepers = [
  { id: "partner", rate: 1000 },
  { id: "associate", rate: 500 },
];
const phases = [
  {
    id: "phase-1",
    selected: true,
    tasks: [
      { id: "fixed", selected: true, low: 101, high: 203 },
      {
        id: "staffed",
        selected: true,
        tkBreakdown: [
          { tkId: "partner", hoursLow: 1, hoursHigh: 2 },
          { tkId: "associate", hoursLow: 2, hoursHigh: 4 },
        ],
      },
    ],
  },
  {
    id: "phase-2",
    selected: true,
    tasks: [{ id: "second", selected: true, low: 700, high: 900 }],
  },
];

describe("budget calculations", () => {
  it("uses timekeeper detail when present and direct ranges otherwise", () => {
    expect(calculateTaskCost(phases[0].tasks[0], timekeepers)).toEqual({
      low: 101,
      high: 203,
    });
    expect(calculateTaskCost(phases[0].tasks[1], timekeepers)).toEqual({
      low: 2000,
      high: 4000,
    });
    expect(calculatePhaseCost(phases[0], timekeepers)).toEqual({
      low: 2101,
      high: 4203,
    });
  });

  it("includes contingency exactly once in the grand total", () => {
    expect(calculateBudgetTotals(phases, timekeepers, 99)).toEqual({
      low: 2900,
      high: 5202,
    });
  });

  it("reconciles every automatic monthly projection to the grand total", () => {
    const projection = buildMonthlyProjection({
      phases,
      timekeepers,
      contingency: 99,
      totalMonths: 7,
      timelineMode: "auto",
      phaseTimeline: {},
    });

    expect(projection.projectionMonths).toBe(7);
    expect(
      Object.values(projection.timeline).reduce(
        (sum, timing) => sum + timing.months,
        0,
      ),
    ).toBe(7);
    expect(
      projection.monthlyData.reduce(
        (total, month) => ({
          low: total.low + month.low,
          high: total.high + month.high,
        }),
        { low: 0, high: 0 },
      ),
    ).toEqual({ low: 2900, high: 5202 });
  });

  it("extends a manual projection so configured work is never dropped", () => {
    const projection = buildMonthlyProjection({
      phases,
      timekeepers,
      contingency: 99,
      totalMonths: 3,
      timelineMode: "manual",
      phaseTimeline: {
        "phase-1": { start: 2, months: 4 },
        "phase-2": { start: 3, months: 5 },
      },
    });

    expect(projection.projectionMonths).toBe(7);
    expect(
      projection.monthlyData.reduce((sum, month) => sum + month.low, 0),
    ).toBe(2900);
    expect(
      projection.monthlyData.reduce((sum, month) => sum + month.high, 0),
    ).toBe(5202);
  });
});
