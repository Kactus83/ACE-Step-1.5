# Source checkpoint #3 — Expert generation API and UI

Date: 15 November 2026
Branch: feature/ace-studio-angular-tauri
PR: https://github.com/Kactus83/ACE-Step-1.5/pull/2 (draft, no merge)
Main baseline: d207bdd283dc726a0d9c711ca518dcf3accd1381

## Completed source tranche

1. Reviewed the current Python standalone request model, request builder,
   parameter parser, generation setup and LM input preparation.
2. Found that DCW parameters already existed in the Pydantic model but were
   missing from HTTP builder forwarding.
3. Patched the Python builder and aliases without modifying default policy:
   absent DCW stays None; False and True are explicit; mode/scalers/wavelet
   are forwarded only when supplied, with safe backend defaults otherwise.
4. Added Angular expert form fields and a focused component for ODE/SDE, shift,
   custom descending timesteps, ADG/CFG range, DCW tri-state and 5Hz LM CoT
   and sampling controls.
5. Added strict pure request validation, prompt preset whitelist updates and
   forced-DCW double-confirmation tied to form and connection revision.
6. Fixed source-audio extension parsing and confirmed that generated
   instrument stem naming does not replace the user-facing queue title.
7. Authored Python builder tests, TypeScript unit tests and Playwright
   HTTP-mock cases for expert request fields and DCW consent.
8. Performed a source-level import/LOC inspection on the eight newly affected
   TS modules: no missing relative imports or >200-line files were found.
9. Updated the feature coverage matrix, source reviews, API contract
   documentation, handoff plan and PR #2 body.

## Verification boundaries

GitHub writes and branch ref updates were confirmed by connector responses.
Python tests, Vitest, Playwright, Angular compilation, Tauri build and GPU
integration were **not executed**. A passing source inspection is not a
passing build or a production-ready claim.

The backend's DCW automatic model policy comes from the loaded model's
configuration and **must not** be guessed from a filename or label. LM
CoT flags are explicitly false by default in ACE Studio (versus true in the
Pydantic model) to prevent unexpected lazy LM initialization; the client
always sends the actual selected value.

## Remaining mission slices

- Completion of expert API surface where meaningful (code control/sample mode,
  LM model/backend selection and safe validation).
- A/B generation comparison, result metadata and deterministic repeat.
- Versioned local project/catalog persistence with explicit file retention.
- Adapter export, advanced dataset/train work and diagnostics.
- Full accessibility, browser/webview and native packaging validation.
- Complete unit/integration acceptance and real GPU tests by the local team.

Do not replace implementation with placeholder controls. Do not run/claim
a final completion gate while these source features remain unfinished.
