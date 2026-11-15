# ACE-Step 1.5 — Functional coverage matrix, 2026-11-15

Baseline: `docs/en/UI_SUPPORT.md` on upstream `ca1e85fe9430179831e6bc6be790c332190a3866`.

**Interpretation:** `Préservée` means historical component paths and wiring are retained by the source structure, **not** that a runtime test has passed. `Améliorée` means code was changed in this candidate, pending runtime validation. `Non testée` explicitly marks a path for which neither an independent source-preservation finding nor execution validation is sufficient. No production-quality guarantee follows from this table.

| Area (UI_SUPPORT.md) | Statut | Validation d'exécution | Notes |
|---|---|---|---|
| Gradio Web UI | Améliorée | Non exécutée | Opt-in five-step builder; original advanced tree retained |
| Gradio-mounted REST API | Préservée | Non exécutée | Existing wiring untouched |
| Standalone REST API | Améliorée | Non exécutée | API custom timesteps forwarding #1383; other endpoints unchanged structurally |
| OpenRouter-compatible API | Préservée | Non exécutée | No OpenRouter code changes |
| Generation CLI | Préservée | Non exécutée | Shared inference changes require direct CLI verification |
| Side-Step training CLI | Préservée | Non exécutée | No direct changes |
| Launch/server settings | Préservée | Non exécutée | Original port/share/auth and allowed-path controls |
| GPU adaptation/VRAM tiers | Préservée | Non exécutée | Same configuration path, no hardware startup change |
| DiT initialization/configuration | Préservée | Non exécutée | Simple readiness is read-only, advanced initializer remains |
| LM init/backend/offloading | Préservée | Non exécutée | No automatic LM initialization in Simple |
| LoRA inference load/unload | Préservée | Non exécutée | Advanced controls not removed |
| Simple generation task | Améliorée | Non exécutée | Distinct from simplified UI level |
| Custom generation | Préservée | Non exécutée | Advanced Generation preserved |
| Remix | Améliorée | Non exécutée | Optional source-audio flow, no sample-drafting leakage |
| Repaint | Préservée | Non exécutée | Advanced editing mode retained |
| Extract | Préservée | Non exécutée | Advanced mode and model gating retained |
| Lego | Préservée | Non exécutée | Advanced mode retained |
| Complete | Préservée | Non exécutée | Advanced mode retained |
| Audio codes/source conditioning | Préservée | Non exécutée | Existing controls retained |
| Music metadata duration/BPM/key/language | Préservée | Non exécutée | Existing advanced controls; new simple defaults |
| Random/fixed/multiple seeds | Améliorée | Non exécutée | Effective seeds corrected; LM determinism incomplete |
| Advanced DiT guidance/scheduler/timesteps/DCW | Préservée | Non exécutée | No control removal; API timesteps change |
| Advanced LM thinking/temperature/CoT | Préservée | Non exécutée | LM RNG #1283 portion deferred |
| Batch generation/autogen | Améliorée | Non exécutée | Effective batch metadata; isolated Simple session queue |
| Results playback up to eight slots | Préservée | Non exécutée | Advanced result builder stays inside Generation tab |
| Simple two-result playback | Améliorée | Non exécutée | Native Gradio audio player/download |
| Batch navigation | Préservée | Non exécutée | Advanced handlers unchanged; Simple history UI incomplete |
| Result-to-Remix/Repaint | Préservée | Non exécutée | Advanced handlers preserved |
| Restore params/metadata files | Améliorée | Non exécutée | Seed/batch/WAV metadata; advanced loader retained |
| Results score/codes/LRC | Préservée | Non exécutée | Advanced handlers unchanged |
| Dataset Builder | Préservée | Non exécutée | Training tab stays mounted |
| Dataset preprocessing | Préservée | Non exécutée | Training handlers unchanged |
| LoRA training | Préservée | Non exécutée | Training tab remains mounted |
| LoKr training | Préservée | Non exécutée | Training tab remains mounted |
| Help and contextual tooltips | Préservée | Non exécutée | Existing help component retained, optional new menu |
| i18n | Améliorée | Non exécutée | English Simple labels + Italian locale; fallback for missing keys |
| Service mode | Préservée | Non exécutée | New UI disabled when service_mode is true |
| Accessibility/responsive | Non testée | Non exécutée | Scoped CSS, focus styles, no browser test |
| Persistent projects / library | Non testée | Non exécutée | #1199 intentionally not delivered; requires independent design |
| Legacy Streamlit/static prototype | Non applicable | Non applicable | Already removed in upstream baseline |

In all cases, actual behavior requires the step-by-step local acceptance matrix in the handoff document. Any discovered regression must be fixed **before** final merge authorization.
