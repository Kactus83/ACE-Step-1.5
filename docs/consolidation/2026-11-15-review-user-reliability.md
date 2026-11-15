# Contradictory Review 2 — User flows and reliability (2026-11-15)

## Method

Independently examined first-run behavior, happy paths, recovery, session interactions, source audio, reproducibility, exports and non-target surfaces. Focused on whether visible user controls are wired and whether a failure can lose audio or corrupt the advanced state. No live Gradio/browser/GPU session was available for this review.

| Scenario | Candidate behavior / expected invariant | Evidence and pending action |
|---|---|---|
| First launch with flag off | Historical advanced UI only | Source flag default off; visually check |
| First launch with flag on, no loaded model | Simple Create disabled; Advanced settings load model | Readiness source/test; click browser |
| Model already loaded | No reinitialization or model choice override | Readiness helper has no init call; verify actual runtime |
| Return Advanced -> Simple | Same model, state restored, button refreshes | Event handler source; test two switches |
| Simple -> Advanced | Advanced results in original tab; eight slots remain | Source composition; verify batch UI |
| Generate instrumental | `[Instrumental]` sentinel, no lyrics overwrite | Regression test added; run DiT |
| Generate with lyrics | Lyrics passed to shared progress handler | Positional adapter static; generate |
| Generate with no description and no source | Recoverable Done/error, no backend request | Preflight source; click |
| Generate with source (Remix) | Cover task, no LM text drafting, source not leaked to later text2music | Source check; two successive runs |
| Optional LM unavailable/exception | Continue without optional sample drafting when possible | Source fallback; test no LM and injected fault |
| Model unloaded during session | Recoverable error instead of silent reinit | Test with deliberate unload |
| Failure during generation | Exit Creating and show localized error | Error tuple source; inject mocked error |
| Earlier audio exists and later sample fails | Existing player remains accessible | Failure helper uses skip for existing audio; verify browser |
| Successful MP3 export | Native format and JSON correct | #1313 adaptation; run with ffmpeg |
| MP3 export missing/timeout | WAV survives and clearly labeled degraded status | #1313 adaptation; inject ffmpeg failures |
| Generic synthesis/file failure | Does not falsely claim success | Test and inspect UI |
| Batch reduced by VRAM | Metadata records effective emitted count | #1357 tests; run relevant mocked cases |
| Fixed seed + same inputs | Seed metadata matches DiT, crop stable | #1357/#1283 partial; LM backend determinism NOT guaranteed |
| Multiple sequential Simple generations | Append only to Simple session queue | Source and mock; exercise several songs |
| Advanced queue after Simple generation | Unmodified eight-slot history | Separated Gradio states; runtime inspect |
| Change UI level mid-generation | No silent model reload/cross-mode state corruption | **Runtime race unverified**, keep flag off by default |
| Browser native download | Download actual audio, no unsafe cross-origin JS | Gradio Audio built-in `download`; click Windows/macOS |
| Restore settings from existing metadata | Historical loader intact | No loader removal; test with WAV fallback metadata |
| Service mode | New UI must remain disabled, existing API unaffected | `enable_simple_ui and not service_mode`; run service mode |
| Dataset / LoRA / LoKr | Training tabs and callbacks retained | Source presence; smoke test UI |
| Touch/mobile/keyboard | Keyboard/focus, scroll, contrast and narrow viewport usable | CSS/design only; **manual inspection required** |
| Italian locale | Existing keys translated; new Simple keys fall back to English | i18n source verified; launch `--language it` |
| Filesystem and uploads | Gradio allowed-path restrictions and original file naming unchanged | No new delete handler; security smoke test |

## Residual usability risks

1. Simple flow is opt-in and may need styling fixes after real responsive/keyboard testing.
2. No persistent project library or cross-session browsing is supplied; do not label this feature complete.
3. Error handling is defensive but data-flow callbacks remain event-driven; parallel requests and mid-run switching require explicit stress tests.
4. LM full determinism cannot be claimed from crop seeding.
5. Audio save paths must remain within configured Gradio allowed locations; test on Windows and Linux.
6. Only the local verifier can inspect GPU initialization, actual playback and service mode under real deployment conditions.

**Review 2 verdict:** No unsupported production-readiness claim; **visual, functional and hardware execution remain necessary**.
