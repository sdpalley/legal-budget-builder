# Phase 4 — Execution Log

Date started: 2026-07-17
Branch: `agent/overhaul-20260717`
Baseline tag: `agent-baseline`

## Batch 1 — Safety net and contributor gates

### `91425a0` — Characterization tests

- Added Vitest 4, Testing Library, jsdom, coverage, and Prettier tooling.
- Added six characterization tests covering duration/catalog helpers, landing-first launch, disclaimer gating, local persistence, six-step navigation, and direct range + contingency calculations.
- Added coverage thresholds: statements 30%, branches 25%, functions 25%, lines 35%.
- Verification: 6/6 tests pass; 34.9% statements, 30.12% branches, 28.26% functions, 38.53% lines; production build passes.

### `8ac7ab8` — Lint and format baseline

- Fixed the three existing lint errors and hook dependency warning.
- Added an explicit Electron/CommonJS ESLint scope and ignored generated output.
- Formatted reports/config/entry files. The monolithic `App.jsx` and legacy CSS are temporarily excluded from Prettier until their planned modularization/UI batches, preventing a large unrelated diff before behavior fixes.
- Verification: lint, format check, 6 tests, and production build pass.

### `4e7681f` — CI quality gate

- Added push/PR verification for format, lint, tests/coverage, build, and production dependency audit.
- Made tag packaging wait for an equivalent verification job and moved CI to Node 22 with npm caching.
- Scoped default workflow permissions to read; write remains only on release jobs.
- Verification: both workflows parse as YAML; the complete local command sequence passes.

### `54450cb` — Operator/developer runbook

- Replaced stock Vite README content with product scope, current privacy limitations, install/run/check/package commands, architecture, release checklist, troubleshooting, and security guidance.
- The README intentionally labels AI/CDN behavior as temporary baseline limitations; later approved commits must update these statements as the limitations are removed.
- Verification: format, lint, tests, and production build pass.

## Deviations from `03-plan.md`

- Formatting was split from CI into its own rollback commit because normalizing existing non-application files was a separate mechanical concern.
- Formatting of `src/App.jsx` and `src/index.css` was completed during the relevant implementation batches. No application source remains excluded from Prettier.
- The proposed persistence debounce remains deferred. The existing synchronous local write is small and reliable; changing its timing would add recovery and teardown edge cases without measured evidence that it is a bottleneck.
- Electron 43, notarization credentials, a preload bridge, and custom signing remain deferred as planned. Electron was updated and pinned to the latest compatible 41.x release instead.

## Batch 2 — Recoverable, privacy-accurate local workflow

### `9fe892d` and `35ef11c` — Versioned draft lifecycle

- Replaced destructive launch-time session clearing with a versioned, validated local draft format and explicit resume, replace, and clear controls.
- Added corruption recovery, confirmation before destructive clearing/replacement, legacy normalization, dangling-reference rejection, and a distinct storage-unavailable mode that allows an explicitly unsaved session.
- Independent review found missing confirmation and storage-denial/malformed-reference edge cases; `35ef11c` closes each finding.
- Verification: draft storage unit coverage plus landing/resume/clear/corruption/storage-denial integration tests pass.

### `426794d` — Removed nonfunctional AI workflows

- Removed direct browser Anthropic calls, API-key prompts, AI state, and the misleading disclosure that implied a dependable AI feature.
- Preserved the deterministic phase libraries as the product's offline budgeting source.
- Verification: repository search finds no application `fetch`, Anthropic, or API-key references; tests, lint, and build pass.

### `39f1fcd` — Offline workbook export

- Replaced runtime CDN script injection with an exact-pinned, locally bundled `xlsx-js-style` dependency loaded only when export is requested.
- Added successful-write and recoverable-failure tests.
- Measured production output after this batch: main application chunk 301.55 kB raw / 86.68 kB gzip; lazy workbook chunk 863.01 kB raw / 317.89 kB gzip.

## Batch 3 — Desktop boundary and calculation integrity

### `880842d` — Electron navigation boundary

- Added an HTTPS-only external-link allowlist, credential rejection, same-document-only internal navigation, and a deny-by-default new-window policy.
- Added a restrictive HTML content security policy and corrected the application document title.
- Verification: ten navigation cases pass; production build and arm64 Electron directory packaging pass. Packaging used ad-hoc signing and skipped notarization because credentials are intentionally outside this repository.

### `f319b1a` — Reconciled budget model

- Extracted task, phase, grand-total, duration-allocation, and monthly-projection math to `src/domain/budget.js`.
- Fixed year-range averaging (`1–2 years` is 18 months), included contingency in monthly projections, made rounding sum-preserving, and extended manual horizons so configured work is never dropped.
- Verification: four focused budget tests prove direct/timekeeper calculations and exact automatic/manual reconciliation; the full suite passes.

## Batch 4 — Approved feature and focused modularization

### `1db88af` — Pre-export readiness review

- Added the second and final approved feature: errors for no costed work, inverted ranges, and missing rates; warnings for missing identification, unnamed staff, and zero-cost selected tasks.
- Each issue links to its source step. Only errors block workbook export.
- Verification: three domain tests plus integration coverage for blocked export, edit navigation, successful export, and write failure pass. The production browser check confirmed the disabled export state and error/warning presentation.

- Focused modularization stopped at high-value boundaries (`draftStorage`, `budget`, and `readiness`) rather than moving the static phase catalog merely to reduce the line count. This preserves a searchable single catalog while removing mutable state, validation, and calculation logic from the view.

## Batch 5 — UI, accessibility, and toolchain

### `f30ad59` — Responsive accessible shell

- Removed the unrelated Vite starter theme and its automatic dark-mode overrides.
- Converted track cards and wizard steps to semantic buttons/navigation, added current-step semantics, visible keyboard focus, reduced-motion handling, horizontal step overflow, and narrow-screen layout rules.
- Browser verification on the production build covered landing-with-draft and output-with-readiness-error states. DOM bounds showed a 1280 px viewport/scroll width match (no horizontal page overflow); screenshots were visually inspected.

### `4741ad0` — Compatible pinned toolchain

- Updated all dependencies within approved major-version boundaries and exact-pinned the manifest for reproducible installs.
- Kept Electron 41 and ESLint 9 to avoid the explicitly deferred major migrations; updated to Electron 41.10.2, Vite 8.1.5, React 19.2.7, and compatible lint/build packages.
- Adapted initial draft initialization and persistence failure handling to the stricter React hooks rules without changing behavior.
- Verification after `npm audit fix`: full and production-only audits report zero vulnerabilities; format, lint, tests, build, and package checks pass.

## Phase 4 result

- Approved implementation order was preserved.
- Exactly two core-job features were added: recoverable local drafts and export readiness review.
- Every concern has its own rollback commit, and the working branch has never modified or merged into `main`.
