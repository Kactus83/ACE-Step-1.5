# CI / local validation mission — ACE-Step 1.5 (2026-11-15)

## Mission and authority

You are the independent local CI/integration team for `Kactus83/ACE-Step-1.5` PR `#1` (head: `integration/ace-ui-foundation`; target: **the owner's fork `main`**). The source authoring team has integrated/adapted #1270 (five-stage opt-in Gradio interface), #1357 (effective seed metadata), #1313 (WAV fallback), safe #1283 reference-crop determinism, #1309 (Flow Edit offload), #1365 (Italian locale), and #1383 (custom API timesteps). The entire branch was statically reviewed several times, but Python tests, UI and GPU have **not** run. Your job is to **compile, execute, find defects, fix them, retest, and supply verifiable acceptance evidence**.

Never merge/auto-merge PR #1, promote to `main`, force-push, rewrite upstream contributors' branches or modify upstream PRs. Work only on `integration/ace-ui-foundation` in our fork. Commit and push coherent verified fixes; before each push fetch and ensure another team's work is not lost. Do not claim 100% or “CI green” for a skipped/unexecuted/blocked check. Never download large checkpoints or run repeated expensive generations without checking locally available weights and obtaining approval for material cost.

The non-integrated persistent library (#1199), global LM RNG changes (#1283), and hardware-specific PRs (#1269/#1377/#1368/#1369/#1359) are **explicitly deferred**. Do not merge them as part of this acceptance job. Report separate follow-up proposals if needed.

## Mandatory preparation

Read the PR body and all linked documentation in `docs/consolidation`, especially the upstream matrix, technical report, four contradictory reviews, UI support coverage, and local handoff. Verify `git status` is clean or preserve uncommitted local changes without resetting them. Inspect current `origin/main`, `upstream/main` and the PR branch; do not assume the historical base SHA is still current. If upstream has advanced, analyze divergences before rebasing or cherry-picking. Do not overwrite concurrent contributions.

PowerShell-friendly initial commands (adapt only if a repo is already checked out):

```powershell
git clone https://github.com/Kactus83/ACE-Step-1.5.git
cd ACE-Step-1.5
git remote add upstream https://github.com/ace-step/ACE-Step-1.5.git
git fetch origin
git fetch upstream
git switch --track origin/integration/ace-ui-foundation
git status --short
git rev-parse HEAD
git rev-parse origin/main
git rev-parse upstream/main
git diff --check origin/main...HEAD
git diff --stat origin/main...HEAD
```

If `upstream` remote or local checkout exists, detect this instead of executing duplicate setup. Use PowerShell single-line test commands; do not paste Bash multiline backslashes into PowerShell.

## Quality gate A — compile and test contracts

Confirm supported Python (`>=3.11,<3.13`) and locked Gradio `6.2.0` from `pyproject.toml`. Use `uv sync` after assessing local environment/lockfile. Run, capture stdout/stderr and exit status:

```powershell
uv sync
uv run python --version
uv run python -m compileall -q acestep
uv run python -m unittest acestep.ui.gradio.events.wiring.simple_ui_contracts_test
uv run python -m unittest acestep.ui.gradio.events.wiring.simple_ui_foundation_test
uv run python -m unittest acestep.ui.gradio.events.wiring.simple_ui_streaming_test
uv run python -m unittest acestep.inference_seed_metadata_test acestep.inference_seed_fallback_test acestep.inference_export_degraded_test acestep.audio_utils_test
uv run python -m unittest acestep.core.generation.handler.io_audio_seed_test acestep.core.generation.handler.generate_music_request_test acestep.core.generation.handler.service_generate_flow_edit_test
uv run python -m unittest acestep.api.http.release_task_request_builder_test acestep.api.http.release_task_request_parser_test acestep.api.http.release_task_route_http_test
uv run python -m unittest discover -s . -p "*_test.py"
uv run python -m unittest discover -s . -p "test_*.py"
git diff --check origin/main...HEAD
```

If the project has additional officially documented test/lint/typecheck commands, run them; do not invent tooling or assume a failed external prerequisite is a code regression. For each check report PASS/FAIL/SKIP/BLOCKED and evidence. Never silently lower a test threshold or delete failing tests.

## Quality gate B — independent source / contract review

Review every changed Python file. Validate imports, AST, actual Gradio signatures, generator output tuple lengths (Simple=14, Advanced remains original), exact `generate_with_progress` positional argument mapping, `_build_saved_params` mapping, I18n keys/fallback, service guard, no implicit model initialization, separate Simple/Advanced batch states, safe source-audio usage, file metadata/format/path, and seed replay. Search for dead callbacks, unintended breaking API changes, unsafe paths, hidden state races and concurrency. **Independently contradict** the prior reviews rather than trusting their verdicts.

## Quality gate C — UI / local manual scenarios

With `ACESTEP_ENABLE_SIMPLE_UI` unset, run `uv run acestep --port 7860 --language en` and confirm the legacy Advanced experience: settings/init, Generation tab **eight** results, generation mode controls, Training, Dataset Builder, LoRA/LoKr, existing batch navigation, metadata restore, Help and source conditioning. No Simple flow should appear.

In a separate clean launch with PowerShell `$env:ACESTEP_ENABLE_SIMPLE_UI = "1"`, run the same command and verify **every** scenario:

1. Five-step flow Describe → Lyrics → Remix → Creating → Done with meaningful progress and playable audio.
2. Button initially disabled without a DiT; switching to Advanced allows explicit setup; returning to Simple updates readiness **without auto-load or model replacement**.
3. Hamburger **Help** opens the visible Simple-owned modal, not a hidden Advanced modal; About/Close work and are readable in both light and dark themes.
4. Random prompt, manual lyrics, instrumental mode (manual lyrics ignored), no-LM fallback and optional LM draft failure.
5. Source remix followed by New Song text-only: no stale source audio, cover strength or task type leakage.
6. One or two real output files depending on VRAM clamp; both native download buttons produce playable files with correct extension.
7. Zero-description/no-source attempt: no model generation, recoverable explicit error.
8. Empty backend result, adapter exception before yielding, and exception **after first audio**: Done/error screen, no dead Creating state; previous playable files/format metadata remain available.
9. Fixed/random/partial seeds: generated per-file JSON shows **effective** seeds and actual emitted count after VRAM clamp.
10. MP3 failure (missing/failed ffmpeg) returns usable WAV and reports actual WAV in metadata and visible status.
11. Consecutive Simple generations preserve separate session queue; Advanced eight-slot queue is unchanged.
12. UI switching while generation is active must not start another generation, mutate model selection, or corrupt sessions.
13. Small 375px / 768px / 1440px widths: no clipped controls; step labels remain legible; progress is indeterminate, motion preference respected; keyboard navigation, visible focus, modal close behavior, basic contrast.
14. Italian `--language it` launches with English fallback for missing Simple keys.
15. Service mode with flag set (check `uv run acestep --help` for exact Boolean syntax): Simple remains absent and existing API/service behavior intact.
16. Standalone `uv run acestep-api`: `/release_task` honors provided custom timesteps, preserves defaults if absent; exercise existing request forms.
17. CLI generation and metadata reload path remain compatible; run only where suitable local model is available.

Use short generations and existing models; prefer deterministic mocks for failure injection, and do not incur unnecessary GPU cost. Save screenshots/logs showing actual results when possible; do not fabricate evidence.

## Quality gate D — final contradictory re-review and exit decision

After fixing any source/runtime issues, rerun every impacted test, `compileall`, full relevant discovery, `git diff --check` and the affected manual cases. Update `docs/consolidation` with the exact evidence, remaining blockers and any deviations. Commit/push fixes in small groups only to the consolidation branch. Confirm PR is still draft, base is own fork main, no other branch modified and no merge occurred.

Produce one final table per gate: requirement, check command/steps, PASS/FAIL/SKIP/BLOCKED, evidence/log or screenshot path, commit SHA, severity/owner for open findings. Include Python/uv/Gradio versions, OS, GPU model/VRAM, optional ffmpeg availability and actual model used. Provide two independent concluding reviews: (1) code/integrity/security, (2) real UX/reliability/hardware.

**Definition of Done for requesting human merge approval:** zero unresolved blocking regressions in integrated scope, imports/compile and required suites green, at least one real UI creation/download on available hardware, core Advanced/API/CLI smoke, feature flag/service guard, negative-path scenarios, coherent docs and evidence. If any mandatory test is impossible, mark **BLOCKED**, keep PR draft and tell the user exactly what is missing. The team may recommend merge only after presenting evidence; it may not actually merge without explicit user authorization.

Until approved, report: **« Implémentation préparée — validation locale finale requise — merge non autorisé ».**
