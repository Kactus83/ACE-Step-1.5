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
- **Feature claims:** unimplemented Extract/Lego/Complete modes removed from
  enabled UI selection, regardless of model inventory advertisement.
- **Format mismatch:** generated audio reuse and download now preserve detected
  source extension instead of claiming every file is MP3 or WAV.
- **Type/code decomposition:** moved form-to-API mapping into pure tested module,
  returning the main component to the repository's <=200-line module target.
- **Angular v21 modern defaults:** removed unnecessary ZoneJS and NgZone
  override, leveraging signal-triggered zoneless change detection.

## Critical open questions

- Upstream API audio response may have incomplete MIME for OPUS/AAC; verify
  all formats and fallback handling in a real backend.
- Release packaging including icon schemas, WebView2 and platform frameworks
  remains unverified.
- Model initialization on a remote backend is privileged; consider an explicit
  confirmation gate and timeouts in the next increment.
- Task results are transient in upstream server memory; permanent library needs
  an independent, authoritative data model and safe retention policy.
- Train/dataset routes need full contract enumeration before exposing UI.
- No dependency lockfile or vulnerability scan yet (network/package install
  unavailable in this environment).

**Review verdict:** architecture consistent at source level, **not build-ready
proven**. Continue implementation; do not merge or declare 100% completion.

