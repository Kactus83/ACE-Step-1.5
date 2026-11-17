# ACE Studio — Source checkpoint 10 (17 November 2026)

## Repository and status

- Repository: `Kactus83/ACE-Step-1.5`
- Branch: `feature/ace-studio-angular-tauri`
- PR: https://github.com/Kactus83/ACE-Step-1.5/pull/2, open draft
- Source head before this documentation checkpoint:
  `17e95771dd1813d458119cdb0eecbe4b64320a37`
- Last **verified green** GitHub Actions head: `34b2fd83`
  (16 November 2026); not a qualification of this source tranche.

## Source changes in checkpoint 10

| Commit | Responsibility | Acceptance evidence to obtain |
| --- | --- | --- |
| `d44e805` | Optional read-only API GET `/v1/studio/jobs/{id}`: authenticated lookup, 404 for absent jobs, never schedules a task | `studio_job_lookup_route_test.py` added to Studio Python CI |
| `19c0a42` | Verify and attach known task to Angular Queue without calling `/release_task`; reject duplicate/stale/cross-backend IDs; EN/FR UI | Vitest job IDs and Playwright existing-job browser scenarios |
| `17e9577` | Warn on ambiguous submission response and fix wrong model label selector in Playwright | Extended `backend-error.test.ts`; `job-model-filter.spec.ts` |

The Python legacy `/query_result` returns status 0 and an empty list
for unknown IDs, making simple attachment indistinguishable from a
queued job. The new opt-in existence endpoint relies on the **current**
job store, not a history/discovery API. Its response contains only
task ID and status. A backend restart or retention cleanup may remove it.

## User-facing behavior

1. Ensure Connection points to the original ACE-Step server.
2. Open **Queue & results** → **Attach an existing task by ID**.
3. Enter the **exact server-issued ID** and select Find & attach task.
4. A verified existing task appears in the current session, with
   normal status polling and audio retrieval. No new job is submitted.
5. Unknown IDs, unauthorized access, duplicates and stale cross-server
   lookups do not attach work. The original generation request and
   source media cannot be restored from a manually attached ID.

If a generation submission lost its HTTP response **before the ID was
received**, it may already be running. A bilingual caution is shown,
but this client cannot recover an unknown ID. This needs a separately
designed **idempotency and durable submission receipt** contract on
the Python backend. Do not implement naive automatic retries.

## Execution gate (not yet satisfied)

From the latest exact SHA, execute:

```bash
cd apps/ace-studio
npm ci
npm run lint
npm run test
npm run build
npm run e2e:mock
npm run desktop:build
```

From repository root:

```bash
python -m unittest acestep.api.http.studio_job_lookup_route_test
python -m unittest \
  acestep.api.http.release_task_request_builder_test \
  acestep.api.http.studio_adapter_export_test \
  acestep.api.http.studio_cors_test
```

New Playwright `existing-job-attachment.spec.ts` covers known,
duplicate, missing and cross-server task IDs, with a mock counter proving
zero new `/release_task` calls during attach. Rerun checkpoint 9
regressions and the corrected `job-model-filter.spec.ts`. Obtain a real
local API read-only lookup smoke with authentication enabled, then
actual GPU/audio, desktop download, a11y and packaging QA.

## Outstanding limits

- No task discovery if the acknowledgement and ID were both lost.
- No idempotency guarantee for repeated `POST /release_task`.
- No persistence of server audio files or orphaned/restarted job state.
- No server-side atomic dataset CAS.
- No current-HEAD compilation, full browser suite, Python execution,
  real GPU generation or native acceptance evidence from this session.
- Preserve existing CLI/Gradio and unrelated Python runtime paths.
- Keep PR draft; do not force-push, merge, or claim full acceptance.
