const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toPositiveInteger = (value, fallback = 1) => {
  const number = Math.floor(toNumber(value));
  return number >= 1 ? number : fallback;
};

export function calculateTaskCost(task, timekeepers) {
  if (task.tkBreakdown?.length) {
    return task.tkBreakdown.reduce(
      (total, entry) => {
        const timekeeper = timekeepers.find((item) => item.id === entry.tkId);
        if (!timekeeper) return total;
        const rate = toNumber(timekeeper.rate);
        return {
          low: total.low + toNumber(entry.hoursLow) * rate,
          high: total.high + toNumber(entry.hoursHigh) * rate,
        };
      },
      { low: 0, high: 0 },
    );
  }

  return { low: toNumber(task.low), high: toNumber(task.high) };
}

export function calculatePhaseCost(phase, timekeepers) {
  return phase.tasks
    .filter((task) => task.selected)
    .reduce(
      (total, task) => {
        const cost = calculateTaskCost(task, timekeepers);
        return { low: total.low + cost.low, high: total.high + cost.high };
      },
      { low: 0, high: 0 },
    );
}

export function calculateBudgetTotals(phases, timekeepers, contingency) {
  const taskTotals = phases
    .filter((phase) => phase.selected)
    .reduce(
      (total, phase) => {
        const cost = calculatePhaseCost(phase, timekeepers);
        return { low: total.low + cost.low, high: total.high + cost.high };
      },
      { low: 0, high: 0 },
    );
  const reserve = toNumber(contingency);
  return { low: taskTotals.low + reserve, high: taskTotals.high + reserve };
}

function allocateInteger(total, slots) {
  if (slots <= 0) return [];
  const roundedTotal = Math.round(toNumber(total));
  const base = Math.floor(roundedTotal / slots);
  let remainder = roundedTotal - base * slots;
  return Array.from({ length: slots }, () => base + (remainder-- > 0 ? 1 : 0));
}

function allocateDurations(totalMonths, weights) {
  if (!weights.length) return [];
  const available = Math.max(toPositiveInteger(totalMonths), weights.length);
  const remaining = available - weights.length;
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const normalized = weightTotal > 0 ? weights : weights.map(() => 1);
  const normalizedTotal = normalized.reduce((sum, weight) => sum + weight, 0);
  const quotas = normalized.map(
    (weight) => (weight / normalizedTotal) * remaining,
  );
  const durations = quotas.map((quota) => 1 + Math.floor(quota));
  let unassigned = available - durations.reduce((sum, value) => sum + value, 0);

  quotas
    .map((quota, index) => ({ index, remainder: quota - Math.floor(quota) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
    .forEach(({ index }) => {
      if (unassigned-- > 0) durations[index] += 1;
    });

  return durations;
}

export function buildMonthlyProjection({
  phases,
  timekeepers,
  contingency,
  totalMonths,
  timelineMode,
  phaseTimeline,
}) {
  const activePhases = phases.filter((phase) => phase.selected);
  const requestedMonths = toPositiveInteger(totalMonths, 12);
  const costs = new Map(
    activePhases.map((phase) => [
      phase.id,
      calculatePhaseCost(phase, timekeepers),
    ]),
  );
  const timeline = {};

  if (timelineMode === "manual") {
    activePhases.forEach((phase) => {
      const configured = phaseTimeline[phase.id] || {};
      timeline[phase.id] = {
        start: toPositiveInteger(configured.start),
        months: toPositiveInteger(
          configured.months,
          Math.max(
            1,
            Math.floor(requestedMonths / Math.max(activePhases.length, 1)),
          ),
        ),
      };
    });
  } else {
    const weights = activePhases.map((phase) => {
      const cost = costs.get(phase.id);
      return (cost.low + cost.high) / 2;
    });
    const durations = allocateDurations(requestedMonths, weights);
    let cursor = 1;
    activePhases.forEach((phase, index) => {
      timeline[phase.id] = { start: cursor, months: durations[index] };
      cursor += durations[index];
    });
  }

  const projectionMonths = Math.max(
    requestedMonths,
    ...activePhases.map((phase) => {
      const timing = timeline[phase.id];
      return timing.start + timing.months - 1;
    }),
  );
  const monthlyData = Array.from({ length: projectionMonths }, (_, index) => ({
    month: index + 1,
    low: 0,
    high: 0,
  }));

  activePhases.forEach((phase) => {
    const timing = timeline[phase.id];
    const cost = costs.get(phase.id);
    const lowAllocation = allocateInteger(cost.low, timing.months);
    const highAllocation = allocateInteger(cost.high, timing.months);
    for (let offset = 0; offset < timing.months; offset += 1) {
      const month = monthlyData[timing.start - 1 + offset];
      month.low += lowAllocation[offset];
      month.high += highAllocation[offset];
    }
  });

  const reserveAllocation = allocateInteger(contingency, projectionMonths);
  monthlyData.forEach((month, index) => {
    month.low += reserveAllocation[index];
    month.high += reserveAllocation[index];
  });

  return { timeline, monthlyData, projectionMonths, costs };
}
