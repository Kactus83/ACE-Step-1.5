# Contradictory review B — workflows / UX / accessibility

Review performed against authored view templates, stores, and API contracts.
No screenshots or real keyboard/screen-reader execution were available.

## Observable source improvements

- Distinct Create, Queue & Results, and Connection views with a persistent
  backend-readiness indicator.
- Advanced generation parameters are progressively disclosed; the beginner's
  prompt and instrumental choice remain prominent.
- Jobs show actual backend text and an indeterminate animation, never an
  invented numeric completion percentage.
- Result playback is loaded on user action rather than eagerly prefetching
  multiple large audio files.
- The editor accepts both local uploads and generated results as editable
  source audio for Remix/Repaint.
- Dark tokens, focus-visible treatment, responsive panels, reduced-motion
  media query, semantic buttons and labels are authored.

## Defects / missing user journeys

- No graphical waveform/timeline for Repaint; numerical start/end fields alone
  are only a partial editing UX.
- No A/B synchronized audition, favourites, tagging, batch navigation across
  sessions, or persistent remote project library.
- Dataset scanning and LoRA/LoKr training controls now exist, but sample editing, preprocessing, auto-label, training exports and runtime verification are not yet present.
- Source audio remains volatile; restoring a preset will never restore files.
- No true multi-panel rearrangement or keyboard hotkey map yet.
- Browser contrast, screen-reader output, 320px width, zoom, Tauri native
  keyboard behavior and audio control rendering require actual inspection.
- Backend outages are communicated but there is no one-click diagnosis panel.
- The visible source currently presents English labels; translation architecture
  and French localization have not been implemented.
- No light theme is authored; users may request it after design review.

**Review verdict:** credible working-generation studio source, but the entire
advanced-product scope is unfinished. No UI acceptance claim before local QA.

