import { describe, expect, it, vi } from "vitest";

import {
  DRAFT_STORAGE_KEY,
  DRAFT_VERSION,
  clearDraft,
  inferModeFromMatterType,
  normalizeDraft,
  readDraft,
  writeDraft,
} from "./draftStorage.js";

const makeDraft = (overrides = {}) => ({
  mode: "litigation",
  matter: {
    name: "Example matter",
    client: "Sample client",
    type: "arbitration",
    duration: "12 months",
    jurisdiction: "AAA",
    description: "A sample dispute",
    dealValue: "",
  },
  phases: [
    {
      id: "p1",
      name: "Pre-Filing",
      selected: true,
      tasks: [
        {
          id: "t1",
          name: "Draft claim",
          note: "",
          selected: true,
          low: "1000",
          high: 2000,
          aiRationale: "legacy AI text",
          tkBreakdown: [
            { tkId: "tk1", hoursLow: "2", hoursHigh: 4, extra: true },
          ],
        },
      ],
    },
  ],
  timekeepers: [{ id: "tk1", name: "Lawyer", title: "Partner", rate: "500" }],
  contingency: "25000",
  feeType: "hourly",
  caveats: ["Estimate only"],
  timelineMode: "manual",
  phaseTimeline: { p1: { start: "2", months: 3, ignored: true } },
  summary: "legacy generated summary",
  aiLoading: { t1: true },
  ...overrides,
});

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
  };
};

describe("inferModeFromMatterType", () => {
  it.each([
    ["federal", "litigation"],
    ["capital_markets_ipo", "corporate"],
    ["tax_court", "tax"],
    ["unknown", null],
    [null, null],
  ])("maps %s to %s", (type, mode) => {
    expect(inferModeFromMatterType(type)).toBe(mode);
  });
});

describe("normalizeDraft", () => {
  it("migrates a legacy draft, coerces values, and preserves accepted AI content", () => {
    const draft = normalizeDraft(makeDraft());

    expect(draft).toMatchObject({
      version: DRAFT_VERSION,
      mode: "litigation",
      contingency: 25000,
      matter: { type: "arbitration" },
      phases: [
        {
          tasks: [
            {
              low: 1000,
              high: 2000,
              tkBreakdown: [{ tkId: "tk1", hoursLow: 2, hoursHigh: 4 }],
            },
          ],
        },
      ],
      timekeepers: [{ rate: 500 }],
      phaseTimeline: { p1: { start: 2, months: 3 } },
    });
    expect(draft.savedAt).toEqual(expect.any(Number));
    expect(draft).not.toHaveProperty("summary");
    expect(draft).not.toHaveProperty("aiLoading");
    expect(draft.phases[0].tasks[0]).toHaveProperty(
      "aiRationale",
      "legacy AI text",
    );
    expect(draft.phases[0].tasks[0].tkBreakdown[0]).not.toHaveProperty("extra");
  });

  it.each([
    null,
    [],
    makeDraft({ version: 99 }),
    makeDraft({ matter: "not an object" }),
    makeDraft({ phases: {} }),
    makeDraft({ phases: [{ id: "p1", tasks: "invalid" }] }),
    makeDraft({ timekeepers: [null] }),
    makeDraft({ caveats: "invalid" }),
    makeDraft({ phaseTimeline: [] }),
    makeDraft({ mode: "tax" }),
    makeDraft({ phases: [{ id: "p1", tasks: [{ tkBreakdown: {} }] }] }),
    makeDraft({
      phases: [
        {
          id: "p1",
          tasks: [{ tkBreakdown: [{ tkId: "missing" }] }],
        },
      ],
    }),
  ])("rejects malformed or inconsistent input %#", (raw) => {
    expect(normalizeDraft(raw)).toBeNull();
  });

  it("does not throw when input properties throw", () => {
    const raw = {};
    Object.defineProperty(raw, "version", {
      get() {
        throw new Error("getter failed");
      },
    });

    expect(() => normalizeDraft(raw)).not.toThrow();
    expect(normalizeDraft(raw)).toBeNull();
  });

  it("infers the missing legacy mode from corporate and tax matter types", () => {
    expect(
      normalizeDraft(makeDraft({ mode: undefined, matter: { type: "ma_pe" } }))
        .mode,
    ).toBe("corporate");
    expect(
      normalizeDraft(
        makeDraft({ mode: "invalid", matter: { type: "irs_appeals" } }),
      ).mode,
    ).toBe("tax");
  });

  it("uses safe defaults for missing or unsupported fee settings", () => {
    expect(
      normalizeDraft(
        makeDraft({ contingency: undefined, feeType: "unsupported" }),
      ),
    ).toMatchObject({ contingency: 100000, feeType: "hourly" });
  });
});

describe("draft persistence", () => {
  it("reports empty storage", () => {
    expect(readDraft(memoryStorage())).toEqual({
      status: "empty",
      draft: null,
    });
  });

  it("reports corrupt JSON and invalid stored shapes without throwing", () => {
    const invalidJson = memoryStorage();
    invalidJson.setItem(DRAFT_STORAGE_KEY, "{not json");
    const invalidShape = memoryStorage();
    invalidShape.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ phases: [] }));

    expect(readDraft(invalidJson)).toMatchObject({
      status: "corrupt",
      draft: null,
      error: expect.any(Error),
    });
    expect(readDraft(invalidShape)).toMatchObject({
      status: "corrupt",
      draft: null,
      error: expect.any(Error),
    });
  });

  it("writes and reads a versioned draft round-trip", () => {
    const storage = memoryStorage();

    expect(writeDraft(storage, makeDraft(), 123456)).toEqual({ ok: true });
    expect(storage.setItem).toHaveBeenCalledWith(
      DRAFT_STORAGE_KEY,
      expect.any(String),
    );

    const result = readDraft(storage);
    expect(result.status).toBe("ready");
    expect(result.draft.savedAt).toBe(123456);
    expect(result.draft.version).toBe(DRAFT_VERSION);
    expect(result.draft.matter.name).toBe("Example matter");
  });

  it("returns structured failures for invalid drafts and storage errors", () => {
    const getFailure = {
      getItem: vi.fn(() => {
        throw new Error("read denied");
      }),
    };
    const setFailure = {
      setItem: vi.fn(() => {
        throw new Error("quota exceeded");
      }),
    };
    const removeFailure = {
      removeItem: vi.fn(() => {
        throw new Error("remove denied");
      }),
    };

    expect(readDraft(getFailure)).toMatchObject({
      status: "unavailable",
      draft: null,
      error: expect.any(Error),
    });
    expect(writeDraft(memoryStorage(), {})).toMatchObject({
      ok: false,
      error: expect.any(Error),
    });
    expect(writeDraft(setFailure, makeDraft())).toMatchObject({
      ok: false,
      error: expect.any(Error),
    });
    expect(clearDraft(removeFailure)).toMatchObject({
      ok: false,
      error: expect.any(Error),
    });
  });

  it("clears the stored draft", () => {
    const storage = memoryStorage();
    writeDraft(storage, makeDraft(), 1);

    expect(clearDraft(storage)).toEqual({ ok: true });
    expect(storage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
    expect(readDraft(storage).status).toBe("empty");
  });
});
