# ACE Studio — Autonomous coordination and next source passes (checkpoint 6)

Repository: `Kactus83/ACE-Step-1.5`
Branch: `feature/ace-studio-angular-tauri`
Draft PR: https://github.com/Kactus83/ACE-Step-1.5/pull/2
Fork main last synchronized: `d207bdd283dc726a0d9c711ca518dcf3accd1381`,
merged into the feature branch via `73b32efc`.

## Collaboration boundary

The independent Windows team already committed compilation, debugging, CSP,
dependency lockfile and packaged WebView corrections on this *same* feature
branch (latest local qualification lineage includes `20286b7`).
These changes must **not** be overwritten or silently reverted. Always inspect
the current HEAD and changed paths before writing. Commit coherent increments
and update the ref with `expected_sha` and `force=false`. On a rejected
lease, refresh and reconcile, never force-push or reset the other team's work.
Do not merge PR #2 into `main`. Codex/Claude Code will handle final promotion.

## Evidence separation

The local team recorded real Windows evidence on 15 November 2026:
`npm ci`, Angular production build/lint, 78 Vitest tests, 20 Playwright
mock scenarios, Cargo check/test, unsigned MSI/NSIS packaging, real packaged
WebView launch, and focused Python unittests (18 tests with one skip).
Read `docs/verification.md` and retain the exact logs and toolchain details.

**This new source tranche, authored on 16 November after that qualification,
has NOT been compiled or executed.** It must not inherit the older green
status. Backend inference, GPU training, complete Python regression, other
desktop platforms and screen-reader acceptance remain unverified.

## Source now written

- Angular 21 standalone frontend and Tauri 2 shell, shared UI, typed
  standalone API adapter and opt-in desktop CORS.
- Connection credentials only in memory; model inventory, explicit DiT +
  LM initialization, validated task and queue state.
- Text2music, Cover/Repaint, Extract/Lego/Complete where advertised,
  expert scheduler/DCW/ADG/LM controls, 5Hz concept sample generation.
- **New Analysis workspace:** actual `extract_codes_only`,
  `full_analysis_only` and `analysis_only` flags, ephemeral audio upload,
  typed non-audio results, bounded metadata/code display and TXT export.
- **Code-control generation:** exact `audio_code_string` forwarded to
  `/release_task` only with normal text2music and LM thinking disabled.
  Codes may be transferred to Create from completed analysis without
  automatic GPU work; excluded from presets and local project storage.
- Description-from-analysis to Create, explicit intent only.
- Queue/status/results, authenticated audio, actual progress fractions when
  valid, multiple variants, approximate A/B audition and seed restoration.
- Local project library, bookmarks, notes/tags/favorites, bounded JSON
  import/export, stale-tab protection and **backup-first corrupt-data
  recovery with two-click reset only when the current catalog is invalid**.
- Datasets scan/load/save, sample updates, async label/tensors, LoRA/LoKr
  training/status/stop/loss and safe adapter export within explicitly
  approved server directories. Legacy destructive export route unchanged.
- Dark/light tokens, keyboard help with Alt+1–7, initial typed EN/FR
  persistence and partial localized navigation/Analysis labels.

## Highest-priority remaining source work

1. **Batch/results explorer:** time/model groupings, batch variant navigation
   and explicit repeat/compare workflows with source reattachment, without
   inventing GPU cancellation or persisting audio binaries.
2. **API lifecycle robustness:** task and server errors (401/403/404/409),
   recovery/timeouts, capability unavailable UX, pre-existing task
   observation and strict model/profile compatibility.
3. **Server-global dataset contention:** clear ownership warnings, active
   task recovery, safe write/overwrite rules and coordination guidance.
4. **Internationalization:** extend typed EN/FR strings to Create, jobs,
   library, datasets, training, connection and all form errors. Current
   language preference translates navigation and parts of Analysis only.
5. **Native acceptance:** decide browser versus Tauri media save/dialog
   boundary with a capability-gated adapter, without blanket filesystem
   permissions or duplicate Python processes. Validate actual packaged
   WebView audio, downloads and CORS.
6. **A11y and visual review:** narrow/zoomed layouts, color contrast,
   keyboard traversal, focus management, reduced motion, screen readers.
7. **Test expansion:** new analysis/code-control/recovery/locale/progress
   tests and existing mock suite, real Python API/GPU variants and
   cross-platform packaging. Current branch must pass fresh tests before
   any 100% claim.
8. Perform separate contradictory architecture/security and UX reviews,
   apply remaining corrections, update matrix and handoff evidence.

## Required local-team test delta

At **current branch HEAD**, rerun:
- `npm ci && npm run lint && npm run test && npm run build`
- `npm run e2e:mock` including `analysis.spec.ts`,
  `analysis-codes-reuse.spec.ts`, `library-recovery.spec.ts`,
  `locale.spec.ts` and existing regressions
- focused Python tests and later real GPU analysis/code-control paths
- Windows packaged WebView navigation and file downloads; record exact
  exit status, SHA, platform and evidence
- Rust/Tauri checks if capabilities, plugins or native files were changed.

The web team must keep writing remaining source even when the local toolchain
is inaccessible. The local team's job is to compile/debug and validate,
not to replace the web team or become its approval gate.

## Non-negotiable restrictions

No force push, no automatic merge, no invented endpoints or model behavior,
no silent loading/downloading, no API secrets in browser storage,
no native shell/filesystem wildcard capabilities, no Python engine duplication,
and no claim of 100% or production readiness without both complete source
and actual acceptance evidence.

