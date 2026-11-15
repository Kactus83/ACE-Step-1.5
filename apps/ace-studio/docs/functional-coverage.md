# ACE Studio — Functional coverage against ACE-Step 1.5

Status: **locally compiled and mock-qualified on Windows**. Angular, Rust,
focused Python, Windows desktop packaging, 78 unit tests and 20 browser-mock
scenarios passed on 15 November 2026. Real GPU/model, full Python regression,
signed-installer, screen-reader and non-Windows acceptance remains pending.
The standalone FastAPI server is the only supported backend profile.

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
| Generation queue | Written | Task submission/status, bounded polling, session recovery, status filtering and search; outages need QA |
| Results and audio | Written | Authenticated Blob player/download, detailed metadata, server seed, safe edit reuse |
| A/B comparison | Written | Same-backend session/bookmark tracks, separate or approximately simultaneous listening; **not sample accurate** |
| Request/seed restoration | Written | Memory-resident request and actual valid seed restored, no auto-submission; media reattachment required |
| Browser-local presets | Written | Versioned whitelisted parameters; audio and keys excluded |
| Browser-local projects | Written | Metadata-only bookmarks, tags/favorites, search, bounded JSON import/export, external-tab refresh and stale-write rejection |
| Durable server audio library | Unavailable | No corresponding server persistence contract; local project catalog **does not** back up audio |
| Queue diagnostics | Written | Actual /v1/stats job counts; no fabricated GPU or VRAM metrics |
| Server dataset lifecycle | Partial | Scan/load/save, indexed sample editing, LM auto-label and tensor preprocess; concurrent server-global state and GPU QA |
| LoRA/LoKr training | Partial | Tensor validation, explicit double-confirm start, stop request, real loss/history/log, preprocessed tensor handoff |
| Trained adapter export | Written | New authenticated /v1/studio/training/export refuses existing targets and source symlinks; existing legacy endpoint unchanged, backend QA pending |
| Accessibility | Partial | Semantic labels, focus-visible, skip link, responsive CSS, reduced motion; screen-reader/zoom checks pending |
| Light and dark appearance | Written | Semantic color tokens and local preference; human contrast/visual QA pending |
| Keyboard shortcuts / translations | Partial | Alt+1..6 navigation, help panel and field-focus guards pass browser tests; French translation architecture pending |
| Optional Tauri native integration | Partial | Safe WebView shell only; Windows MSI/NSIS built and release executable startup/layout/navigation inspected; installation and other OSes untested |
| Tests | Verified locally | 79 Vitest, 20 Playwright mock and 16 focused Python tests passed; one symlink/platform test skipped; full Python/GPU suites pending |
| Existing Python CLI and Gradio | Source isolated | Opt-in desktop CORS + PUT, DCW parser forwarding, additive no-overwrite export route; complete regression testing pending |

Do not conflate local metadata persistence with permanent backend audio storage.
The PR must remain draft until remaining source functionality and independent
local CI, real API/GPU and native visual validation are completed.


