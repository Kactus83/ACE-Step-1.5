# ACE Studio — Source checkpoint 9 (17 November 2026)

## Scope and concurrency

- Repository: `Kactus83/ACE-Step-1.5`
- Head: `6f2bd1aeea450bb8f6a5d6cb613bb218160f96fd`
- Working branch: `feature/ace-studio-angular-tauri`
- Review: https://github.com/Kactus83/ACE-Step-1.5/pull/2 (draft; no merge)
- Last confirmed green GitHub Actions SHA: `34b2fd83` (16 November)
- Changes were made with expected-head Git ref updates, no force-push.

## Code delivered in this continuation

| Commit | Change | New tests |
| --- | --- | --- |
| `418345c` | Queue polling pauses for non-retryable backend failures (400/401/403/404/409); retryable network, 429 and 5xx still use backoff | `polling-fail-closed.spec.ts` (404 and 409) |
| `29e65a1` | Timeout for read-only health/model/stats/task status calls to avoid infinitely stuck polling | `read-only-timeout.test.ts` |
| `6f2bd1a` | Captured dataset connection revision checked after sample preflight and before indexed PUT | `dataset-server-switch.spec.ts` |

No Python inference, Gradio, legacy training, CLI, authorization or native
filesystem APIs were changed in these three commits.

## Verified vs unverified

The prior `34b2fd83` GitHub checks verified Angular/browser mocks, focused
Python contracts, Windows desktop packaging and CodeQL. The latest source
commits have **not** been compiled or executed in this GitHub authoring
environment, and no current-HEAD CI was confirmed when writing this note.
Do not claim a green CI result or 100% acceptance for this source tranche.

To qualify, use the exact head SHA and execute from `apps/ace-studio`:

```sh
npm ci
npm run lint
npm run test
npm run build
npm run e2e:mock
npm run desktop:build
```

Run relevant focused Python regression tests from the repository root.
Retest the three new scenarios together with `auth-recovery.spec.ts`,
`dataset-conflict.spec.ts` and the previous 17 November additions.
Capture toolchain, platform, counts, SHA, exit code and logs.

## Functional boundaries and next priorities

- A client status-lookup timeout is **not** a server job cancellation.
- Stopping retries after a non-retryable response requires an explicit
  successful Connection workflow before polling resumes.
- The dataset guard prevents a delayed preflight from dispatching a write
  to a different endpoint. It does **not** close the concurrent-edit window
  between GET and PUT on the same Python server; that needs backend CAS.
- Next source work: explicit existing-job attachment or failed-acknowledgement
  recovery, model/task compatibility, dataset contention coordination, more
  reliable native audio saves and targeted accessibility improvements.
- Acceptance still requires real GPU inference/analysis/training, real
  WebView downloads, local screen-reader/zoom/contrast, signed installer
  lifecycle and other-platform validation.

Retain draft PR #2. No automatic merge, no force-push, no 100% claim.
