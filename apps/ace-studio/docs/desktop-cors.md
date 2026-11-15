# Desktop CORS compatibility

Packaged Tauri 2 webviews have different origins from normal web pages:
- Windows: `http://tauri.localhost`
- macOS/Linux: `tauri://localhost`

The upstream standalone API restricts CORS to localhost browser origins and
the literal `null` origin. A packaged ACE Studio webview would otherwise fail
to communicate using the browser fetch API even when the backend is healthy.

This branch adds **one optional environment variable** to the Python API,
disabled by default:

```powershell
$env:ACESTEP_ENABLE_STUDIO_DESKTOP_CORS = "1"
acestep-api
```

Linux/macOS:

```sh
ACESTEP_ENABLE_STUDIO_DESKTOP_CORS=1 acestep-api
```

This changes only FastAPI allowed origins; it does not start Python, select
models, change Gradio or alter the authorization contract. API Bearer keys are
still required when `ACESTEP_API_KEY` is configured. Never enable public
network binding solely because desktop CORS is active.

Development with `npm run desktop` uses `http://127.0.0.1:4200`, already
allowed by the upstream API, so the flag is not needed for dev mode.

References:
- `acestep/api/http/studio_cors.py`
- `acestep/api/route_setup.py`
- Tauri 2 official webview custom-protocol origin specification.
