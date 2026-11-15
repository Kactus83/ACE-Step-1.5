# ACE-Step 1.5 — Upstream convergence decisions (2026-11-15)

**Base verified:** `ace-step/main` and `Kactus83/main` = `ca1e85fe9430179831e6bc6be790c332190a3866`.
**Destination:** `Kactus83/ACE-Step-1.5:integration/ace-ui-foundation`. No upstream or third-party PR modified.
**Evidence:** GitHub PR descriptions, changed-file lists, actual diffs, relevant review comments, and source comparison against base. "Not in main" means the exact candidate change is absent from the verified base, not that every related capability is absent.

| PR | Feature | GitHub state at inspection | Already on main? | Dependencies / overlap / conflicts | Decision | Rationale | Required verification |
|---|---|---|---|---|---|---|---|
| [#1270](https://github.com/ace-step/ACE-Step-1.5/pull/1270) | Five-stage Gradio UI | Open, draft, not mergeable | No | Gradio event tuples, model load, results mounting, 824 lines of CSS; drift from base | **Adapted; feature-flagged** | Builders and event flow decomposed; old advanced results remain inside Generation; no implicit init; new CSS and English locale | Gradio 6.2 UI, browser, GPU and visual/a11y checks |
| [#1357](https://github.com/ace-step/ACE-Step-1.5/pull/1357) | Effective seeds and batch metadata | Open, unmerged | No | `inference.py`, seed helper, JSON sidecars | **Integrated/adapted** | Resolved seeds are passed once; effective emitted batch count recorded | Seed random/fixed/partial, VRAM batch reduction, JSON restoration, CLI/API |
| [#1313](https://github.com/ace-step/ACE-Step-1.5/pull/1313) | Preserve WAV on MP3 export error | Open, unmerged | No | AudioSaver, inference, Gradio progress | **Integrated/adapted** | WAV fallback retained; review issue corrected so result metadata records `audio_format=wav` | Missing ffmpeg, timeout, hard failure, JSON, API/CLI and Gradio |
| [#1283](https://github.com/ace-step/ACE-Step-1.5/pull/1283) | LM and audio-crop reproducibility | Open, unmerged; changes requested | No | LM global RNG across PT/MLX/vLLM; handler test double signature | **Partially adapted** | Deterministic reference crop integrated with corrected request test doubles. Global LM RNG changes deliberately deferred for concurrency audit | Same seed/different seed; multi-worker batch LM, all backends/hardware |
| [#1199](https://github.com/ace-step/ACE-Step-1.5/pull/1199) | Titles, project save/load and persistent library | Closed without merge | Partial primitives: `track_name`, session batches, JSON sidecars and metadata load already exist | 31 old files touching outputs, metadata schema, filesystem deletion, i18n | **Analyzed, deferred** | Existing primitives retained. Full import could duplicate batch storage, break positional contracts or introduce destructive file operations. No complete library claimed | Independent design/storage/security review before any later library PR |
| [#1309](https://github.com/ace-step/ACE-Step-1.5/pull/1309) | Flow Edit under offloading | Open, unmerged | No | Device context, stale source-text test | **Integrated/adapted** | Context reacquired for downstream condition; brittle assertion replaced with semantic task contract | GPU offloading, Flow Edit and full targeted unittest |
| [#1269](https://github.com/ace-step/ACE-Step-1.5/pull/1269) | Multi-GPU placement | Open, unmerged | No | Device mapping, CLI/Gradio model loading and offload | **Excluded (hardware-specific)** | Outside UI foundation; cannot verify multi-GPU here; may interact with model readiness | Separate dual-GPU test campaign |
| [#1365](https://github.com/ace-step/ACE-Step-1.5/pull/1365) | Italian locale | Open, unmerged | No | i18n loader with English fallback | **Integrated** | `it.json` copied with author attribution, no loader modification. New `simple_flow` keys and pre-existing `gen.*` keys fall back to English | Locale loading, placeholders, UI text overflow |
| [#1383](https://github.com/ace-step/ACE-Step-1.5/pull/1383) | Custom timesteps forwarded by API | Closed without merge | No | `/release_task` parser/builder test doubles | **Integrated/adapted** | Focused fix preserving existing API semantics and tests | API payload with/without timesteps and response parity |
| [#1377](https://github.com/ace-step/ACE-Step-1.5/pull/1377) | FP16 lyric NaN on older NVIDIA GPUs | Open, unmerged | No | Core model precision, Pascal/Turing hardware | **Deferred** | Relevant to reliability but high regression/hardware validation cost beyond UI scope | GTX 1080 Ti / Tesla T4 / P40 lyrics and instrumental |
| [#1368](https://github.com/ace-step/ACE-Step-1.5/pull/1368) | Windows RAM leak with offloading | Open, unmerged | No | Service-generation threading and memory management | **Deferred** | Global concurrency semantics are not suitable for this consolidation without Windows stress runs | Long-running Windows repeated generation/RSS soak |
| [#1369](https://github.com/ace-step/ACE-Step-1.5/pull/1369) | Windows RSS metric | Open, unmerged | No | WinDLL/ctypes | **Excluded** | Diagnostics-only Windows-specific, unrelated to consolidated feature paths | Separate Windows-only check |
| [#1359](https://github.com/ace-step/ACE-Step-1.5/pull/1359) | API VRAM-tier offload defaults | Open, unmerged | No | API startup and model lifecycle | **Deferred** | Changes startup semantics independently of the new opt-in UI; do not silently alter default hardware behavior | API default overrides across GPU tiers/CPU/MPS |

## Architecture decisions and invariants

1. Upstream first: no merge of original contributors' PR branches, no rewriting history, no upstream edits.
2. Gradio remains the single product UI. `ACESTEP_ENABLE_SIMPLE_UI=1` enables the optional flow only outside service mode.
3. Advanced Generation, its **eight audio slots**, Training, Dataset Builder, LoRA/LoKr, API and CLI remain structurally mounted through the original composition; this is not a claim of runtime validation.
4. Simple UI has its own session batch state; switching UI level must not modify the legacy generation mode or advanced queue.
5. Model readiness is **read-only**; no silent checkpoint selection, initialization, generation or unload on page load / mode switch.
6. Only two simple result cards are presented; these do not impose a two-slot limit on advanced results.
7. The #1283 LM path and the #1199 library remain explicitly incomplete/deferred.
8. Contributions are attributed in their consolidation commits and in this matrix.

## Open questions for a subsequent PR

Persistent library design needs a data model for project versus audio artifact versus session event, versioned metadata, safe path confinement, atomic writes, restoration and deletion semantics. It must not be presented as delivered here.

Reproducibility requires per-backend LM RNG policy, concurrency tests and explicit hardware/batch determinism boundaries; a fixed DiT seed alone is not sufficient.
