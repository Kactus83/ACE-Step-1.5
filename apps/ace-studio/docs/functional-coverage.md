# ACE Studio — Functional coverage against ACE-Step 1.5

Status: **locally qualified on Windows at current SHA `8ceb2ec` on
19 November 2026**. Supported Node 24 passed install, typecheck, lint,
production build, 149 Vitest tests and 51 Chromium mock scenarios. Python
3.12 passed 25 focused contracts and 110 HTTP/API tests with one Windows
symlink skip in each run; Cargo checks and unsigned MSI/NSIS packaging passed.
The real WebView launched and read-only local API/CORS checks passed. The last
fully green GitHub Actions SHA remains `34b2fd83`; no new paid workflow was
triggered. Real GPU generation/training, signed installer, screen-reader,
cross-platform packaging and native media acceptance remain open. Detailed
evidence is in `local-qualification-2026-11-18.md`.

**Evidence boundary (17 November):** the newer `36a2b6f`, `75e8eaf`
and `a3ab529` commits have tests authored but **no check-run evidence**
at the time of inspection. API token isolation, recorded-model filter/order
and result-details EN/FR changes therefore need a fresh current-HEAD CI.
Real GPU generation/training, full Python regression, signed installer,
screen-reader, cross-platform packaging and native download acceptance
remain open. The standalone FastAPI profile is the only supported backend.

| Capability | Source | Verification / limitations |
| --- | --- | --- |
| Angular 21 + Tauri 2 optional client | Verified locally | Shared frontend; Angular production build plus unsigned Windows MSI/NSIS packaging passed |
| Connection/authentication/CORS | Written | Explicit HTTPS or loopback URL; volatile API key; Tauri CORS opt-in; CORS PUT added |
| Backend readiness/model inventory/init | Written, current-head CI pending | /health, validated /v1/model_inventory, explicit double-confirmed DiT + 5Hz LM /v1/init; Create now refuses unloaded/unknown/incompatible DiT selections to avoid primary fallback; full GPU model routing QA pending |
| Text-to-music | Written | Queued /release_task; prompt, instrumental, lyrics, model plus LM sample_mode/sample_query with resource confirmation; GPU QA pending |
| Cover/Remix/Repaint | Partial | Multipart source/reference; waveform, ranges, latent/audio crossfade, source preservation, cover noise; codec QA pending |
| Extract/Lego/Complete | Partial | Only model-advertised modes; stem and track_classes; real base-model GPU QA missing |
| Expert diffusion controls | Partial | ODE/SDE, shift, custom descending timesteps, CFG, ADG, DCW tri-state; remaining API modes and GPU behavior |
| LM thinking/format/CoT | Partial | Explicit thinking, CoT, temperature/CFG/top-k/p; 5Hz model selection and consent-based init; backend/GPU QA pending |
| Generation queue | Written, latest source unqualified | Task submission/status, server-origin session recovery, model filters, chronological sorting, day/variant browsing, truthful progress, non-retryable 4xx pause, 429/5xx backoff, 15-second status timeout; authenticated existing-job ID attachment (current-process only) via additive read-only Studio API; ambiguous submission warnings; latest tests pending |
| Non-audio analysis | Written, awaiting new CI | Exact extract_codes_only/full_analysis_only/analysis_only, structured queued metadata, full bounded code TXT and reusable descriptions; GPU/LM contract acceptance pending |
| Semantic code generation | Written, awaiting new CI | audio_code_string provided only with text2music and LM thinking off; transient codes excluded from presets |
| Results and audio | Written | Authenticated Blob player/download, detailed metadata, server seed, safe edit reuse |
| A/B comparison | Written | Same-backend session/bookmark tracks, approximate dual listening, playback invalidated on backend/file changes; **not sample accurate** |
| Request/seed restoration | Written | Memory-resident request and actual valid seed restored, no auto-submission; media reattachment required |
| Browser-local presets | Written | Versioned whitelisted parameters; audio and keys excluded |
| Browser-local projects | Written | Metadata-only bookmarks, tags/favorites, search, bounded JSON import/export, external-tab refresh, stale-write rejection and explicit raw backup/recovery from corrupt catalog |
| Durable server audio library | Unavailable | No corresponding server persistence contract; local project catalog **does not** back up audio |
| Queue diagnostics | Written | Actual /v1/stats job counts; no fabricated GPU or VRAM metrics |
| Server dataset lifecycle | Partial | Scan/load/save, indexed sample editing with read-before-write conflict checks and stale-connection guard before PUT, LM auto-label/tensor preprocess; backend still has no atomic CAS, live GPU validation pending |
| LoRA/LoKr training | Partial | Tensor validation, explicit double-confirm start, stop request, real loss/history/log, preprocessed tensor handoff |
| Trained adapter export | Written | Authenticated route fails closed without configured filesystem roots and refuses outside/existing/symlink targets; legacy endpoint unchanged |
| Accessibility | Partial | Semantic labels, focus-visible, skip link, responsive CSS, reduced motion; screen-reader/zoom checks pending |
| Light and dark appearance | Written | Semantic color tokens and local preference; human contrast/visual QA pending |
| Keyboard shortcuts / translations | Partial | Alt+1..7 navigation, help panel, typed EN/FR for navigation, Create, datasets, training, Connection, Analysis, Queue/Batch, A/B, library and result detail UI. Remaining client error copy and real long-label / screen-reader QA pending |
| Optional Tauri native integration | Partial | Safe WebView shell only; Windows MSI/NSIS built and release executable startup/layout/navigation inspected; installation and other OSes untested |
| Tests | Locally verified at 8ceb2ec; GitHub CI last verified at 34b2fd83 | Current Windows qualification: 149 Vitest / 51 Playwright, 110 Python HTTP/API tests, Cargo and unsigned packaging. No current-HEAD GitHub check was triggered |
| Existing Python CLI and Gradio | Source isolated | Opt-in desktop CORS + PUT, DCW parser forwarding, additive no-overwrite export route and authenticated read-only task existence lookup; legacy inference and Gradio unchanged, complete regression testing pending |

Do not conflate local metadata persistence with permanent backend audio storage.
The PR must remain draft until remaining source functionality and independent
local CI, real API/GPU and native visual validation are completed.


**18 November checkpoint 11:** Source-only tests now cover advertised model
capabilities and actual DiT provenance: optional real `dit_model` is retained
from the Python job store in `/query_result` audio metadata, and the UI
warns only on a known requested/reported mismatch. Cache-derived results
without provenance remain unknown; no claim of model identity is fabricated.
No current-head CI or real GPU qualification is yet available.
