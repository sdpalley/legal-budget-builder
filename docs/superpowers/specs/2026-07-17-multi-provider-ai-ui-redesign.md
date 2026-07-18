# Multi-Provider AI and Counsel Workspace Redesign

Status: Approved by delegated recommendation
Date: 2026-07-17
Repository: `sdpalley/legal-budget-builder`
Product direction: Secure desktop AI with a modern, contextual budgeting workspace

## Objective

Restore and improve the application's removed AI capabilities without weakening its local-first privacy model, while redesigning the interface into a polished legal-pricing workspace. Users can configure OpenAI, Anthropic Claude, or OpenRouter, route each AI workflow to a chosen model, preview exactly what will be sent, and explicitly accept or reject every proposed budget change.

## Acceptance checklist

- OpenAI, Anthropic, and OpenRouter are available through provider adapters.
- API keys are encrypted through Electron's operating-system-backed `safeStorage`, are never returned to the renderer, and are never included in drafts, exports, logs, or error messages.
- If secure encryption is unavailable, the desktop app refuses persistent credential storage and explains why.
- Browser development mode uses session-only credentials, clearly labels the reduced security, and never persists them.
- Settings supports adding, replacing, testing, and deleting each provider key.
- Settings supports refreshing provider models, entering a model ID manually, choosing a default, and assigning a provider/model to each workflow.
- The earlier scope generation, individual and batch task estimates, caveat generation, and client-summary generation features are restored.
- New assumption review, budget integrity review, and natural-language change planning workflows are available.
- AI output is schema-validated and shown in an Apply/Dismiss preview before budget state changes.
- Client and matter names are excluded from AI payloads. Users can inspect the exact outgoing payload before each request.
- Manual budgeting, validation, preview, and export continue to work offline with no AI provider configured.
- The UI uses the Counsel Workspace direction and is responsive, accessible, and keyboard operable.
- Provider, credential, routing, workflow, redaction, preview/apply, failure, and no-key regression paths have automated coverage.

## Approaches considered

### 1. Electron service boundary with encrypted local credentials — selected

Keep keys and network calls in the Electron main process. A narrow preload bridge exposes allowlisted credential, model, and workflow operations. This fits the desktop-first application, avoids exposing keys to page code, and uses the operating system's credential encryption facilities without adding a hosted service.

### 2. Direct renderer integrations — rejected for production

Calling providers directly from React would be simpler, but the key would be visible to page code and developer tools. Browser-only development may use a clearly marked session adapter, but production desktop requests do not use this path.

### 3. Hosted proxy and accounts — deferred

A remote proxy could centralize secrets, usage limits, and billing. It would also require authentication, hosting, monitoring, privacy terms, and ongoing operations outside this repository's current scope.

## Product and information architecture

The six implementation steps become four user-facing stages:

1. **Brief** — matter type, jurisdiction, duration, fee context, and an explicitly anonymized scope description for AI.
2. **Scope** — phases and tasks, with AI scope drafting and natural-language change planning.
3. **Estimate** — team, rates, task staffing, hours or direct ranges, fee structure, and AI cost suggestions.
4. **Review & Export** — assumptions, caveats, readiness, client narrative, integrity review, timeline, previews, and workbook export.

The stage rail shows completion and issue states. A persistent summary rail shows autosave state, low/high total, selected fee structure, and unresolved issue count. Settings is global rather than a wizard step. AI actions are contextual beside the work they improve rather than collected in a separate “AI mode.”

## Visual direction: Counsel Workspace

- Warm ivory canvas, white working surfaces, deep ink/slate text, restrained cobalt actions, and semantic warning/success colors.
- Editorial serif typography only for product and major page titles; modern sans-serif for forms, tables, and body content.
- Left stage rail, spacious central work surface, and sticky summary rail on wide screens.
- At narrower widths the summary becomes a compact top strip and the stage rail collapses to a labeled progress control.
- Semantic headings, labels, fieldsets, tables, dialogs, and buttons replace styled generic elements.
- Visible focus states, AA contrast, 44-pixel minimum primary touch targets, descriptive destructive controls, and no platform-dependent emoji icons.
- Cost entry presents explicit “Range” and “Hours × rates” modes. Reference-only values are visually read-only and never resemble editable inputs.
- Review & Export uses tabs or sections for readiness, client preview, internal preview, timeline, and files so one page does not become an undifferentiated wall.

## AI workflows

Every workflow has a stable ID, display name, input builder, redaction policy, JSON Schema, output validator, and preview renderer.

| Workflow             | Restored/new          | Input                                                    | Proposed result                                  |
| -------------------- | --------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| `scope_draft`        | Restored and expanded | Anonymized scope, matter type, jurisdiction, duration    | Phases, tasks, optional initial ranges           |
| `task_estimate`      | Restored              | One task, matter context, staffing/rates                 | Low/high estimate and rationale                  |
| `all_task_estimates` | Restored              | All tasks, matter context, staffing/rates                | Per-task low/high estimates and rationales       |
| `caveat_draft`       | Restored              | Budget structure and non-identifying assumptions         | Suggested caveats                                |
| `budget_narrative`   | Restored              | Matter type, totals, fee type, phases, caveats           | Client-facing summary                            |
| `assumption_review`  | New                   | Scope, estimates, caveats, fee structure                 | Missing assumptions, exclusions, and scope risks |
| `integrity_review`   | New                   | Completed non-identifying budget                         | Inconsistencies, outliers, and unresolved issues |
| `change_plan`        | New                   | Anonymized instruction plus current phase/task structure | Structured adds, edits, moves, or removals       |

Natural-language changes are plans, not commands. A preview lists each proposed operation; users can select operations and apply them together. Destructive proposals require explicit selection and never bypass existing confirmation behavior.

## Credential and provider architecture

### Desktop boundary

`electron/preload.cjs` exposes a frozen `window.legalBudgetAI` object through `contextBridge`. The renderer can request only these operations:

- list provider credential status;
- set or delete a credential;
- test a configured provider;
- list models for a configured provider;
- run an allowlisted workflow with an allowlisted routing configuration.

The main process validates every IPC payload and owns all provider URLs and headers. It does not accept arbitrary URLs, headers, raw prompts, or credential identifiers from the renderer.

### Credential store

The store writes only encrypted, base64-encoded blobs beneath Electron's `userData` directory. Encryption and decryption use asynchronous `safeStorage` APIs when available. The file is written with restrictive permissions where the platform supports them. The renderer receives only configured/not-configured state.

If `safeStorage` is unavailable or its Linux backend reports an insecure basic-text fallback, persistent saving fails closed. The interface explains that secure OS credential storage is unavailable and offers no “save anyway” option. Deleting a key removes the encrypted blob. Key values are cleared from form state immediately after a successful save.

### Provider adapters

- **OpenAI:** Bearer authentication, Responses API, strict JSON Schema structured output, and provider model listing.
- **Anthropic Claude:** `x-api-key` plus the required API version header, Messages API, structured output when the selected model supports it, and model listing.
- **OpenRouter:** Bearer authentication, OpenAI-compatible chat completions, JSON Schema response format for compatible models, and model listing.

Model lists are fetched on demand and cached only in memory. Because provider catalogs change, model IDs are not treated as permanent application constants. Each provider has a sensible editable seed value, but users can refresh the catalog or enter a model ID manually. A provider/model capability check runs before a structured workflow.

Official implementation references:

- [Electron safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage)
- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI models](https://developers.openai.com/api/docs/models)
- [Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create)
- [Anthropic model listing](https://platform.claude.com/docs/en/api/models/list)
- [OpenRouter authentication](https://openrouter.ai/docs/api/reference/authentication)
- [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs)
- [OpenRouter model listing](https://openrouter.ai/docs/api/api-reference/models/get-models)

## Settings experience

Settings has two sections:

### Providers

Each OpenAI, Anthropic, and OpenRouter card shows configured state, a masked key-entry field, Save/Replace, Test connection, Refresh models, and Remove. The app never redisplays a saved key. Connection tests use a low-cost metadata/model-list operation rather than generating content where the provider supports it.

### Workflow routing

A routing table lists every workflow, its purpose, provider, and model. Users may inherit the global default or override either value. Unconfigured or incompatible rows show a precise warning. Routing preferences contain no secrets and may persist with application settings.

## Data minimization and consent

- Client name and matter name are always removed before an AI request.
- Scope generation uses a separate field labeled “Anonymized scope for AI”; it does not silently reuse a client description.
- Payload builders include only fields needed by that workflow.
- Before the first request, and thereafter through “Preview data,” a dialog displays the exact JSON payload and provider/model destination.
- The dialog warns users not to include privileged, confidential, personal, or identifying material unless their firm's policies and provider agreement permit it.
- Preview confirmation may be remembered per provider for the current session, but exact-payload preview remains available on every AI control.
- Raw prompts, raw responses, and keys are not written to application logs or draft storage. Accepted rationales/caveats/narratives become normal user-owned budget content.
- A local metadata-only activity record may retain timestamp, workflow, provider, model, success/failure category, and apply/dismiss outcome. It contains no request or response body.

## Suggestion lifecycle

1. The user invokes a contextual AI action.
2. The app builds and redacts a workflow-specific payload.
3. The user previews the destination and outgoing data when required.
4. The main process resolves the route, decrypts the key for the request, builds the provider request, and enforces timeout/size limits.
5. The provider response is normalized and validated against the workflow schema.
6. The renderer shows a diff or proposal preview with Apply and Dismiss actions.
7. Only Apply mutates budget state. Applied content remains editable and is marked as AI-assisted until the user edits it or dismisses the marker.

Batch proposals support select all/none and per-item selection. Generation can be cancelled locally; a late response is ignored and cannot change state.

## Errors and resilience

Provider failures normalize to actionable categories: missing key, invalid key, permission failure, unavailable model, unsupported structured output, rate limit, quota/billing, timeout, network unavailable, provider outage, refusal, invalid response, and cancelled request. Messages identify the provider and recovery action without showing secrets or raw sensitive content.

Malformed or schema-invalid output is never partially applied. Users can retry, select a different route, or continue manually. AI availability never blocks launch, draft editing, calculations, validation, preview, or export.

## Code organization

The implementation should continue the existing incremental modularization:

- `electron/llm/credentialStore.cjs` — encrypted credential persistence.
- `electron/llm/providers/*.cjs` — provider-specific transport and normalization.
- `electron/llm/service.cjs` — routing, workflow allowlist, validation, timeout, and error normalization.
- `electron/preload.cjs` — narrow IPC bridge.
- `src/ai/workflows.js` — workflow metadata, redacted payload builders, schemas, and pure validators.
- `src/ai/client.js` — renderer bridge/session-development adapter.
- `src/components/settings/*` — provider and routing settings.
- `src/components/ai/*` — data preview, suggestion preview, status, and errors.
- `src/components/workspace/*` — stage rail, summary rail, and responsive shell.

Existing domain calculation and persistence modules remain authoritative. AI code proposes domain data through the same validated reducer/actions as manual editing.

## Verification strategy

- Credential-store tests with mocked secure storage for save/read/delete, corruption, permission failure, encryption unavailability, and insecure Linux fallback.
- IPC tests proving channel allowlists, payload validation, and that credentials never cross into renderer responses or errors.
- Provider contract tests with mocked HTTP for correct endpoints/headers, model normalization, structured request format, refusal/error mapping, timeouts, and secret redaction.
- Workflow tests for field minimization, name removal, JSON Schemas, numeric bounds, and rejection of malformed output.
- UI integration tests for provider setup, replace/remove, routing inheritance/override, payload preview, apply/dismiss, batch selection, cancellation, and error recovery.
- Regression tests proving every manual flow works with no key and while offline.
- Accessibility checks for semantic headings, form labels, dialog focus management, keyboard operation, and visible focus.
- Responsive visual smoke checks at wide desktop, laptop, tablet, and narrow mobile widths.
- Full existing lint, test, coverage, production build, and Electron launch smoke checks before completion.
- No live paid provider calls are required for automated tests. Optional manual smoke calls require user-supplied keys and explicit invocation.

## Delivery sequence

1. Add workflow contracts, routing defaults, provider adapters, encrypted credentials, preload IPC, and tests.
2. Add Settings and contextual AI controls behind the service boundary.
3. Restore the four earlier workflows, then add the four optional workflows.
4. Extract the workspace shell and migrate the six implementation steps into four macro-stages without changing domain calculations.
5. Apply the Counsel Workspace visual system and responsive/accessibility improvements.
6. Run regression, security, build, Electron, and visual verification; update README and evidence reports.

## Reversible decisions made on the user's behalf

- Counsel Workspace was selected over the denser Precision Ledger and generic Quiet Enterprise directions.
- Expert and guided use are balanced: contextual help is prominent, while repeated users retain direct table editing.
- Desktop is the secure production AI surface; browser AI remains development-only and explicitly reduced-security.
- Operating-system encryption is required for persistent keys; insecure plaintext fallback is not offered.
- AI suggestions require explicit application and never mutate budgets automatically.
- The four user-facing stages replace the six-step presentation, while underlying domain behavior is preserved.
- Dynamic model discovery plus manual IDs is used instead of relying solely on brittle hardcoded model catalogs.

## Self-review

The design has no placeholders. It restores all demonstrated historical AI capabilities, adds the requested providers and per-workflow model choices, makes credential and data boundaries explicit, preserves offline manual operation, incorporates the UI subagent's evidence-backed redesign, and assigns every acceptance item to a verification lane. The user explicitly delegated design choices and instructed implementation to continue, satisfying the approval gate without further preference questions.
