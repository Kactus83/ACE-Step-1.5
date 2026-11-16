# ACE Studio — Source checkpoint #6 — 16 November 2026

## Branch and collaboration

`Kactus83/ACE-Step-1.5` ·
`feature/ace-studio-angular-tauri` ·
https://github.com/Kactus83/ACE-Step-1.5/pull/2 (draft).

The independent local team authored 11 source/packaging/CI fixes and
qualified the Windows baseline through `20286b7` before this web
development tranche. All those commits and their dependency lockfiles,
CSP/WebView fixes, new safe export file-root checks and acceptance evidence
were preserved. New writes use GitHub expected-head leases and no force push.
The consolidation PR #1 had already merged into the fork's `main`; this
feature branch remains separately reviewable, not merged.

## Delivered new code

1. Audited Python's `job_analysis_runtime.py` and
   `query_result_service.py` and implemented a separate Analysis workspace:
   semantic code extraction, full recording analysis and metadata-only LM
   analysis using verified `GenerateMusicRequest` flags.
2. Added typed `AnalysisResult`, non-audio queue outcomes and decoding of
   known legacy JSON-encoded statuses; avoids fabricated audio players.
3. Added user-triggered full code TXT download, safe preview, direct transfer
   of code sequence into Create, and transfer of analysis-derived text.
   No auto submission. `audio_code_string` is validated and never stored
   in local presets, project catalogs or browser task ID cache.
4. Added backup-first corrupt local project recovery and a two-action reset
   that refuses to delete valid, changed or absent catalogs.
5. Introduced typed EN/FR locale persistence, updated HTML language and
   initial bilingual app navigation/Analysis UI while retaining English as
   default. Full localization is explicitly incomplete.
6. Added real backend progress rendering only for finite [0,1] results,
   with honest indeterminate fallback.
7. Consolidated upload-file validation and clarified the separate safe
   adapter export and local CI evidence in documentation.

## Authored tests requiring local execution

Vitest:
- `analysis-request.test.ts`
- `analysis-result.test.ts`
- `source-audio-upload.test.ts`
- additional code-control mapper and normalized-progress assertions
- `locale-store.test.ts`.

Playwright mock:
- `analysis.spec.ts`
- `analysis-codes-reuse.spec.ts`
- `library-recovery.spec.ts`
- `locale.spec.ts`.

`tests/mock-backend.mjs` now returns distinct non-audio analysis outcomes
and accepts verified analysis flags; no real GPU inference is simulated.

## Verification boundary

The Windows 15 November baseline was actually compiled and exercised by
another team (see `docs/verification.md`), but these new files are
**not covered by that prior execution**. The GitHub work validated source
paths, requested API contracts and commit/branch state; no new
npm/Angular/Vitest/Playwright/Rust/Python/GPU commands ran here.
The backend's real analysis and code-control behavior must be accepted
against suitable actual models and an already initialized 5Hz LM.

## Remaining and DoD

See `docs/continuation.md`, `docs/functional-coverage.md` and
`docs/handoff.md`. Significant functionality and QA remain:
batch explorer, comprehensive EN/FR, dataset concurrency recovery,
frontend error handling, native save/codec review, real model/GPU tests,
full Python regressions and cross-platform packaged acceptance.

Do **not** call this 100% complete, production ready or merge-authorized.

