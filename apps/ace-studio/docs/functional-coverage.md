# Functional coverage against ACE-Step 1.5 Gradio

**Evidence convention:** `Written / unexecuted` means source is present, but
Angular, Tauri, end-to-end or GPU acceptance has **not** been run. It does not
establish that the feature actually works. `Partial` marks a real functional gap.
`Unavailable` means explicitly disabled or absent, not a simulated feature.

| Capability | ACE Studio source | Validation | Scope and next obligation |
| --- | --- | --- | --- |
| Standalone FastAPI connection | Written | Unexecuted | Validated URL; nonpersistent credential |
| Health and model inventory | Written | Unexecuted | /health, /v1/models |
| Model init/switch | Written | Unexecuted | Explicit /v1/init; no implicit model download |
| Text-to-music creation | Written | Unexecuted | /release_task via queued backend |
| Prompt, lyrics, instrumental | Written | Unexecuted | Backend instrumental sentinel |
| Model-aware mode availability | Partial | Unexecuted | Only text2music/cover/repaint are wired |
| Remix/Cover with uploaded source | Written | Unexecuted | Multipart; backend controls quality/semantics |
| Repaint with uploaded source | Partial | Unexecuted | Numeric time controls, no waveform selection |
| Reference audio | Written | Unexecuted | Multipart reference upload |
| Advanced inference controls | Partial | Unexecuted | Steps/guidance/seed/batch/format; not DCW, custom timesteps etc |
| Model/LM thinking | Partial | Unexecuted | Boolean thinking; no full LM control panel |
| Batches / variants | Partial | Unexecuted | Batch parameter and result cards; no A/B synchronized comparison |
| Job queue / progress | Written | Unexecuted | Polling, status, backend text, backoff; no invented percentages |
| Failure/reconnection | Written | Unexecuted | Session task IDs; needs outage scenario |
| Audio playback/download | Written | Unexecuted | Authenticated Blob fetch; raw MIME test needed |
| Result-to-remix/repaint | Written | Unexecuted | Re-upload resulting audio to the same backend |
| Local presets | Written | Unexecuted | Whitelist versioned settings, no binary data |
| Cross-session server library/projects | Unavailable | Not applicable | Requires backend/storage design and security review |
| Audio metadata, seeds | Partial | Unexecuted | Display available seed/BPM; no complete catalog |
| Extract | Unavailable | Not applicable | API mode exists; not yet implemented in Studio |
| Lego | Unavailable | Not applicable | Needs track conditioning UX/API validation |
| Complete | Unavailable | Not applicable | Needs own form and source-data contracts |
| GPU/runtime stats | Unavailable | Not applicable | /v1/stats could be exposed read-only |
| Dataset preparation | Partial | Unexecuted | Server directory scanning only; preprocessing/labeling still missing |
| LoRA/LoKr training | Partial | Unexecuted | Server status, tensor validation, explicit start/stop authored; needs runtime and extended controls |
| Desktop integration | Partial | Unexecuted | Tauri 2 host and icons, no native capabilities |
| Native process supervision | Voluntarily excluded | Not applicable | Do not duplicate existing Python inference instance |
| Dark responsive UI | Written | Unexecuted | Contrast, mobile, keyboard, screen-reader QA pending |
| Light theme | Voluntarily deferred | Not applicable | Dark design system is current baseline |
| Test unit / browser mock | Written | Unexecuted | Vitest/Playwright and mocked API provided |
| Python original CLI/Gradio | Untouched except optional CORS | Unexecuted | Full nonregression tests required |

The project is **not** at 100% source coverage. A polished shell must not be
counted as API-backed Extract/Lego/Complete, training, or persistent library.


