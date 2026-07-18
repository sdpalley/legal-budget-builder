export const DRAFT_STORAGE_KEY = "lb_session";
export const DRAFT_VERSION = 1;

const MODES = new Set(["litigation", "corporate", "tax"]);
const FEE_TYPES = new Set(["hourly", "fixed", "blended", "contingency"]);

const MATTER_TYPES = {
  litigation: new Set(["arbitration", "federal", "state", "regulatory"]),
  corporate: new Set([
    "ma_strategic",
    "ma_pe",
    "vc_growth",
    "capital_markets_ipo",
    "capital_markets_debt",
    "private_placement",
    "real_estate_acq",
    "real_estate_finance",
    "commercial_lending",
    "joint_venture",
    "licensing_ip",
    "restructuring",
  ]),
  tax: new Set([
    "irs_audit",
    "irs_appeals",
    "tax_court",
    "district_court_tax",
    "salt_controversy",
    "transfer_pricing",
    "criminal_tax",
    "ma_tax",
    "intl_tax",
    "partnership_tax",
    "exec_comp",
    "tax_exempt",
  ]),
};

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const toString = (value, fallback = "") => {
  if (["string", "number", "boolean"].includes(typeof value)) {
    return String(value);
  }
  return fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }
  return fallback;
};

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
};

const normalizeBreakdown = (value) => {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value)) return false;

  const entries = value.map((entry) =>
    isRecord(entry)
      ? {
          tkId: toString(entry.tkId),
          hoursLow: toOptionalNumber(entry.hoursLow),
          hoursHigh: toOptionalNumber(entry.hoursHigh),
        }
      : null,
  );
  return entries.some((entry) => entry === null) ? false : entries;
};

const normalizeTask = (task) => {
  if (!isRecord(task)) return null;

  const tkBreakdown = normalizeBreakdown(task.tkBreakdown);
  if (tkBreakdown === false) return null;

  return {
    id: toString(task.id),
    name: toString(task.name),
    note: toString(task.note),
    selected: toBoolean(task.selected, true),
    low: toOptionalNumber(task.low),
    high: toOptionalNumber(task.high),
    aiRationale: toString(task.aiRationale),
    tkBreakdown,
  };
};

const normalizePhase = (phase) => {
  if (!isRecord(phase) || !Array.isArray(phase.tasks)) return null;

  const tasks = phase.tasks.map(normalizeTask);
  if (tasks.some((task) => task === null)) return null;

  return {
    id: toString(phase.id),
    name: toString(phase.name),
    selected: toBoolean(phase.selected, true),
    tasks,
  };
};

const normalizeMatter = (matter) => ({
  name: toString(matter.name),
  client: toString(matter.client),
  type: toString(matter.type),
  duration: toString(matter.duration),
  jurisdiction: toString(matter.jurisdiction),
  description: toString(matter.description),
  dealValue: toString(matter.dealValue),
});

const normalizeTimekeeper = (timekeeper) => {
  if (!isRecord(timekeeper)) return null;

  return {
    id: toString(timekeeper.id),
    name: toString(timekeeper.name),
    title: toString(timekeeper.title),
    rate: toOptionalNumber(timekeeper.rate),
  };
};

const normalizeTimeline = (timeline) => {
  const normalized = {};
  for (const [phaseId, entry] of Object.entries(timeline)) {
    if (!isRecord(entry)) continue;
    normalized[toString(phaseId)] = {
      start: Math.max(1, toNumber(entry.start, 1)),
      months: Math.max(1, toNumber(entry.months, 1)),
    };
  }
  return normalized;
};

const resolveTimestamp = (now = Date.now()) => {
  const value = typeof now === "function" ? now() : now;
  const timestamp = value instanceof Date ? value.getTime() : Number(value);
  return Number.isFinite(timestamp) && timestamp >= 0 ? timestamp : Date.now();
};

export function inferModeFromMatterType(type) {
  const normalizedType = toString(type);
  return (
    Object.entries(MATTER_TYPES).find(([, types]) =>
      types.has(normalizedType),
    )?.[0] ?? null
  );
}

export function normalizeDraft(raw) {
  try {
    if (!isRecord(raw)) return null;
    if (raw.version !== undefined && Number(raw.version) !== DRAFT_VERSION) {
      return null;
    }
    if (
      !isRecord(raw.matter) ||
      !Array.isArray(raw.phases) ||
      !Array.isArray(raw.timekeepers)
    ) {
      return null;
    }
    if (raw.caveats !== undefined && !Array.isArray(raw.caveats)) return null;
    if (raw.phaseTimeline !== undefined && !isRecord(raw.phaseTimeline)) {
      return null;
    }

    const matter = normalizeMatter(raw.matter);
    const inferredMode = inferModeFromMatterType(matter.type);
    const mode = MODES.has(raw.mode) ? raw.mode : inferredMode;
    if (!mode || (inferredMode && mode !== inferredMode)) return null;

    const phases = raw.phases.map(normalizePhase);
    const timekeepers = raw.timekeepers.map(normalizeTimekeeper);
    if (
      phases.some((phase) => phase === null) ||
      timekeepers.some((timekeeper) => timekeeper === null)
    ) {
      return null;
    }
    const timekeeperIds = new Set(
      timekeepers.map((timekeeper) => timekeeper.id),
    );
    if (
      timekeeperIds.has("") ||
      timekeeperIds.size !== timekeepers.length ||
      phases.some((phase) =>
        phase.tasks.some((task) =>
          task.tkBreakdown?.some(
            (entry) => !entry.tkId || !timekeeperIds.has(entry.tkId),
          ),
        ),
      )
    ) {
      return null;
    }

    return {
      version: DRAFT_VERSION,
      savedAt: resolveTimestamp(raw.savedAt),
      mode,
      matter,
      phases,
      timekeepers,
      contingency: toNumber(raw.contingency, 100000),
      feeType: FEE_TYPES.has(raw.feeType) ? raw.feeType : "hourly",
      caveats: (raw.caveats ?? []).map((caveat) => toString(caveat)),
      aiScope: toString(raw.aiScope),
      clientNarrative: toString(raw.clientNarrative),
      timelineMode: raw.timelineMode === "manual" ? "manual" : "auto",
      phaseTimeline: normalizeTimeline(raw.phaseTimeline ?? {}),
    };
  } catch {
    return null;
  }
}

export function readDraft(storage) {
  let serialized;
  try {
    serialized = storage.getItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    return {
      status: "unavailable",
      draft: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  if (serialized === null || serialized === "") {
    return { status: "empty", draft: null };
  }

  try {
    const draft = normalizeDraft(JSON.parse(serialized));
    if (!draft) {
      return {
        status: "corrupt",
        draft: null,
        error: new Error("Stored draft has an invalid shape or version."),
      };
    }
    return { status: "ready", draft };
  } catch (error) {
    return {
      status: "corrupt",
      draft: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function writeDraft(storage, draft, now) {
  try {
    const normalized = normalizeDraft(draft);
    if (!normalized) {
      return { ok: false, error: new Error("Draft has an invalid shape.") };
    }

    storage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ ...normalized, savedAt: resolveTimestamp(now) }),
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function clearDraft(storage) {
  try {
    storage.removeItem(DRAFT_STORAGE_KEY);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
