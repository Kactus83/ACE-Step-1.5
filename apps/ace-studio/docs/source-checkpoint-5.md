# ACE Studio — Source checkpoint #5 (15 November 2026)

## GitHub state

Repository: `Kactus83/ACE-Step-1.5`
Branch: `feature/ace-studio-angular-tauri`
PR: https://github.com/Kactus83/ACE-Step-1.5/pull/2 (draft)
Current work tracked beyond checkpoint #4 `e7cbf231`.

## Source increment

1. Replaced the unsafe training export call with a new, additive,
   authenticated server route `/v1/studio/training/export`.
   It refuses target overlap, existing output directories, empty sources and
   source symlinks. The legacy `/v1/training/export` is **untouched**.
   New stdlib Python tests assert non-destructive semantics.
2. Added a catalog persistence adapter with cross-tab change detection,
   stale-write rejection, corrupt-storage handling and a browser multi-tab E2E.
   localStorage is not a transactional database.
3. Audited actual Python release_task model/builder and added typed
   Cover/Repaint source-preservation controls, latent and waveform
   crossfades, full Lego caption and tiled decode.
4. Added explicit DiT and 5Hz LM initialization from server-advertised model
   inventory with resource warnings and double confirmations; /v1/init always
   reinitializes DiT when LM initialization is requested.
5. Validated model inventories, stats counters and task ID results before
   updating Angular state, with new pure-unit tests.
6. Added real `sample_mode/sample_query` path: LM generates song description
   and lyrics from an idea. Explicit confirmation when LM is not loaded;
   no auto-run on settings restoration.
7. Added scoped Alt+1..6 navigation, help panel and keyboard tests.
8. Audited 62 application TypeScript modules against connected GitHub tree;
   no missing relative imports, missing referenced templates or >200 LOC
   modules identified.

## Verification boundaries

Commits/pushes and branch state were verified through the connected GitHub
tooling. **No Angular TypeScript compilation, Rust/Tauri bundling, package
installation, Python unit test, Vitest, Playwright browser flow, accessibility
runtime check or real GPU inference was executed.** Code source presence and
structural consistency are not an executed acceptance test.

The new Studio export route must be deployed with the frontend; on servers
where it is absent, the frontend fails rather than invoking the old export.
The optional backend HTTP changes require Python regression and security
review by the local team.

## Remaining

See `docs/continuation.md` for advanced audio-code/analysis workflows,
local data recovery, localization, robust failures and packaging/CI/GPU gates.
Do not declare 100% or merge PR #2 while these source items remain open.

