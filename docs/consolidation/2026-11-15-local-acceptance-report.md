# Local acceptance report — 2026-11-15

## Decision

**PASS — ready to merge into the fork's `main`.** The user explicitly authorized the
merge and local cutover once blocking validation passed. This authorization supersedes
the no-merge instruction in the original execution prompt for this run only; upstream
is not a merge target.

Validated code commit: `b8234f9` on `integration/ace-ui-foundation`.
Base during validation: fork and upstream `main` at
`ca1e85fe9430179831e6bc6be790c332190a3866`.

## Environment

- Windows, Python 3.12.16, Gradio 6.2.0.
- PyTorch 2.7.1+cu128; CUDA available on NVIDIA RTX 3500 Ada Laptop GPU, 12 GB.
- Existing local `acestep-v15-turbo`, VAE and text encoder checkpoints reused through
  the local checkpoint junction; no large model download was performed.
- FFmpeg 9.0.2 installed through WinGet.

## Automated acceptance

| Check | Result | Evidence |
|---|---|---|
| `uv sync` | PASS | Python 3.12 environment resolved; pytest added to the dev group for collected pytest-based tests. |
| `python -m compileall -q acestep` | PASS | No compiler output or failure after final fixes. |
| Simple UI contract/foundation/streaming tests | PASS | 24 tests in the final focused group, including duration forwarding and failure recovery. |
| Seeds, metadata, export, Flow Edit, source audio and `/release_task` focused tests | PASS | 73 reliability tests and 28 API/CLI tests passed during the focused runs. |
| Windows/inherited regression group | PASS | 176 tests passed, one platform skip. |
| `unittest discover -p '*_test.py' -q` | PASS | 1,284 tests in 17.221 s; 8 platform/dependency skips; no failures or errors. |
| `unittest discover -p 'test_*.py' -q` | PASS | 13 tests; no skips, failures or errors. |
| CLI `python -m acestep.acestep_v15_pipeline --help` | PASS | Exit 0 on the Windows console after UTF-8 stream configuration. |
| `git diff --check` | PASS | Clean before commit; exact range check is repeated after the documentation commit. |

The eight skips are capability-gated tests (primarily MLX/Apple Silicon and optional
runtime dependencies), not failures of the Windows/CUDA product path.

## Real UI, GPU and API acceptance

| Scenario | Result | Evidence |
|---|---|---|
| Flag disabled | PASS | Historical Advanced UI rendered with settings, generation, training and batch/result controls; no optional Simple shell. |
| Flag enabled, model unloaded | PASS | Five-step Simple shell rendered; Create remained disabled with an explicit request to load a model in Advanced. No implicit initialization occurred. |
| Navigation and overlays | PASS | Description, Lyrics/Instrumental, Remix, return to Advanced, Help and About open/close were exercised in the browser. |
| Responsive layout | PASS | 375, 768 and 1,440 px viewports had `scrollWidth == clientWidth`; no horizontal clipping. |
| Italian and fallback | PASS | Historical UI rendered in Italian; new Simple keys correctly fell back to English. |
| Service mode guard | PASS | Real CUDA service-mode launch with the flag set exposed only the restricted historical Generation UI; no Simple shell/menu. |
| CUDA generation | PASS | Two Simple FLAC outputs generated and played through step 5/5 with CPU offload and INT8 DiT. No `cuda:0`/CPU tensor mismatch recurred. |
| Simple duration contract | PASS | Initial run exposed a 30 s metadata/120 s audio mismatch. After correction, both real outputs displayed and encoded 0:30. |
| Download | PASS | Browser download produced a non-empty FLAC artifact. |
| VAE tiled decode | PASS | Initial counter-review found an overlap clamp that implied about 1,500 tiles. Corrected geometry uses overlap 32, stride 64 and 47 tiles for 3,000 latent frames; real decode completed. |
| Standalone API | PASS | `/health` 200; `/v1/models` 401 without token and 200 with bearer token; `/release_task` 401 anonymously. |
| Authenticated API generation | PASS | `/release_task` generated one 10 s FLAC with seed 4242, batch 1 and `timesteps=0.97,0.5,0`; `/query_result` returned matching file and metadata. |

Mocked deterministic tests cover the destructive/error scenarios that should not require
repeated GPU work: dispatcher failure before output, stream failure after prior audio,
empty result, fixed/random seeds, VRAM batch clamp, MP3-to-WAV fallback, source-audio
paths, and preservation of Advanced history/state.

## Defects corrected during acceptance

1. Simple UI called newly keyword-only retake parameters positionally.
2. Several inherited tests had stale signatures, imports, Windows temporary-file or path assumptions.
3. Windows CLI help failed on CP1252 when printing Unicode status text.
4. Tiny VAE chunks could retain an invalid overlap; the first repair made normal chunks
   technically valid but pathologically slow. The final adaptive halving preserves a
   useful stride and handles tiny chunks safely.
5. Simple text generation omitted its displayed 30 s duration, so backend padding
   silently produced 120 s audio. It now forwards 30 s explicitly.

## Non-blocking observations

- `torchao` reports that its optional C++ extensions do not match Torch 2.7.1; the tested
  INT8 Python path loaded and generated successfully.
- `bitsandbytes` is absent, so training uses standard AdamW. This does not block inference
  or the tested training UI contracts.
- Windows may log a benign asyncio connection-reset callback when a browser/download
  connection closes; generation and saved output remain successful.

No blocking defect remains in the validated scope.
