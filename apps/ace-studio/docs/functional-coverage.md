# ACE Studio — Functional coverage against ACE-Step 1.5

Status: **source authored, unexecuted**. No Angular, Rust, browser E2E, real GPU,
Python regression or accessibility test has been successfully executed in this
GitHub-only development environment. “Written” therefore means **code exists**,
not “working in production”. “Partial” identifies additional scope or acceptance
required. The standalone FastAPI server is the only supported backend profile.

| Capability | Source | Verification / limitations |
| --- | --- | --- |
| Angular 21 + Tauri 2 optional client | Written | Shared frontend, no embedded inference process; native packaging untested |
| Connection/authentication/CORS | Written | Explicit HTTPS or loopback URL; volatile API key; Tauri CORS opt-in; CORS PUT added |
| Backend readiness/model inventory/init | Written | /health, /v1/models, opt-in /v1/init; real model switching not validated |
| Text-to-music | Written | Real queued /release_task; prompt, instrumental, lyrics, model; GPU acceptance pending |
| Cover/Remix/Repaint | Partial | Multipart source/reference; waveform and numeric repaint range; audio codec QA pending |
| Extract/Lego/Complete | Partial | Only model-advertised modes; stem and track_classes; real base-model GPU QA missing |
| Expert diffusion controls | Partial | ODE/SDE, shift, custom descending timesteps, CFG, ADG, DCW tri-state; remaining API modes and GPU behavior |
| LM thinking/format/CoT | Partial | Explicit toggles, temperature/CFG/top-k/p; fine-grained LM lifecycle not complete |
| Generation queue | Written | Task submission/status, bounded polling, session recovery, status filtering and search; outages need QA |
| Results and audio | Written | Authenticated Blob player/download, detailed metadata, server seed, safe edit reuse |
| A/B comparison | Written | Same-backend session/bookmark tracks, separate or approximately simultaneous listening; **not sample accurate** |
| Request/seed restoration | Written | Memory-resident request and actual valid seed restored, no auto-submission; media reattachment required |
| Browser-local presets | Written | Versioned whitelisted parameters; audio and keys excluded |
| Browser-local projects | Written | Explicit bookmarks, annotations, tags/favorites, search and bounded versioned JSON import/export |
| Durable server audio library | Unavailable | No corresponding server persistence contract; local project catalog **does not** back up audio |
| Queue diagnostics | Written | Actual /v1/stats job counts; no fabricated GPU or VRAM metrics |
| Server dataset lifecycle | Partial | Scan/load/save, indexed sample editing, LM auto-label and tensor preprocess; concurrent server-global state and GPU QA |
| LoRA/LoKr training | Partial | Tensor validation, explicit double-confirm start, stop request, real loss/history/log, preprocessed tensor handoff |
| Trained adapter export | Written | Existing destructive /v1/training/export; path checks, typed OVERWRITE and two-click confirmation; server overwrite remains possible |
| Accessibility | Partial | Semantic labels, focus-visible, skip link, responsive CSS, reduced motion; screen-reader/zoom checks pending |
| Light and dark appearance | Written | Semantic color tokens and local preference; human contrast/visual QA pending |
| Keyboard shortcuts / translations | Unavailable | Core browser keyboard semantics exist; no app-wide shortcut map or French translation architecture |
| Optional Tauri native integration | Partial | Safe WebView shell only, intentionally no shell/filesystem commands; packaging untested |
| Tests | Written | Pure Vitest, Python unittest and Playwright mock scenarios authored; none executed |
| Existing Python CLI and Gradio | Source isolated | Two narrow backend changes: opt-in desktop CORS + browser PUT; expert DCW request-field forwarding; complete regression testing pending |

Do not conflate local metadata persistence with permanent backend audio storage.
The PR must remain draft until remaining source functionality and independent
local CI, real API/GPU and native visual validation are completed.

