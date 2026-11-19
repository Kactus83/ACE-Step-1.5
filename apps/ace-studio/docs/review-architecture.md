# Contradictory architecture review — API, boundaries and security

**Scope:** source inspection only (no local compiler, browser or Python test execution).
The independent Studio branch targets consolidated fork main
`d207bdd283dc726a0d9c711ca518dcf3accd1381`.

## Findings and authored corrections

1. **Standalone vs Gradio:** client targets audited standalone FastAPI, not
   Gradio-mounted paths assumed to have the same contracts. Python inference
   model initialization is never started implicitly by ACE Studio.
2. **Authenticated audio:** backend audio requires the same bearer policy as
   other routes. UI fetches Blob on user intent rather than assigning remote
   media URLs directly to unauthenticated HTML players.
3. **Packaged WebView CORS:** opt-in fixed local Tauri origins, no wildcard and
   no implicit permission. New dataset editor exposed a separate omission:
   PUT /v1/dataset/sample/{index} was real, but middleware allowed only
   GET/POST/OPTIONS. Added explicit PUT to CORS methods and regression test.
4. **Expert DCW API:** Pydantic accepted tri-state DCW policy, but a former
   request builder omitted forwarding. Builder now carries None/False/True and
   expert parameters, preserving model-specific backend defaults.
5. **Result integrity:** queue uses exact server task IDs and status text;
   extension detection uses server audio path when available. Request + seed
   restoration is explicit; no implicit GPU job is created.
6. **Connection identity:** signals/revision checks guard returned jobs,
   datasets, training and preview state against stale-server results.
7. **Local projects:** a bounded versioned, allowlisted catalog saves
   metadata-only references and tags. Auth keys/media bytes are excluded;
   different backend origins cannot be previewed through the active key.
8. **Training export:** reviewed `train_api_service.py`: the existing endpoint
   calls `shutil.rmtree(export_path)` when destination exists. Client presents
   risk, blocks obvious parent/source overlaps and requires typed OVERWRITE
   plus a second confirmation. It **cannot** prove remote path safety and
   remains subject to backend symlink/permission behavior.
9. **Training metrics:** /status carries real `loss_history` as {step,loss};
   chart uses bounded recorded samples rather than forecasting GPU progress.

## Verification evidence

- Inspected 53 application TypeScript source files through GitHub for local
  relative imports, referenced templates and 200-line module guidance:
  no missing paths or oversize modules at source checkpoint.
- Compared core API DTO fields directly with Python model and route source.
- Added Python, Vitest and Playwright regression *source*.
- **None of these tests, Angular compilation, Tauri builds, real GPU inference,
  screen-reader checks or native packaging has been executed.**

## Open architecture risks

- Browser localStorage is not transactional across multiple tabs; project
  import/add/delete may race. Add revision-aware reconciliation/locking.
- The backend dataset builder is process-global without ETag/optimistic
  versioning. Parallel users can replace/modify another user's active dataset.
- Backend audio may expire; local bookmark is not binary backup.
- Export endpoint can delete an existing destination; client confirmation is
  not server-side path authorization or symlink validation.
- No native OS vault, npm lockfile/security audit, real WebView2/CSP/origin
  matrix, HTTP failure/retry test or GPU compatibility evidence.
- Optional advanced APIs still require contract checks and model-specific
  execution. Do not claim broader Gradio/UI feature parity.

**Verdict:** meaningful source maturity, not yet source-complete or verified
build-ready; keep the PR draft and continue the implementation.

