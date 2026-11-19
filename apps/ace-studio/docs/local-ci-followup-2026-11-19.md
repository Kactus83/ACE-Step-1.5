# LOCAL TEAM — checkpoint 12 requalification and native keyboard check

**Created 19 November 2026.** Use the latest **remote** HEAD of
`Kactus83/ACE-Step-1.5`, branch
`feature/ace-studio-angular-tauri`, PR #2 draft. The previous
qualified SHA is `8ceb2ec`, not the current implementation.

Read `AGENTS.md`, `apps/ace-studio/AGENTS.md`,
`docs/source-checkpoint-12.md`, `docs/verification.md` and
`docs/local-qualification-2026-11-18.md` first. Preserve concurrent
changes; no force-push, destructive reset or merge to main.

**Mandate:** Rerun every frontend and focused Python contract at the
actual SHA, especially `query_result_audio_projection_test`,
`query_result_route_test`,
`task-variant-provenance.test.ts`,
`api-decoder.test.ts`, `restore-request.test.ts` and
`legacy-cache-provenance.spec.ts`. Then run full
`npm run typecheck`, `npm run lint`, `npm run test`,
`npm run build`, `npm run e2e:mock`, relevant Python HTTP
discovery, `cargo check --locked`, `cargo test --locked` and
Windows Tauri package only when feasible without interrupting
another opened application. Record PASS/FAIL/SKIP, logs, counts,
SHA, and evidence in a **new** qualification section/document.

Before attributing native keyboard failures to source, launch the
actual released Tauri WebView with a focused application window.
Test `Alt+2` on a noneditable element (expect Queue), `Alt+3`
(expect Library) and `Alt+2` with focus in the Music description
textarea (expect no navigation). Check OS keyboard layout,
injection tooling, focus and whether `KeyboardEvent.code` reaches
the webview. Contrast with the Playwright cases. Fix only when
the real cause is verified. Never install a global shortcut hook
or broaden Tauri permissions as an unreviewed workaround.

Remain strictly **read-only** on the existing ACE-Step server.
Do not automatically initialize/download DiT/LM models,
submit GPU jobs, run training, export real artifacts, mutate
datasets or install/replace unsigned packages. Request user
approval before any such material step. Real GPU batch seed
verification is a separate opt-in acceptance test.

Work autonomously through detected source/test failures,
committing and pushing focused fixes after coherent blocks.
Keep the PR draft and report the last qualified SHA rather than
calling unscheduled GitHub Actions "green".
