# ACE Studio

An **optional** standalone Angular 21 Web frontend and Tauri 2 desktop shell
for the existing ACE-Step 1.5 Python FastAPI server.

Repository: `Kactus83/ACE-Step-1.5`, dedicated development branch
`feature/ace-studio-angular-tauri`, draft PR #2. No code is automatically
merged into fork main or upstream ACE-Step.

## Run locally

Use Node 22.12+ and npm from this directory:

```sh
npm install
npm run start        # Angular web frontend on http://127.0.0.1:4200
npm run desktop      # same frontend in Tauri (needs Rust and OS dependencies)
```

Separately start **one existing** ACE-Step standalone FastAPI Python service,
normally at `http://127.0.0.1:8001`. The Studio never starts Python, downloads
model checkpoints or launches a model initialization implicitly. Configure the
backend address/API key explicitly from Connection. Remote origins require
HTTPS; the API key is session memory only.

For packaged desktop WebViews, opt in to the fixed local-origin setting on
the existing Python process: `ACESTEP_ENABLE_STUDIO_DESKTOP_CORS=1`.
Without that setting, the native app may fail CORS even when browser Web
works. No wildcard browser origins or native shell/filesystem permissions
are granted. Browser sample metadata editing requires the PUT preflight
compatibility correction in this branch.

Safe trained-adapter export is disabled until the Python operator explicitly
allowlists every server directory that may be read or written. Use the OS path
separator to provide one or more existing roots:

```powershell
$env:ACESTEP_STUDIO_FILE_ROOTS = "C:\ACE-Step\training;D:\ACE-Step\exports"
```

```sh
ACESTEP_STUDIO_FILE_ROOTS=/srv/acestep/training:/srv/acestep/exports acestep-api
```

Both the training source and new export destination must remain inside those
roots. Authentication does not replace this filesystem boundary.

## Functional areas

- Create: text2music, Cover/Repaint with source/reference uploads, advertised
  Extract/Lego/Complete, waveform boundaries, expert diffusion/DCW/LM panel.
- Queue & Results: actual status, authenticated audio, server metadata, batch
  cards, settings/seed restore, approximate A/B audition.
- Library: optional browser-local projects and bookmarks, tags, favorites,
  notes and bounded JSON import/export.
- Datasets: server-local scan/load/save, sample metadata updates, asynchronous
  labeling and tensor preprocessing.
- Training: LoRA/LoKr status/start/stop, measured loss, tensor validation and
  explicit non-overwriting adapter export within operator-approved roots.
- Connection: backend profile, model inventory, explicit initialization and
  real queue statistics.
- Appearance: persistent light/dark visual preference.

**Important:** Library saves metadata and temporary audio references, not
binary files. Explicitly download any track requiring long-term preservation.
Dataset and export paths belong to the Python server, not the browser. Studio
uses only its bounded no-overwrite route; the legacy `/v1/training/export`
still deletes a pre-existing destination for existing non-Studio consumers.
Protect the backend with authentication, OS permissions and trusted operators.

## Validation

```sh
npm run lint
npm run test
npm run build
npm run e2e:mock
npm run desktop:build
```

Python API and broader regression commands are in `docs/verification.md`.
Angular, mock browser, focused Python and Windows package checks have run
locally and in CI; real GPU/model and screen-reader acceptance has not. See
`docs/functional-coverage.md`, `docs/continuation.md`,
`docs/source-checkpoint-4.md`, `docs/security-review.md` and the review files.
The draft PR is not production-ready or merge-authorized.

