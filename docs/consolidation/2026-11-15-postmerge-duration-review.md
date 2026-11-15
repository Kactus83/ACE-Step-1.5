# ACE-Step 1.5 — Post-merge Simple UI duration contract audit (2026-11-15)

## Repository status at inspection

- The consolidated upstream adaptation PR [#1](https://github.com/Kactus83/ACE-Step-1.5/pull/1) was merged into the **fork** `main` at commit `d207bdd283dc726a0d9c711ca518dcf3accd1381`.
- The previous branch `integration/ace-ui-foundation` is already integrated and **must not be reused** for new changes.
- The [local acceptance report](2026-11-15-local-acceptance-report.md) records Python 3.12/Gradio 6.2.0, 1,284 main unittests with 8 skips, real 30-second CUDA generation, audio downloads, API generation and service-mode checks. Those results are historical *reported evidence*, not a new run by this audit.
- New branch: `integration/ace-simple-duration-postmerge`. No direct `main` updates are made by this follow-up.

## Negative-path defect (identified after merge)

The optional five-stage Simple interface has an explicit default 30-second duration for text generation: `SIMPLE_DEFAULT_DURATION_SECONDS = 30.0`. The accepted validation demonstrated this case **without optional LM drafting**.

When lyrics are empty and an initialized LM is present, `_simple_generate_wrapper` calls `create_sample`. The merged code replaced the 30-second default with `result.duration`, clamped only against the GPU maximum. LM metadata may legitimately supply 120 seconds, 10 seconds, `None`, a non-positive value or a non-finite float.

Consequences:

1. The same user-facing UI silently switches the duration based on LM availability and generated metadata.
2. A missing/non-positive LM duration produced `-1`, allowing the backend to choose a longer default.
3. Long or non-finite values can increase computation, memory pressure, and UI/audio mismatch despite the accepted 30-second contract.

**Scope note:** Remix/cover intentionally uses `audio_duration=-1` because duration is derived from source audio; do not force Remix to 30 seconds.

## Implementation

- Keep `audio_duration_val = 30.0` for text generation even when LM drafts captions or lyrics. Never use the LM-proposed duration to override this UI-level invariant.
- Continue using the existing `generate_with_progress` path, which already clamps against GPU duration limits before calling inference.
- Keep `audio_duration=-1` for Remix.
- Remove the now-unused UI-level duration clamp import; do not modify global inference defaults, Advanced, or API.
- Add `simple_ui_duration_test.py` with mocked tests for LM duration `None`, negative, shorter, longer, NaN; LM draft failure; user-provided lyrics; and source-audio Remix.

## Local CI acceptance — mandatory before merge

On the new branch, with the project's pinned dependencies and local models:

```powershell
git fetch origin
git switch integration/ace-simple-duration-postmerge
uv sync
uv run python -m compileall -q acestep
uv run python -m unittest acestep.ui.gradio.events.wiring.simple_ui_duration_test
uv run python -m unittest acestep.ui.gradio.events.wiring.simple_ui_foundation_test acestep.ui.gradio.events.wiring.simple_ui_streaming_test acestep.ui.gradio.events.wiring.simple_ui_contracts_test
uv run python -m unittest discover -s . -p "*_test.py" -q
git diff --check origin/main...HEAD
```

Run the optional UI with the flag on and an LM actually initialized. Generate a text song with no manually supplied lyrics and verify the exported audio, generation metadata and visible result report a 30-second target or a documented **shorter** hardware cap. Run one Remix with source audio to ensure source-based duration remains unchanged. Do not download heavy models or repeatedly consume GPU time if existing checkpoints suffice.

Record command exits, environment versions and real audio evidence. Retain the PR as draft until the independent team runs the tests; this audit **has not run Python compilation, the test suites, Gradio or CUDA**.

## Independent post-merge review findings

- Main and the historical consolidation are already merged: do not claim PR #1 is still draft.
- The original Simple text duration test covers **only** `llm_initialized=False`; the optional LM success path had no targeted duration assertion.
- The fix is isolated to Simple UI generation and its mock tests, leaving Advanced, API, seeds, metadata and model loading unchanged by design.
- Remaining uncertainty: real LM metadata extraction, low-memory behavior and Gradio display require local execution.

**Verdict: Narrow post-merge fix committed to a separate branch; validation pending; do not merge automatically.**
