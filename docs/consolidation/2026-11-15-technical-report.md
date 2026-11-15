# ACE-Step 1.5 — Consolidation technical report (2026-11-15)

## References, publication and change scope

- Fork: https://github.com/Kactus83/ACE-Step-1.5
- Upstream: https://github.com/ace-step/ACE-Step-1.5
- Base: \`ca1e85fe9430179831e6bc6be790c332190a3866\` (verified for both main branches).
- Working branch: \`integration/ace-ui-foundation\`, created from base without force-push; final SHA is the branch HEAD shown on GitHub once documentation is committed.
- Code head before documentation: \`d7f16928a85e57737b56fd6ff2ed818f50fcfcec\`.
- Merge: **not performed, not authorized**; target for any later PR is the fork's own \`main\`.
- Scope retained: PR #1270 refactoring with explicit opt-in, P0 #1357/#1313, safe #1283 reference-crop subset, #1309, #1365 and API fix #1383. #1199 remains an explicitly deferred separate product initiative.

## Changes made

- \`acestep/inference.py\`, \`acestep/audio_utils.py\`, related \`*_test.py\`: consistent seeds, effective batch metadata, WAV fallback and truthful \`audio_format\`.
- \`acestep/core/generation/handler/{generate_music,generate_music_request,io_audio,service_generate_flow_edit}.py\` and corresponding tests: seeded reference cropping and offload-aware Flow Edit.
- \`acestep/api/http/release_task_request_builder.py\` and three test modules: explicit API timesteps forwarding.
- \`acestep/ui/gradio/interfaces/simple_ui*.py\` and \`interfaces/__init__.py\`: modular, responsive, feature-flagged five-step interface with original advanced result placement retained.
- \`acestep/ui/gradio/events/wiring/simple_ui*.py\`: generation, status, results, navigation, independent session state, model readiness and regression tests.
- \`acestep/ui/gradio/events/results/generation_progress.py\`: instrumental sentinel and degraded-export status/path handling.
- \`acestep/ui/gradio/i18n/{en,it}.json\`: translated-key fallback for the new UI, Italian baseline.
- This \`docs/consolidation\` directory: contribution matrix, technical report, functional coverage, contradictory reviews and handoff.

## Resulting boundaries

\`create_gradio_interface\` builds the existing advanced interface and optionally mounts \`build_simple_ui\`. The advanced Generation tab still owns \`create_results_section\`. Simple callbacks call the existing \`generate_with_progress\` via \`simple_ui_generation_dispatch.py\`; the positional signature is centralized and protected by an offline AST contract test. Batch snapshots reuse the established helper while the simple queue remains independent.

No service model is loaded automatically by the new UI. A missing DiT model produces a recoverable result state directing users to Advanced settings. Optional LM draft failures fall back to the user's supplied caption. Download uses \`gr.Audio(buttons=["download"])\`; no custom file-fetch JavaScript is required.

## Results obtained, with evidence boundaries

**Actually performed through connected GitHub:** PR metadata/reviews/diffs inspection; verified main SHAs; branch creation; fast-forward commits via expected-SHA leases; per-file content examination; compare of branch to main; focused structural cross-checks (38 referenced UI keys resolved, 38 translation uses resolved, 12 new UI modules under 200 lines, no silent model initializer in readiness helper, native download in two audio cards, advanced batch state separated). The generation-progress call and saved-parameter positional lists were compared against upstream source.

**Not executed in this environment:** \`git diff --check\`, \`python -m compileall\`, \`unittest\` or \`pytest\`, Gradio server launch, browser keyboard/mobile/contrast inspection, GPU inference, CPU/MPS/XPU/MLX, multi-GPU stress, Windows offload soak. Remote Git is unavailable in the local shell (DNS/network unavailable); the connected GitHub API enabled authoring, not Python execution.

Do not confuse newly committed regression tests with passing tests. Source-based checks are not a Python parser, compiler or UI acceptance test. The offline AST checks in \`simple_ui_contracts_test.py\` are prepared for the local team but **not yet run**.

## Known incompleteness and risks

- #1283 LM RNG changes deferred; bit-exact generation across seeds, LM backends, hardware and concurrent runs is **not guaranteed**.
- #1199 complete project library, search, ratings, deletion and permanent history are **not delivered**. Existing \`track_name\`, session batches, metadata files and metadata loader remain.
- Simple flow visual/keyboard/mobile/a11y and real downloads remain **unverified** on pinned Gradio 6.2.0.
- Changing mode during active generation, concurrent user sessions, disabled models after initial readiness, filesystem restrictions and session retention require local exercise.
- Simple history is separate and retained in state but has no dedicated persistent library or cross-session browsing interface.
- CSS is deliberately scoped to the simple UI; the advanced visual redesign is a separate future effort.
- Simple generation exposes at most two results per request, whereas advanced remains capable of eight.
- Runtime exports and API/CLI compatibility must be checked locally after applying all patches.

## Review and acceptance

Review 1: \`2026-11-15-review-code-integration.md\` documents technical defects and corrections. Review 2: \`2026-11-15-review-user-reliability.md\` audits paths and known gaps. Actual local final acceptance must follow \`2026-11-15-local-handoff.md\`.

**Status: Implémentation préparée — validation locale finale requise — merge non autorisé.**

No claim of fully successful CI, GPU generation or production readiness is made.
