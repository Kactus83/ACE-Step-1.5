# ACE Studio — Coordinator continuity and source completion plan

**Repository:** `Kactus83/ACE-Step-1.5`
**Branch:** `feature/ace-studio-angular-tauri`
**Draft PR:** https://github.com/Kactus83/ACE-Step-1.5/pull/2
**Synchronized fork main:** `d207bdd283dc726a0d9c711ca518dcf3accd1381`
(merged into this feature branch through two-parent commit `73b32efc`).
**Progress:** substantial authored source; **not 100% complete** and no executed
build, browser, GPU or packaged Tauri acceptance evidence.

## Completed source tracks

- Independent Angular 21 standalone Web + Tauri 2 shell, responsive dark and
  light semantic token themes and local appearance preference.
- Typed standalone API client, credentialed audio, model discovery and explicit
  initialization; server counters and bounded job polling with stale-server
  response invalidation.
- Text2music, cover/repaint uploads and opt-in waveform, advertised
  Extract/Lego/Complete, expert scheduler/ADG/DCW/LM control panel.
- Audio result cards, expanded metadata, search/filter, approximate A/B
  audition, verified seed/settings restoration, result reuse without auto-run.
- Safe versioned *browser-local metadata-only* project catalog, intentional
  bookmarking, tags/favorites, edit, bounded JSON import/export.
- Datasets scan/load/save, indexed metadata editing, async label/preprocess and
  latest-task polling; LoRA/LoKr tensor handoff, start/stop, measured loss/log.
- Guarded trained-adapter export; destructive backend destination overwrite
  requires typed acknowledgement and two matching user submissions.
- Narrow opt-in desktop origins plus PUT preflight for dataset editing.
- Unit/browser/Python tests and successive contradictory *source* reviews.

## Remaining code (continue rather than stopping for absent local compilers)

1. Audit and integrate remaining useful generation API modes: audio-code and
   sample-mode where genuinely supported, cover/reference controls and
   relevant LM backend/model settings; enforce exact Pydantic/transport fields.
2. Improve batch explorer, job metadata/seed browsing, repeat/replay and
   resilient source handling without persisting sensitive media.
3. Strengthen local catalog consistency across tabs: revisions, concurrent
   writes and explicit corrupt-storage recovery; document quota and backup
   boundaries. A durable remote audio library requires a separate backend
   design and must not be implied.
4. Strengthen backend response validation, error handling, retries and
   cancellation semantics only where real API support exists. No fake GPU,
   VRAM, completion percentage or backend task cancellation.
5. Add explicit advanced training/dataset lifecycle recovery, pre-existing
   task detection, destination overwrite constraints and user permission review.
6. Finish UI quality: keyboard shortcuts, meaningful French localization,
   responsive/zoom/screen-reader contrast, empty states and concise warnings.
7. Expand isolated unit and E2E cases for API failures, browser CORS PUT,
   A/B selection, corrupted catalogs, training/export confirmations,
   connection switching, accessibility and native desktop permissions.
8. Perform independent contradictory reviews on concurrency, WebView
   origin/codec/security and functional parity; commit and document fixes.
9. In a genuine local machine environment, install locked dependencies and
   execute Angular build/lint/tests, Playwright, Python regressions, Rust/Tauri
   bundle and real GPU scenarios. Record exit codes, platform and logs.
10. Produce a CI-team prompt only after source milestones genuinely close.
    Do not merge into `main` or mark production-ready without user approval.

## Constraints

Each source increment must be committed/pushed to its own feature branch.
Never force-push, replay consolidation PR #1, alter the Python inference
architecture, auto-load models, or introduce generic native filesystem/shell
permissions. Operator confirmation is mandatory before risky server actions.
Compilation absence **does not authorize abandoning source implementation**.

Backend datasets and audio outputs are server-owned. LocalStorage is not a
backup. Imported JSON may contain creative metadata; passwords/API keys must
never be saved. Changes involving the source backend require regression tests
and a clear opt-in compatibility assessment.

