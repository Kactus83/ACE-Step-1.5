# Local acceptance handoff — Codex / Claude Code (2026-11-15)

> Acceptance update: local Windows/CUDA validation passed on code commit `b8234f9`.
> The execution user explicitly authorized merge into the fork and local cutover once
> green. See [the acceptance report](2026-11-15-local-acceptance-report.md).

Consolidation branch: `Kactus83/ACE-Step-1.5:integration/ace-ui-foundation`; base is own fork `main` at `ca1e85fe9430179831e6bc6be790c332190a3866`.

## 1. Acquire candidate and examine provenance

```bash
git clone https://github.com/Kactus83/ACE-Step-1.5.git
cd ACE-Step-1.5
git remote add upstream https://github.com/ace-step/ACE-Step-1.5.git
git fetch origin upstream
git switch --track origin/integration/ace-ui-foundation
git status --short
git rev-parse HEAD
git rev-parse upstream/main
git diff --check upstream/main...HEAD
git diff --stat upstream/main...HEAD
```

If the local checkout already exists, fetch and switch carefully; do not reset uncommitted work. **Never** force-push, and do not merge into main during acceptance. Check the two main branches still share the expected base, or reassess if upstream advanced.

## 2. Install only required dependencies; no model downloads

ACE-Step targets Python 3.11–3.12 and pins Gradio 6.2.0 in `pyproject.toml`.

```bash
uv sync
uv run python --version
uv run python -m compileall -q acestep
uv run python -m unittest discover -s acestep/ui/gradio/events/wiring -p "simple_ui_contracts_test.py"
```

On Windows PowerShell, use equivalent shell commands. Do not install checkpoints or fetch large GPU weights solely to make tests green; use models already available locally.

## 3. Focused regression and global discovery

```bash
uv run python -m unittest \
  acestep.inference_seed_metadata_test \
  acestep.inference_seed_fallback_test \
  acestep.inference_export_degraded_test \
  acestep.audio_utils_test \
  acestep.core.generation.handler.io_audio_seed_test \
  acestep.core.generation.handler.generate_music_request_test \
  acestep.core.generation.handler.service_generate_flow_edit_test \
  acestep.api.http.release_task_request_builder_test \
  acestep.api.http.release_task_request_parser_test \
  acestep.api.http.release_task_route_http_test \
  acestep.ui.gradio.events.wiring.simple_ui_foundation_test \
  acestep.ui.gradio.events.wiring.simple_ui_contracts_test \
  acestep.ui.gradio.events.wiring.simple_ui_streaming_test

uv run python -m unittest discover -s . -p "*_test.py"
uv run python -m unittest discover -s . -p "test_*.py"
git diff --check upstream/main...HEAD
```

Use one line per command or PowerShell backticks on Windows. Classify each test as **passed / failed / skipped / blocked** and retain the exact command/log; never report unexecuted tests as passed. If failures stem from model/network prerequisites, record them separately from code regressions.

## 4. Run baseline UI first (flag off)

```bash
uv run acestep --port 7860 --language en
```

Open http://127.0.0.1:7860. Verify original Settings, Generation, eight audio outputs, Training/Dataset Builder/LoRA/LoKr, source modes, batch navigation, metadata download/load, help, preferences after refresh, and advanced controls. No Simple UI menu should appear.

Stop the server cleanly before switching launch modes.

## 5. Run opt-in UI without implicit initialization

Windows PowerShell:

```powershell
$env:ACESTEP_ENABLE_SIMPLE_UI = "1"
uv run acestep --port 7860 --language en
```

Linux/macOS shell:

```bash
ACESTEP_ENABLE_SIMPLE_UI=1 uv run acestep --port 7860 --language en
```

Initially no DiT loaded: verify Create remains disabled and communicates the need for Advanced model setup. Switch to Advanced, load an **existing local** compatible checkpoint with current device/offload settings, return Simple; verify readiness updates and model identity stays unchanged. No model should load just by opening the page.

## 6. Execute end-user scenarios with expected outputs

| Steps | Expected |
|---|---|
| 1. Type a song description, click Continue, add lyrics, Continue, no source, Create | Progress through stages 1→2→3→4→5, generated audio playable, status success |
| 2. Enable Instrumental, provide contradictory lyrics, generate | Instrumental audio request sent with sentinel; manual lyrics ignored for that attempt |
| 3. Upload a short source audio, create Remix, then Create New Song and generate text-only | First request uses cover; second uses text2music, no stale source/strength leaks |
| 4. Generate 2 samples then create another song | Prior results preserved in independent Simple history; new song appends without overwriting; Advanced queue unchanged |
| 5. Enter blank prompt and no source, attempt generation | No backend generation; recoverable Done/error (button may remain enabled depending on loaded model) |
| 6. Unload DiT in Advanced and attempt Simple generation | No forced auto-load; recoverable failure, not stuck on Creating |
| 7. Force mock generator error after first audio | Status explains failure and already playable audio remains available |
| 8. Click built-in download for each result | Audio file downloads with correct extension and plays |
| 9. Set MP3 and simulate missing ffmpeg in targeted test | Preserved WAV path and truthful format in metadata; explicit degraded status |
| 10. Run fixed/random/partial seeds and batch clamp cases | Effective seeds and emitted count saved; JSON sidecar matches audio |
| 11. Switch modes during and after a queued generation | No unrequested generation/initialization, no advanced-state corruption |
| 12. Open viewport 375px, 768px, 1440px; keyboard Tab/Shift+Tab/Enter/Escape | No clipping or invisible controls; readable step labels, About dismissal, logical focus, contrast and readable errors |
| 13. Launch with `--language it` and flag | Italian legacy UI loads; new untranslated keys fall back to English |
| 14. Launch `--service_mode true` with flag set | Optional Simple UI absent; original service behavior and mounted API preserved |
| 15. Launch `uv run acestep-api`, exercise `/release_task` timesteps | API accepts supplied timesteps; absent/empty uses legacy defaults |

For slow GPU cases use a short audio duration, one batch first; avoid repeated expensive generations when mocked checks suffice. Observe device memory and logs without modifying model selection silently.

## 7. Contradictory reviews and controlled acceptance

Review A (code): inspect every changed file against `upstream/main`, validate AST/compile, signatures, imports, paths, permissions, no dead callbacks, no unintended hardware changes. Review B (user/security): independently rerun the step table above, especially failures, downloads, mode switches and no-LM/offloading.

Record each discrepancy; implement minimal fixes **on this branch**, commit/push after coherent groups, repeat affected tests, and append evidence to the two reviews. Do not silently remove features.

Only after all blocking checks pass may the user authorize the **separate** local team to merge the draft PR to **fork main**. Never automatically target upstream. Until then status must remain:

**Implémentation préparée — validation locale finale requise — merge non autorisé.**

## 8. Additional hardening checks (post review 3)

- Confirm Simple hamburger Help opens **the Simple-owned visible** help modal rather than the hidden Advanced help button.
- Confirm an empty generation, a synchronous dispatcher exception, and a failure after the first streamed audio produce a recoverable Done/error screen without erasing previously playable audio or its metadata.
- Confirm the About overlay is legible in light/dark themes, the close button has a readable label, and 375px layouts do not reduce step labels to unreadable dimensions.
- Confirm the Creating progress bar is indeterminate (no fabricated percentage); honor reduced-motion preferences.
- Run the additional `simple_ui_streaming_test.py` tests, plus existing contract/foundation tests; note the tests are **not yet executed** by the authoring environment.
- Use the companion [CI execution prompt](2026-11-15-ci-team-prompt.md) and record real command results in the acceptance report.
