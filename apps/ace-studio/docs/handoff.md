# ACE Studio — local CI and reviewer handoff

**Repo:** `Kactus83/ACE-Step-1.5`
**Branch:** `feature/ace-studio-angular-tauri`
**Draft PR:** https://github.com/Kactus83/ACE-Step-1.5/pull/2
**Fork main:** `d207bdd283dc726a0d9c711ca518dcf3accd1381`,
merged non-destructively into the feature branch at `73b32efc`.
Consolidation PR #1 was already merged independently. Do not reapply it.

## Read before compiling

1. Root `AGENTS.md`, Studio `AGENTS.md` and `README.md`.
2. `docs/architecture.md`, `docs/contracts.md`, `docs/functional-coverage.md`.
3. `docs/source-checkpoint-6.md`, `docs/continuation.md`.
4. `docs/review-architecture.md`, `docs/review-ux.md`,
   `docs/security-review.md`, and `docs/verification.md`.

## Local workflow

- Check that the PR is still draft, inspect latest `main` and other teams'
  commits, preserve any concurrent work, no force-push/auto-merge.
- Run the exact commands and capture evidence specified in
  `docs/verification.md`; no fabricated green CI declarations.
- Prefer minimal, reversible, well-tested fixes on the Studio feature branch,
  commit/push after each coherent checkpoint.
- Keep existing model inference, Gradio, CLI and training behavior intact.
- Treat remote server files as privileged operator-owned paths. Never exercise
  destructive training export against user data; use disposable directories.
- Do not start a second Python model service, download models automatically or
  run repeated costly GPU actions unless the user approves.
- Validate actual desktop origins on Windows, macOS and Linux, including
  keyboard focus, browser codecs, CORS PUT and native application icons.

## Current source handoff — 17 November 2026

Last fully green GitHub check suite: `34b2fd83` (16 November 2026,
Angular/browser mocks, Python contracts, Windows package and CodeQL).
New source commits on the existing branch:
- `36a2b6f`: clear draft bearer token on endpoint edits; test cross-server isolation.
- `75e8eaf`: model filter and newest/oldest queue ordering; unit and mock E2E.
- `a3ab529`: EN/FR audio, generation metadata and analysis results; unit and
  mock E2E. The backend response fields are not translated.

The current code **has not been requalified since those changes**. Before
acceptance, run `npm ci`, `npm run lint`, `npm run test`,
`npm run build`, `npm run e2e:mock` and `npm run desktop:build`;
log each command's SHA, exit status, toolchain and results. Inspect new tests
alongside all earlier regressions. Then perform the real API/GPU, WebView,
download, a11y and install checks listed in `docs/verification.md`.
Keep PR #2 draft; do not merge.

## Concurrent local qualification

The Windows local team already compiled and mock-qualified the prior source
through commit `20286b7`. Their commits, dependency lockfiles, CSP fixes,
safe backend filesystem-root guard and packaging evidence are preserved.
The newer source must be validated from its own **current HEAD**.
Our GitHub writes use a branch-head lease and do not force-push or merge.
Local-team corrections take precedence when reconciling overlapping changes.

## Critical integration checks

- `/v1/dataset/sample/{index}` is a PUT route, now preflight allowed via the
  narrow Studio CORS helper. Confirm browser end-to-end editing.
- The new `/v1/studio/training/export` route refuses a destination that
  already exists, conflicts with training source or resolves outside explicit
  `ACESTEP_STUDIO_FILE_ROOTS`. **Never** redirect Studio back to legacy
  `/v1/training/export`, which remains destructive.
- `/release_task` expert DCW fields were made available through a narrow
  Python HTTP adapter change; verify server defaults when not set.
- Browser-local bookmarks are metadata-only and may become unplayable if the
  backend removes generated temp audio. They are not backups.
- A/B playback uses two HTML media elements and is not phase-aligned.
- Run independent source, runtime and UX/security contradiction checks and
  update the PR scope matrix before requesting review.

Windows local qualification is recorded in `docs/verification.md`, including a
real packaged-WebView startup and layout/navigation inspection. It does not
cover real GPU/model execution, full Python regression, signed installation,
visual assistive-technology acceptance or non-Windows packaging. Only the user
can authorize promoting/merging the completed and accepted work.

## 17 November — checkpoint 9 incremental qualification

Additional commits after the prior 17 November source report:
`418345c` (pause non-retryable polling), `29e65a1` (15-second
status-read timeout) and `6f2bd1a` (cross-server dataset PUT guard).
Source head: `6f2bd1aeea450bb8f6a5d6cb613bb218160f96fd`.

**New targeted tests:** `polling-fail-closed.spec.ts`,
`read-only-timeout.test.ts`, `dataset-server-switch.spec.ts`.
Run with the entire existing web and focused Python suites. All three new
commits are **unqualified until current-head execution evidence exists**.

See `docs/source-checkpoint-9.md` for exact changes, limitations and
prioritization. Keep the PR draft, do not force-push and do not merge.
