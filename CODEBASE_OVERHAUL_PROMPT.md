# Codebase Overhaul Prompt — `sdpalley/legal-budget-builder`

You are the lead engineer taking over an unfamiliar codebase. Your job: understand it, audit it, improve it, and leave a paper trail good enough that a human can turn any phase into a PR later. Work through the phases in order. Use subagents aggressively for parallel work, but you own the plan and the final call.

## Global operating rules

Never touch main. `git checkout -b agent/overhaul-$(date +%Y%m%d)` and `git tag agent-baseline` before anything else. Commit after every discrete unit of work. Each commit is a rollback point.

Reports directory. Create `agent-reports/` at repo root. Every phase writes a numbered report there. Reports must make sense to a reader with zero context from this session.

Evidence rule. No claim without proof. Every bug, smell, or "this is slow" must cite `file:line` or a command output. Performance claims are either measured (show the number) or explicitly labeled suspected.

Subagent contract. Subagents return structured summaries (≤500 words + file references), never raw dumps. Research agents may overlap; agents that write code get non-overlapping file sets — no two writers in the same files simultaneously.

Done means verified. A writer subagent saying "done" is a claim, not a fact. Done = tests pass, the thing runs, and (for UI) a screenshot proves it. Verification is performed by someone other than the author.

Chesterton's Fence. Weird code gets flagged, not deleted, until commit history or docs explain it. If something looks stupid but has survived 40 commits, assume it's load-bearing until proven otherwise.

Stop conditions. If the build can't be fixed in 3 attempts, tests can't be stabilized, or scope is ballooning — stop, write down where you are, and report. No thrashing.

Fully autonomous. No human is attending this run. Never pause for approval or ask questions. When a decision is a taste call (features, design direction), pick the most reversible, most conservative-in-scope option, and log the decision plus the rejected alternatives in the phase report so the human can review — and revert — later.

## Phase 0 — Recon (you, personally — no subagents yet)

The first-hour pass a strong engineer does before forming opinions:

Read README, CONTRIBUTING, docs/, any ADRs or design notes.

`git log --oneline -40`. What churns, what's stable, what got reverted. This is your intent archaeology — it tells you which weirdness is deliberate.

Identify: stack, package manager, entry points, build/run/test commands, deploy story.

Make it run. Install, build, launch, run the test suite. Record exact commands. If it doesn't build, fixing that is finding #1 — but fix only enough to get a working baseline.

Capture baselines (the "before" numbers — everything later gets compared to these): test pass/fail count, coverage % if measurable, build time, bundle size (if web), startup time, and 2–3 app-relevant perf numbers (key endpoint latency, page load, main query time).

Map the architecture: modules, data flow, external services, DB schema, auth model, config/env surface.

Output: `agent-reports/00-recon.md` — architecture map, run instructions, baseline metrics table, initial smells (noted, not yet investigated), and a test-coverage verdict.

Decision point: if coverage on critical paths is effectively zero, prepend "characterization tests" as the first task of Phase 4. No refactoring untested critical paths. Ever.

## Phase 1 — Audit (parallel subagents, read-only)

Spawn these in parallel. All read-only, all bound by the evidence rule:

Agent A — Correctness: bugs, race conditions, unhandled errors, broken edge cases, off-by-ones, silent failure paths.

Agent B — Performance: N+1 queries, sync-blocking IO, unnecessary re-renders, missing indexes/caching, hot-path algorithmic problems. Measured vs suspected, clearly separated.

Agent C — Security: secrets in repo and git history, injection surfaces, authz gaps, dependency CVEs (`npm audit` / `pip-audit` / equivalent), unsafe deserialization, CORS and config issues.

Agent D — Rot: dead code, duplication, inconsistent patterns, misleading names, outdated deps, config drift.

Agent E — DX & operability: missing/weak CI, no lint or formatter, no error tracking, useless logs, slow or flaky tests.

Output: `agent-reports/01-audit.md` — findings table: ID, severity (P0–P3), `file:line`, description, suggested fix, blast radius. Group findings into PR-sized batches so a human can cherry-pick a fix-only PR later without reading anything else.

Save the report, then continue. Do not wait here.

## Phase 2 — Improvement research (parallel subagents, read-only)

Agent F — Simplification: what can be deleted or collapsed? Fewer layers, fewer deps, less config. Deletion proposals are the highest-value proposals.

Agent G — Performance architecture: beyond bug fixes — caching layers, query strategy, build pipeline, lazy loading, batching.

Agent H — Feature gaps: infer the product's core job, then compare against what users of this category expect (search, export, keyboard shortcuts, sane empty/loading/error states, dark mode, onboarding, undo). Propose only features that serve the core job. "Competitors have it" is not a reason by itself.

Agent I — UX/UI: assess current design, accessibility, inconsistency. Propose a concrete design direction — not "modern": name a reference aesthetic, a type scale, a spacing system, a color token set. Vague direction produces generic output.

Agent J — Modernization: outdated APIs/patterns/framework versions, and what each migration actually buys. "Newer" is not a benefit; name the benefit.

Each proposal: what / why / expected impact / rough effort / risk.

Output: `agent-reports/02-proposals.md`.

## Phase 3 — Adversarial verification

Spawn one verifier subagent with a skeptic's mandate: its job is to kill proposals, not bless them. For each proposal, score:

Agent-legibility debt. In an agentic workflow, tech debt is not "hours for a human to fix" — it's anything that makes future agent runs worse: inconsistency, magic indirection, sprawling context, hidden coupling. Code that's cheap to write can still be expensive to carry, because every future session pays for it in confusion and tokens. Score debt on that axis.

Regression risk relative to actual test coverage.

Chesterton check — does this "flaw" look intentional given the history and docs from Phase 0?

Scope fit — does this feature belong in this product, or is it kitchen-sinking?

Conflicts — proposals that clash with each other; pick winners.

Output: `agent-reports/03-plan.md` — APPROVED (ordered), DEFERRED (reason), REJECTED (reason).

No gate — decide and proceed. The verifier's APPROVED list is the plan. Because no human is reviewing taste calls: cap new features at the 3 highest-confidence, core-job items; choose the UI direction that stays closest to the product's existing brand cues rather than the boldest option; and record every judgment call, with the rejected alternatives, in `03-plan.md` under a Decisions made on your behalf section.

## Phase 4 — Execution (sequential batches; parallel within a batch only when file sets don't overlap)

Order is deliberate — safety net first, churn last:

Safety net: characterization/smoke tests for critical paths if coverage is thin. Add CI + lint/format if absent. This is what makes every later step safe and cheap to verify.

P0/P1 audit fixes from Phase 1's approved list.

Simplification and refactors. Tests stay green after every one. A refactor that changes behavior is a bug with good intentions.

Approved features. Each feature: implement → write its tests → independent self-review pass by a separate subagent.

UI overhaul last (it churns the most files): implement the named design direction with tokens; verify visually — screenshot every major view and state (use browser tooling if available), check empty/loading/error states, a mobile breakpoint, keyboard navigation, and contrast. A UI change without a screenshot is unverified.

Rules: one concern per commit; run the test suite after every batch; log any deviation from the plan (and why) in `agent-reports/04-execution-log.md`.

## Phase 5 — QA and final report

Full test suite, lint, typecheck, production build.

Re-run every Phase 0 baseline measurement. Produce a before/after table. If "faster" isn't in the numbers, it didn't happen.

Fresh-eyes review: spawn a subagent that has seen none of the work to review `git diff agent-baseline` hunting for regressions, half-finished changes, and leftover debug artifacts.

Smoke-test the app end to end as a user would.

Output: `agent-reports/05-final.md` — everything changed, metrics before/after, known issues, suggested follow-ups, and a recommended PR breakdown (audit fixes / refactors / features / UI as separate PRs, mapped to commits).

Close with a summary written for someone returning cold: 5 lines on what changed, the headline before/after numbers, a Decisions made on your behalf recap (features added, UI direction chosen, anything deferred), and exact revert instructions per batch (`git revert` ranges or branch points).
