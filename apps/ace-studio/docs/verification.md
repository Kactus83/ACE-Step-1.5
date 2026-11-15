# Verification strategy and evidence

## Static implementation vs execution

The GitHub connector writes source and reports remote commit SHAs. It is not a
substitute for npm, Angular TypeScript compilation, Rust compilation, runtime
browser flows, Python unit tests, or GPU execution.

## Commands for a local validation team

Run from `apps/ace-studio` after installing compatible Node and npm:

```sh
npm ci               # only after committing package-lock.json
# fallback before lock exists: npm install
npm run build
npm run lint
npm run test
npx playwright install chromium
npm run e2e:mock
npm run desktop:build
```

Run from repository root in the existing Python environment:

```sh
uv run python -m unittest acestep.api.http.studio_cors_test
uv run python -m unittest discover -s . -p "*_test.py"
```

## Runtime manual acceptance

1. Start the genuine standalone API on loopback and connect Web Studio.
2. Confirm health and model inventory; verify no implicit second model load.
3. Select a model explicitly and initialize when required.
4. Submit text-to-music with a short prompt and instrumental or lyrical output.
5. Confirm queued -> running -> completed or failed by actual job status.
6. Confirm MP3 and WAV playback/download with and without API key.
7. Test network interruption and restoration without submitting duplicate jobs.
8. Upload user source audio; test Cover/Remix and bounded Repaint.
9. In packaged Tauri, set `ACESTEP_ENABLE_STUDIO_DESKTOP_CORS=1` for the Python process.
10. Check native Windows release, Linux and macOS where toolchains are available.
11. Check keyboard navigation, screen reader semantics, responsive widths, reduced motion.
12. Reject merge on any regressions in existing Gradio, CLI, FastAPI, or Python training.

## Remaining coverage

The mock server is deliberately limited to stable generation paths. It cannot
validate model quality, hardware runtimes, file lifetime, or GPU performance.
A successful browser E2E is not evidence of actual music inference.

All E2E checks are currently authored and awaiting execution by an appropriate
local environment; failures must be resolved before accepting the PR.

