# Phase 1 — Audit

Date: 2026-07-17  
Branch: `agent/overhaul-20260717`  
Method: five parallel, read-only audits covering correctness, performance, security/privacy, rot, and developer experience/operability. Duplicate findings were consolidated under one ID. Every item below is either verified or explicitly labeled suspected.

## Plain-English verdict

**Fix before release.** The manual budgeting core builds and launches, but returning users lose saved drafts, the privacy promise contradicts actual persistence and network behavior, enabled AI actions cannot authenticate, timeline allocation can silently omit budget, and Excel export depends on executing third-party CDN code at runtime. There is no automated safety net or CI quality gate.

No P0 issue was found. The audit identified 11 P1 findings, 12 P2 findings, and 4 P3 findings after deduplication.

## Findings

| ID | Severity | Evidence | Description | Suggested fix | Blast radius |
| --- | --- | --- | --- | --- | --- |
| COR-01 | P1 | `src/App.jsx:1111-1124,1137-1164`; commit `96c4e27` | Saved drafts cannot be resumed. Launch sets `mode=null`, persistence immediately writes that transient value, and choosing a track triggers the mode-reset effect that clears the loaded draft. | Separate landing selection from persisted draft mode; never persist transient `null`; restore only a matching-track draft. | Every returning user/draft. |
| COR-02 | P1 | `src/App.jsx:1103-1125,1886,1933,1195` | Unversioned, unvalidated saved JSON can make render/calculation calls crash on stale or malformed shapes. | Add a versioned storage schema, normalization/migration, atomic fallback, and clear-draft recovery. | Launch availability and future schema changes. |
| COR-03 | P1 | `src/App.jsx:247-284,602-868,1268-1307` | Corporate/tax task IDs repeat across phases; “Suggest All” matches only `taskId`, so one response can be copied to unrelated tasks. | Use compound phase/task keys or globally unique IDs, with saved-data migration. | Corporate/tax AI estimates and saved sessions. |
| COR-04 | P1 | `src/App.jsx:1274-1391`; matching live request returned HTTP 401 | All four enabled AI actions omit required authentication/version headers, ignore `res.ok`, and expose failure only in the console. | Remove active renderer AI in the desktop-first product; a future integration needs a controlled service, consent, and recoverable UI errors. | All AI suggestions, caveats, and narrative actions. |
| COR-05 | P1 | `src/App.jsx:2331-2359` | Auto-timeline rounds each phase independently and can allocate more months than the horizon; out-of-window phases disappear from monthly projections. Example: eight equal phases across 12 months allocate 16 months. | Use a sum-preserving integer allocation and assert projected totals reconcile to overall totals. | Output cash-flow forecasts. |
| PRIV-01 | P1 | `src/App.jsx:1059-1063,1103-1105,1137-1142,1274-1385` | The disclaimer says nothing is stored or transmitted and “Nothing will be saved,” while full matter state is stored locally and AI prompts transmit matter scope to Anthropic. | Make storage/transfer disclosure truthful, default local-only, and provide explicit clear-draft control. | Confidentiality expectations for every matter. |
| SEC-01 | P1 | `src/App.jsx:1144-1149`; `index.html:3-12` | XLSX code executes from jsDelivr without SRI or CSP; compromise/outage can access renderer data and breaks offline export. Measured script: 425,020 B raw / 142,472 B gzip. | Pin/package the dependency locally and apply a restrictive CSP compatible with the built app. | All renderer data, export integrity, offline use. |
| SEC-02 | P1 | `electron/main.cjs:18-24` | Every URL scheme is passed to `shell.openExternal`, and top-level navigation is not blocked. | Allowlist safe `https:` destinations, deny other schemes, and block/route `will-navigate`. | Host protocol handlers, phishing, renderer boundary. |
| TEST-01 | P1 | `package.json:8-16`; no test/spec files | There is no test script, framework, coverage, or characterization coverage for critical behavior. | Add Vitest/Testing Library and pure-domain tests before refactoring; cover critical paths and migrations. | Every code change. |
| CI-01 | P1 | `.github/workflows/build.yml:3-33` | CI runs only on version tags and packages releases without lint, tests, or a separate quality gate. | Add push/PR validation for lint, tests/coverage, and production build; make release depend on it. | Every shipped artifact. |
| ARCH-01 | P1 | `src/App.jsx:5-879,1110-2553` | One 2,553-line file combines legal catalogs, state, persistence, AI, calculations, export, styles, and all views. | After tests, extract domain data/functions, storage/export services, and bounded UI components incrementally. | Entire app; agent/reviewer comprehension. |
| COR-06 | P2 | `src/App.jsx:2398-2408,2347-2357` | Manual timeline start and duration are capped independently, so costs outside the horizon are silently omitted. | Clamp duration to remaining horizon or extend/warn, and reconcile totals. | Manual forecasts. |
| PERF-01 | P2 | `src/App.jsx:1137-1142`; controlled inputs such as `1654-1658` | **Suspected:** every keystroke synchronously serializes and writes the full session on the renderer thread. | Debounce/idle-schedule persistence and measure a representative large draft. | Editing responsiveness. |
| PERF-02 | P2 | `src/App.jsx:1178-1201,2318-2375` | **Suspected:** output repeatedly recomputes task/phase totals and linearly searches timekeepers inside nested loops. | Derive a timekeeper map and memoized task/phase/month totals once; profile before/after. | Step 6 on large/long budgets. |
| PERF-03 | P2 | `src/App.jsx:1110-1135,1647-2536` | **Suspected:** 17 root states and nested step functions cause broad rerenders and handler recreation on every input. | Extract stable step components with narrow props; profile before selective memoization. | All wizard editing. |
| PERF-04 | P2 | `src/App.jsx:1396-1642` | **Suspected:** workbook construction and file writing synchronously block the renderer. | Add explicit progress/error state; measure large exports before deciding on a worker/main-process move. | Export responsiveness. |
| ROT-01 | P2 | `src/App.jsx:1268-1392` | Four AI routines duplicate request, parse, loading, and error patterns. | Removal under COR-04 supersedes this; centralize only if AI is reintroduced. | AI maintenance. |
| ROT-02 | P2 | `src/index.css:1-111`; unused `src/App.css`, `src/assets/*`, `public/icons.svg` | Template CSS remains globally active while unused template styles/assets add noise. | Render-compare, then remove only proven-unused remnants and consolidate global styles. | Layout/theme and repository legibility. |
| DOC-01 | P2 | `README.md:1-16`; `index.html:7`; `.claude/launch.json:5` | README is stock Vite text and launch/page naming still reflects the original single litigation mode. | Write product/developer/operator documentation; align names after checking consumers. | Onboarding and automation. |
| LINT-01 | P2 | `eslint.config.js:8-18`; `src/App.jsx:1141,1174,1421-1422` | Lint fails with three errors and one hook warning; Electron/CommonJS scope is not explicitly configured; no formatter check exists. | Fix diagnostics, configure renderer/Electron scopes, add format checking, and gate CI. | Review signal and CI. |
| SEC-03 | P2 | `package.json:27,33`; `package-lock.json`; `npm audit` | Full audit reports 13 dev/build/runtime-tool findings (6 high, 6 moderate, 1 low), including direct Vite and Electron advisories; production-only npm audit reports zero because Electron is a dev dependency. | Apply compatible patched versions, rerun audits and launch/build/package smoke tests. | Packaged runtime and developer/CI hosts. |
| SEC-04 | P2 | `.github/workflows/build.yml:8-34` | Release uses write permission plus mutable major action tags; signing/provenance are absent. | Pin action SHAs, scope write permission, document signing/notarization, and emit checksums/SBOM where feasible. | Release supply chain. |
| OPS-01 | P2 | `src/main.jsx:6-10`; `electron/main.cjs:27-37` | No UI error boundary or privacy-safe crash/load diagnostics exist. | Add an error boundary and local redacted diagnostics/lifecycle handlers; avoid remote telemetry by default. | Production supportability. |
| COR-07 | P3 | `src/App.jsx:1103-1105,1301-1307,1331-1356` | Saved/model JSON lacks shape, size, numeric-range, and unknown-ID validation. | Address saved data under COR-02; validate external responses if AI returns later. | Budget integrity and availability. |
| PERF-05 | P3 | `src/App.jsx:1303-1307` | **Suspected:** each task scans all AI suggestions with `.find`. | Superseded by removing broken AI; otherwise index responses by compound key. | Suggest All completion. |
| PERF-06 | P3 | `src/main.jsx:1-9,src/App.jsx:1144-1149` | **Suspected:** StrictMode can replay the script-injection effect, which lacks cleanup/idempotence. | Superseded by bundling XLSX. | Development/HMR only. |
| DEPS-01 | P3 | `package.json:19-33`; verified with `npm outdated` | Patch/minor drift exists; Electron 43 and ESLint 10 are major migrations. | Batch compatible security updates now; defer majors unless they buy a verified benefit. | Toolchain/build compatibility. |

## Negative evidence and existing strengths

- Pattern searches over the current tree and all five commits found no candidate secrets. A dedicated secret scanner was unavailable, so this is strong pattern-based evidence, not an exhaustive guarantee.
- The application has no authentication/authorization layer because it is a local, single-user desktop tool; authz is not currently applicable.
- Electron correctly uses `nodeIntegration: false` and `contextIsolation: true` (`electron/main.cjs:10-15`).
- No `dangerouslySetInnerHTML`, `eval`, iframe/webview, or renderer IPC surface was found.
- User strings written to XLSX cells are explicitly typed as strings (`src/App.jsx:1424-1435`), reducing formula-injection risk.
- Electron main contains no synchronous filesystem work; no measured main-process startup problem was found.

## PR-sized batches

1. **Safety net and CI** — TEST-01, CI-01, LINT-01, initial DOC-01. Add characterization tests and green gates before behavioral refactoring.
2. **Privacy, persistence, and broken integrations** — PRIV-01, COR-01, COR-02, COR-04, COR-07. Make local storage truthful/versioned/recoverable and remove nonfunctional renderer AI.
3. **Offline export and desktop boundary** — SEC-01, SEC-02, PERF-04. Bundle XLSX, add export feedback, restrict navigation, add CSP.
4. **Timeline correctness** — COR-05 and COR-06 with reconciliation tests.
5. **Architecture and rot** — ARCH-01, ROT-01/02, DOC-01. Incrementally extract pure domain/services/components and remove proven-unused remnants.
6. **Toolchain and release hardening** — SEC-03/04, DEPS-01, OPS-01. Apply compatible security updates, pin CI, document/sign release path, add local diagnostics.
7. **Measured optimization only** — PERF-01/02/03. Profile representative workflows, implement only changes with demonstrated value.

The batches intentionally separate fix-only changes from refactors, features, UI, and release work so a human can cherry-pick them independently.
