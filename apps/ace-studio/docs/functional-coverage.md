# ACE Studio — Functional coverage against ACE-Step 1.5

Status: **locally compiled and mock-qualified on Windows**. Angular, Rust,
focused Python, Windows desktop packaging, 78 unit tests and 20 browser-mock
scenarios passed on 15 November 2026. Real GPU/model, full Python regression,
signed-installer, screen-reader and non-Windows acceptance remains pending.
The standalone FastAPI server is the only supported backend profile.

**Evidence boundary:** the executed Windows qualification predates the new
Analysis, code-controlled generation, corrupted-catalog recovery, queue/session
robustness, partial EN/FR workspaces and reported-progress source commits on 16 November. These new workflows have
unit and browser mock tests **authored but not yet executed**; they require a
fresh local CI run. Do not treat old green results as validation of new code.

| Capability | Source | Verification / limitations |
| --- | --- | --- |
| Angular 21 + Tauri 2 optional client | Verified locally | Shared frontend; Angular production build plus unsigned Windows MSI/NSIS packaging passed |
| Connection/authentication/CORS | Written | Explicit HTTPS or loopback URL; volatile API key; Tauri CORS opt-in; CORS PUT added |
| Backend readiness/model inventory/init | Written | /health, validated /v1/models, double-confirmed DiT + 5Hz LM /v1/init; GPU load untested |
| Text-to-music | Written | Queued /release_task; prompt, instrumental, lyrics, model plus LM sample_mode/sample_query with resource confirmation; GPU QA pending |
| Cover/Remix/Repaint | Partial | Multipart source/reference; waveform, ranges, latent/audio crossfade, source preservation, cover noise; codec QA pending |
| Extract/Lego/Complete | Partial | Only model-advertised modes; stem and track_classes; real base-model GPU QA missing |
| Expert diffusion controls | Partial | ODE/SDE, shift, custom descending timesteps, CFG, ADG, DCW tri-state; remaining API modes and GPU behavior |
| LM thinking/format/CoT | Partial | Explicit thinking, CoT, temperature/CFG/top-k/p; 5Hz model selection and consent-based init; backend/GPU QA pending |
| Generation queue | Written | Task submission/status, server-origin-scoped session recovery, phase/search/explicit-model filters, newest/oldest sorting, day/variant batch navigation, 401/403 polling suspension, true reported progress; new model-filter regression requires qualification |
| Non-audio analysis | Written, awaiting new CI | Exact extract_codes_only/full_analysis_only/analysis_only, structured queued metadata, full bounded code TXT and reusable descriptions; GPU/LM contract acceptance pending |
| Semantic code generation | Written, awaiting new CI | audio_code_string provided only with text2music and LM thinking off; transient codes excluded from presets |
| Results and audio | Written | Authenticated Blob player/download, detailed metadata, server seed, safe edit reuse |
| A/B comparison | Written | Same-backend session/bookmark tracks, approximate dual listening, playback invalidated on backend/file changes; **not sample accurate** |
| Request/seed restoration | Written | Memory-resident request and actual valid seed restored, no auto-submission; media reattachment required |
| Browser-local presets | Written | Versioned whitelisted parameters; audio and keys excluded |
| Browser-local projects | Written | Metadata-only bookmarks, tags/favorites, search, bounded JSON import/export, external-tab refresh, stale-write rejection and explicit raw backup/recovery from corrupt catalog |
| Durable server audio library | Unavailable | No corresponding server persistence contract; local project catalog **does not** back up audio |
| Queue diagnostics | Written | Actual /v1/stats job counts; no fabricated GPU or VRAM metrics |
| Server dataset lifecycle | Partial | Scan/load/save, indexed sample editing with read-before-write conflict checks, LM auto-label/tensor preprocess; server has no atomic CAS and needs GPU QA |
| LoRA/LoKr training | Partial | Tensor validation, explicit double-confirm start, stop request, real loss/history/log, preprocessed tensor handoff |
| Trained adapter export | Written | Authenticated route fails closed without configured filesystem roots and refuses outside/existing/symlink targets; legacy endpoint unchanged |
| Accessibility | Partial | Semantic labels, focus-visible, skip link, responsive CSS, reduced motion; screen-reader/zoom checks pending |
| Light and dark appearance | Written | Semantic color tokens and local preference; human contrast/visual QA pending |
| Keyboard shortcuts / translations | Partial | Alt+1..7 navigation, help panel, typed EN/FR navigation, Analysis, Queue/Batch, A/B and Library UI with localized timestamps; Create/Datasets/Training/Connection and error copy remain partial |
| Optional Tauri native integration | Partial | Safe WebView shell only; Windows MSI/NSIS built and release executable startup/layout/navigation inspected; installation and other OSes untested |
| Tests | Older baseline verified locally | Windows evidence in verification.md records 78 Vitest and 20 Playwright plus focused Python; newly authored analysis, recovery, results/library i18n, batch, dataset conflict, credential retry, A/B invalidation, code-control and progress tests still unexecuted |
| Existing Python CLI and Gradio | Source isolated | Opt-in desktop CORS + PUT, DCW parser forwarding, additive no-overwrite export route; complete regression testing pending |

Do not conflate local metadata persistence with permanent backend audio storage.
The PR must remain draft until remaining source functionality and independent
local CI, real API/GPU and native visual validation are completed.

