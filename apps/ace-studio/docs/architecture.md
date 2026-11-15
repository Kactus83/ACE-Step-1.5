# ACE Studio — architecture baseline

Source baseline: fork `main` at `ca1e85fe9430179831e6bc6be790c332190a3866`.
This independent module does not import Gradio's frontend or bundle a Python inference runtime.

## Deployment topology

```text
Browser (http://127.0.0.1:4200)          Tauri 2 webview (packaged)
                  \                        /
                   \    same Angular 21    /
                     Angular app / signals
                              |
                 typed client + session key
                              |
                     HTTP / HTTPS + CORS
                              |
              ACE-Step standalone FastAPI 8001
                              |
                  existing Python job queue
                              |
                  existing model / GPU engine
```

### Angular modules

- `app.component`: shell and view selection; no native-specific logic.
- `features/create/`: generation form and pure request mapper.
- `features/results/`: queue and authenticated audio cards.
- `features/system/`: connection and explicit model initialization.
- `core/backend.client`: typed generation HTTP adapter; training mutations are isolated in `features/training/training.client`.
- `core/backend.store`: observed health/model inventory and explicit load state.
- `core/jobs.store`: bounded, non-overlapping polling and ephemeral job recovery.
- `core/audio.service`: authenticated Blob previews and browser-native downloads.
- `core/workflow.store`: result-to-cover/repaint intent.
- `core/presets.store` and `preset-codec`: whitelist-sanitized browser-local settings.\n- `features/training/`: audited LoRA/LoKr status, dataset scan, tensor validation, confirmed start/stop.
- `core/api-decoder`: runtime envelope/URL validation and legacy result coercion.

### Tauri adapter

The native crate runs `tauri::Builder::default()` and serves Angular assets. It
intentionally exposes **no native commands, filesystem permissions, shell access,
embedded Python binary or model lifecycle control**. Packaged WebView2 origin
differs from browser origin; the optional fixed allowlist in
`acestep/api/http/studio_cors.py` addresses that without modifying standard CORS
unless an operator explicitly opts in.

No Angular business feature imports `@tauri-apps/api`. Any future native
feature must use an injectable interface with a browser-safe implementation and
a narrowly scoped Tauri implementation; no unconditional native imports.

### Network API

Only the **standalone** server is claimed by this adapter. It is selected
explicitly by validated endpoint. The Gradio-mounted API may be different.
See `contracts.md` for actual route shapes and authentication.

### Mutable data / boundaries

- Server: all model, job, and media truth (including audio file lifetime).
- Browser memory: API key, selected source/reference `File`, transient workflow intent,
  audio Blob URLs.
- `sessionStorage`: up to 30 task IDs/title/time records for reload recovery,
  with no API key or binary audio persisted.
- `localStorage`: validated non-secret backend origin and at most 50 whitelisted
  generation presets. This is *not* a persistent server-side project library.
- Tauri local data: no Rust-side persistence implemented yet.

### State / recovery

Submission acknowledges `task_id` before tracking starts. Polling takes at
least 2.5 seconds between successful rounds and increases delay to 30 seconds
on transport errors. A disconnected backend does not automatically cancel the
GPU job; an HTTP aborted request is not equivalent to canceling inference.
The list is reset when users explicitly switch servers, preserving separation.

### Integration invariants

1. Never spawn a second Python model service on application startup.
2. Never interpret server-issued filesystem paths as client filesystem paths.
3. Never advertise a feature merely because a visual control exists.
4. Never write a secret into local/session storage or source code.
5. Never mutate Gradio/CLI/training defaults for ACE Studio convenience.
6. Keep every backend extension additive, opt-in and testable.
7. Tauri and Web must continue to use one Angular source tree.

