# Multi-Provider AI and Counsel Workspace Implementation Plan

Design: `docs/superpowers/specs/2026-07-17-multi-provider-ai-ui-redesign.md`
Date: 2026-07-17

## Goal

Ship secure, optional OpenAI/Anthropic/OpenRouter workflows and the first complete Counsel Workspace UI pass without regressing offline budgeting or export.

## Task 1: Workflow contracts and routing

Files:

- Create `src/ai/workflows.js`
- Create `src/ai/routing.js`
- Create `src/ai/workflows.test.js`
- Create `src/ai/routing.test.js`

Steps:

1. Define the eight workflow IDs, labels, descriptions, payload builders, schemas, and output validators.
2. Ensure builders omit client and matter names and minimize fields per workflow.
3. Define provider metadata and inherited/per-workflow routing normalization.
4. Test redaction, invalid numeric output, unknown providers/workflows, and routing fallbacks.
5. Run `npm test -- src/ai/workflows.test.js src/ai/routing.test.js`.

## Task 2: Encrypted desktop credentials

Files:

- Create `electron/llm/credentialStore.cjs`
- Create `electron/llm/credentialStore.test.js`

Steps:

1. Inject `safeStorage`, file path, and filesystem functions for deterministic tests.
2. Store only encrypted base64 blobs and expose configured booleans.
3. Reject unavailable encryption and insecure Linux backends.
4. Implement replace and delete with atomic file replacement and restrictive permissions.
5. Test round trips, deletion, corrupt files, unavailable encryption, and secret-free errors.
6. Run `npm test -- electron/llm/credentialStore.test.js`.

## Task 3: Provider adapters and service

Files:

- Create `electron/llm/providers/openai.cjs`
- Create `electron/llm/providers/anthropic.cjs`
- Create `electron/llm/providers/openrouter.cjs`
- Create `electron/llm/providers/providers.test.js`
- Create `electron/llm/service.cjs`
- Create `electron/llm/service.test.js`

Steps:

1. Implement authenticated model listing and structured generation for each provider with injected `fetch`.
2. Normalize model records and response content.
3. Add request timeout, response-size guard, workflow/provider allowlists, and error categories.
4. Guarantee thrown errors and returned metadata do not contain credentials.
5. Test endpoints, headers, request shapes, successful normalization, refusal, rate limit, timeout, and malformed output.
6. Run the provider and service test files.

## Task 4: Preload and IPC boundary

Files:

- Create `electron/preload.cjs`
- Create `electron/llm/ipc.cjs`
- Create `electron/llm/ipc.test.js`
- Modify `electron/main.cjs`

Steps:

1. Register allowlisted handlers for status, save/delete, test, models, and workflow execution.
2. Validate all incoming payloads and return sanitized result envelopes.
3. Expose only fixed methods through `contextBridge`.
4. Attach preload to the BrowserWindow and initialize/dispose handlers with application lifecycle.
5. Test channel registration, validation, and non-disclosure of keys.
6. Run Electron tests and an Electron launch smoke test after the production build.

## Task 5: Renderer AI client and Settings

Files:

- Create `src/ai/client.js`
- Create `src/ai/client.test.js`
- Create `src/components/settings/AISettings.jsx`
- Create `src/components/settings/AISettings.test.jsx`
- Create `src/components/ai/DataPreviewDialog.jsx`
- Create `src/components/ai/SuggestionDialog.jsx`
- Modify `src/App.jsx`
- Modify `src/index.css`

Steps:

1. Wrap the preload bridge and a clearly labeled session-only browser-development fallback.
2. Build provider cards with save/replace, test, refresh, manual model entry, and delete.
3. Build workflow routing with inherited defaults and overrides.
4. Build accessible outgoing-data and proposal dialogs with focus-safe native dialog semantics.
5. Persist non-secret routing preferences with draft/application settings.
6. Test no-bridge, success, error, key clearing, routing, and keyboard/dialog behavior.

## Task 6: Restore and extend contextual AI actions

Files:

- Create `src/hooks/useAIWorkflow.js`
- Create `src/hooks/useAIWorkflow.test.jsx`
- Modify `src/App.jsx`
- Modify `src/App.test.jsx`

Steps:

1. Restore anonymized scope drafting, one/all task estimation, caveat drafting, and narrative drafting.
2. Add assumption review, integrity review, and natural-language change planning.
3. Use one shared preview/apply/dismiss state machine.
4. Route all accepted changes through existing validated state setters; never mutate on response arrival.
5. Add cancellation/stale-response protection and normalized recovery messages.
6. Test every workflow's invoke, preview, apply, dismiss, missing-key, malformed-response, and offline behavior.

## Task 7: Counsel Workspace shell and visual system

Files:

- Create `src/components/workspace/WorkspaceShell.jsx`
- Create `src/components/workspace/StageRail.jsx`
- Create `src/components/workspace/SummaryRail.jsx`
- Create `src/components/workspace/workspace.css`
- Create workspace component tests
- Modify `src/App.jsx`
- Modify `src/index.css`

Steps:

1. Add four macro-stage navigation over the existing six-step domain flow.
2. Add persistent autosave, range total, fee type, and issue summary.
3. Establish semantic headings, controls, design tokens, restrained SVG icon treatment, and visible focus.
4. Rework cost mode labels and remove false edit affordances.
5. Make stage and summary rails responsive for desktop, laptop, tablet, and narrow screens.
6. Test navigation, issue states, semantics, and narrow-width structure.

## Task 8: Documentation and full verification

Files:

- Modify `README.md`
- Update relevant `docs/overhaul/*.md` evidence files if present

Steps:

1. Document secure provider setup, per-workflow routing, payload preview, browser-development limitation, and offline behavior.
2. Run `npm run format:check` and fix only touched formatting.
3. Run `npm run lint`.
4. Run `npm test` and `npm run test:coverage`.
5. Run `npm run build`.
6. Launch the packaged Electron entry long enough to verify window creation and preload registration without provider keys.
7. Inspect `git diff --check`, new artifact paths, and scan touched/generated files for credential-like content.
8. Record exact pass/fail results and limitations; do not claim live provider success without an explicit manual key-backed smoke test.

## Commit strategy

Use small reversible commits: workflow contracts; credential/provider boundary; IPC; settings and dialogs; restored workflows; workspace redesign; documentation/verification. Do not push or publish.
