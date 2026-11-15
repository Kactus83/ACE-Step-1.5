# ACE Studio — Coordinator continuity, post-checkpoint 5

Repo: `Kactus83/ACE-Step-1.5` · Branch:
`feature/ace-studio-angular-tauri` · Draft PR:
https://github.com/Kactus83/ACE-Step-1.5/pull/2

Fork `main` at last synchronization: `d207bdd283dc726a0d9c711ca518dcf3accd1381`
via merge `73b32efc`. Do not merge PR #2, force-push or reapply
consolidation PR #1. The local CI team will test after source completion.

## Written in source so far

- Shared Angular 21/Tauri 2 frontend; typed standalone FastAPI adapter,
  opt-in native CORS, browser PUT preflight, volatile session key.
- Model inventories and init, explicit double-confirmed DiT + 5Hz LM load,
  real queue/status and robust authenticated media fetch.
- Text2music, Cover, Repaint, Extract/Lego/Complete from advertised models;
  source preserving/crossfade controls, opt-in waveform and exact upload fields.
- Expert scheduler/ADG/CFG/DCW/LM CoT and sampling controls; 5Hz LM sample
  query generation gated by explicit resource warning.
- Queue search and phases, metadata/seed/details, restorable parameters
  without auto-running GPU, approximate A/B listening.
- Browser-local project metadata, tags, favorites, safe import/export and
  cross-tab stale-save detection; **no permanent audio persistence claim**.
- Dataset scan/load/save, indexed updates, auto-label, tensor preprocessing;
  LoRA/LoKr validated starting, status/loss/log and graceful stop.
- Additive authenticated **non-overwriting** adapter export route; Studio
  never calls the legacy directory-deleting export endpoint.
- Dark/light semantic design tokens, keyboard help and Alt+1–6 shortcuts,
  labels, responsive layout, reduced-motion treatment.
- Pure Vitest/Python unittest and Playwright mock scenarios authored;
  structural import/template checks performed on 62 TS modules.

## Priorities for subsequent independent source passes

1. Complete audited optional audio-code and analysis-only generation
   workflows with accurate output presentation, avoiding unsupported claims.
2. Extend batch explorer, grouping and explicit repeat with source reattachment.
3. Improve local project backup/corrupt-catalog recovery and work through the
   browser localStorage non-atomic concurrency limitation.
4. Expand mode-specific model capability detection, errors, request retries,
   safe timeout policy and precise diagnostics without inventing progress.
5. Extend training/dataset recovery, active task observation, scheduling
   controls and server-global-state collision messaging.
6. Complete localization (especially French), keyboard focus accessibility,
   responsive/mobile zoom and differentiated light-theme visual QA.
7. Expand API auth/409 scenarios, malformed result input, exact form requests,
   Tauri permissions, packaged WebView CORS and genuine GPU acceptance plans.
8. Perform independent architecture/security and UX reviews after each
   meaningful integration milestone and apply corrections.
9. Build with lockfile/dependencies when a real local toolchain becomes
   available. Run `npm run build/lint/test/e2e:mock/desktop:build`, Python
   unittest and real hardware tests; record evidence and fix defects.
10. Update this file and PR status after every pass. Declare 100% only
    when source is actually complete, not because local compilation is absent.

## Never claim verified without executed evidence

This pass used GitHub connector tree/file comparisons and writes. The 62
TypeScript application files had **no unresolved relative imports, missing
templateUrl targets or >200-line modules** at the static checkpoint.
This is *not* proof that Angular templates compile or that browser/GPU/Tauri
workflows run. The installed toolchain cannot access the repository and npm
dependencies for meaningful runtime execution in this environment.

If a user says "continue", implement the next source tranche immediately.
Do not return only environmental blockers or ask previously answered questions.

