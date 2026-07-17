# Phase 2 — Improvement Proposals

Date: 2026-07-17  
Method: five parallel, read-only research lanes covering simplification, performance architecture, feature gaps, UX/accessibility, and modernization. Proposals are inputs to adversarial verification, not approvals.

## Product anchor

The core job is to build a transparent legal-fee range from matter assumptions, review its integrity, and export a client-ready budget. Proposals that do not strengthen that path are deferred by default.

## Simplification

### SIM-01 — Delete the active AI subsystem

- **What:** Remove four direct Anthropic request paths, AI loading/rationale state, suggestion/caveat/narrative buttons, and AI-only display/export fields (`src/App.jsx:1126-1129,1266-1392,1915-1966,2146-2157,2265-2275`). Ignore old `aiRationale` fields during draft migration.
- **Why:** Requests are verified unauthenticated, nonfunctional, privacy-incompatible, and duplicate ~180–220 lines of transport/parsing/error state.
- **Expected impact:** Eliminate a broken network boundary, misleading UI, and task-ID collision exposure.
- **Effort / risk:** Medium / low after characterization tests.
- **Chesterton check:** AI arrived in the initial commit and no later history or documentation repaired/defended it; the approved desktop-local design supersedes it.

### SIM-02 — Delete template residue and placeholder UI

- **What:** After render comparison, remove unimported `src/App.css`, unused `src/assets/hero.png`, React/Vite SVGs, unused `public/icons.svg`, and the disabled Word/PDF button (`src/App.jsx:2485-2491`). Replace active template globals in `src/index.css` with intentional app foundations; retain the referenced favicon.
- **Why:** These artifacts add Vite-template noise and advertise nonexistent scope.
- **Expected impact:** Roughly 300 lines and 45 KB removed; smaller context and clearer output UI.
- **Effort / risk:** Small / low with screenshot comparison.

### SIM-03 — Consolidate track configuration

- **What:** Place track labels, catalogs, caveats, defaults, titles, and field vocabulary behind one direct `TRACKS` registry; replace scattered mode ternaries (`src/App.jsx:5-879,1113-1130,1156-1163,1462,1650-1797,2507-2509`).
- **Why:** Three parallel constant families and mode branches require whole-file search for one product change.
- **Expected impact:** One source of truth and lower agent/reviewer context cost.
- **Effort / risk:** Medium / medium; IDs and draft compatibility must be preserved.

### SIM-04 — Use a small module set, not an abstraction framework

- **What:** Extract domain catalogs/calculations, draft storage, and workbook export. Keep UI together until tests demonstrate stable component boundaries.
- **Why:** A reducer/repository/adapter/DI hierarchy or per-step file explosion would create indirection without demonstrated variants.
- **Expected impact:** Shorter critical read paths while retaining direct navigation.
- **Effort / risk:** Medium / medium, incremental only.

## Performance architecture

Measured baseline: build median 136 ms internal / 0.60 s wall; initial JS 301,402 B raw / 85.69 kB gzip; XLSX CDN payload 425,020 B raw / 142,472 B gzip. Renderer CPU proposals remain suspected until profiled.

### PERF-P01 — Local, on-demand workbook dependency

- **What:** Pin `xlsx-js-style`, dynamically import it on the first export (optionally prefetch on entering Output), cache the import promise, and expose loading/error states.
- **Why:** Makes export deterministic/offline without adding the measured 142.5 kB gzip library to the initial chunk.
- **Expected impact:** High reliability/security; likely preserves current initial bundle size.
- **Effort / risk:** Medium / medium for CJS/ESM and packaging parity.

### PERF-P02 — One derived budget model

- **What:** Extract a pure selector that creates a timekeeper lookup plus task, phase, grand, and monthly totals once per state revision (`src/App.jsx:1178-1201,1531-1578,1939,2086,2206-2243,2318-2375`).
- **Why:** Current render/export paths repeatedly scan the same arrays and recompute totals.
- **Expected impact:** High consistency/testability; suspected medium large-draft speedup.
- **Effort / risk:** Medium / medium due financial reconciliation.

### PERF-P03 — Batched durable persistence

- **What:** Persist a normalized/versioned draft after a 250–500 ms debounce or idle callback, with a bounded timeout and close/visibility flush; never store a transient null track.
- **Why:** Current controlled inputs synchronously stringify/write the full draft each keystroke.
- **Expected impact:** Correct recovery and suspected smoother typing/fewer writes.
- **Effort / risk:** Medium / medium; last-edit loss must be prevented by flush tests.

### PERF-P04 — Bound render scope before memoizing

- **What:** After tests, move stable steps to module-level components with narrow data/actions and use atomic domain transitions. Profile before applying memoization.
- **Why:** Seventeen root states and nested step functions currently recreate broad subtrees.
- **Expected impact:** High legibility; suspected medium responsiveness benefit.
- **Effort / risk:** Large / high without the safety net, medium after it.

### PERF-P05 — Gate worker export on evidence

- **What:** Benchmark a representative maximum workbook with visible progress. Move generation off-thread only if long tasks exceed a meaningful threshold.
- **Why:** Synchronous generation may block, but there is no measured defect.
- **Expected impact:** Potentially high only for large exports.
- **Effort / risk:** Large / medium; defer without evidence.

## Feature gaps

These are the only three new feature candidates. Search, dark mode, broad shortcuts, undo, scenario management, accounts/cloud sync, and Word/PDF are deferred as nonessential scope.

### FEAT-01 — Explicit draft lifecycle

- **What:** On the landing screen, show a local draft's track, matter label, and last-saved time, with Resume, Start new, and Clear saved draft actions.
- **Why:** Persistence is invisible, uncontrolled, and currently destroyed (`src/App.jsx:1103-1165`); commit `96c4e27` deliberately requires landing first.
- **Expected impact:** High recovery value and truthful local retention.
- **Effort / risk:** Medium / medium due migration and initialization.

### FEAT-02 — Pre-export readiness review with edit links

- **What:** Step 6 lists warnings/errors for no selected tasks, zero/blank or inverted ranges, missing rates, missing title, and unreconciled timelines. Each item links to its source step; only integrity-breaking errors block export.
- **Why:** Navigation always advances and export readiness currently means only “XLSX loaded,” so incomplete budgets can look authoritative (`src/App.jsx:1178-1203,1933-2035,2172-2255,2485-2548`).
- **Expected impact:** High client-artifact integrity and clearer review flow.
- **Effort / risk:** Medium / low–medium; avoid over-validating optional fields.

### FEAT-03 — Local editable budget narrative in export

- **What:** Replace AI-only narrative generation with an optional persisted textarea, starting blank or from a deterministic factual template, and include it in client/internal workbooks.
- **Why:** Current narrative requires a broken request, is not persisted, and is absent from export (`src/App.jsx:1129,1371-1392,2177-2294,1396-1642`).
- **Expected impact:** Medium improvement to client delivery without network/privacy risk.
- **Effort / risk:** Small–medium / low if prose is never invented as legal advice.

## UX/UI direction

### UX-01 — Calm legal document foundations

- **What:** Preserve navy/blue/warm-paper cues with Georgia display and system UI body/control text. Type scale: `12/16`, `14/20`, `16/24`, `20/28`, `28/36`. Spacing: `4, 8, 12, 16, 24, 32, 48`. Radii: 4px controls, 6px cards. Tokens: ink `#1A2744`, text `#1A1A1A`, muted `#66615C`, accent/focus `#2E5FA3`, paper `#F7F6F3`, surface `#FFFFFF`, border `#D6D2CA`, success `#356B4B`, warning `#8A4B08`, danger `#A33A32`.
- **Why:** Current template and inline systems conflict (`src/index.css:1-46`, `src/App.jsx:918-976`); current muted text measures 4.14:1 on paper and misses AA normal-text contrast.
- **Expected impact:** Consistent, accessible hierarchy without rebranding.
- **Effort / risk:** Medium / low with visual verification.

### UX-02 — Semantic keyboard workflow

- **What:** Use real buttons for landing cards and steps, ordered progress with `aria-current`, associated labels, accessible names for icon buttons, and a 3px visible focus ring (`src/App.jsx:980-998,1653-1797,2524-2532`).
- **Why:** Click-only generic elements, unassociated labels, and removed outlines block keyboard/screen-reader use.
- **Expected impact:** High accessibility and predictable interaction.
- **Effort / risk:** Medium / low.

### UX-03 — Responsive dense workflow

- **What:** At ≤720px stack header, multi-column forms, cost/timeline rows, and export actions; scroll progress with active step visible. At ≤420px use 16px gutters/full-width primary actions; keep 44px targets and reduced-motion support.
- **Why:** Fixed grids and dense rows clip on narrow viewports (`src/App.jsx:942-943,1821-1849,1999-2035,2385-2410`).
- **Expected impact:** Usable narrow-window/mobile web fallback.
- **Effort / risk:** Medium / medium around dense cost tables.

### UX-04 — Explicit empty/loading/error/success states

- **What:** Actionable empty states; `aria-live` loading; retryable export errors; field-linked integrity errors; “Start clean” corrupt-draft recovery; transient copy/export status. Remove dead AI/Word-PDF controls.
- **Why:** Current failures are silent, loaders can stall forever, and dead actions consume attention.
- **Expected impact:** Recoverable, truthful workflows.
- **Effort / risk:** Medium / low.

## Modernization

### MOD-01 — Patch and declare the supported toolchain

- **What:** Upgrade Vite `8.0.1→8.1.5`, Electron `41.0.3→41.10.2`, electron-builder `26.8.1→26.15.3`, and compatible patch dependencies; set Node `>=22.12`, add `.nvmrc`, use Node 22 in CI.
- **Why:** Removes verified direct/transitive advisories while keeping majors stable and makes installs reproducible. Registry metadata confirms the proposed Node floor.
- **Expected impact:** High security/reproducibility.
- **Effort / risk:** Small / low–medium with build, launch, and packaging smoke tests.

### MOD-02 — Deliberately evaluate Electron 43

- **What:** After patching 41, test migration to Electron 43.1.1 in a separate commit.
- **Why:** Electron 41 reaches end of life on 2026-08-25; Electron 43 extends support to 2027-01-05 and updates Chromium 146→150. The main-process API is only 37 lines. Source: [official Electron release timeline](https://www.electronjs.org/docs/latest/tutorial/electron-timelines) and [schedule](https://releases.electronjs.org/schedule).
- **Expected impact:** Roughly four additional months of security support.
- **Effort / risk:** Medium / medium; installers need smoke tests.

### MOD-03 — Narrow preload bridge only for proven desktop needs

- **What:** Consider a `contextBridge` preload for native Save As and local diagnostics while keeping isolation; retain browser download fallback.
- **Why:** Gives observable desktop save failures without renderer filesystem access.
- **Expected impact:** Better native export/support seam.
- **Effort / risk:** Medium / medium; defer unless export implementation proves it necessary.

### MOD-04 — First-class least-privileged CI/release

- **What:** Add verify workflows, pin actions to SHAs, scope write permission, cache dependencies, add concurrency/checksums, and document signing/notarization.
- **Why:** Prevents unverified or duplicated releases and reduces mutable-action risk.
- **Expected impact:** High release confidence.
- **Effort / risk:** Medium; signing is large/credential-dependent and may be documented rather than executed.

### Explicit modernization deferrals

- React 19 `createRoot` and StrictMode are already current; do not enable React Compiler without profiling evidence.
- Defer ESLint 10 unless a required rule/fix justifies the migration.
- Do not lazy-load wizard steps/catalogs or redesign Vite: measured startup/build/bundle are already fast.
