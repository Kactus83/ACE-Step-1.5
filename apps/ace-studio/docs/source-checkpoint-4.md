# ACE Studio — Source checkpoint #4 (15 November 2026)

## Delivery

- Fork: `Kactus83/ACE-Step-1.5`
- Branch: `feature/ace-studio-angular-tauri`
- PR: https://github.com/Kactus83/ACE-Step-1.5/pull/2 (**open draft**)
- Base: consolidated fork `main` at `d207bdd283dc726a0d9c711ca518dcf3accd1381`.
- Previous expert checkpoint: `a10bcd52b36ba6c63b8f1dec0639099337d4948b`.

## Source authored in this pass

1. Versioned browser-local projects with explicit save from generated jobs,
   server-scoped references, editing, tags, notes, favorites, search and bounded
   user-triggered JSON export/import. Audio bytes and API keys never persisted.
2. Near-synchronous A/B audition of finished session or local-bookmarked
   tracks on the same backend. HTML audio is **not** sample-accurate.
3. Restore submitted generation parameters and the backend-reported valid seed,
   explicitly requiring reattachment of source/reference audio if needed.
4. Real Python `/v1/training/export` mapping with typed OVERWRITE, double
   confirmation, path overlap checks; upstream destination deletion remains
   a serious risk. Latest training loss, measured speed and bounded log.
5. `PUT` preflight fix in FastAPI CORS for browser-side dataset sample edit.
6. Search and phase filters for queue, expanded generation metadata.
7. Dark/light theme using semantic CSS tokens and a persistent user preference.
8. Keyboard-accessible skip link, native-label/source E2E and new pure tests.

## Contradictory source checks

- Python model/route source audited for export semantics, dataset states
  (`running/completed/failed`) and training loss shape `{step,loss}`.
- Browser CORS mismatch discovered (real PUT route excluded by middleware);
  corrected source + new Python test.
- 53 Angular application TS modules were inspected through the GitHub
  connector in four batches: no relative imports or templateUrl targets
  missing, no module exceeded 200 source lines at that checkpoint.
  This is **textual structural inspection only**, not a TypeScript compile.
- Source-only PR, **no npm install/build, Rust compilation, Vitest, Python
  unittest, Playwright, GPU, native packaging or visual QA was executed**.

## Product/security limitations

Local project JSON is metadata plus backend-specific temporary audio URLs,
not persistent audio media or cross-device syncing. It may contain lyrics and
prompts, is not encrypted, and is capped for browser storage. The Python
dataset is server-global, with no optimistic concurrency revision.

The export route deletes an existing destination folder. The client cannot
establish remote filesystem existence or symlink relationships; human
confirmation and server-side permission policy remain essential.

## Next handoff

Continue coding the still-open source scope in `docs/continuation.md`.
Maintain PR #2 in draft. After full source authoring, use `docs/handoff.md`
for independent local CI/GPU/native acceptance before any merge decision.

