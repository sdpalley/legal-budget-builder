# Phase 3 — Adversarial Plan

Date: 2026-07-17
Verifier mandate: kill proposals that add unjustified scope, hidden coupling, or regression risk.
Score order: **agent-legibility debt / regression risk / Chesterton-history risk / scope mismatch**, each 1 (low) to 5 (high).

## Plan verdict

Proceed with a desktop/privacy-first hardening overhaul. Add only two core features: an explicit local-draft lifecycle and a pre-export readiness review. Remove the broken AI surface. Preserve the landing-first behavior and recognizable navy/blue/warm-paper design. No broad rewrite and no speculative performance optimization.

## Approved, in execution order

### 1. Safety net and contributor gates — `1/1/1/1`

TEST-01, CI-01, LINT-01, and initial DOC-01. Add characterization tests before behavior/refactors, fix current lint, add coverage/build gates, and replace the template README. This is the prerequisite for every later batch.

### 2. Privacy-safe draft lifecycle — `2/5/2/1`

PRIV-01, COR-01/02/07, and FEAT-01, excluding persistence debounce. Preserve the intentional landing-first launch from commit `96c4e27`, but stop overwriting loaded drafts. Add versioned normalization plus explicit Resume, Start new, and Clear saved draft controls with truthful local-storage disclosure.

### 3. Delete broken AI — `1/4/2/1`

SIM-01 subsumes COR-03/04, ROT-01, and PERF-05. Delete renderer Anthropic calls, AI state, rationale plumbing, and active AI actions. This is safer and simpler than repairing identifiers/transport for a product direction that forbids silent external matter-data transmission.

### 4. Deterministic offline export — `2/4/1/1`

SEC-01 plus PERF-P01 and explicit loading/error feedback. Pin `xlsx-js-style`, dynamically import it on export/output entry, remove runtime CDN script injection/global state, and verify browser and Electron packaging behavior.

### 5. Harden the Electron boundary — `1/3/1/1`

SEC-02. Allow only safe `https:` external links and deny unexpected schemes. Block top-level navigation away from the packaged application.

### 6. Timeline and derived-budget integrity — `2/5/1/1`

COR-05/06 with pure reconciliation tests, followed by the consistency portion of PERF-P02. Implement sum-preserving automatic month allocation, constrain manual ranges to the selected horizon, and derive task/phase/grand/monthly totals through tested pure functions.

### 7. Pre-export readiness review — `2/3/1/1`

FEAT-02. Detect integrity-breaking data (inverted ranges, missing rates used in breakdowns, no selected costed tasks, unreconciled timeline) and useful warnings (missing title, zero ranges). Deep-link each item to the responsible step; block export only for errors.

### 8. Focused modularization and verified deletion — `2/5/3/1`

SIM-04, then SIM-03. Extract only domain catalogs/calculations, draft storage, and workbook export before considering UI splits. Consolidate track metadata without altering legal catalog content or persisted IDs. Apply SIM-02 only after screenshots/render checks prove template assets/styles/placeholders unused.

### 9. Conservative UI/accessibility overhaul — `2/4/2/1`

UX-01/02/03/04. Keep the existing legal-professional brand cues; add exact tokens, AA text contrast, semantic landing/step controls, associated labels, accessible icon buttons, focus-visible states, responsive dense forms/tables, and explicit empty/loading/error/success feedback. Capture every major view/state, a ≤720px breakpoint, keyboard flow, and contrast evidence.

### 10. Compatible toolchain and release hardening — `2/3/2/1`

MOD-01 plus verify/pinned-action/checksum portions of MOD-04. Revalidate versions immediately before editing. Apply compatible security patches, declare Node 22, add push/PR verification, pin third-party actions, scope write permission, and document/checksum releases. Run full audit, build, launch, and packaging smoke tests.

## Execution batches and rollback points

Each numbered concern is a separate commit unless verification forces a smaller split:

1. `test: add characterization safety net`
2. `ci: gate changes on lint test and build`
3. `docs: replace template readme with operator runbook`
4. `fix: make saved drafts versioned and recoverable`
5. `fix: remove broken external AI workflows`
6. `fix: bundle reliable offline workbook export`
7. `fix: restrict Electron external navigation`
8. `fix: reconcile budget timeline allocations`
9. `feat: add pre-export readiness review`
10. `refactor: extract tested domain and platform modules`
11. `style: apply accessible responsive document workspace`
12. `build: patch toolchain and harden releases`

The test suite runs after every batch. Deviations and their reasons go in `agent-reports/04-execution-log.md`.

## Deferred

| Proposal                                                  | Score     | Reason                                                                                                        |
| --------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| PERF-P03 persistence debounce                             | `3/5/1/2` | Correctness first; last-edit loss risk exceeds an unmeasured typing benefit.                                  |
| PERF-P04/P05 and suspected PERF-01/02/03/04 optimizations | `3/5/2/3` | No representative runtime profile proves a user-facing performance problem. Profile after extraction.         |
| MOD-02 Electron 43                                        | `2/4/2/2` | Keep a major runtime migration separate from hardening; document the near-term EOL follow-up.                 |
| MOD-03 preload bridge                                     | `4/4/1/3` | No proven native Save As or diagnostics requirement justifies new IPC.                                        |
| Signing, notarization, SBOM, remote crash/error tracking  | `3/3/1/3` | Credential-sensitive/operational scope. Document exact gaps; do not invent credentials or external telemetry. |

## Rejected

| Proposal                                                                | Score     | Reason                                                                                              |
| ----------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| FEAT-03 editable/generated narrative                                    | `3/3/2/4` | Adds a legal-prose surface after AI removal and is unnecessary for budget integrity.                |
| Search, dark mode, undo, scenario management                            | `4/4/1/5` | Kitchen-sink scope with weak connection to the core budgeting path.                                 |
| Accounts, cloud sync, collaboration                                     | `4/5/1/5` | Requires a backend, identity, privacy, and operations that do not exist.                            |
| Word/PDF export                                                         | `4/4/1/5` | Large artifact scope; reliable Excel is the demonstrated product path. Remove the disabled promise. |
| Full platform rewrite, DI/repository framework, per-step file explosion | `5/5/3/5` | Replaces direct code with abstraction debt before product need is demonstrated.                     |

## Conflicts resolved

- **Static vs dynamic XLSX import:** bundle the package but dynamically import it for export; this wins both deterministic offline behavior and initial-bundle restraint.
- **Reducer/component rewrite vs minimal modules:** pure domain/storage/export boundaries win first. UI splits happen only where the accessibility overhaul demonstrates a stable reusable boundary.
- **Fix AI IDs/transport vs delete AI:** deletion wins; it removes broken behavior and the privacy boundary.
- **Debounced persistence vs durable drafts:** correctness and explicit lifecycle win; debounce remains deferred until measured.
- **Native preload export vs browser fallback:** local bundled renderer export wins until native Save As is a proven requirement.

## Decisions made on your behalf

- Desktop-first and privacy-first; web build remains a supported fallback.
- Exactly two new features: draft lifecycle and readiness review.
- AI is removed, not repaired or proxied.
- Landing-first behavior is preserved while draft restoration becomes explicit.
- UI stays closest to existing brand cues instead of adopting a dashboard or dark theme.
- Legal catalogs are preserved; representation may be consolidated only behind tests.
- No speculative performance claims or work without measurements.
- Electron 43, signing/notarization, and native preload work are deferred as separate follow-ups.
