# ACE Studio — Source checkpoint 11 (18 November 2026)

## Scope and current verification boundary

- Repository: `Kactus83/ACE-Step-1.5`
- Branch: `feature/ace-studio-angular-tauri`
- Pull request: https://github.com/Kactus83/ACE-Step-1.5/pull/2 — **draft**
- Baseline before this tranche: `6a3f3d945083630ecbe362c4f9a1b85ea91e2a95`
- Source commits: `6c0d589` (model policy), `7ee2f97` (actual
  provenance), followed by a one-line Python regex fix.
- Last confirmed green GitHub Actions SHA: `34b2fd83`
  (16 November 2026). This does **not** qualify the latest changes.

## Problem 1 — actual DiT selection

The existing Python `select_generation_handler` may fall back to its
primary handler when a requested model is not loaded, depending on backend
configuration. Previously Studio displayed available models and sent an
explicit `model` request even for unloaded entries.

Create now has a pure `model-policy.ts` validator, independent from
HTTP and the UI, that uses authoritative `/v1/model_inventory` entries
to refuse:

- missing model inventory or default name;
- an explicit model absent from the inventory;
- a model reported available but not loaded;
- a task mode not advertised for the selected model.

Supported mode options use the selected model's advertised task types,
without adding an invented `text2music` fallback. Localized
explanations are displayed and the Generate action is disabled.
The Connection screen remains the sole explicit DiT initialization
path. On-demand model loading is not assumed safe from an inventory
snapshot; avoiding unexpected fallback is prioritized.

## Problem 2 — requested vs actual DiT evidence

The Python `/query_result` service already had the true `dit_model`
inside its completed generation record but projected only a small
subset of metadata into the audio variant list. Its store-result
projection now forwards a validated, optional model name as
`metas.dit_model`. No new GPU work, API route or external upload is
introduced. Cache-derived results and older jobs may not contain it.

Angular Queue now compares a submitted explicit model with the actual
server-reported model, and shows a localized warning **only for a
verified discrepancy**. It does not infer the model from a filename,
task mode, backend default or missing field.

## Added regression cases

| Test | Purpose |
| --- | --- |
| `tests/unit/model-policy.test.ts` | Loaded vs unloaded, unknown, unsupported mode |
| `tests/e2e/model-fallback-guard.spec.ts` | Zero duplicate submissions when refusing model/mode |
| `tests/e2e/job-model-filter.spec.ts` | Two loaded DiT fixture for model filtering |
| `tests/unit/reported-model.test.ts` | No fabricated model identity, bounded valid names |
| `tests/e2e/reported-model-mismatch.spec.ts` | Reported mismatch with exactly one submission |
| `acestep.api.http.query_result_route_test` | Real Python store-result metadata projection |

## Qualification commands

Use latest HEAD after all commits land. Under `apps/ace-studio`:

```sh
npm ci
npm run lint
npm run test
npm run build
npm run e2e:mock
npm run desktop:build
```

At repository root:

```sh
python -m unittest   acestep.api.http.query_result_route_test   acestep.api.http.studio_job_lookup_route_test   acestep.api.http.release_task_request_builder_test   acestep.api.http.studio_adapter_export_test   acestep.api.http.studio_cors_test
```

Capture exact SHA, platform/toolchain, test counts, exit status, logs
and screenshots where appropriate. Also validate actual per-job DiT
routing on GPU, both configured multiple-slot models and the
on-demand loading option, and whether legacy cache hits omit actual
provenance. Check native WebView audio playback/download.

## Residual risks

- Client inventory can become stale between preflight and backend
  execution; **server-side strict routing would be the stronger
  guarantee** but is not added here to avoid altering legacy clients.
- Legacy cached jobs can omit optional actual-model metadata.
- Background queue, job attachment, dataset CAS, training, audio
  codecs, signed installer, a11y and OS acceptance remain independent
  release gates. No current-head compilation/CI has yet been verified.

Keep PR #2 open draft. No force-push or automatic merge; never declare
full acceptance based on source authored alone.
