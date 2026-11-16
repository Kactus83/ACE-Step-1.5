# ACE Studio — local verification and acceptance gates

The source PR was authored through the GitHub connector and independently
qualified on Windows on 15 November 2026. Angular, browser-mock, focused
Python and Windows desktop packaging evidence is recorded below. Real GPU,
real-model, signed-installer and non-Windows acceptance is still pending.
Do not substitute the completed mock coverage for those remaining gates.

## Executed local evidence (Windows)

- Node `24.22.3` / npm `11.21.2`: clean `npm ci` succeeded from the committed
  lockfile; `npm run build` and `npm run lint` succeeded.
- Vitest `4.1.12`: 19 files, 78 tests passed.
- Playwright Chromium: 20 mock-backend browser scenarios passed, including
  creation/audio, datasets, training/export, keyboard navigation and
  cross-tab catalog synchronization.
- Rust `1.93.0`: `cargo check --locked` and `cargo test --locked` succeeded
  (the minimal shell currently contains no Rust unit tests).
- `npm run desktop:build` produced an unsigned x64 MSI and NSIS installer.
- The packaged release executable was launched in the real Windows WebView;
  dark-theme layout, sidebar/panels, Create and Connection navigation, and the
  truthful disconnected state were visually inspected. This caught and fixed
  Angular critical-CSS loading being blocked by the strict Tauri CSP.
- Python `3.13.7`: the three focused Studio/API unittest modules ran 18 tests
  successfully with one platform/symlink skip. The repository targets Python
  3.11–3.12, so this is additive evidence rather than the supported matrix.
- `npm audit --omit=dev`: zero production vulnerabilities. The full audit
  reports 21 moderate development-tool findings whose offered remediation is
  an unqualified Angular CLI 22 major upgrade; these remain documented.

Not executed: full Python discovery, real ACE-Step model/GPU generation or
training, signed installer installation, comprehensive WebView interaction,
macOS or Linux packaging, screen-reader and human contrast review.

## Local toolchain and dependency evidence

From `apps/ace-studio` on a trusted development workstation:

```sh
node --version
npm --version
npm ci
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run e2e:mock
npm run desktop:build
```

Record command, exit status, logs and OS versions. The npm and Cargo
lockfiles are committed from the prior Windows qualification; prefer
reproducible `npm ci` and `cargo --locked` verification.
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
11. Export: verify typed EXPORT, double confirmation, same/overlapping/root
    directories rejected; perform actual export only to a throwaway destination.
    Studio's separate endpoint rejects existing destinations and is
    fail-closed until `ACESTEP_STUDIO_FILE_ROOTS` is configured. The legacy
    `/v1/training/export` deletes existing destinations; Studio never calls it.
12. Run keyboard/screen-reader checks, skip link, light/dark contrast,
    zoom up to 200%, reduced-motion preference, mobile viewports, 320px width,
    media input labels and native WebView desktop controls.
13. Confirm Gradio, Python CLI, model inference and Python training workflows
    are unchanged apart from reviewed additive API compatibility fixes.

## Incremental validation required after the prior Windows checkpoint

The source commits following `20286b7018469e1700874b25eaad766726236f97`
introduce an independent Analysis workspace, code-control reuse, corrupted
catalog recovery, partial EN/FR navigation and progress reporting.
Re-run `npm ci`, lint, Angular build, all Vitest and Playwright mock scenarios
at the *current branch HEAD*, not just the earlier locally qualified SHA.

Specifically verify `tests/e2e/analysis.spec.ts`,
`analysis-codes-reuse.spec.ts`, `library-recovery.spec.ts`,
`locale.spec.ts` and all previous regression suites. Verify non-audio
tasks show metadata without an audio player and extracted codes are never
saved in localStorage by presets. New source has **no executed test evidence**
until the local team records new exit codes and logs.

For real GPU acceptance, exercise extract codes, deep analysis, 5Hz LM metadata
and code-controlled text2music on a disposable model setup. Do not infer
backend support from mock responses.


## Checkpoint 7 delta — not covered by the Windows baseline

Source commits after `111bd004caadb43c48e451396e7083b22e791c31`
introduced the typed bilingual Queue/Batch/A-B and Library UI, localized date
display, dedicated translation dictionaries, and backend-change A/B media
invalidation. The independent Windows team's earlier build/test evidence
remains valid **only for the earlier SHA**, not the new branch HEAD.

Run the entire existing suite at current HEAD and specifically include:
- Vitest: `locale-workspaces.test.ts`, `localized-date.test.ts`,
  `batch-navigation.test.ts`, `job-session-codec.test.ts`,
  `dataset-edit-guard.test.ts`, `backend-error.test.ts`.
- Playwright mock: `localized-workspaces.spec.ts`,
  `batch-navigation.spec.ts`, `dataset-conflict.spec.ts`,
  `auth-recovery.spec.ts`, `comparison-connection.spec.ts`.
- Manually switch EN↔FR while Queue, A/B and a saved project are open.
  Confirm user metadata, seeds, IDs and backend error messages remain
  unchanged; inspect long French buttons at 320px width and 200% zoom.
- Verify an authorization failure cannot be bypassed by the queue's
  "Check jobs now" button; reconnect through Connection to re-enable polling.
- Verify that switching endpoint/token invalidates loaded A/B audio immediately.

**None of the tests in this checkpoint were executed by the web authoring
environment.** Record toolchain, exit status, test counts, SHA and logs after
the next local team validation pass.

## Non-negotiable release gate

Draft PR stays unmerged until the remaining real API/GPU, visual,
multiplatform and full-regression gates are completed, remaining security
issues are addressed, CI reviewer signs off and user explicitly authorizes
promotion. Local mock and packaging evidence is not a production certificate.

