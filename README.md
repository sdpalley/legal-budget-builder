# Legal Budget Builder

Legal Budget Builder is a desktop-first tool for preparing transparent legal-fee estimates. It provides litigation, corporate/transactional, and tax budgeting tracks; lets a user tailor phases, tasks, staffing, rates, and caveats; calculates fee ranges and timelines; and exports a styled Excel workbook.

The application is a local single-user budgeting aid, not legal advice, billing software, matter management, or a system of record.

## Privacy and data handling

- Draft data is stored in the current browser/Electron profile under the local-storage key `lb_session`.
- There is no application server, account system, cloud sync, or remote database.
- Manual budgeting, calculation, preview, and export do not transmit matter data. Optional AI workflows send the exact anonymized payload shown in the privacy preview to the provider/model the user selects.
- API keys are stored only by the desktop app as operating-system-encrypted blobs. They are never stored in the budget draft or Excel export and are never returned to the React renderer.
- Treat the app as a demonstration tool and use anonymized/sample data unless your organization has reviewed the local-device storage model.
- Excel export uses a pinned, locally bundled workbook library loaded on demand. Export does not require network access.

The statements above describe the current branch state and are deliberately explicit while the privacy/export hardening commits are in progress.

## Requirements

- Node.js 22 or newer (also declared in `package.json`; CI uses Node 22)
- npm
- macOS, Windows, or Linux for browser development
- macOS or Windows for the configured desktop installers

## Install and run

```sh
npm ci
npm run dev
```

Vite prints the local development URL. To build and launch the Electron desktop application:

```sh
npm run electron
```

The Electron command runs the production web build first, then opens `dist/index.html` in an isolated renderer.

## Optional AI setup

1. Launch the desktop app with `npm run electron`.
2. Open **AI settings** in the workspace header.
3. Add an API key for OpenAI, Anthropic Claude, or OpenRouter. The app never displays a saved key again.
4. Test the connection and refresh the provider's current model list.
5. Choose a default provider/model under **Workflow routing**, then override individual tasks if desired.
6. Use the contextual AI controls in Brief, Scope, Estimate, and Review. Inspect the outgoing JSON and destination before sending, then review and explicitly apply or dismiss the result.

The Vite browser-development view can hold a key only in memory for the current tab and does not make provider requests. This prevents production keys from being exposed to page code. Use Electron for real AI workflows. Client name and matter name are excluded from every built-in AI payload; the scope generator uses its own explicitly anonymized input.

Available workflows are phase/task drafting, one-task and all-task estimates, caveat drafting, client narrative drafting, assumption review, completed-budget integrity review, and natural-language scope change planning. AI remains entirely optional: all manual features work with no key and while offline.

## Quality checks

Run the same checks used by CI:

```sh
npm run format:check
npm run lint
npm run test:coverage
npm run build
npm audit --omit=dev --audit-level=high
```

Useful development variants:

```sh
npm test
npm run test:watch
npm run format
npm run preview
```

Coverage thresholds are defined in `vite.config.js`. Raise them as tested modules are extracted; do not lower them to make a change pass.

## Desktop packaging

```sh
npm run dist:mac
npm run dist:win
```

Output is written to `release/`. The macOS build targets arm64 and x64 DMGs. The Windows build targets NSIS and portable executables.

The tag-triggered GitHub Actions release workflow runs format, lint, tests/coverage, a production build, and the production dependency audit before packaging. Signing and notarization are not configured; see [the final overhaul report](agent-reports/05-final.md) when available for the current release limitations.

## Architecture

```text
electron/main.cjs       Electron window lifecycle and navigation boundary
electron/preload.cjs    Narrow credential/model/workflow bridge
electron/llm/           Encrypted credential store, providers, IPC, and AI service
src/main.jsx            React entry point
src/ai/                 Redacted workflow contracts, result validation, and routing
src/components/         Counsel Workspace, AI dialogs, and provider settings
src/App.jsx             Product state, catalogs, contextual workflow integration, and export
src/App.test.jsx        Characterization/integration safety net
vite.config.js          Browser build and Vitest/coverage configuration
```

The approved overhaul extracts only proven boundaries—domain/calculation code, draft storage, and workbook export—before considering broader component splitting. The architecture and decision record are in:

- `agent-reports/00-recon.md`
- `agent-reports/01-audit.md`
- `agent-reports/02-proposals.md`
- `agent-reports/03-plan.md`
- `docs/superpowers/specs/2026-07-17-overhaul-design.md`
- `docs/superpowers/specs/2026-07-17-multi-provider-ai-ui-redesign.md`

## Release checklist

1. Start from a clean checkout and run `npm ci`.
2. Run all commands in **Quality checks**.
3. Launch the production Electron application with `npm run electron`.
4. Smoke-test all three tracks, draft restore/clear behavior, calculations, timeline, and Excel export.
5. Build the target installer(s) and smoke-install each artifact.
6. Record versions, checksums, signing/notarization status, and known limitations in the release notes.
7. Create a `v*` tag only after the checks above pass; tag pushes trigger the release workflow.

## Troubleshooting

- **A saved draft prevents launch:** clear site data/local storage for the app profile. The overhaul adds an in-app recovery control.
- **Excel export fails:** the draft remains saved locally. Retry from Output; if it still fails, restart the app and attach only redacted diagnostic details to a private report.
- **Electron opens a stale UI:** stop Electron, run `npm run build`, and relaunch.

## Security

Do not commit API keys, client data, matter details, answer keys, or private logs. Report vulnerabilities privately to the repository owner rather than opening a public issue containing sensitive details.
