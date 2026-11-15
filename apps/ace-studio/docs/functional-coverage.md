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
| Model-aware mode availability | Partial | Unexecuted | Advertised text2music/cover/repaint/extract/lego/complete; advanced modes lack real GPU acceptance |
| Remix/Cover with uploaded source | Written | Unexecuted | Multipart; backend controls quality/semantics |
| Repaint with uploaded source | Partial | Unexecuted | Accessible numeric inputs plus opt-in decoded waveform and synchronized range sliders |
| Reference audio | Written | Unexecuted | Multipart reference upload |
| Advanced inference controls | Partial | Unexecuted | DCW tri-state, ODE/SDE, shift, custom timesteps, ADG, CFG windows and existing steps/guidance/seed; broader code-control still pending |
| Model/LM thinking | Partial | Unexecuted | Thinking, CoT toggles, temperature, CFG, top-k/p now mapped; LM model/backend lifecycle UI still pending |
| Batches / variants | Partial | Unexecuted | Batch parameter and result cards; no A/B synchronized comparison |
| Job queue / progress | Written | Unexecuted | Polling, status, backend text, backoff; no invented percentages |
| Failure/reconnection | Written | Unexecuted | Session task IDs; needs outage scenario |
| Audio playback/download | Written | Unexecuted | Authenticated Blob fetch; source extension from server path where possible, full codec validation pending |
| Result-to-remix/repaint | Written | Unexecuted | Re-upload resulting audio to the same backend |
| Local presets | Written | Unexecuted | Whitelist versioned settings, no binary data |
| Cross-session server library/projects | Unavailable | Not applicable | Requires backend/storage design and security review |
| Audio metadata, seeds | Partial | Unexecuted | Display available seed/BPM; no complete catalog |
| Extract | Partial | Unexecuted | Source audio and instrument stem mapped to API; hardware/model validation pending |
| Lego | Partial | Unexecuted | Source audio and requested added stem mapped; real source-conditioned behavior unverified |
| Complete | Partial | Unexecuted | Source and validated track_classes forwarded; specialized output review pending |
| GPU/runtime stats | Partial | Unexecuted | Real queue and job counts from /v1/stats; no GPU/VRAM telemetry API |
| Dataset preparation | Partial | Unexecuted | Server scan/load/save, sample metadata editor, asynchronous labeling and preprocessing; full integration/QA pending |
| LoRA/LoKr training | Partial | Unexecuted | Server status, tensor validation, explicit start/stop authored; needs runtime and extended controls |
| Desktop integration | Partial | Unexecuted | Tauri 2 host and icons, no native capabilities |
| Native process supervision | Voluntarily excluded | Not applicable | Do not duplicate existing Python inference instance |
| Dark responsive UI | Written | Unexecuted | Contrast, mobile, keyboard, screen-reader QA pending |
| Light theme | Voluntarily deferred | Not applicable | Dark design system is current baseline |
| Test unit / browser mock | Written | Unexecuted | Vitest/Playwright and mocked API provided |
| Python original CLI/Gradio | Untouched except optional CORS | Unexecuted | Full nonregression tests required |

The project is **not** at 100% source coverage. A polished shell and API request mapping do not prove GPU correctness for advanced modes or a persistent server-side library.




