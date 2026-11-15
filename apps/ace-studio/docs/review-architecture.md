# Contradictory review A — architecture / API / security

Review performed by source reasoning at commit `ac09d443` and then extended
documentation. This is not a static analyzer or runtime compilation.

## Findings corrected in source

- **False Gradio/API parity:** targeted the separately verified standalone
  FastAPI routes with one adapter; no automatic Gradio mode assumed.
- **Credentialed audio:** replaced plain <audio> server URLs with authenticated
  Blob fetching to preserve Authorization header requirements.
- **Desktop CORS dead-end:** original localhost CORS would not accept packaged
  Tauri webview origins. Added narrowly scoped opt-in fixed origins with tests.
- **Model lifecycle:** no silent model/process initialization; explicit user
  operation and readiness observation only.
- **Feature claims:** Extract/Lego/Complete are now conditionally exposed only\n  when the selected backend model advertises them; request DTOs use audited\n  source audio, instrument names and track classes. GPU verification remains outstanding.
- **Format mismatch:** generated audio reuse and download now preserve detected
  source extension instead of claiming every file is MP3 or WAV.
- **Type/code decomposition:** moved form-to-API mapping into pure tested module,
  returning the main component to the repository's <=200-line module target.
- **Angular v21 modern defaults:** removed unnecessary ZoneJS and NgZone
  override, leveraging signal-triggered zoneless change detection.

## Follow-up contradictory findings, 15 Nov 2026

- Connection credential/origin changes previously leaked old local job and
  dataset snapshots; revision-based invalidation has been added across stores.
- The form exposed one `track_name` for both user-facing title and Extract/Lego
  instruction; source request mapping now separates instrument stem from title.
- Multipart `track_classes` must be transmitted as repeated form keys rather
  than a comma-separated scalar; the adapter was corrected accordingly.
- A detached Repaint WAV/MP3 conversion relied on incorrect MIME from the server.
  The selected source extension is now taken from the backend audio route path.
- The 37 application TS files were checked via connected GitHub for relative
  import existence and a <=200 LOC threshold, both clean at that checkpoint.
  This is a structural text check, **not** TypeScript/Angular compiler evidence.

## Critical open questions

- Upstream API audio response may have incomplete MIME for OPUS/AAC; verify
  all formats and fallback handling in a real backend.
- Release packaging including icon schemas, WebView2 and platform frameworks
  remains unverified.
- Model initialization on a remote backend is privileged; consider an explicit
  confirmation gate and timeouts in the next increment.
- Task results are transient in upstream server memory; permanent library needs
  an independent, authoritative data model and safe retention policy.
- LoRA/LoKr and dataset scan/load/save, sample update, labeling and preprocessing\n  routes have been audited and authored; adapter export and other specialized\n  training operations remain unfinished.
- No dependency lockfile or vulnerability scan yet (network/package install
  unavailable in this environment).

**Review verdict:** architecture consistent at source level, **not build-ready
proven**. Continue implementation; do not merge or declare 100% completion.



## Contradictory review C — expert API forwarding

- **Identified:** Pydantic declared DCW fields, but the HTTP request builder did
  not forward them. Simply adding client controls would silently do nothing.
- **Corrected:** forwarded optional dcw_enabled as None/False/True alongside
  mode/scalers/wavelet, with Python regression tests. This retains the server's
  policy resolution and minimizes changes outside the new Studio branch.
- **Validated at source:** scheduler, CoT and sampling controls map through the
  request builder to the generation setup or LM input-preparation modules.
- **Guard:** forced DCW on non-turbo is warned and explicitly re-confirmed; no
  model-name-based turbo heuristic is introduced.
- **Remaining:** real GPU/codec behavior, Angular/Rust compilation, backend
  API compatibility and effect of settings on generated audio are untested.

