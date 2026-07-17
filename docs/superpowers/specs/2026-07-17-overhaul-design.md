# Legal Budget Builder Overhaul Design

Status: Approved by delegated recommendation
Date: 2026-07-17
Product direction: Desktop-first, privacy-first; retain a functional web build where it does not compromise the desktop design

## Objective

Turn the current proof-of-concept into a dependable, understandable legal-budget desktop application without expanding it into a case-management system. Preserve its core job: quickly assemble a transparent legal-fee budget, review assumptions, and export a client-ready artifact.

## Acceptance checklist

- A new contributor can install, test, build, and launch the app from the README.
- CI runs lint, tests, and the production build for pushes and pull requests.
- Critical calculations, persistence behavior, mode changes, and primary navigation have automated coverage.
- The privacy copy accurately describes local persistence and any external data transfer.
- No legal-matter content is silently transmitted to third parties.
- Optional AI behavior is either implemented behind a safe desktop boundary or removed from active UI; broken direct renderer requests are not shipped.
- Excel export is packaged locally rather than injected as executable CDN code.
- The app remains launchable through Electron and buildable through Vite.
- Major empty, loading, error, desktop, mobile-width, and keyboard states are verified visually.
- All approved P0/P1 audit findings are fixed; lower-priority deferrals are documented.
- Reports `00-recon.md` through `05-final.md` provide a cold-start evidence trail and commit/revert map.

## Approaches considered

### 1. Desktop-first hardening and focused modularization — selected

Keep Electron as the primary product, preserve the existing wizard and recognizable visual character, package dependencies locally, establish tests, extract stable domain/data modules, and make privacy behavior explicit. This is the shortest path to a trustworthy release and aligns with the existing DMG/Windows release workflow.

### 2. Web-first rewrite — rejected

Rebuild around hosted deployment and a backend proxy. This could make AI integration easier, but it introduces hosting, authentication, secrets management, privacy policy, and operational scope that the repository does not currently have.

### 3. Full cross-platform platform layer — deferred

Create adapters for Electron, web, storage, export, and remote services from the outset. This maximizes flexibility but adds abstraction before the product has tests or demonstrated need. It would increase agent-legibility debt now.

## Architecture

The implementation should evolve toward four explicit layers while avoiding a large rewrite:

1. **Domain data and calculations** — immutable legal phase libraries plus pure budget/timeline functions.
2. **Application state** — a reducer or focused hooks that own wizard state, mode transitions, persistence, and validation.
3. **UI components** — semantic, accessible screens and reusable form/navigation components.
4. **Platform services** — local persistence and workbook export behind small interfaces; external AI remains disabled unless a secure credential/data boundary is deliberately added later.

Extraction should be incremental and protected by characterization tests. The goal is not maximum file count; it is bounded units that can be understood without reading a 2,553-line component.

## Data and privacy behavior

- Budget drafts may persist locally on the device for convenience.
- The disclaimer and settings must state exactly what is stored and provide a clear “clear saved draft” action.
- Local storage parsing must be versioned and validated enough to survive corrupt or stale data without breaking launch.
- No client or matter data should leave the device in the default product.
- AI suggestion controls should not imply availability when no secure service is configured. The conservative implementation is to remove broken active AI calls and present no enabled AI action.

## Product scope

The approved product remains a six-step budgeting wizard across litigation, corporate, and tax tracks. High-confidence improvements may include at most three core-job features after audit verification. Likely candidates are draft reset, clearer review/edit navigation, and a dependable export flow; audit and adversarial review will decide.

Explicitly out of scope: accounts, cloud sync, collaboration, billing/invoicing, document management, case management, and a hosted AI proxy.

## UI direction

Retain the existing restrained navy, blue, and warm-neutral legal-professional cues. Use a compact token system, semantic controls, visible focus states, and clearer hierarchy rather than a brand replacement. The reference aesthetic is a calm professional document workspace: editorial serif display accents, highly readable sans-serif controls/body text, an 8px spacing base, modest radii, and AA contrast.

The wizard should remain recognizable. Improvements prioritize accessibility, responsive behavior, error/empty states, and scanability over decorative novelty.

## Error handling

- Corrupt saved data falls back to a clean draft and can be cleared.
- Export loading and failure states are explicit and recoverable.
- Invalid numeric inputs cannot silently produce misleading totals.
- Optional integrations fail closed without blocking manual budgeting.
- Electron external navigation is restricted to safe HTTP(S) URLs and denied inside the app window.

## Verification strategy

- Unit tests for pure calculations, phase builders, duration parsing, and persistence migration/validation.
- React integration tests for landing/disclaimer/wizard navigation, mode changes, form state, draft reset, and output states.
- CI gates for lint, tests with coverage, and production build.
- Browser smoke tests across major views, an empty state, an error state, a mobile-width viewport, and keyboard navigation.
- Electron launch smoke test plus production package configuration validation.
- Before/after build, bundle, startup, and local response metrics using the same Phase 0 commands.

## Reversible decisions made on the user's behalf

- Desktop-first instead of web-first or equal-priority dual-platform architecture.
- Local persistence retained, with truthful disclosure and user control, instead of silently removing saved drafts.
- Broken renderer-side AI disabled/removed rather than adding a backend and secret infrastructure.
- Visual evolution stays close to existing brand cues rather than a full redesign.
- Refactoring proceeds incrementally behind tests rather than rewriting the application.

## Self-review

The design contains no placeholders. Its scope is limited to the repository's demonstrated product, the architecture matches the privacy and testing requirements, and each acceptance item has a concrete verification lane. The user explicitly delegated remaining product-direction decisions to the recommended path, satisfying the design approval gate without further questions.
