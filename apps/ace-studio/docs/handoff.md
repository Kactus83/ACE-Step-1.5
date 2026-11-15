# ACE Studio — handoff for local Codex / Claude Code / CI team

**Fork:** `Kactus83/ACE-Step-1.5`

**Branch:** `feature/ace-studio-angular-tauri`

**Draft PR:** https://github.com/Kactus83/ACE-Step-1.5/pull/2

**Latest synchronized fork main:** `d207bdd283dc726a0d9c711ca518dcf3accd1381`
(integrated into feature branch with two-parent merge `73b32efc`).

**Starting base:** `ca1e85fe9430179831e6bc6be790c332190a3866`
(fork main = official main when branch was cut).

## Read before applying changes

1. `AGENTS.md` at repository root.
2. `apps/ace-studio/docs/architecture.md`.
3. `apps/ace-studio/docs/contracts.md`.
4. `apps/ace-studio/docs/functional-coverage.md`.
5. Two contradictory reviews under `apps/ace-studio/docs/`.
6. Consolidation PR #1 **was merged into main by another team**. The Studio branch now includes that main as a merge parent; do not replay or cherry-pick its changes.

## Agent operational constraints

- Do not check out or commit to `main`, force-push, auto-merge or alter PR #1.
- Rebase/sync only after assessing drift and concurrent edits.
- Preserve all non-target Python, Gradio, GPU, CLI and training functionality.
- Only announce green tests with actual executed commands and logs.
- If a test fails, fix source in the ACE Studio branch; update the draft PR.
- Do not launch/reload backend, install heavyweight models or reset user
  conversations without explicit approval if doing so would consume resources.

## Build and test

From `apps/ace-studio`, after npm dependency availability:
```bash
npm install
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run e2e:mock
npm run desktop:build
```

From root in the existing Python environment:
```bash
uv run python -m unittest acestep.api.http.studio_cors_test
uv run python -m unittest discover -s . -p "*_test.py"
```

Also run `git diff --check main...feature/ace-studio-angular-tauri` and
inspect all file changes in the PR. Check the package lockfile produced by the
install and commit it only after dependency resolution and security review.

## Real API / native acceptance

- Use a running standalone ACE-Step API on loopback port 8001, or a securely
  configured HTTPS instance. Avoid starting a second model process.
- In packaged desktop mode, launch Python API with
  `ACESTEP_ENABLE_STUDIO_DESKTOP_CORS=1`, testing all actual origins.
- Perform basic generation, lyrics, instrumental, seed/batches, reference audio,\n  Cover, Repaint timeline, Extract/Lego/Complete on supporting base models,\n  server fail/recovery, authorization, audio preview/download.
- Inspect Windows WebView2, Linux GTK and macOS webviews independently.
- Assess dataset scan/load/save, sample indexing, async labeling and preprocessing,\n  LoRA/LoKr start/stop, and server-global dataset race behavior.\n- Assess GPU memory, queue saturation, long-running jobs and file cleanup.
- Record exact platform, Node/npm/Rust/Python versions and command exits.
- Restore any source regressions before considering merge eligibility.

## Exit criteria

The draft PR can be promoted only after functional scope completion,
independent contradictions resolved, unit and integration build/test evidence,
native packaging checks and explicit user authorization. Do not treat the code
written so far as a substitute for that evidence.


