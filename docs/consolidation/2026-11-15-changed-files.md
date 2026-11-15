# Exact changed-file inventory — consolidation PR #1

Comparison: fork main `ca1e85fe9430179831e6bc6be790c332190a3866` to code commit `9de07522917e7d306520e001f8533f9461c5b71f`.

At inspection: 24 fast-forward commits ahead, 0 behind and 45 changed files. This snapshot does not include the following documentation correction commit; use `git diff --name-status main...HEAD` for the exact final list.

| Path | Git status | Added | Removed |
|---|---:|---:|---:|
| `acestep/api/http/release_task_request_builder.py` | modified | 1 | 0 |
| `acestep/api/http/release_task_request_builder_test.py` | modified | 21 | 2 |
| `acestep/api/http/release_task_request_parser_test.py` | modified | 2 | 2 |
| `acestep/api/http/release_task_route_http_test.py` | modified | 2 | 2 |
| `acestep/audio_utils.py` | modified | 51 | 10 |
| `acestep/audio_utils_test.py` | modified | 101 | 1 |
| `acestep/core/generation/handler/generate_music.py` | modified | 1 | 0 |
| `acestep/core/generation/handler/generate_music_request.py` | modified | 7 | 2 |
| `acestep/core/generation/handler/generate_music_request_test.py` | modified | 18 | 2 |
| `acestep/core/generation/handler/io_audio.py` | modified | 7 | 4 |
| `acestep/core/generation/handler/io_audio_seed_test.py` | added | 51 | 0 |
| `acestep/core/generation/handler/service_generate_flow_edit.py` | modified | 21 | 16 |
| `acestep/core/generation/handler/service_generate_flow_edit_test.py` | modified | 61 | 11 |
| `acestep/inference.py` | modified | 11 | 4 |
| `acestep/inference_export_degraded_test.py` | added | 118 | 0 |
| `acestep/inference_seed_fallback_test.py` | modified | 8 | 15 |
| `acestep/inference_seed_metadata_test.py` | added | 112 | 0 |
| `acestep/ui/gradio/events/results/generation_progress.py` | modified | 28 | 8 |
| `acestep/ui/gradio/events/wiring/simple_ui_contracts.py` | added | 11 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_contracts_test.py` | added | 167 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_foundation_test.py` | added | 151 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_generation.py` | added | 187 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_generation_dispatch.py` | added | 54 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_generation_results.py` | added | 149 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_generation_wiring.py` | added | 121 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_helpers.py` | added | 153 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_model_readiness.py` | added | 24 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_navigation.py` | added | 121 | 0 |
| `acestep/ui/gradio/events/wiring/simple_ui_wiring.py` | added | 38 | 0 |
| `acestep/ui/gradio/i18n/en.json` | modified | 44 | 0 |
| `acestep/ui/gradio/i18n/it.json` | added | 533 | 0 |
| `acestep/ui/gradio/interfaces/__init__.py` | modified | 101 | 48 |
| `acestep/ui/gradio/interfaces/simple_ui.py` | added | 93 | 0 |
| `acestep/ui/gradio/interfaces/simple_ui_markup.py` | added | 103 | 0 |
| `acestep/ui/gradio/interfaces/simple_ui_results.py` | added | 94 | 0 |
| `acestep/ui/gradio/interfaces/simple_ui_steps.py` | added | 144 | 0 |
| `acestep/ui/gradio/interfaces/simple_ui_styles.py` | added | 105 | 0 |
| `docs/consolidation/2026-11-15-changed-files.md` | added | 53 | 0 |
| `docs/consolidation/2026-11-15-local-handoff.md` | added | 116 | 0 |
| `docs/consolidation/2026-11-15-review-code-integration.md` | added | 42 | 0 |
| `docs/consolidation/2026-11-15-review-contracts-final.md` | added | 36 | 0 |
| `docs/consolidation/2026-11-15-review-user-reliability.md` | added | 47 | 0 |
| `docs/consolidation/2026-11-15-technical-report.md` | added | 58 | 0 |
| `docs/consolidation/2026-11-15-ui-coverage.md` | added | 50 | 0 |
| `docs/consolidation/2026-11-15-upstream-matrix.md` | added | 38 | 0 |

No changes have been made to `main` or any third-party branches.
