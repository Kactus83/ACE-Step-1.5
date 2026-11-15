# ACE Studio — local verification and acceptance gates

The source PR was authored through the GitHub connector. It has **no
successful build, unit-test, browser or GPU execution evidence** yet.
Do not substitute source review for command exit codes.

## Local toolchain and dependency evidence

From `apps/ace-studio` on a trusted development workstation:

```sh
node --version
npm --version
npm install
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run e2e:mock
npm run desktop:build
```

Record command, exit status, logs and OS versions. Inspect exact npm dependency
versions, generate/review/commit `package-lock.json` before reproducible `npm ci`.
For desktop packaging record `rustc --version`, `cargo --version`, WebView2/
GTK/macOS prerequisites, icon validation, CSP and signed/unsigned install tests.

From repository root with the compatible Python environment:

```sh
uv run python -m unittest acestep.api.http.studio_cors_test
uv run python -m unittest acestep.api.http.release_task_request_builder_test
uv run python -m unittest discover -s . -p "*_test.py"
git diff --check main...feature/ace-studio-angular-tauri
```

Do not run GPU training or overwrite any real dataset directories during
normal unit/browser mock testing. Use disposable temp paths and isolated mock
instances. Never treat the fake mock WAV as evidence of inference quality.

## Browser and API functional matrix

1. Confirm connection URL normalization, bearer credentials and recovery
   after disconnect, wrong token, backend change and in-flight old requests.
2. Verify model inventory, default model selection and opt-in /v1/init.
3. Generate real text2music with instrumental/lyrics and exact seed. Check
   batches, timeouts, full queued/running/failed/succeeded states and audio.
4. Validate Cover, Repaint, reference upload, waveform/slider boundaries,
   base-only Extract/Lego/Complete and every expert setting on suitable models.
5. Verify explicit DCW model defaults, forced-on double confirmation, scheduler
   and LM/CoT request fields with real API and actual GPU.
6. Validate job filter, detailed returned metadata, recovery IDs,
   result-to-edit, settings/seed restore and **no auto resubmission**.
7. A/B: source and local bookmark selection, audio origin isolation,
   approximate group start and truthful non-sample-accurate description.
8. Local library: create/edit/delete project, favorite/tag/note, full browser
   reload, import/export, malformed/oversized archives, storage quota and
   simultaneous tabs. Verify bookmarks do **not** preserve audio binaries.
9. Dataset: scan/load/save, PUT sample metadata from an actual browser
   (CORS OPTIONS includes PUT), async label and preprocess, latest-task status,
   server-global collisions and backend permission errors.
10. Training: tensor validation, LoRA and LoKr start double-confirmation,
    graceful stop, loss plot from real server points, log truncation.
11. Export: verify typed OVERWRITE, double confirmation, same/overlapping/root
    directories rejected; perform actual export only to a throwaway destination.
    The backend deletes an existing destination; verify permissions and
    symlink behavior separately.
12. Run keyboard/screen-reader checks, skip link, light/dark contrast,
    zoom up to 200%, reduced-motion preference, mobile viewports, 320px width,
    media input labels and native WebView desktop controls.
13. Confirm Gradio, Python CLI, model inference and Python training workflows
    are unchanged apart from reviewed additive API compatibility fixes.

## Non-negotiable release gate

Draft PR stays unmerged until all source scope is completed, actual Angular,
Python, Rust, Web/desktop and GPU test evidence exists, remaining security
issues are addressed, CI reviewer signs off and user explicitly authorizes
promotion. A source-level feature matrix is not an acceptance certificate.

