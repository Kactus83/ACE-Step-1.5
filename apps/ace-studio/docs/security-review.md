# ACE Studio — Security and compatibility review

Source-level review only; **not a penetration test, compiled audit or release approval**.

## Enforced trust boundaries

1. **Backend identity:** only explicitly selected HTTPS or loopback HTTP;
   API key remains session-only. Endpoint or credentials changes invalidate
   stale task, model, dataset, training and audio states.
2. **Untrusted responses:** inventories, job statuses, references, task IDs,
   counters and envelope shapes are checked before display or use. Angular
   displays backend descriptions as escaped text, never dynamic HTML.
3. **Audio:** authenticated Blob download, exact origin and route allowlist.
   Audio URLs and generated output references are not native file permissions.
4. **Local catalog:** versioned whitelisted metadata, no persisted tokens or
   audio bytes. Cross-tab storage events propagate remote changes and stale
   writes are refused when detected. A localStorage check is not atomic,
   so a simultaneous-millisecond race remains possible.
5. **Tauri:** shared Angular Web and desktop frontend; no generic native
   filesystem/shell permission. Fixed desktop CORS origins require explicit
   backend opt-in. CORS is not authentication.
6. **Server-side files:** data scan, tensor preparation and training accept
   authenticated server filesystem paths, not paths to the browser computer.
7. **Safe adapter export:** Studio calls only authenticated
   `POST /v1/studio/training/export`. The additive endpoint validates
   source/target overlap, refuses empty source, existing destinations and
   source-contained symlinks. Copytree has non-overwrite semantics; the
   **legacy `/v1/training/export` retains its existing deletion behavior**
   for older consumers, but Studio never uses it.
8. **Resource consent:** DiT and 5Hz-LM initialization need two matching
   clicks; sample-mode lazy LM initialization warns before submitting when
   the LM is not ready. No silent inference process starts.

## Residual risks

- The new export route has no atomic OS-level sandbox: filesystem permission,
  parent-symlink races and other processes on the Python host require a trusted
  operator environment. No privilege escalation or broad native permission is
  intended.
- Browser localStorage is unencrypted and can contain user prompts, lyrics,
  annotations, tags, model names and temporary backend audio paths. These
  should not be used as sensitive-secret storage.
- Server-global datasets are not tenant-separated; concurrent users can
  replace or edit a single working dataset.
- Python result retention remains temporary; a local bookmark does not
  guarantee audio availability. Download important results separately.
- No formal dependency scan, browser CSP/WCAG review, WebView packaging,
  real codec validation or GPU acceptance has been performed.
- The existing legacy destructive export route is still reachable with
  appropriate API authorization; deployments should restrict privileged
  API access and server filesystem permissions.

## Acceptance before merge

Verify real 401/403/404/409 behavior, blocked cross-origin URLs, CORS preflight
PUT, safe-export conflicts and symlink test, local-storage corruption and
multi-tab races, model initialization resource use, native CSP/permissions,
screen reader, contrast, responsive layouts and the original Python CLI/Gradio.

