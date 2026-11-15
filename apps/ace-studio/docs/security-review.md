# Security and compatibility review (source-level, not penetration test)

## Trust boundaries

1. **Untrusted backend content** is decoded by explicit envelope and result validators;
   Angular interpolations escape text by default. Backend URLs for audio are
   confined to the exact configured origin and `/v1/audio?path=...` route.
2. **Credentials:** the API token remains in an Angular signal (session memory)
   and is attached only to explicitly targeted backend requests; not saved in
   `localStorage`, URL parameters, docs, logs or Git.
3. **Transport:** plain HTTP endpoints are limited to loopback. Remote endpoints
   must use HTTPS; the application does not trust an arbitrary HTTP service.
4. **Tauri:** no file/shell commands or plugin permissions. `core:default`
   is the only native capability. The frontend does not execute Rust commands.
5. **Backend file safety:** /v1/audio already confines paths to its temp audio
   directory. Studio does not construct arbitrary backend filesystem paths.
6. **CORS:** `ACESTEP_ENABLE_STUDIO_DESKTOP_CORS` is disabled by default, and
   when enabled adds exactly `tauri://localhost` and
   `http://tauri.localhost`. Never adds a wildcard or arbitrary user input.

## Threat-specific checks before release

- Verify preflight, Bearer auth, CORS origins and API `401/403/429` behavior in
  real browser and packaged WebView2.
- Confirm no API key is logged via DevTools, exception reporting or subprocess output.
- Test malicious/malformed job-result JSON, audio URLs, metadata and filenames.
- Test very large uploaded files, MIME mismatches, audio decoding failures and
  files that disappear from the API temp directory.
- Verify native CSP, certificate failures and different remote HTTPS origins.
- Probe model-init permissions; remote API users with valid tokens can still
  trigger GPU model loads.
- Confirm no absolute Python process launching, shell plugins or unmanaged
  filesystem permissions are introduced in future native work.

## Known limitations / residual risk

- No secure desktop OS vault is implemented. Secrets are volatile, including
  across restarts; a compromised renderer could read them.
- Local presets are non-secret but not encrypted and may contain personal lyrics.
  Users must be informed that browser/profile storage holds them on device.
- The current Tauri CSP admits HTTPS backend connections by design; the chosen
  endpoint is explicitly validated and requires user configuration.
- Browser-only authentication/authorization is still the Python server's job;
  CORS is not an access-control substitute.
- Path allowlisting and file retention are authoritative server policies, not
  contracts under client control.
- No formal dependency audit, sandbox inspection or runtime penetration test
  has been performed.

