const string = { type: "string" };
const rangeProperties = { low: { type: "number" }, high: { type: "number" } };

const WORKFLOWS = {
  scope_draft: {
    system:
      "You are a legal pricing assistant. Draft a practical phase and task structure from anonymized facts. Do not invent client identities, legal advice, or guarantees.",
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
              name: string,
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["name", "range"],
                  properties: {
                    name: string,
                    range: {
                      anyOf: [
                        {
                          type: "object",
                          additionalProperties: false,
                          required: ["low", "high"],
                          properties: rangeProperties,
                        },
                        { type: "null" },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  task_estimate: {
    system:
      "You are a legal pricing assistant. Suggest a defensible cost range and concise internal rationale. Treat the result as a planning estimate, not a quote.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["low", "high", "rationale"],
      properties: { ...rangeProperties, rationale: string },
    },
  },
  all_task_estimates: {
    system:
      "You are a legal pricing assistant. Suggest a defensible range and concise rationale for each supplied task ID. Return one suggestion per task.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["suggestions"],
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["taskId", "low", "high", "rationale"],
            properties: {
              taskId: string,
              ...rangeProperties,
              rationale: string,
            },
          },
        },
      },
    },
  },
  caveat_draft: {
    system:
      "You are a legal pricing assistant. Draft concise budget assumptions and exclusions that clarify scope. Do not state legal conclusions.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["caveats"],
      properties: { caveats: { type: "array", items: string } },
    },
  },
  budget_narrative: {
    system:
      "You are a legal pricing assistant. Draft a polished, concise client-facing explanation of the supplied budget without identifying a client or matter and without promising an outcome.",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["narrative"],
      properties: { narrative: string },
    },
  },
  assumption_review: {
    system:
      "You are a legal pricing reviewer. Identify missing assumptions, exclusions, and scope risks. Be concrete and do not provide legal advice.",
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
            required: ["severity", "message", "suggestedCaveat"],
            properties: {
              severity: {
                type: "string",
                enum: ["info", "warning", "critical"],
              },
              message: string,
              suggestedCaveat: { type: ["string", "null"] },
            },
          },
        },
      },
    },
  },
  integrity_review: {
    system:
      "You are a legal pricing quality reviewer. Identify arithmetic-looking outliers, inconsistent ranges, missing scope, and unresolved budget issues. Do not change the budget.",
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
            required: ["severity", "message", "taskId"],
            properties: {
              severity: {
                type: "string",
                enum: ["info", "warning", "critical"],
              },
              message: string,
              taskId: { type: ["string", "null"] },
            },
          },
        },
      },
    },
  },
  change_plan: {
    system:
      "You are a legal budget editor. Translate the anonymized instruction into a small, reviewable plan of adds, edits, moves, or removals. Never execute changes.",
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
            required: ["action", "summary", "phaseId", "taskId", "name"],
            properties: {
              action: {
                type: "string",
                enum: ["add", "edit", "move", "remove"],
              },
              summary: string,
              phaseId: { type: ["string", "null"] },
              taskId: { type: ["string", "null"] },
              name: { type: ["string", "null"] },
            },
          },
        },
      },
    },
  },
};

function validateResult(workflowId, result) {
  if (!result || typeof result !== "object" || Array.isArray(result))
    return false;
  switch (workflowId) {
    case "scope_draft":
      return Array.isArray(result.phases);
    case "task_estimate":
      return (
        Number.isFinite(result.low) &&
        Number.isFinite(result.high) &&
        result.low >= 0 &&
        result.high >= result.low &&
        Boolean(result.rationale?.trim())
      );
    case "all_task_estimates":
      return (
        Array.isArray(result.suggestions) &&
        result.suggestions.every(
          (item) =>
            item.taskId &&
            Number.isFinite(item.low) &&
            Number.isFinite(item.high) &&
            item.low >= 0 &&
            item.high >= item.low &&
            item.rationale,
        )
      );
    case "caveat_draft":
      return (
        Array.isArray(result.caveats) &&
        result.caveats.every((item) => typeof item === "string" && item.trim())
      );
    case "budget_narrative":
      return (
        typeof result.narrative === "string" && Boolean(result.narrative.trim())
      );
    case "assumption_review":
    case "integrity_review":
      return (
        Array.isArray(result.findings) &&
        result.findings.every(
          (item) =>
            ["info", "warning", "critical"].includes(item?.severity) &&
            item.message,
        )
      );
    case "change_plan":
      return (
        Array.isArray(result.operations) &&
        result.operations.every(
          (item) =>
            ["add", "edit", "move", "remove"].includes(item?.action) &&
            item.summary,
        )
      );
    default:
      return false;
  }
}

module.exports = { WORKFLOWS, validateResult };
