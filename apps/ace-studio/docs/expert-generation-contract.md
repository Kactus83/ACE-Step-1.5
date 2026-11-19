# Expert generation — verified standalone API contract

Checkpoint: 15 November 2026, ACE Studio draft PR #2, after consolidation PR
#1 was integrated into the fork's main branch. This document covers only the
standalone FastAPI /release_task profile, **not** the Gradio-mounted API.

## Source of truth

The contracts were checked against these Python files on current fork main:
- acestep/api/http/release_task_models.py (GenerateMusicRequest)
- acestep/api/http/release_task_request_builder.py (explicit field mapping)
- acestep/api/http/release_task_param_parser.py (canonical aliases and types)
- acestep/api/job_generation_setup.py (GenerationParams/Config forwarding)
- acestep/api/llm_generation_inputs.py (CoT and LM initialization behavior)

A field existing in Pydantic alone does **not** establish that the HTTP builder
forwards it. This pass corrected a previously missing DCW forwarding path:
DCW is now explicitly forwarded with the critical **three-state** behavior,
so a missing value remains None for the backend model's own default policy.

## Exposed controls and semantics

| API fields | Studio behavior | Caveat |
| --- | --- | --- |
| infer_method | ODE or SDE | Model performance varies |
| shift | finite 1.0–5.0 | Only effective for base models |
| timesteps | Optional 2–128 descending normalized values in [0,1] | Overrides inference_steps and shift; not every schedule is appropriate |
| use_adg | Explicit opt-in | No promise of quality improvement |
| cfg_interval_start, cfg_interval_end | Bounds in [0,1] with start before end | Backend controls exact scheduling |
| dcw_enabled | Auto omitted; Off false; On true | **Do not guess from model name** |
| dcw_mode, dcw_scaler, dcw_high_scaler, dcw_wavelet | Sent only with forced-on mode | Forcing DCW on non-turbo can distort audio |
| use_cot_caption, use_cot_language | Explicit toggles, default false in Studio | Backend may lazily initialize LM when enabled |
| lm_temperature, lm_cfg_scale | Numeric bounded inputs | Only relevant where LM runs |
| lm_top_k | 0 omitted, otherwise positive integer | Backend substitutes its own default |
| lm_top_p | Numeric [0.01,0.99] | Backend normalizes values >=1 to fallback; UI disallows |

No new model process is launched by the Studio. The backend remains responsible
for lazy LM init and all GPU scheduling. The Studio defaults CoT toggles to
false to avoid unexpected LM initialization from this frontend, whereas the
Python request model defaults them to true when omitted. The UI **always sends**
explicit CoT boolean values, so this is an intentional opt-in difference.

## Forced-DCW safety

Selecting "Backend model default" sends no dcw_enabled field. The Python
request builder preserves None (not False) and the core resolves the loaded
model's own policy (turbo vs non-turbo). Explicit On/Off transmit true/false
respectively. Selecting forced On displays a clear warning and requires two
matching submission actions. That confirmation is bound to the form snapshot
and current connection revision, so edits and server changes require new
confirmation.

## Tests authored — NOT executed in the connector environment

- Python: release_task_request_builder_test.py tests absent / explicit
  False / explicit True DCW with scalers and wavelet.
- Vitest: expert-request.test.ts validates tri-state, schedules, CFG, LM
  sampling, CoT opt-ins and unsupported values.
- Vitest: create-request.test.ts includes all new typed controls.
- Playwright mock: expert-creation.spec.ts checks JSON fields at the
  HTTP boundary, confirmation before forced DCW, and rejected schedules.
- Regression: source-audio.ts filename extension parsing was corrected
  against its existing unit test.

## Intentionally not yet implemented

- Full 5Hz model selection, backend switch and LM lifecycle UI.
- Code-control audio_code_string, sample-mode semantic generation, LM-negative
  prompt and specialized formatting flags.
- Waveform codec parity, E2E with real backend and GPU validation across turbo,
  base, SFT, MLX and hardware-supported configurations.
- Real Angular/Rust build, dependency audit, browser accessibility and
  complete desktop packaging.

## Handoff gate

Before declaring source complete, finish the remaining documented functionality.
Before declaring production-ready or merging, run actual Python, Angular,
Vitest, Playwright, Rust/Tauri and real GPU tests with recorded evidence.

