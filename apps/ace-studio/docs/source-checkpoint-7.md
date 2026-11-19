# ACE Studio — Source checkpoint #7 — 16 November 2026

## Collaboration and branch

Repository `Kactus83/ACE-Step-1.5`, branch
`feature/ace-studio-angular-tauri`,
draft PR https://github.com/Kactus83/ACE-Step-1.5/pull/2.
This tranche started at `111bd004caadb43c48e451396e7083b22e791c31`.
The remote HEAD was checked before each change, and each new commit used
`expected_sha` with `force=false`. Other teams' Windows fixes were
preserved; no merges or branch resets were performed.

## Source delivered

1. Typed EN/FR dictionaries for Queue, Batch navigator, A/B monitor and
   full project-library UI including critical recovery and local-data warnings.
   Extracted independent `locale.results.ts` / `locale.library.ts` to keep
   each source module readable and isolated. Existing English labels remain
   stable for older tests.
2. Localized client-created timestamps and queue lifecycle statuses; raw
   Python progress text, user prompts and model/audio metadata are not translated.
3. Reactively accurate authorization-blocked warning in Queue.
4. A/B players now require the loaded audio to match the current connection
   revision and exact pair of selected files before playback.
5. Prevented "Check jobs now" from bypassing a prior 401/403 block; only a
   successful explicit Connection workflow clears the block.
6. New pure Vitest and Playwright mock scenarios cover localized workspaces,
   durable metadata after language switching, date formatting, A/B invalidation
   and blocked authorization retry.
7. Fixed a missing comma in the split localization catalog during source
   inspection; this is **not** a claim that the Angular compiler ran.

## Verification boundary

Prior independently executed Windows baseline: see `docs/verification.md`.
**No build, lint, Vitest, Playwright, Rust, Python or GPU execution was
performed for these new commits** in the web authoring environment. The local
CI team should now validate the current PR HEAD, not reuse the earlier green
baseline. Long French strings and accessible controls need real visual QA.

## Remaining source

Complete the remaining basic/advanced Create, Dataset, Training and Connection
localization; audit exact model permissions and server-global data contention;
advance sorted/model-grouped batch browsing, native media-save UX, error
recovery and packaging acceptance. No remote media persistence or generic
filesystem/shell Tauri permissions are implied.

**PR stays draft.** Neither source completion nor CI acceptance is 100%.

