# Contradictory UX and accessibility review

**Evidence:** static Angular templates, signals, CSS and authored tests only.
No user-session recording, browser screenshot inspection, screen-reader test,
mobile zoom check or real media playback has been performed.

## Implemented in source

- A dedicated responsive app shell with Create, Queue & Results, Library,
  Datasets, Training, and Connection navigation.
- Contextual expert controls behind progressive disclosure; explicit high-risk
  prompts for forced DCW, training start and destructive training export.
- Backend-reported queue states, errors and measured training loss; no invented
  percentage or fake hardware telemetry.
- Safe audio preview/download, metadata, server seed restoration and explicit
  remix/repaint with optional decoded waveform/time sliders.
- A/B comparison with separate listening and near-concurrent HTML media starts,
  clearly marked as **not phase-aligned** or sample-accurate.
- Local projects for intentional track bookmarks, favorites, tags, notes and
  bounded JSON import/export. Audio files themselves are **not saved**.
- Dark and light semantic theme tokens, focus-visible styles, skip-to-main
  keyboard link, labeled forms, responsive layouts and reduced-motion CSS.
- Planned Playwright mock flows include dataset editing, export warnings,
  library save, local theme persistence and viewport checks.

## Remaining experience work

- Actual Windows/macOS/Linux WebView/codec/contrast verification; mobile
  viewport and 200% zoom, voice and keyboard/screen-reader acceptance.
- Full localization (including French), shortcut map and accessible keyboard
  operations for all specialized audio and dataset interactions.
- A/B is approximate; synchronized phase-accurate audition is not supplied.
- Preserve creative output across backend cleanup through an explicitly
  designed local binary archive rather than implying bookmarks are backups.
- Better multi-batch result grouping, reproducibility panel and dangerous-path
  error handling, including storage quota and concurrent browser tabs.
- Data ownership/conflict warnings: Python's active dataset is server-global
  and a separate user's overwrite can invalidate visible edits.

**Verdict:** product workflows are broader than initial shell, but actual
browser/native visual QA and remaining flows are still mandatory.

