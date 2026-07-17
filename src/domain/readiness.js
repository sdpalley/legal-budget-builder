import { calculateTaskCost } from "./budget.js";

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function reviewBudget({ matter, phases, timekeepers }) {
  const issues = [];
  const add = (id, severity, step, message) =>
    issues.push({ id, severity, step, message });

  if (!matter.name?.trim() && !matter.client?.trim()) {
    add(
      "matter-title",
      "warning",
      1,
      "Add a matter or client name so the exported budget is identifiable.",
    );
  }

  timekeepers.forEach((timekeeper) => {
    if (!timekeeper.name?.trim()) {
      add(
        `timekeeper-name-${timekeeper.id}`,
        "warning",
        1,
        `Name the ${timekeeper.title || "timekeeper"} used in this budget.`,
      );
    }
  });

  const selectedTasks = phases
    .filter((phase) => phase.selected)
    .flatMap((phase) =>
      phase.tasks
        .filter((task) => task.selected)
        .map((task) => ({ phase, task })),
    );

  if (!selectedTasks.length) {
    add(
      "selected-tasks",
      "error",
      2,
      "Select at least one task before exporting the budget.",
    );
    return issues;
  }

  let zeroRangeCount = 0;
  selectedTasks.forEach(({ task }) => {
    if (task.tkBreakdown?.length) {
      task.tkBreakdown.forEach((entry) => {
        const timekeeper = timekeepers.find((item) => item.id === entry.tkId);
        if (!timekeeper || number(timekeeper.rate) <= 0) {
          add(
            `rate-${task.id}-${entry.tkId}`,
            "error",
            1,
            `${task.name} uses a timekeeper without a billing rate.`,
          );
        }
        if (number(entry.hoursLow) > number(entry.hoursHigh)) {
          add(
            `hours-range-${task.id}-${entry.tkId}`,
            "error",
            3,
            `${task.name} has low hours greater than high hours.`,
          );
        }
      });
    } else if (number(task.low) > number(task.high)) {
      add(
        `cost-range-${task.id}`,
        "error",
        3,
        `${task.name} has a low estimate greater than its high estimate.`,
      );
    }

    const cost = calculateTaskCost(task, timekeepers);
    if (cost.low === 0 && cost.high === 0) {
      zeroRangeCount += 1;
    }
  });

  if (zeroRangeCount > 0) {
    add(
      "zero-ranges",
      "warning",
      3,
      `${zeroRangeCount} selected ${zeroRangeCount === 1 ? "task has" : "tasks have"} no estimated cost.`,
    );
  }

  if (
    !selectedTasks.some(({ task }) => {
      const cost = calculateTaskCost(task, timekeepers);
      return cost.low > 0 || cost.high > 0;
    })
  ) {
    add(
      "costed-task",
      "error",
      3,
      "Add a non-zero estimate to at least one selected task before exporting.",
    );
  }

  return issues;
}
