# Phase 0 — Recon

Date: 2026-07-17  
Repository: `sdpalley/legal-budget-builder`  
Baseline commit: `96c4e278872853eddf366b6c9294eebe5515305f`  
Baseline tag: `agent-baseline`  
Working branch: `agent/overhaul-20260717`

## Executive summary

Legal Budget Builder is a small React 19 application packaged as an Electron 41 desktop app. It guides a user through six steps—matter details, phases, costs, fee type, caveats, and output—then exports a styled Excel budget. All product data, state transitions, calculations, AI requests, and most styling live in one 2,553-line component (`src/App.jsx`). There is no application server, database, authentication layer, test suite, or coverage instrumentation.

The production build and both web and Electron launch paths work. Lint does not pass, there is no test command, and the current disclaimer contradicts the persistence behavior: it says nothing is stored while the application writes the matter session to `localStorage` (`src/App.jsx:1103-1141`). Critical-path coverage is effectively zero, so characterization tests are mandatory before refactoring.

## Intent archaeology

The repository contains four commits:

| Commit | Intent | Evidence |
| --- | --- | --- |
| `7f37c17` | Initial complete application | Added all 19 original files, including the 2,553-line `src/App.jsx` |
| `46dde11` | Repair parallel release creation | Changed `.github/workflows/build.yml` and disabled implicit electron-builder publishing |
| `783a50b` | Repair release permissions | Replaced the explicit release job with `contents: write` and per-platform release uploads |
| `96c4e27` | Always show the landing page on launch | Changed `mode` initialization from the saved mode to `null` at `src/App.jsx:1116` |

There is no long-lived churn history: nearly the entire application arrived in the initial commit. The only product-behavior change deliberately preserves saved budget data while returning users to the track chooser. That behavior should be protected by characterization tests.

## Stack and commands

| Concern | Current implementation |
| --- | --- |
| UI | React 19.2.4, JSX, inline style objects, limited global CSS |
| Build/dev | Vite 8.0.1 |
| Desktop | Electron 41.0.3, electron-builder 26.8.1 |
| Package manager | npm; lockfile version managed by npm 11.11.0 during recon |
| Runtime used for recon | Node `v25.8.0`, npm `11.11.0` |
| Export | `xlsx-js-style@1.2.0` loaded at runtime from jsDelivr (`src/App.jsx:1144-1149`) |
| AI | Direct renderer requests to Anthropic (`src/App.jsx:1268-1393`) |
| Persistence | Browser/Electron renderer `localStorage` key `lb_session` (`src/App.jsx:1103-1141`) |
| CI/release | Tag-triggered GitHub Actions builds macOS DMGs and Windows installers, then uploads them to a GitHub release (`.github/workflows/build.yml:1-33`) |

Exact baseline commands:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5174
npm run electron
npm test
npm run lint
npm run build
npm audit --omit=dev --audit-level=low
npm audit --audit-level=high
```

## Baseline metrics

| Metric | Baseline | Evidence / method |
| --- | ---: | --- |
| Tests | No test script; exit 1 | `npm test` reports `Missing script: "test"` |
| Coverage | Not measurable; effectively 0% | No test files, test dependencies, or coverage command exist |
| Lint | 3 errors, 1 warning; exit 1 | `npm run lint`; `src/App.jsx:1141`, `1174`, `1421`, `1422` |
| Production build | Pass; median 0.60 s wall time | Three `/usr/bin/time -p npm run build` runs: 0.49, 0.60, 0.80 s |
| Vite internal build | Median 136 ms | Three runs: 105, 136, 172 ms |
| JS bundle | 301,402 B raw; 85.69 kB gzip | Vite production output |
| CSS bundle | 1,788 B raw; 0.81 kB gzip | Vite production output |
| Total `dist/` | 318,213 B | `find dist ... | xargs wc -c` |
| Dev startup | 100 ms | Vite readiness output |
| Local HTML latency | 3.729 ms median total | Five `curl` runs: 4.581, 3.218, 5.188, 3.729, 3.141 ms |
| Local HTML TTFB | 3.578 ms median | Five `curl` runs: 4.420, 3.121, 5.017, 3.578, 2.947 ms |
| Electron launch | Pass | `npm run electron`; renderer remained running until terminated with SIGINT |
| Production dependency audit | 0 vulnerabilities | `npm audit --omit=dev --audit-level=low` |
| Full dependency audit | 13 findings: 1 low, 6 moderate, 6 high | `npm audit --audit-level=high` |

The browser smoke test reached the landing page, selected Litigation, accepted the disclaimer, and reached Step 1 without console errors.

## Architecture map

```text
Electron main process (electron/main.cjs)
  └─ loads dist/index.html in an isolated BrowserWindow
      └─ React root (src/main.jsx)
          └─ App (src/App.jsx)
              ├─ static legal matter/phase/task libraries
              ├─ landing + disclaimer screens
              ├─ six-step budget wizard
              ├─ fee and timeline calculations
              ├─ localStorage persistence
              ├─ direct Anthropic HTTP calls
              └─ browser-side XLSX generation/download
```

### Data flow

1. A track selection sets `mode` (`litigation`, `corporate`, or `tax`).
2. A disclaimer acknowledgement unlocks the wizard.
3. React state holds matter metadata, selected phases/tasks, timekeepers, contingency, fee arrangement, caveats, timeline configuration, and generated summary (`src/App.jsx:1116-1135`).
4. A side effect serializes most of that state to `localStorage` after every meaningful change (`src/App.jsx:1137-1141`).
5. Calculation functions derive task, phase, and grand totals in the renderer (`src/App.jsx:1178-1203`).
6. Optional AI helpers send matter scope and task names directly to Anthropic from the renderer (`src/App.jsx:1268-1393`).
7. Excel export builds and downloads a workbook using a CDN-provided global (`src/App.jsx:1396-1642`).

### External services and trust boundaries

- Anthropic Messages API: direct calls from the unprivileged renderer; no server-side credential boundary is present.
- jsDelivr: executable XLSX code is fetched at runtime.
- GitHub Actions/releases: tag pushes build and publish unsigned application artifacts.
- No database, backend API, user accounts, roles, or authentication exist.
- Electron enables `contextIsolation` and disables `nodeIntegration` (`electron/main.cjs:12-15`), which is a sound baseline boundary.

### Configuration and environment surface

No environment-variable or secret configuration is implemented. There is no `.env` template. Build settings are embedded in `package.json`, Vite uses only `base: './'`, and Electron has no preload bridge. AI requests therefore have no supported credential path.

## Initial smells (not yet adjudicated)

These are audit leads, not final findings:

- The privacy disclaimer says nothing is stored, while the application persists client and matter fields locally (`src/App.jsx:1057-1064`, `1103-1141`).
- The direct Anthropic requests provide neither an API key nor a supported desktop credential path (`src/App.jsx:1274-1390`).
- Runtime code execution depends on jsDelivr availability and integrity (`src/App.jsx:1144-1149`).
- The entire product is concentrated in a 2,553-line component, increasing regression and agent-legibility risk.
- `src/App.css` appears unused; `src/main.jsx:3` imports only `src/index.css`.
- The landing cards are clickable generic elements rather than semantic controls (`src/App.jsx:980-1038`).
- Lint fails on an empty catch, a missing hook dependency, and two unused variables (`src/App.jsx:1141`, `1174`, `1421-1422`).
- Existing CI only runs on tags and does not run lint, tests, or a build for ordinary branches/PRs (`.github/workflows/build.yml:1-33`).
- Word/PDF output is shown as a disabled “Coming in next version” control (`src/App.jsx:2490-2492`).

## Test-coverage verdict

Critical-path coverage is effectively zero. Phase 4 must begin with characterization and smoke tests for:

- track selection and disclaimer gating;
- saved-session restoration while still starting at the landing page;
- fee calculations for flat ranges and hours × rates;
- mode/type changes rebuilding the correct phase library;
- Excel export readiness and workbook generation;
- navigation across all six steps;
- failure handling for optional external AI functionality.

No refactoring of those paths is approved until the safety net passes.
