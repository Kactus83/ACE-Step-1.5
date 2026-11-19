# ACE Studio — local verification and acceptance gates

The source PR was authored through the GitHub connector and independently
qualified on Windows on 15 November 2026. Angular, browser-mock, focused
Python and Windows desktop packaging evidence is recorded below. Real GPU,
real-model, signed-installer and non-Windows acceptance is still pending.
Do not substitute the completed mock coverage for those remaining gates.

## Executed local evidence (19 November 2026, SHA 8ceb2ec)

Windows qualification at exact SHA
`8ceb2ec0634bdc6d6a2144fcfbb9790ff1fb0dae` passed supported Node
`24.22.3` / npm `11.17.0` install, typecheck, lint, production build,
**149 Vitest tests** and **51 Playwright Chromium mock scenarios**. Python
`3.12.16` passed the five focused Studio modules (25 tests, one Windows
symlink skip) and the complete `acestep/api/http` discovery (110 tests, one
skip). Cargo check/test and unsigned x64 MSI/NSIS packaging passed.

The release WebView2 `157.0.4341.60` executable was launched and inspected.
Create, Analyze, Queue and Connection rendered and navigated without starting
GPU work. A pre-existing local API was verified read-only for health,
inventory and stats; real PUT preflights accepted both browser origins and
`http://tauri.localhost`, while rejecting external origins. No real job,
dataset mutation, model initialization, training, export or installer run was
performed. See `local-qualification-2026-11-18.md` for exact commands,
artifact hashes, findings and the acceptance matrix.

## Executed GitHub Actions evidence (16 November 2026, SHA 34b2fd83)

At the exact SHA `34b2fd83feab714bb009d23712015882bf000204`
the GitHub Checks API returned five completed successful checks:
Angular and browser mocks, focused Python contracts, Windows desktop package,
CodeQL and Python analysis. See:
- https://github.com/Kactus83/ACE-Step-1.5/actions/runs/43909020482
- https://github.com/Kactus83/ACE-Step-1.5/actions/runs/43909023222

The PR qualification summary reports **122 Vitest tests and 38 Playwright
mock scenarios** for this exact SHA. These checks supersede the historical
source-only warning through checkpoint 7 but do not prove real GPU
music-generation, signed-installation, accessibility or other-OS success.
The three 17 November commits have **no checks recorded yet**, so that
prior green SHA cannot qualify the new head.

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
saved in localStorage by presets. The source in this historical section was subsequently qualified through
`34b2fd83`; only later changes lack current-HEAD check evidence.

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

These tests were not executed by the web authoring environment itself,
but later GitHub Actions passed at `34b2fd83`. Record toolchain, exit
status, counts and exact SHA for all future changes.

## Endpoint credential isolation regression (17 November 2026 source change)

The Connection form clears its draft bearer token immediately when the URL
field is edited. A new server cannot inherit the previous server's token,
and its credential must be entered explicitly after selecting its address.

- Unit: `tests/unit/connection-credential.test.ts` tests unchanged and edited
  drafts, including partial URL edits.
- Browser mock: `tests/e2e/connection-credential-isolation.spec.ts` connects
  with token A, edits to server B, verifies no bearer secret is forwarded,
  and checks that an explicitly entered token B is used.
- Manual: connect to server A with a disposable token, change its URL, verify
  the field is cleared, check outgoing Authorization headers to server B
  and repeat after entering token B. Check English and French notices.
- Execution evidence is pending until CI or local tests run at the new SHA.

## 17 November source delta — required new test evidence

Additional tests authored on `36a2b6f`, `75e8eaf` and `a3ab529`:
- Unit: `connection-credential.test.ts`, `job-filter.test.ts`,
  `locale-result-details.test.ts`.
- Playwright: `connection-credential-isolation.spec.ts`,
  `job-model-filter.spec.ts`, `result-localization.spec.ts`.
- Manual: validate token A does not reach server B when editing the URL;
  model filtering includes only explicitly recorded models while "All"
  includes tasks with unknown models; newest/oldest ordering uses local
  creation time; EN/FR switching preserves prompt/seed/semantic codes.
- Run complete current-head lint/test/build/mock E2E and relevant Python
  regressions. Verify Windows WebView downloads and UI at 320px/200% zoom.
- **No current-head CI result yet recorded** as of this source update.

## Source-audio backend switch regression (17 November 2026)

Source-only remediation: Create captures its connection revision and refuses
to accept an awaited source-audio Blob or advertise job submission after
credentials/server identity changes. Reusing audio from another backend must
never initiate a new GPU job on a different server.

- Unit: `tests/unit/connection-revision.test.ts` verifies revision updates
  on endpoint and token changes.
- Browser E2E: `tests/e2e/create-source-revision.spec.ts` holds an old
  authenticated audio fetch, changes the Connection endpoint, releases the
  fetch and checks for unintended new-backend submissions.
- Manual: queue a track, select Remix, begin loading its source, switch the
  server while the response is pending and confirm that no new job starts.
- **New tests still require execution and are not considered passing.**

## Non-retryable queue polling policy (17 November 2026)

The client previously recognized HTTP 404 and 409 as non-retryable, yet
continued periodic `/query_result` polling. The queue now pauses on any
classified non-retryable HTTP failure, including 400/401/403/404/409, and
only resumes following a successful explicit Connection workflow. Transient
network failures, HTTP 429 and 5xx retain exponential-backoff retries.

New browser mock regression: `tests/e2e/polling-fail-closed.spec.ts` returns
404 and 409 from `/query_result`, verifies a single lookup despite the
"Check jobs now" action, then explicitly reconnects and confirms a resumed
successful task. The mock-only status switch must not affect Python.

Run these new source tests and the existing `auth-recovery.spec.ts` at the
new exact SHA; no current-head execution is claimed.

## Bounded status-request lifetimes (17 November 2026)

The Angular API adapter now imposes a 15-second first-response timeout on
read-only `/health`, `/v1/model_inventory`, `/v1/stats` and task-status
`/query_result` requests. An unresponsive polling request can therefore
settle and enter the existing retry/backoff path rather than holding the
non-overlap guard forever. The timeout unsubscribes from HTTP only: **it
does not cancel, restart or retry a backend generation job**.

Deliberately excluded: `/release_task` (acceptance can be ambiguous after
a lost acknowledgement), model initialization, training mutations and
audio transfers. Do not assume aborting any of those would undo backend work.

- Unit: `tests/unit/read-only-timeout.test.ts` checks a normal response and
  an indefinitely silent observable using virtual timers.
- Manual: stall `/query_result` with a disposable mock or network proxy;
  confirm one request at a time, a timeout warning after the bound, and
  subsequent backoff without a new generation submission.
- Run the complete current-head suite; this source change has no executed
  CI/local test evidence yet.

## Cross-server dataset edit preflight (17 November 2026)

A Dataset sample edit reads the current server snapshot before a PUT.
Previously, changing the Connection endpoint while this GET was pending
could direct the subsequent PUT to a different server. The dataset store
now checks its captured connection/generation token **after** preflight
resolution and **before** issuing any mutation. Stale responses are discarded;
they do not update dataset UI state or silently replace new-server metadata.

- Regression: `tests/e2e/dataset-server-switch.spec.ts` suspends the old
  server's preflight GET, changes the Connection to a different mock origin,
  resumes the GET and asserts zero PUT requests to the new server.
- Also rerun `dataset-conflict.spec.ts` for same-server concurrent edits.
- Real server-global dataset changes remain non-atomic without backend CAS.
  This check prevents cross-server writes; it is not a multi-user lock.
- Current-HEAD compilation and browser test evidence are still required.

## Verified existing-job attachment (17 November 2026 — checkpoint 10)

The legacy `POST /query_result` returns `status=0, result="[]"`
for **both nonexistent task IDs and some queued tasks**. A raw ID lookup
therefore cannot be safely validated with that contract alone.

An **additive, authenticated and read-only** API route,
`GET /v1/studio/jobs/{task_id}`, now checks the current in-memory
Python job store. It returns only `task_id` and its server-owned phase in
the normal envelope, 404 if not found, 400 on malformed IDs and 401 when
authentication is required and missing. It never accepts a prompt,
uploads audio, changes status or launches any inference. The legacy
generation, query and Gradio behavior are untouched.

From Queue & results, open **Attach an existing task by ID**. Supply the
exact ID from the **same backend**. Angular first verifies the task
with this new route and then adds it to the local tracked queue; further
updates use the existing `POST /query_result` read-only lookup. Invalid,
missing, duplicate and mismatched IDs are rejected. Changing endpoint or
credential while verification is in flight invalidates the attachment.
The local entry time is not asserted to be the backend creation time.
Original submission settings are unavailable, so parameter/seed restore
is disabled, though safe audio preview or download may still be available.

**Lost acknowledgement boundary:** A response can be lost *after* the
server accepts `POST /release_task`. For ambiguous network/5xx/unknown
submission failures, the user now sees a bilingual warning not to
automatically resubmit. Attachment is only possible if the task ID is
known independently. This flow **does not** discover tasks or invent an
ID; it cannot solve ambiguity without a future server idempotency key
and discovery contract.

Targeted regression authored:
- Python: `python -m unittest
  acestep.api.http.studio_job_lookup_route_test` (known, unknown,
  malformed and unauthorized; no new jobs). Added to Studio CI.
- Vitest: `tests/unit/job-attachment.test.ts`,
  `tests/unit/backend-error.test.ts` (valid/mismatched IDs,
  ambiguous vs definite submission failure).
- Playwright: `tests/e2e/existing-job-attachment.spec.ts`
  (known/duplicate/unknown, read-only no duplicate `release_task`,
  stale response after switching backend).
- Corrected the existing `job-model-filter.spec.ts` to use the real
  accessible model label `Model`, instead of `DiT model`.

Manual acceptance: generate once on a disposable API and capture the
server task ID; restart the browser (not the backend), manually attach
it, observe terminal audio/analysis without a second generation
submission. Try an unknown ID and a different backend; assert no
phantom queued job or credential leak. Inspect network traffic:
attachment uses `GET /v1/studio/jobs/<id>` and `POST /query_result`,
never `POST /release_task`.

The route only recognizes jobs still present in the **current Python
process store**. A restart or retention cleanup can make old IDs
unavailable. This does not persist server-generated audio or bypass
retention. Older standalone servers without this route must be updated
before the UI can verify attachment.

**No new-source tests or current-head GitHub CI were executed by this
source-only authoring session.** Run full lint, build, Vitest, browser,
focused Python and Windows Tauri packaging from exact current HEAD.

## Non-negotiable release gate

Draft PR stays unmerged until the remaining real API/GPU, visual,
multiplatform and full-regression gates are completed, remaining security
issues are addressed, CI reviewer signs off and user explicitly authorizes
promotion. Local mock and packaging evidence is not a production certificate.


## 18 November — model selection and actual DiT provenance (checkpoint 11)

The Create workspace now uses the current server's validated inventory to
allow only explicitly advertised task modes on a **loaded** DiT. An explicitly
selected, available-but-unloaded model no longer silently falls back to the
primary model. Explicit DiT initialization remains a separate two-step user
action in Connection. There is no automatic model download or GPU work.

The Python `/query_result` store-result serialization now conditionally
forwards a validated `dit_model` into each audio variant's `metas`, when the
existing generation result actually reports it. The original result remains
unchanged. Studio compares this against an explicit submitted model and
warns if they differ. No model is inferred for absent metadata or old
cache-derived results. The Python change intentionally preserves the legacy
response shape and optional field behavior.

**New tests (authored, not yet executed on latest SHA):**

- `tests/unit/model-policy.test.ts`: selection, loading, task capabilities
  and stale mode/model switching.
- `tests/e2e/model-fallback-guard.spec.ts`: prevent unloaded-model and
  incompatible-mode submissions, without additional `/release_task` calls.
- `tests/e2e/job-model-filter.spec.ts`: mock now explicitly represents
  two loaded models instead of relying on silent server fallback.
- `tests/unit/reported-model.test.ts`: compare only trustworthy reported
  model names; ignore absent/invalid metadata.
- `tests/e2e/reported-model-mismatch.spec.ts`: display discrepancy with
  server-reported actual DiT and exactly one GPU-submission mock request.
- `acestep.api.http.query_result_route_test`: positive server provenance
  serialization. Also rerun all existing Python route and source regressions.

Run, from `apps/ace-studio`, `npm ci`, `npm run lint`,
`npm run test`, `npm run build`, `npm run e2e:mock`,
`npm run desktop:build`; and, from repository root,
`python -m unittest acestep.api.http.query_result_route_test` plus all
focused Python contracts. Capture the exact SHA and real result logs.

**Limits:** The inventory is a snapshot and a separate client-side check
cannot guarantee atomic model selection on a concurrently changing server.
A legacy cache hit may omit `dit_model` even when the in-memory job store
has it. Real server GPU model provenance and multi-slot/on-demand model
routing remain a mandatory local acceptance test. Do not claim CI green or
100% release readiness before the new SHA is qualified.

## 18 November — in-flight submission isolation across backend switches

A generation request may have been accepted server-side while its
`POST /release_task` HTTP acknowledgement remains unresolved. When
Connection switches endpoint or credentials, `JobsStore.resetSession()`
now invalidates the old submission generation and releases the
**new** session's submit UI lock. The old asynchronous `finally` may
not clear the submitting state of a later request. Old acknowledgements
and errors cannot register tasks in a different backend session.

The polling result mapping was extracted to the pure
`job-result-reducer.ts` module to retain the project 200-line
source cap and preserve existing result/analysis semantics.

- Vitest: `tests/unit/job-result-reducer.test.ts` covers successful
  results, malformed payloads and missing progress without mutating input.
- Playwright: `tests/e2e/submission-backend-switch.spec.ts` holds
  submit A, switches backend, holds submit B, releases A and verifies
  that B remains pending; then releases B and confirms B alone is tracked.
- **Important:** this intentionally does not cancel A's Python
  computation or re-submit it. With a lost ACK, acceptance is ambiguous.
- Run with the rest of checkpoint 11/current-head suite locally before
  claiming any qualification evidence.

## 19 November — source checkpoint 12: per-variant seed + legacy-cache parity

The executed local Windows qualification **still applies only to SHA
`8ceb2ec`**. Later source changes have not yet been executed by
that local team. Source commits `ff558c6` and `a4d864a` plus
a small precedence clarification:

1. Store-derived `/query_result` response projection preserves
   optional bounded `generation_info` and exactly aligned per-audio
   `seed_value`, using a focused Python helper. Real server analysis
   output remains unchanged.
2. The legacy local-cache response has priority over the job store.
   It repeats the entire comma-separated batch seed list for every
   variant and reports actual `dit_model` at top level. Angular
   now normalizes this *existing* response without modifying the
   cache writer or other legacy clients. No seed is assigned where
   matching is ambiguous.
3. Tests added: Python `query_result_audio_projection_test`,
   extended `query_result_route_test`, Vitest
   `task-variant-provenance.test.ts`, expanded
   `api-decoder.test.ts` and `restore-request.test.ts`;
   Playwright `legacy-cache-provenance.spec.ts`.

Rerun full current-head build/typecheck/lint/Vitest/Chromium, Python
HTTP/API tests and Windows Tauri smoke; capture exact SHA/evidence
in a new qualification record. Source contract and tests are not
a substitute for a real GPU batch with server-reported actual seeds
and DiT. Native `Alt+2` remains a manual verification gap;
do not claim a bug or change a global shortcut without evidence.
Detailed mandate: `source-checkpoint-12.md` and
`local-ci-followup-2026-11-19.md`.
