# Security and compatibility review (source-level, not penetration testing)

## Trust boundaries

1. **Backend identity:** explicit validated HTTPS or loopback HTTP base URL,
   session-only API key in memory; changing endpoint/credentials invalidates
   stale jobs, training/dataset displays and audio previews.
2. **Protected results:** authenticated Blob fetch through the configured
   origin and exact `/v1/audio?path=...` route. Arbitrary external URLs,
   custom protocols and mismatched origins must not receive credentials.
3. **Persistence:** localStorage holds only endpoint, appearance, whitelisted
   presets and an explicit versioned local metadata catalog. It may contain
   private lyrics, prompts, notes, tags and backend references, **unencrypted**;
   there is no secure desktop keychain, remote sync or persisted audio binary.
4. **Tauri host:** one shared Angular app, no native shell/filesystem commands
   or arbitrary local file permissions. Packaged Tauri webviews require
   operator-enabled fixed CORS origins; CORS is *not* authentication.
5. **Server files:** dataset scanning, tensor validation/training and adapter
   export accept server-side user-entered paths. They are processed by Python,
   not browser filesystem operations. Security and permissions are ultimately
   backend responsibilities.
6. **Destructive export:** ACE-Step removes an existing destination folder
   when exporting LoRA/LoKr. The Studio client warns clearly, rejects obvious
   root/overlapping/traversal paths, demands typed OVERWRITE and double click.
   UI path checks cannot prevent symlink aliasing or establish if a server
   directory already exists. The backend must be protected by OS permissions.
7. **CORS method:** explicit GET/POST/**PUT**/OPTIONS permits actual sample
   metadata editing from a browser, without adding wildcards or trusting input.

## Unresolved release risks

- Verify API 401/403/429, source audio codec handling, malicious response
  envelopes/filenames, expired audio paths and cross-origin behavior.
- Review raw `/v1/training/export` permissions and symlink/overwrite behavior
  for remote or multi-user deployments; never treat frontend confirmation as
  sufficient security boundary.
- Add storage revision policy for concurrent tabs and explicit recovery from
  corrupted local metadata; protect prompts/notes on shared computers.
- Confirm Angular content-security policy, Tauri WebView2 origin and native
  capabilities across platforms.
- Run dependency security scan, browser accessibility checks and a local
  security review. No penetration test or runtime assurance has been obtained.

No silent Python process creation, model initialization, credential storage,
network wildcard or automatic GPU job has been added by the Studio frontend.

