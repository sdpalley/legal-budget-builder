export const WORKFLOW_IDS = Object.freeze([
  "scope_draft",
  "task_estimate",
  "all_task_estimates",
  "caveat_draft",
  "budget_narrative",
  "assumption_review",
  "integrity_review",
  "change_plan",
]);

const moneyRange = {
  type: "object",
  additionalProperties: false,
  required: ["low", "high"],
  properties: {
    low: { type: "number", minimum: 0 },
    high: { type: "number", minimum: 0 },
  },
};

const taskSuggestion = {
  type: "object",
  additionalProperties: false,
  required: ["taskId", "low", "high", "rationale"],
  properties: {
    taskId: { type: "string" },
    low: { type: "number", minimum: 0 },
    high: { type: "number", minimum: 0 },
    rationale: { type: "string" },
  },
};

export const WORKFLOWS = Object.freeze({
  scope_draft: {
    label: "Draft scope",
    description: "Propose phases, tasks, and optional initial ranges.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["phases"],
      properties: {
        phases: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "tasks"],
            properties: {
              name: { type: "string" },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["name"],
                  properties: { name: { type: "string" }, range: moneyRange },
                },
              },
            },
          },
        },
      },
    },
  },
  task_estimate: {
    label: "Estimate task",
    description: "Suggest a low/high cost range and rationale for one task.",
    schema: { ...taskSuggestion, required: ["low", "high", "rationale"] },
  },
  all_task_estimates: {
    label: "Estimate all tasks",
    description: "Suggest ranges and rationales for every task.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["suggestions"],
      properties: { suggestions: { type: "array", items: taskSuggestion } },
    },
  },
  caveat_draft: {
    label: "Draft caveats",
    description: "Suggest assumptions and exclusions for the budget.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["caveats"],
      properties: { caveats: { type: "array", items: { type: "string" } } },
    },
  },
  budget_narrative: {
    label: "Draft client narrative",
    description: "Create a concise client-facing budget summary.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["narrative"],
      properties: { narrative: { type: "string" } },
    },
  },
  assumption_review: {
    label: "Review assumptions",
    description: "Find missing assumptions, exclusions, and scope risks.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["findings"],
      properties: {
        findings: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["severity", "message"],
            properties: {
              severity: { type: "string", enum: ["info", "warning", "critical"] },
              message: { type: "string" },
              suggestedCaveat: { type: "string" },
            },
          },
        },
      },
    },
  },
  integrity_review: {
    label: "Review completed budget",
    description: "Find inconsistencies, outliers, and unresolved issues.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["findings"],
      properties: {
        findings: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["severity", "message"],
            properties: {
              severity: { type: "string", enum: ["info", "warning", "critical"] },
              message: { type: "string" },
              taskId: { type: "string" },
            },
          },
        },
      },
    },
  },
  change_plan: {
    label: "Plan scope changes",
    description: "Turn a plain-language instruction into reviewable edits.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["operations"],
      properties: {
        operations: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["action", "summary"],
            properties: {
              action: { type: "string", enum: ["add", "edit", "move", "remove"] },
              summary: { type: "string" },
              phaseId: { type: "string" },
              taskId: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    },
  },
});

const cleanText = (value, maxLength = 4000) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const cleanNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const cleanTasks = (phases = [], includeCosts = true) =>
  (Array.isArray(phases) ? phases : []).slice(0, 60).map((phase) => ({
    id: cleanText(phase.id, 100),
    name: cleanText(phase.name, 240),
    tasks: (Array.isArray(phase.tasks) ? phase.tasks : []).slice(0, 250).map((task) => ({
      id: cleanText(task.id, 100),
      name: cleanText(task.name, 300),
      ...(includeCosts
        ? { low: cleanNumber(task.low), high: cleanNumber(task.high) }
        : {}),
    })),
  }));

const context = (input) => ({
  matterType: cleanText(input.matterType, 120),
  jurisdiction: cleanText(input.jurisdiction, 160),
  durationMonths: cleanNumber(input.durationMonths),
  feeType: cleanText(input.feeType, 100),
});

export function buildWorkflowPayload(workflowId, input = {}) {
  if (!WORKFLOWS[workflowId]) throw new Error(`Unknown AI workflow: ${workflowId}`);

  const base = context(input);
  switch (workflowId) {
    case "scope_draft":
      return { ...base, anonymizedScope: cleanText(input.anonymizedScope, 12000) };
    case "task_estimate":
      return {
        ...base,
        task: {
          id: cleanText(input.task?.id, 100),
          name: cleanText(input.task?.name, 300),
        },
        timekeepers: (Array.isArray(input.timekeepers) ? input.timekeepers : []).map((item) => ({
          role: cleanText(item.role || item.name, 160),
          rate: cleanNumber(item.rate),
        })),
      };
    case "all_task_estimates":
      return {
        ...base,
        phases: cleanTasks(input.phases, false),
        timekeepers: (Array.isArray(input.timekeepers) ? input.timekeepers : []).map((item) => ({
          role: cleanText(item.role || item.name, 160),
          rate: cleanNumber(item.rate),
        })),
      };
    case "caveat_draft":
      return { ...base, phases: cleanTasks(input.phases), totals: cleanRange(input.totals) };
    case "budget_narrative":
      return {
        ...base,
        phases: cleanTasks(input.phases),
        totals: cleanRange(input.totals),
        caveats: (Array.isArray(input.caveats) ? input.caveats : []).map((item) => cleanText(item, 1000)),
      };
    case "assumption_review":
      return {
        ...base,
        phases: cleanTasks(input.phases),
        caveats: (Array.isArray(input.caveats) ? input.caveats : []).map((item) => cleanText(item, 1000)),
      };
    case "integrity_review":
      return {
        ...base,
        phases: cleanTasks(input.phases),
        totals: cleanRange(input.totals),
        caveats: (Array.isArray(input.caveats) ? input.caveats : []).map((item) => cleanText(item, 1000)),
      };
    case "change_plan":
      return {
        instruction: cleanText(input.instruction, 6000),
        phases: cleanTasks(input.phases),
      };
    default:
      throw new Error(`Unknown AI workflow: ${workflowId}`);
  }
}

function cleanRange(value = {}) {
  return { low: cleanNumber(value.low), high: cleanNumber(value.high) };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isRange(value) {
  return (
    value &&
    Number.isFinite(value.low) &&
    Number.isFinite(value.high) &&
    value.low >= 0 &&
    value.high >= value.low
  );
}

export function validateWorkflowResult(workflowId, value) {
  if (!WORKFLOWS[workflowId]) return { valid: false, errors: ["Unknown workflow."] };
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, errors: ["The provider did not return an object."] };
  }

  if (workflowId === "task_estimate" && (!isRange(value) || !isNonEmptyString(value.rationale))) {
    errors.push("The task estimate needs a valid low/high range and rationale.");
  }
  if (workflowId === "all_task_estimates") {
    if (!Array.isArray(value.suggestions) || value.suggestions.some((item) => !isRange(item) || !isNonEmptyString(item.taskId) || !isNonEmptyString(item.rationale))) {
      errors.push("Every task suggestion needs an ID, valid range, and rationale.");
    }
  }
  if (workflowId === "scope_draft") {
    if (!Array.isArray(value.phases) || value.phases.some((phase) => !isNonEmptyString(phase.name) || !Array.isArray(phase.tasks) || phase.tasks.some((task) => !isNonEmptyString(task.name) || (task.range && !isRange(task.range))))) {
      errors.push("Every phase and task needs a name, and optional ranges must be valid.");
    }
  }
  if (workflowId === "caveat_draft" && (!Array.isArray(value.caveats) || value.caveats.some((item) => !isNonEmptyString(item)))) errors.push("Caveats must be non-empty text.");
  if (workflowId === "budget_narrative" && !isNonEmptyString(value.narrative)) errors.push("The narrative is empty.");
  if (["assumption_review", "integrity_review"].includes(workflowId)) {
    const severities = new Set(["info", "warning", "critical"]);
    if (!Array.isArray(value.findings) || value.findings.some((item) => !severities.has(item?.severity) || !isNonEmptyString(item?.message))) errors.push("Every finding needs a recognized severity and message.");
  }
  if (workflowId === "change_plan") {
    const actions = new Set(["add", "edit", "move", "remove"]);
    if (!Array.isArray(value.operations) || value.operations.some((item) => !actions.has(item?.action) || !isNonEmptyString(item?.summary))) errors.push("Every change needs a recognized action and summary.");
  }
  return { valid: errors.length === 0, errors };
}

