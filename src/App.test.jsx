import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import App, { buildPhases, parseDurationMonths } from "./App.jsx";

const workbookMocks = vi.hoisted(() => ({
  bookAppendSheet: vi.fn(),
  bookNew: vi.fn(() => ({})),
  writeFile: vi.fn(),
}));

vi.mock("xlsx-js-style", () => ({
  default: {
    utils: {
      book_append_sheet: workbookMocks.bookAppendSheet,
      book_new: workbookMocks.bookNew,
    },
    writeFile: workbookMocks.writeFile,
  },
}));

const ACKNOWLEDGEMENT =
  "I understand that drafts are stored locally on this device and I will only enter anonymized or sample data.";

async function enterLitigationWizard(user) {
  render(<App />);
  await user.click(screen.getByText("Litigation & Dispute Resolution"));
  await user.click(screen.getByRole("checkbox", { name: ACKNOWLEDGEMENT }));
  await user.click(screen.getByRole("button", { name: "Continue →" }));
}

function createDraft(overrides = {}) {
  return {
    mode: "litigation",
    matter: { name: "Draft export", type: "arbitration" },
    phases: buildPhases("arbitration", "litigation"),
    timekeepers: [],
    contingency: 100000,
    feeType: "hourly",
    caveats: [],
    ...overrides,
  };
}

async function openDraftReview(user, draft) {
  localStorage.setItem("lb_session", JSON.stringify(draft));
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Resume draft" }));
  await user.click(screen.getByRole("checkbox", { name: ACKNOWLEDGEMENT }));
  await user.click(screen.getByRole("button", { name: "Continue →" }));
  await user.click(screen.getByRole("button", { name: /^\d+ issues?$/ }));
}

describe("phase catalog helpers", () => {
  it("parses common duration formats and uses a stable fallback", () => {
    expect(parseDurationMonths("18-24 months")).toBe(21);
    expect(parseDurationMonths("2 years")).toBe(24);
    expect(parseDurationMonths("1–2 years")).toBe(18);
    expect(parseDurationMonths("not decided")).toBe(12);
    expect(parseDurationMonths("")).toBe(12);
  });

  it("builds independent, selected phase trees for each track", () => {
    const first = buildPhases("arbitration", "litigation");
    const second = buildPhases("arbitration", "litigation");

    expect(first).toHaveLength(7);
    expect(first.every((phase) => phase.selected)).toBe(true);
    expect(
      first.flatMap((phase) => phase.tasks).every((task) => task.selected),
    ).toBe(true);

    first[0].tasks[0].name = "Changed only here";
    expect(second[0].tasks[0].name).toBe("Draft and file claim");
    expect(buildPhases("ma_strategic", "corporate")).toHaveLength(6);
    expect(buildPhases("irs_audit", "tax")).toHaveLength(4);
  });
});

describe("primary wizard workflow", () => {
  it("starts at the landing page even when a draft exists", () => {
    localStorage.setItem(
      "lb_session",
      JSON.stringify({
        mode: "litigation",
        matter: { name: "Saved matter", type: "arbitration" },
        phases: buildPhases("arbitration", "litigation"),
        timekeepers: [],
        contingency: 100000,
        feeType: "hourly",
        caveats: [],
      }),
    );

    render(<App />);

    expect(screen.getByText("Select a budgeting track")).toBeInTheDocument();
    expect(screen.queryByText("Matter Information")).not.toBeInTheDocument();
  });

  it("gates the wizard behind the acknowledgement", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("Litigation & Dispute Resolution"));
    const continueButton = screen.getByRole("button", { name: "Continue →" });
    expect(continueButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: ACKNOWLEDGEMENT }));
    expect(continueButton).toBeEnabled();

    await user.click(continueButton);
    expect(screen.getByText("Matter Information")).toBeInTheDocument();
    expect(screen.getByLabelText("Matter Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Client")).toBeInTheDocument();
    expect(screen.getByLabelText("Matter Type")).toBeInTheDocument();
  });

  it("resumes a saved draft without resetting its matter data", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "lb_session",
      JSON.stringify({
        mode: "litigation",
        matter: { name: "Resume me", type: "arbitration" },
        phases: buildPhases("arbitration", "litigation"),
        timekeepers: [],
        contingency: 100000,
        feeType: "hourly",
        caveats: [],
        timelineMode: "auto",
        phaseTimeline: {},
        savedAt: 123456,
      }),
    );

    render(<App />);
    expect(screen.getByText("Resume me")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resume draft" }));
    await user.click(screen.getByRole("checkbox", { name: ACKNOWLEDGEMENT }));
    await user.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByPlaceholderText("e.g. Smith v. Jones")).toHaveValue(
      "Resume me",
    );
  });

  it("clears a saved draft from the landing page", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    localStorage.setItem(
      "lb_session",
      JSON.stringify({
        mode: "litigation",
        matter: { name: "Discard me", type: "arbitration" },
        phases: buildPhases("arbitration", "litigation"),
        timekeepers: [],
        contingency: 100000,
        feeType: "hourly",
        caveats: [],
      }),
    );

    render(<App />);
    await user.click(screen.getByRole("button", { name: "Clear saved draft" }));
    expect(localStorage.getItem("lb_session")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Resume draft" }),
    ).toBeInTheDocument();

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Clear saved draft" }));

    expect(localStorage.getItem("lb_session")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Resume draft" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Saved draft cleared from this device.",
    );
  });

  it("requires deliberate confirmation before replacing a saved draft", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "lb_session",
      JSON.stringify({
        mode: "litigation",
        matter: { name: "Keep me", type: "arbitration" },
        phases: buildPhases("arbitration", "litigation"),
        timekeepers: [],
        contingency: 100000,
        feeType: "hourly",
        caveats: [],
      }),
    );
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<App />);
    await user.click(screen.getByText("Corporate & Transactional"));
    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(localStorage.getItem("lb_session")).not.toBeNull();

    confirm.mockReturnValue(true);
    await user.click(screen.getByText("Corporate & Transactional"));
    expect(localStorage.getItem("lb_session")).toBeNull();
    expect(screen.getByText("Before You Continue")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: ACKNOWLEDGEMENT }));
    await user.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByText("Corporate Budget Builder")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Project Falcon")).toHaveValue("");
  });

  it("offers recovery when saved data is corrupt", async () => {
    const user = userEvent.setup();
    localStorage.setItem("lb_session", "{invalid json");

    render(<App />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The saved draft could not be read.",
    );

    await user.click(screen.getByRole("button", { name: "Start clean" }));
    expect(localStorage.getItem("lb_session")).toBeNull();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("continues without persistence when local storage is unavailable", async () => {
    const user = userEvent.setup();
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("storage denied");
    });

    render(<App />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Local draft storage is unavailable.",
    );

    await user.click(screen.getByText("Litigation & Dispute Resolution"));
    expect(screen.getByText("Before You Continue")).toBeInTheDocument();
  });

  it("persists matter edits locally and navigates all six steps", async () => {
    const user = userEvent.setup();
    await enterLitigationWizard(user);

    const matterName = screen.getByPlaceholderText("e.g. Smith v. Jones");
    await user.type(matterName, "Sample matter");

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("lb_session"));
      expect(saved.matter.name).toBe("Sample matter");
    });

    const expectedSteps = [
      "Phases and Tasks",
      "Cost Ranges",
      "Fee Arrangement",
      "Caveats and Exclusions",
      "Output Version",
    ];

    for (const heading of expectedSteps) {
      await user.click(screen.getByRole("button", { name: "Next →" }));
      expect(screen.getByText(heading)).toBeInTheDocument();
    }

    expect(screen.getByText("Step 6 of 6")).toBeInTheDocument();
  });

  it("calculates direct fee ranges plus contingency", async () => {
    const user = userEvent.setup();
    await enterLitigationWizard(user);

    await user.click(screen.getByRole("button", { name: "Next →" }));
    await user.click(screen.getByRole("button", { name: "Next →" }));

    const lowInputs = screen.getAllByPlaceholderText("Low $");
    const highInputs = screen.getAllByPlaceholderText("High $");
    await user.type(lowInputs[0], "1000");
    await user.type(highInputs[0], "2000");

    expect(screen.getByText("Total Estimate").parentElement).toHaveTextContent(
      "$101,000 — $102,000",
    );
  });

  it("creates the Excel workbook on demand from the output step", async () => {
    const user = userEvent.setup();
    await enterLitigationWizard(user);
    await user.type(
      screen.getByPlaceholderText("e.g. Smith v. Jones"),
      "Export sample",
    );

    await user.click(screen.getByRole("button", { name: "Next →" }));
    await user.click(screen.getByRole("button", { name: "Next →" }));
    await user.type(screen.getAllByPlaceholderText("Low $")[0], "1");
    await user.type(screen.getAllByPlaceholderText("High $")[0], "2");
    for (let step = 3; step < 6; step += 1) {
      await user.click(screen.getByRole("button", { name: "Next →" }));
    }
    await user.click(screen.getByRole("button", { name: "↓ Download Excel" }));

    await waitFor(() => {
      expect(workbookMocks.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        "Export_sample_budget.xlsx",
      );
    });
    expect(
      screen.getByText("Excel budget created successfully."),
    ).toHaveTextContent("Excel budget created successfully.");
  });

  it("shows a recoverable error when Excel writing fails", async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    workbookMocks.writeFile.mockImplementationOnce(() => {
      throw new Error("write denied");
    });
    await enterLitigationWizard(user);

    await user.click(screen.getByRole("button", { name: "Next →" }));
    await user.click(screen.getByRole("button", { name: "Next →" }));
    await user.type(screen.getAllByPlaceholderText("Low $")[0], "1");
    await user.type(screen.getAllByPlaceholderText("High $")[0], "2");
    for (let step = 3; step < 6; step += 1) {
      await user.click(screen.getByRole("button", { name: "Next →" }));
    }
    await user.click(screen.getByRole("button", { name: "↓ Download Excel" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Excel export failed. Your draft is still saved; try again.",
    );
    expect(
      screen.getByRole("button", { name: "Retry Excel Export" }),
    ).toBeEnabled();
    expect(consoleError).toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Retry Excel Export" }),
    );

    await waitFor(() => {
      expect(workbookMocks.writeFile).toHaveBeenCalledTimes(2);
    });
    expect(
      await screen.findByText("Excel budget created successfully."),
    ).toBeInTheDocument();
  });

  it("exports an incomplete draft and links review notes to their source", async () => {
    const user = userEvent.setup();
    await enterLitigationWizard(user);

    for (let step = 1; step < 6; step += 1) {
      await user.click(screen.getByRole("button", { name: "Next →" }));
    }

    expect(
      screen.getByRole("button", { name: "↓ Download Excel" }),
    ).toBeEnabled();
    expect(
      screen.getByText(/Add a non-zero estimate to at least one selected task/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "↓ Download Excel" }));
    await waitFor(() => {
      expect(workbookMocks.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        "budget_budget.xlsx",
      );
    });
    await user.click(
      screen.getAllByRole("button", { name: "Fix in Step 3" })[0],
    );
    expect(screen.getByText("Cost Ranges")).toBeInTheDocument();
  });

  it.each([
    {
      name: "an unnamed matter",
      expectedNote: "Add a matter or client name",
      expectedFilename: "budget_budget.xlsx",
      draft: () => createDraft({ matter: { name: "", type: "arbitration" } }),
    },
    {
      name: "an unnamed timekeeper",
      expectedNote: "Name the Partner used in this budget",
      draft: () =>
        createDraft({
          timekeepers: [
            { id: "partner", name: "", title: "Partner", rate: 900 },
          ],
        }),
    },
    {
      name: "no selected work",
      expectedNote: "Select at least one task",
      draft: () =>
        createDraft({
          phases: buildPhases("arbitration", "litigation").map((phase) => ({
            ...phase,
            selected: false,
          })),
        }),
    },
    {
      name: "an inverted direct-cost range",
      expectedNote: "low estimate greater than its high estimate",
      draft: () => {
        const phases = buildPhases("arbitration", "litigation");
        phases[0].tasks[0] = { ...phases[0].tasks[0], low: 2000, high: 1000 };
        return createDraft({ phases });
      },
    },
    {
      name: "a missing timekeeper rate",
      expectedNote: "without a billing rate",
      draft: () => {
        const phases = buildPhases("arbitration", "litigation");
        phases[0].tasks[0] = {
          ...phases[0].tasks[0],
          tkBreakdown: [{ tkId: "partner", hoursLow: 1, hoursHigh: 2 }],
        };
        return createDraft({
          phases,
          timekeepers: [
            { id: "partner", name: "Pat", title: "Partner", rate: "" },
          ],
        });
      },
    },
    {
      name: "an inverted timekeeper-hours range",
      expectedNote: "low hours greater than high hours",
      draft: () => {
        const phases = buildPhases("arbitration", "litigation");
        phases[0].tasks[0] = {
          ...phases[0].tasks[0],
          tkBreakdown: [{ tkId: "partner", hoursLow: 2, hoursHigh: 1 }],
        };
        return createDraft({
          phases,
          timekeepers: [
            { id: "partner", name: "Pat", title: "Partner", rate: 900 },
          ],
        });
      },
    },
  ])(
    "exports a draft with $name",
    async ({
      expectedFilename = "Draft_export_budget.xlsx",
      expectedNote,
      draft,
    }) => {
      const user = userEvent.setup();
      await openDraftReview(user, draft());

      expect(
        screen.getByText(expectedNote, { exact: false }),
      ).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", { name: "↓ Download Excel" }),
      );

      await waitFor(() => {
        expect(workbookMocks.writeFile).toHaveBeenCalledWith(
          expect.any(Object),
          expectedFilename,
        );
      });
    },
  );
});
