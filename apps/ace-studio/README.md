# ACE Studio

Optional Angular 21 / Tauri 2 application for the existing ACE-Step 1.5 FastAPI server.

## Run

From this directory, install Node 22.12+ / npm, then run:

1. `npm install`
2. `npm run start` — Web application at http://127.0.0.1:4200
3. `npm run desktop` — Same Angular frontend in Tauri; requires Rust and OS-specific desktop dependencies.

Separately start the **existing** ACE-Step standalone API (`acestep-api`) with its standard Python environment; its normal port is 8001. The Studio never starts another model process implicitly. Configure the backend endpoint in Studio.

## Architecture boundary

The Python backend remains authoritative for model and job state. The browser and Tauri webview share the same Angular source. No Tauri command is currently exposed. The existing Gradio, Python CLI, training and REST API are untouched. The initial API adapter targets **standalone FastAPI**; the Gradio-mounted API may not be equivalent.

The backend allows browser CORS from localhost/127.0.0.1. If enabled, API key authentication applies also to the audio endpoint: Studio retrieves protected audio via fetch/Blob rather than embedding an uncredentialed media URL. Never expose ACE-Step's API to a public network without independent authentication/TLS review.

## Local verification

- `npm run build`: Angular TypeScript and template compilation
- `npm run lint`
- `npm run test`
- `npm run desktop:build`: Rust/native bundling
- Actual GPU workflows require the running compatible Python API.

See `docs/architecture.md`, `docs/contracts.md`,
`docs/functional-coverage.md`, `docs/security-review.md`, both contradictory
review reports, `docs/verification.md` and `docs/continuation.md`.
Packaged desktop requires the opt-in CORS setting documented in
`docs/desktop-cors.md`.

**Not yet declared production-ready.**
