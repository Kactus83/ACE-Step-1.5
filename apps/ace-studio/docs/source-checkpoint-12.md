# ACE Studio — Source checkpoint 12 (19 November 2026)

## Evidence boundary

- Repository: `Kactus83/ACE-Step-1.5`
- Branch: `feature/ace-studio-angular-tauri`
- PR: https://github.com/Kactus83/ACE-Step-1.5/pull/2 — **open draft**
- Last independently **executed** Windows qualification:
  `8ceb2ec0634bdc6d6a2144fcfbb9790ff1fb0dae` (19 November 2026).
  Angular typecheck/lint/build, 149 Vitest, 51 Chromium mock scenarios,
  110 Python HTTP/API tests (one skip), Cargo and unsigned MSI/NSIS passed.
  Browser/native startup and read-only API/CORS were inspected. This is not
  approval of a release or a green GitHub Actions workflow.
- New code is **source-authored only** until another local qualification
  run is captured against the exact later commit.
- Checkpoint commits: `ff558c6` (Python store projection), `a4d864a`
  (Angular legacy-cache adaptation), followed by a small additional
  precedence clarification in this documentation checkpoint.

## Problem: seeds and executed DiT lost or mislabeled along real API paths

ACE-Step generates `seed_value` (comma-separated seeds for a batch),
`generation_info` and `dit_model` on completion. The legacy
`/query_result` route can retrieve the completed payload from either
the in-memory job store or a cache. Crucially, **the cache takes precedence**:

1. Store-derived projections previously discarded the seed and generation
   summary. They now use a separate `query_result_audio_projection.py`
   module to forward bounded server-provided fields, aligning individual
   seeds to the corresponding `audio_paths`. Invalid/mismatched seed lists
   are omitted rather than attributed to the wrong variant. Optional
   validated `metas.dit_model` remains supported.
2. Cache-derived projections retain the legacy format, where each audio
   variant repeats the entire comma-separated `seed_value`, and the
   actual `dit_model` is a top-level field rather than
   `metas.dit_model`. Studio now normalizes these two proven source
   shapes via the pure `task-variant-provenance.ts` helper during
   `decodeTask`. It derives a per-variant seed only for an exact
   numeric, one-to-one correspondence. Canonical direct server
   `dit_model` takes precedence if a nested metadata copy disagrees.
3. Both paths retain safe audio URL, no automatic resubmission, current
   request/seed restoration and the verified model mismatch warning.
   Neither path invents model identity or media persistence.

This is a **read-only result representation change**. It does not
start inference, change the scheduler or alter the legacy
`update_local_cache` writer used by Gradio and other clients.

## Focused regressions added

- Python: `acestep.api.http.query_result_audio_projection_test` —
  distinct batch seeds, invalid/mismatched counts, optional model and
  bounded generation summary; `query_result_route_test` now checks a
  store-derived seed and generation summary.
- Vitest: `tests/unit/task-variant-provenance.test.ts` —
  legacy repeated batch seed list, model from top-level, distinct
  store-format seeds, malicious metadata rejection and precedence.
  Existing `api-decoder.test.ts` and `restore-request.test.ts`
  expanded to assert preserved generation summaries and seed reuse.
- Chromium mock: `tests/e2e/legacy-cache-provenance.spec.ts` —
  simulate cache-format response, verify each displayed variant seed,
  actual DiT mismatch and **exactly one** submit.
- CI: changed-path triggers now cover the new projection module and
  tests; focused Python contract list includes the new test module.

## Local verification gate

On the updated HEAD, from `apps/ace-studio`:

```sh
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e:mock
```

From repository root using existing Python 3.12 environment:

```sh
python -m unittest \
  acestep.api.http.query_result_audio_projection_test \
  acestep.api.http.query_result_route_test \
  acestep.api.http.query_result_route_http_test
```

Then rerun `python -m unittest discover -s acestep/api/http -p '*_test.py'`
and the full Studio suites. Build and inspect Tauri as needed. Record
full command logs, exit codes, counts and SHA, in a new **appended**
qualification record; never rewrite the 19 November evidence as if
the new SHA were tested.

## Independent runtime and acceptance gaps

- A new real GPU job requires explicit operator approval. On a
  disposable server only, verify generated 1- and 2-variant
  `seed_value` against the actual Python job result, cache/store
  projection and `withResultSeed` restoration. Verify the real DiT
  routed versus the explicitly selected model. Do not retry a
  generation automatically after an ambiguous acknowledgement.
- Real audio/WebView2 codec/download behavior remains unverified.
- The native `Alt+2` automation produced no navigation. Browser
  `Alt+3` passed, so no unproven native shortcut fix was made.
  Manually check window focus, text input focus, OS shortcut interception
  and `event.code` on the actual WebView, then repair only with evidence.
- No completed dataset CAS, durable server media, signed installer,
  cross-OS release or human a11y qualification is claimed.
- Keep PR #2 draft, no merge and no force-push.
